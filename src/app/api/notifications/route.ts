import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const notifications = await prisma.activityLog.findMany({
      where: {
        userId: { not: (session.user as { id: string }).id }, // Exclude my own actions
        task: {
          OR: [
            { creatorId: (session.user as { id: string }).id },
            { assignees: { some: { userId: (session.user as { id: string }).id } } }
          ]
        }
      },
      include: {
        user: { select: { name: true, image: true } },
        task: { 
          include: { 
            project: { select: { id: true, name: true, color: true } },
            assignees: { include: { user: { select: { id: true, name: true, image: true } } } },
            tags: { include: { tag: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    const formatted = notifications.map(n => ({
      id: n.id,
      user: n.user?.name || "Système",
      userImage: n.user?.image || null,
      action: n.action,
      target: n.task?.title || "Projet",
      task: n.task || null,
      type: n.entityType.toLowerCase(),
      time: new Date(n.createdAt).toLocaleTimeString(),
      read: true // For now
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
