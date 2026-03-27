import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const userId = (session.user as { id: string }).id;
    const files = await prisma.attachment.findMany({
      where: {
        task: {
          OR: [
            { creatorId: userId },
            { assignees: { some: { userId } } },
            { project: { workspace: { members: { some: { userId } } } } }
          ]
        }
      },
      include: {
        task: {
          select: {
            title: true,
            creator: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const formattedFiles = files.map(f => ({
      id: f.id,
      name: f.name,
      type: f.type,
      size: (f.size / 1024 / 1024).toFixed(1) + " MB",
      date: new Date(f.createdAt).toLocaleDateString(),
      user: f.task?.creator?.name || "Système",
      taskTitle: f.task?.title
    }));

    return NextResponse.json(formattedFiles);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}
