import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    // 1. Find the user's Google Account
    const googleAccount = await prisma.account.findFirst({
      where: {
        userId: userId,
        provider: "google",
      },
    });

    if (!googleAccount || !googleAccount.access_token) {
      return NextResponse.json({ error: "Google account not connected" }, { status: 403 });
    }

    // Optional: Normally here we would check if access_token is expired and use refresh_token to get a new one.
    // For this MVP, we will try to use the current access_token.
    const accessToken = googleAccount.access_token;

    // 2. Fetch recent message IDs from Gmail
    const messagesRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&labelIds=INBOX", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!messagesRes.ok) {
      if (messagesRes.status === 401) {
        return NextResponse.json({ error: "Token expired. Please reconnect Google Account." }, { status: 401 });
      }
      throw new Error(`Gmail API error: ${messagesRes.statusText}`);
    }

    const messagesData = await messagesRes.json();
    const messageIds = messagesData.messages || [];

    // 3. Fetch full details for each message
    const emailPromises = messageIds.map(async (msg: any) => {
      const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!msgRes.ok) return null;
      return msgRes.json();
    });

    const fullMessages = await Promise.all(emailPromises);
    const validMessages = fullMessages.filter(Boolean);

    // 4. Transform and save to Database
    const savedEmails = [];
    for (const email of validMessages) {
      const headers = email.payload?.headers || [];
      const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value;

      const subject = getHeader("subject") || "No Subject";
      const from = getHeader("from") || "Unknown Sender";
      const dateStr = getHeader("date");
      const date = dateStr ? new Date(dateStr) : new Date();
      
      const snippet = email.snippet || "";

      // Upsert into our database
      const saved = await prisma.emailMessage.upsert({
        where: { messageId: email.id },
        update: {
          labels: JSON.stringify(email.labelIds || []),
        },
        create: {
          messageId: email.id,
          threadId: email.threadId,
          subject,
          snippet,
          sender: from,
          date,
          labels: JSON.stringify(email.labelIds || []),
          userId,
          read: !(email.labelIds || []).includes("UNREAD")
        }
      });
      savedEmails.push(saved);
    }

    return NextResponse.json({ 
      success: true, 
      count: savedEmails.length,
      message: "Emails synchronized successfully" 
    });

  } catch (error: any) {
    console.error("Email Sync Error:", error);
    return NextResponse.json({ error: error.message || "Failed to sync emails" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const emails = await prisma.emailMessage.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 20
    });

    return NextResponse.json(emails);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch saved emails" }, { status: 500 });
  }
}
