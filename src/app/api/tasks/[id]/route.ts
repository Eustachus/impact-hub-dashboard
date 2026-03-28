import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Fetch task joined with project for access check
    const { data: task, error: fetchError } = await supabase
      .from('Task')
      .select(`
        *,
        project:Project!inner (
          workspace:Workspace!inner (
            members:WorkspaceMember!inner ( userId )
          )
        ),
        subtasks:Subtask (*),
        assignees:TaskAssignee (
          user:User (*)
        ),
        tags:TaskTag (
          tag:Tag (*)
        )
      `)
      .eq('id', params.id)
      .eq('project.workspace.members.userId', user.id)
      .order('createdAt', { foreignTable: 'subtasks', ascending: true })
      .single();

    if (fetchError || !task) {
      // It might be a task where the user is just an assignee or creator, 
      // even if the workspace join fails or is too restrictive.
      // But standard access is via workspace.
      return NextResponse.json({ error: "Task not found or access denied" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Task Detail Error:", error);
    return NextResponse.json({ error: "Failed to fetch task details" }, { status: 500 });
  }
}
