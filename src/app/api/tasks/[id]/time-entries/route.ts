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

    const taskAccess = await prisma.task.findFirst({
      where: {
        id: params.id,
        OR: [
          { creatorId: userId },
          { assignees: { some: { userId } } },
          { project: { workspace: { members: { some: { userId } } } } }
        ]
      }
    });

    if (!taskAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 404 });
    }

    const entries = await prisma.timeEntry.findMany({
      where: { taskId: params.id },
      include: {
        user: {
          select: { id: true, name: true, image: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(entries);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch time entries" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const userId = (session.user as { id: string }).id;
    const { duration, description, date } = await req.json();
    
    if (typeof duration !== "number" || duration < 0) {
      return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
    }

    const taskAccess = await prisma.task.findFirst({
      where: {
        id: params.id,
        OR: [
          { creatorId: userId },
          { assignees: { some: { userId } } },
          { project: { workspace: { members: { some: { userId } } } } }
        ]
      }
    });

    if (!taskAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 404 });
    }

    const entry = await prisma.timeEntry.create({
      data: {
        duration,
        description: description || "",
        date: date ? new Date(date) : new Date(),
        taskId: params.id,
        userId: userId,
      },
      include: {
        user: {
          select: { id: true, name: true, image: true }
        }
      }
    });

    // Optionally update task activity here or via separate trigger
    
    return NextResponse.json(entry);
  } catch (error) {
    console.error("[TIME_ENTRY_POST]", error);
    return NextResponse.json({ error: "Failed to create time entry" }, { status: 500 });
  }
}
