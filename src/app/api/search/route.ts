import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";

  if (query.length < 2) return NextResponse.json([]);

  try {
    const [projects, tasks] = await Promise.all([
      prisma.project.findMany({
        where: { name: { contains: query } },
        take: 5
      }),
      prisma.task.findMany({
        where: { title: { contains: query } },
        take: 10,
        include: { project: true }
      })
    ]);

    const results = [
      ...projects.map(p => ({
        id: `p-${p.id}`,
        title: p.name,
        type: "Projet",
        href: `/dashboard/projects/${p.id}`,
        category: "Projets"
      })),
      ...tasks.map(t => ({
        id: `t-${t.id}`,
        title: t.title,
        type: "Tâche",
        href: `/dashboard/projects/${t.projectId}`,
        category: "Tâches",
        subtitle: t.project?.name
      }))
    ];

    return NextResponse.json(results);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
