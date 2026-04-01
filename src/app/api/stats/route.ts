import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Get workspace IDs where user is a member
    const { data: memberships } = await supabase
      .from('WorkspaceMember')
      .select('workspaceId')
      .eq('userId', user.id);
    
    const workspaceIds = memberships?.map(m => m.workspaceId) || [];

    if (workspaceIds.length === 0) {
      return NextResponse.json({
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        totalProjects: 0,
        projectProgress: [],
        upcomingDeadlines: [],
        recentActivity: []
      });
    }

    // 2. Get project IDs in those workspaces
    const { data: projects } = await supabase
      .from('Project')
      .select('id')
      .in('workspaceId', workspaceIds);

    const projectIds = projects?.map(p => p.id) || [];

    if (projectIds.length === 0) {
      return NextResponse.json({
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        totalProjects: 0,
        projectProgress: [],
        upcomingDeadlines: [],
        recentActivity: []
      });
    }

    // 3. Aggregate stats
    const [
      { count: totalTasks },
      { count: completedTasks },
      { count: inProgressTasks },
      { count: totalProjects },
      { data: recentTasks },
      { data: projectsWithStats },
      { data: upcomingDeadlines }
    ] = await Promise.all([
      supabase.from('Task').select('id', { count: 'exact', head: true }).in('projectId', projectIds),
      supabase.from('Task').select('id', { count: 'exact', head: true }).eq('status', 'DONE').in('projectId', projectIds),
      supabase.from('Task').select('id', { count: 'exact', head: true }).eq('status', 'IN_PROGRESS').in('projectId', projectIds),
      supabase.from('Project').select('id', { count: 'exact', head: true }).in('id', projectIds),
      supabase.from('Task').select('*, project:Project!inner(*)').in('projectId', projectIds).order('updatedAt', { ascending: false }).limit(5),
      supabase.from('Project').select('*, tasks:Task(status)').in('id', projectIds),
      supabase.from('Task').select('*, project:Project!inner(*)').in('projectId', projectIds).neq('status', 'DONE').not('dueDate', 'is', null).lte('dueDate', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()).order('dueDate', { ascending: true }).limit(5)
    ]);

    const projectProgress = (projectsWithStats as Record<string, unknown>[] || []).map(p => {
      const total = (p.tasks as Record<string, unknown>[] | undefined)?.length || 0;
      const completed = (p.tasks as Record<string, unknown>[] | undefined)?.filter((t: Record<string, unknown>) => t.status === "DONE").length || 0;
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
      totalTasks: totalTasks || 0,
      completedTasks: completedTasks || 0,
      inProgressTasks: inProgressTasks || 0,
      totalProjects: totalProjects || 0,
      projectProgress,
      upcomingDeadlines: upcomingDeadlines || [],
      recentActivity: (recentTasks || []).map((t: Record<string, unknown>) => ({
        id: t.id,
        user: "Vous",
        action: t.createdAt === t.updatedAt ? "a créé" : "a mis à jour",
        target: t.title,
        project: (t.project as Record<string, unknown> | undefined)?.name,
        time: "À l'instant"
      }))
    });
  } catch (error) {
    console.error("Fetch Stats Error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
