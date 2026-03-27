import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const userId = (session.user as { id: string }).id;
    
    // Scoping to ensure user can only see stats for their own workspaces, creations, or assignments
    const hasAccessToTask = {
      OR: [
        { creatorId: userId },
        { assignees: { some: { userId } } },
        { project: { workspace: { members: { some: { userId } } } } }
      ]
    };

    const hasAccessToProject = {
      workspace: { members: { some: { userId } } }
    };

    const [totalTasks, completedTasks, inProgressTasks, totalProjects, recentTasks, projectsWithStats, upcomingDeadlines] = await Promise.all([
      prisma.task.count({ where: hasAccessToTask }),
      prisma.task.count({ where: { status: "DONE", ...hasAccessToTask } }),
      prisma.task.count({ where: { status: "IN_PROGRESS", ...hasAccessToTask } }),
      prisma.project.count({ where: hasAccessToProject }),
      prisma.task.findMany({
        where: hasAccessToTask,
        take: 5,
        orderBy: { updatedAt: "desc" },
        include: { project: true }
      }),
      prisma.project.findMany({
        where: hasAccessToProject,
        include: {
          _count: {
            select: { tasks: true }
          },
          tasks: {
            where: { status: "DONE" },
            select: { id: true }
          }
        }
      }),
      prisma.task.findMany({
        where: {
          ...hasAccessToTask,
          status: { not: "DONE" },
          dueDate: {
            not: null,
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
          }
        },
        take: 5,
        orderBy: { dueDate: "asc" },
        include: { project: true }
      })
    ]);

    const projectProgress = projectsWithStats.map(p => {
      const total = p._count.tasks;
      const completed = p.tasks.length;
      return {
        id: p.id,
        name: p.name,
        color: p.color,
        progress: total > 0 ? Math.round((completed / total) * 100) : 0,
        totalTasks: total,
        completedTasks: completed
      };
    });

    return NextResponse.json({
      totalTasks,
      completedTasks,
      inProgressTasks,
      totalProjects,
      projectProgress,
      upcomingDeadlines,
      recentActivity: recentTasks.map(t => ({
        id: t.id,
        user: "Vous",
        action: t.createdAt === t.updatedAt ? "a créé" : "a mis à jour",
        target: t.title,
        project: t.project?.name,
        time: "À l'instant"
      }))
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
