import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Get task IDs where user is creator or assignee
    const { data: creatorTasks } = await supabase.from('Task').select('id').eq('creatorId', user.id);
    const { data: assignedTasks } = await supabase.from('TaskAssignee').select('taskId').eq('userId', user.id);
    
    const relevantTaskIds = [
      ...(creatorTasks?.map(t => t.id) || []),
      ...(assignedTasks?.map(t => t.taskId) || [])
    ];

    if (relevantTaskIds.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Fetch ActivityLogs for those tasks
    const { data: notifications, error: fetchError } = await supabase
      .from('ActivityLog')
      .select(`
        id,
        action,
        entityType,
        createdAt,
        user:User ( name, image ),
        task:Task (
          id,
          title,
          project:Project ( id, name, color ),
          assignees:TaskAssignee ( user:User ( id, name, image ) ),
          tags:TaskTag ( tag:Tag ( * ) )
        )
      `)
      .neq('userId', user.id)
      .in('taskId', relevantTaskIds)
      .order('createdAt', { ascending: false })
      .limit(20);

    if (fetchError) throw fetchError;

    const formatted = (notifications || []).map((n: any) => ({
      id: n.id,
      user: n.user?.name || "Système",
      userImage: n.user?.image || null,
      action: n.action,
      target: n.task?.title || "Projet",
      task: n.task || null,
      type: n.entityType.toLowerCase(),
      time: new Date(n.createdAt).toLocaleTimeString(),
      read: true // For now
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Fetch Notifications Error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
