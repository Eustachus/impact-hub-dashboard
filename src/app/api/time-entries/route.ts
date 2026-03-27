import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const entries = await prisma.timeEntry.findMany({
      where: { userId: (session.user as any).id },
      include: {
        task: { select: { title: true, project: { select: { name: true } } } }
      },
      orderBy: { date: "desc" },
      take: 10
    });

    const formatted = entries.map(e => ({
      id: e.id,
      task: e.task?.title || "Tâche inconnue",
      project: e.task?.project?.name || "Projet inconnu",
      duration: Math.floor(e.duration / 3600) + "h " + Math.floor((e.duration % 3600) / 60) + "m",
      date: new Date(e.date).toLocaleDateString()
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch time entries" }, { status: 500 });
  }
}
