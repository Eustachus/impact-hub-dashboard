import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";

  if (query.length < 2) return NextResponse.json([]);

  try {
    const [projectsRes, tasksRes] = await Promise.all([
      supabase
        .from('Project')
        .select('id, name')
        .ilike('name', `%${query}%`)
        .limit(5),
      supabase
        .from('Task')
        .select('id, title, projectId, Project(name)')
        .ilike('title', `%${query}%`)
        .limit(10)
    ]);

    const projects = projectsRes.data || [];
    const tasks = tasksRes.data || [];

    const results = [
      ...projects.map(p => ({
        id: `p-${p.id}`,
        title: p.name,
        type: "Projet",
        href: `/dashboard/projects/${p.id}`,
        category: "Projets"
      })),
      ...tasks.map((t: any) => ({
        id: `t-${t.id}`,
        title: t.title,
        type: "Tâche",
        href: `/dashboard/projects/${t.projectId}`,
        category: "Tâches",
        subtitle: t.Project?.name
      }))
    ];

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
