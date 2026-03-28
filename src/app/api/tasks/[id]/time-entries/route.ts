import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const userId = user.id;

    // Check task access: Creator, Assignee, or Workspace Member
    const { data: taskAccess, error: accessError } = await supabase
      .from('Task')
      .select('id, creatorId, projectId, Project(workspaceId)')
      .eq('id', params.id)
      .single();

    if (accessError || !taskAccess) {
      return NextResponse.json({ error: "Task not found or access denied" }, { status: 404 });
    }

    // Verify workspace membership or assignment
    const { data: memberData } = await supabase
      .from('WorkspaceMember')
      .select('id')
      .eq('workspaceId', taskAccess.Project.workspaceId)
      .eq('userId', userId)
      .single();

    const { data: assignmentData } = await supabase
      .from('TaskAssignee')
      .select('taskId')
      .eq('taskId', params.id)
      .eq('userId', userId)
      .single();

    if (taskAccess.creatorId !== userId && !memberData && !assignmentData) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { data: entries, error } = await supabase
      .from('TimeEntry')
      .select(`
        *,
        user:User (
          id,
          name,
          email
        )
      `)
      .eq('taskId', params.id)
      .order('createdAt', { ascending: false });

    if (error) throw error;

    return NextResponse.json(entries);
  } catch (error: any) {
    console.error("Time-entries fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch time entries" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const userId = user.id;
    const { duration, description, date } = await req.json();
    
    if (typeof duration !== "number" || duration < 0) {
      return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
    }

    // Task access check
    const { data: taskAccess, error: accessError } = await supabase
      .from('Task')
      .select('id, creatorId, projectId, Project(workspaceId)')
      .eq('id', params.id)
      .single();

    if (accessError || !taskAccess) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Verify workspace membership or assignment
    const { data: memberData } = await supabase
      .from('WorkspaceMember')
      .select('id')
      .eq('workspaceId', taskAccess.Project.workspaceId)
      .eq('userId', userId)
      .single();

    const { data: assignmentData } = await supabase
      .from('TaskAssignee')
      .select('taskId')
      .eq('taskId', params.id)
      .eq('userId', userId)
      .single();

    if (taskAccess.creatorId !== userId && !memberData && !assignmentData) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { data: entry, error: insertError } = await supabase
      .from('TimeEntry')
      .insert({
        duration,
        description: description || "",
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
        taskId: params.id,
        userId: userId,
      })
      .select(`
        *,
        user:User (
          id,
          name,
          email
        )
      `)
      .single();

    if (insertError) throw insertError;

    return NextResponse.json(entry);
  } catch (error: any) {
    console.error("Time-entry creation error:", error);
    return NextResponse.json({ error: "Failed to create time entry" }, { status: 500 });
  }
}
