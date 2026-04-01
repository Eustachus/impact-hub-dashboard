import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { emitSocket } from "@/lib/socket";

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
        assignees:TaskAssignee (
          userId,
          user:User (
            id,
            name,
            image
          )
        ),
        timeEntries:TimeEntry (*)
      `)
      .eq('projectId', params.id)
      .order('createdAt', { ascending: true });

    if (error) throw error;

    const taskList = (tasks || []) as Record<string, unknown>[];

    // Batch fetch comment and subtask counts in 2 queries instead of 2N
    const taskIds = taskList.map(t => t.id as string);

    const [commentsResult, subtasksResult] = await Promise.all([
      supabase.from('Comment').select('taskId').in('taskId', taskIds),
      supabase.from('Task').select('parentId').in('parentId', taskIds),
    ]);

    // Count in memory
    const commentCounts: Record<string, number> = {};
    for (const c of (commentsResult.data || [])) {
      commentCounts[c.taskId] = (commentCounts[c.taskId] || 0) + 1;
    }

    const subtaskCounts: Record<string, number> = {};
    for (const s of (subtasksResult.data || [])) {
      if (s.parentId) subtaskCounts[s.parentId] = (subtaskCounts[s.parentId] || 0) + 1;
    }

    const tasksWithCount = taskList.map(t => ({
      ...t,
      _count: {
        comments: commentCounts[t.id as string] || 0,
        subtasks: subtaskCounts[t.id as string] || 0,
      }
    }));

    return NextResponse.json(tasksWithCount);
  } catch (error: unknown) {
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

    // 4. Broadcast creation via socket
    emitSocket("task:created", {
      taskId: task.id,
      projectId: params.id,
      userId: user.id,
    });

    return NextResponse.json(fullTask);
  } catch (error: unknown) {
    console.error("Task creation error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, taskId, title, description, status, priority, order, sectionId, startDate, dueDate, effort, completed, assigneeIds } = await req.json();
    
    const targetId = id || taskId;
    if (!targetId) return NextResponse.json({ error: "Task ID is required" }, { status: 400 });

    // Verify task belongs to this project
    const { data: existingTask } = await supabase
      .from('Task')
      .select('id, projectId')
      .eq('id', targetId)
      .maybeSingle();

    if (!existingTask || (existingTask as Record<string, unknown>).projectId !== params.id) {
      return NextResponse.json({ error: "Task not found in this project" }, { status: 404 });
    }

    // 1. Update task
    const { error: updateError } = await supabase
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
    const { data: fullTaskData } = await supabase
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

    const fullTask = fullTaskData as Record<string, unknown> | null;

    // 4. Broadcast update via socket
    emitSocket("task:updated", {
      taskId: targetId,
      projectId: fullTask?.projectId,
      userId: user.id,
    });

    return NextResponse.json(fullTask);
  } catch (error: unknown) {
    console.error("Task update error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}
