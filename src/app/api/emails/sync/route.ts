import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = user.id;

  try {
    // 1. Find the user's Google Account from Supabase
    const { data: googleAccount, error: accountError } = await supabase
      .from('Account')
      .select('access_token')
      .eq('userId', userId)
      .eq('provider', 'google')
      .single();

    if (accountError || !googleAccount?.access_token) {
      return NextResponse.json({ error: "Google account not connected" }, { status: 403 });
    }

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
    const emailPromises = messageIds.map(async (msg: { id: string }) => {
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

    // 4. Transform and save to Database via Supabase
    const savedEmails = [];
    for (const emailMsg of validMessages) {
      const headers = emailMsg.payload?.headers || [];
      const getHeader = (name: string) => headers.find((h: { name: string; value: string }) => h.name.toLowerCase() === name.toLowerCase())?.value;

      const subject = getHeader("subject") || "No Subject";
      const from = getHeader("from") || "Unknown Sender";
      const dateStr = getHeader("date");
      const date = dateStr ? new Date(dateStr).toISOString() : new Date().toISOString();
      
      const snippet = emailMsg.snippet || "";

      // Upsert into our database
      const { data: saved, error: upsertError } = await supabase
        .from('EmailMessage')
        .upsert({
          messageId: emailMsg.id,
          threadId: emailMsg.threadId,
          subject,
          snippet,
          sender: from,
          date,
          labels: JSON.stringify(emailMsg.labelIds || []),
          userId,
          read: !(emailMsg.labelIds || []).includes("UNREAD")
        }, { onConflict: 'messageId' })
        .select()
        .single();

      if (upsertError) {
        console.error("Email upsert error:", upsertError);
        continue;
      }
      savedEmails.push(saved);
    }

    return NextResponse.json({ 
      success: true, 
      count: savedEmails.length,
      message: "Emails synchronized successfully" 
    });

  } catch (error: any) {
    console.error("Email sync error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { data: emails, error } = await supabase
      .from('EmailMessage')
      .select('*')
      .eq('userId', user.id)
      .order('date', { ascending: false })
      .limit(20);

    if (error) throw error;
    return NextResponse.json(emails);
  } catch (error: any) {
    console.error("Email fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch saved emails" }, { status: 500 });
  }
}
