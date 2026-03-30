import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Get workspace IDs where the user is a member
    const { data: memberships, error: memberError } = await supabase
      .from('WorkspaceMember')
      .select('workspaceId')
      .eq('userId', user.id);

    if (memberError) throw memberError;

    const workspaceIds = memberships?.map(m => m.workspaceId) || [];

    if (workspaceIds.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Fetch projects for these workspaces
    const { data: projects, error: projectsError } = await supabase
      .from('Project')
      .select('*')
      .in('workspaceId', workspaceIds)
      .order('updatedAt', { ascending: false });

    if (projectsError) throw projectsError;

    // 3. Get task counts for all projects in a single query
    const projectIds = (projects || []).map(p => p.id);
    const { data: taskCounts } = await supabase
      .from('Task')
      .select('projectId')
      .in('projectId', projectIds);

    // Count tasks per project in memory
    const countMap: Record<string, number> = {};
    for (const t of (taskCounts || [])) {
      countMap[t.projectId] = (countMap[t.projectId] || 0) + 1;
    }

    const projectsWithCount = (projects || []).map(project => ({
      ...project,
      _count: { tasks: countMap[project.id] || 0 }
    }));

    return NextResponse.json(projectsWithCount);
  } catch (error: unknown) {
    console.error("Fetch Projects Error:", (error as Error).message);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, description, color } = await req.json();

    // 1. Find ANY workspace for this user
    const { data: membership } = await supabase
      .from('WorkspaceMember')
      .select('workspaceId')
      .eq('userId', user.id)
      .limit(1)
      .maybeSingle();

    let workspaceId: string;

    if (!membership) {
      // 2. If no workspace, create a default one
      const { data: newWorkspace, error: wsError } = await supabase
        .from('Workspace')
        .insert({ name: "Mon Espace" })
        .select()
        .single();

      if (wsError) throw wsError;
      workspaceId = newWorkspace.id;

      // Create membership for the user
      await supabase
        .from('WorkspaceMember')
        .insert({
          userId: user.id,
          workspaceId,
          role: "ADMIN"
        });
    } else {
      workspaceId = membership.workspaceId;
    }

    // 3. Create project
    const { data: project, error: projectError } = await supabase
      .from('Project')
      .insert({
        name,
        description: description || null,
        color: color || null,
        workspaceId,
      })
      .select()
      .single();

    if (projectError) throw projectError;

    return NextResponse.json(project);
  } catch (error: unknown) {
    console.error("Project Creation Error:", (error as Error).message);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
