import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  _: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const tasks = await prisma.task.findMany({
      where: { projectId: params.id },
      include: {
        assignees: {
          include: {
            user: {
              select: { id: true, name: true, image: true }
            }
          }
        },
        blocking: {
          include: { blockedBy: true }
        },
        blockedBy: {
          include: { blocking: true }
        },
        _count: {
          select: { comments: true, subtasks: true }
        },
        timeEntries: true
      },
      orderBy: { order: "asc" }
    });
    return NextResponse.json(tasks);
  } catch {
    return NextResponse.json({ error: "Failed to fetch project tasks" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const json = await req.json();
    const { title, description, status, priority, sectionId, startDate, dueDate, parentId, assigneeIds, effort } = json;
    
    const task = await prisma.task.create({
      data: {
        title,
        description: description || "",
        status: status || "TODO",
        priority: priority || "NONE",
        projectId: params.id,
        creatorId: (session.user as { id: string }).id,
        sectionId: sectionId || null,
        startDate: startDate ? new Date(startDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        parentId: parentId || null,
        order: 0,
        effort: effort || null,
        assignees: assigneeIds ? {
          create: assigneeIds.map((userId: string) => ({ userId }))
        } : undefined,
      },
      include: {
        assignees: { include: { user: true } }
      }
    });
    return NextResponse.json(task);
  } catch {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, taskId, title, description, status, priority, order, sectionId, startDate, dueDate, effort, completed, assigneeIds } = await req.json();
    
    const targetId = id || taskId;
    if (!targetId) return NextResponse.json({ error: "Task ID is required" }, { status: 400 });

    const task = await prisma.task.update({
      where: { id: targetId },
      data: {
        title,
        description,
        status,
        priority,
        order,
        sectionId,
        startDate: startDate ? new Date(startDate) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        effort: effort !== undefined ? effort : undefined,
        completed,
        completedAt: completed ? new Date() : null,
        assignees: assigneeIds ? {
          deleteMany: {},
          create: assigneeIds.map((userId: string) => ({ userId }))
        } : undefined,
      },
      include: {
        assignees: { include: { user: true } }
      }
    });
    return NextResponse.json(task);
  } catch {
    return NextResponse.json({ error: "Failed to update task positions" }, { status: 500 });
  }
}
