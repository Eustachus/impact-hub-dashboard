import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const userId = (session.user as { id: string }).id;
    const task = await prisma.task.findFirst({
      where: { 
        id: params.id,
        OR: [
          { creatorId: userId },
          { assignees: { some: { userId } } },
          { project: { workspace: { members: { some: { userId } } } } }
        ]
      },
      include: {
        subtasks: {
          orderBy: { createdAt: "asc" }
        },
        assignees: {
          include: { user: true }
        },
        tags: {
          include: { tag: true }
        }
      }
    });

    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    return NextResponse.json(task);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch task details" }, { status: 500 });
  }
}
