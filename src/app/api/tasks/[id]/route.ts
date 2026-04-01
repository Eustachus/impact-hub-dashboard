import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: task, error: fetchError } = await supabase
      .from('Task')
      .select(`
        *,
        project:Project!inner (
          id,
          name,
          workspaceId,
          workspace:Workspace!inner (
            id,
            members:WorkspaceMember!inner ( userId )
          )
        ),
        assignees:TaskAssignee (
          userId,
          user:User (*)
        ),
        tags:TaskTag (
          tag:Tag (*)
        ),
        comments:Comment (
          id,
          content,
          userId,
          createdAt,
          user:User ( id, name, image )
        ),
        subtasks:Task (
          id,
          title,
          status,
          priority,
          order
        )
      `)
      .eq('id', params.id)
      .single();

    if (fetchError || !task) {
      return NextResponse.json({ error: "Task not found or access denied" }, { status: 404 });
    }

    // Access check: creator, assignee, or workspace member
    const taskData = task as Record<string, unknown>;
    const isCreator = taskData.creatorId === user.id;
    const isAssignee = ((taskData.assignees as Record<string, unknown>[]) || [])
      .some((a: Record<string, unknown>) => a.userId === user.id);

    if (!isCreator && !isAssignee) {
      return NextResponse.json({ error: "Task not found or access denied" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Task Detail Error:", error);
    return NextResponse.json({ error: "Failed to fetch task details" }, { status: 500 });
  }
}
