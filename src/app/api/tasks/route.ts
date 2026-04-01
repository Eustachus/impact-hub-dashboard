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
      return NextResponse.json([]);
    }

    // 2. Get project IDs in those workspaces
    const { data: projects } = await supabase
      .from('Project')
      .select('id')
      .in('workspaceId', workspaceIds);

    const projectIds = projects?.map(p => p.id) || [];

    if (projectIds.length === 0) {
      return NextResponse.json([]);
    }

    // 3. Fetch tasks for those projects
    const { data: tasks, error: fetchError } = await supabase
      .from('Task')
      .select('*, project:Project!inner(*)')
      .in('projectId', projectIds)
      .order('updatedAt', { ascending: false });

    if (fetchError) throw fetchError;

    return NextResponse.json(tasks || []);
  } catch (error) {
    console.error("Fetch Tasks Error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}
