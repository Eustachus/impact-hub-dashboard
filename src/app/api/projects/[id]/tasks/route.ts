import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { data: tasks, error } = await supabase
      .from('Task')
      .select(`
        *,
        assignees:TaskAssignment (
          membership:Membership (
            user:User (
              id,
              name,
              image
            )
          )
        ),
        timeEntries:TimeEntry (*)
      `)
      .eq('projectId', params.id)
      .order('createdAt', { ascending: true });

    if (error) throw error;

    // Manual count mapping since Supabase join count is complex
    const tasksWithCount = await Promise.all(tasks.map(async (t: any) => {
      const { count: commentCount } = await supabase
        .from('Comment')
        .select('*', { count: 'exact', head: true })
        .eq('taskId', t.id);
      
      const { count: subtaskCount } = await supabase
        .from('Task')
        .select('*', { count: 'exact', head: true })
        .eq('parentId', t.id);

      return {
        ...t,
        _count: {
          comments: commentCount || 0,
          subtasks: subtaskCount || 0
        }
      };
    }));

    return NextResponse.json(tasksWithCount);
  } catch (error: any) {
    console.error("Project tasks fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch project tasks" }, { status: 500 });
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
    const json = await req.json();
    const { title, description, status, priority, sectionId, startDate, dueDate, parentId, assigneeIds, effort } = json;
    
    // 1. Create task
    const { data: task, error: taskError } = await supabase
      .from('Task')
      .insert({
        title,
        description: description || "",
        status: status || "TODO",
        priority: priority || "NONE",
        projectId: params.id,
        creatorId: user.id,
        sectionId: sectionId || null,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        parentId: parentId || null,
        order: 0,
        effort: effort || null,
      })
      .select()
      .single();

    if (taskError) throw taskError;

    // 2. Add assignees
    if (assigneeIds && assigneeIds.length > 0) {
      await supabase
        .from('TaskAssignee')
        .insert(assigneeIds.map((userId: string) => ({ taskId: task.id, userId })));
    }

    // 3. Get full task with assignees for response
    const { data: fullTask } = await supabase
      .from('Task')
      .select(`
        *,
        assignees:TaskAssignee (
          userId,
          user:User (*)
        )
      `)
      .eq('id', task.id)
      .single();

    return NextResponse.json(fullTask);
  } catch (error: any) {
    console.error("Task creation error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request
) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, taskId, title, description, status, priority, order, sectionId, startDate, dueDate, effort, completed, assigneeIds } = await req.json();
    
    const targetId = id || taskId;
    if (!targetId) return NextResponse.json({ error: "Task ID is required" }, { status: 400 });

    // 1. Update task
    const { data: task, error: updateError } = await supabase
      .from('Task')
      .update({
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(order !== undefined && { order }),
        ...(sectionId !== undefined && { sectionId }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate).toISOString() : null }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate).toISOString() : null }),
        ...(effort !== undefined && { effort }),
        ...(completed !== undefined && { 
          completed,
          completedAt: completed ? new Date().toISOString() : null 
        }),
      })
      .eq('id', targetId)
      .select()
      .single();

    if (updateError) throw updateError;

    // 2. Handle assignments if provided
    if (assigneeIds) {
      // Clear old and insert new
      await supabase.from('TaskAssignee').delete().eq('taskId', targetId);
      if (assigneeIds.length > 0) {
        await supabase
          .from('TaskAssignee')
          .insert(assigneeIds.map((userId: string) => ({ taskId: targetId, userId })));
      }
    }

    // 3. Get full task for response
    const { data: fullTask } = await supabase
      .from('Task')
      .select(`
        *,
        assignees:TaskAssignee (
          userId,
          user:User (*)
        )
      `)
      .eq('id', targetId)
      .single();

    return NextResponse.json(fullTask);
  } catch (error: any) {
    console.error("Task update error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}
