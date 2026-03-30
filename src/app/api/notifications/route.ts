import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Get task IDs where user is creator or assignee (parallel)
    const [creatorResult, assignedResult] = await Promise.all([
      supabase.from('Task').select('id').eq('creatorId', user.id),
      supabase.from('TaskAssignee').select('taskId').eq('userId', user.id),
    ]);
    
    const relevantTaskIds = [
      ...(creatorResult.data?.map(t => t.id) || []),
      ...(assignedResult.data?.map(t => t.taskId) || [])
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

    const formatted = (notifications || []).map((n: Record<string, unknown>) => {
      const user = n.user as Record<string, unknown> | undefined;
      const task = n.task as Record<string, unknown> | undefined;
      return {
        id: n.id,
        user: user?.name || "Système",
        userImage: user?.image || null,
        action: n.action,
        target: task?.title || "Projet",
        task: n.task || null,
        type: (n.entityType as string).toLowerCase(),
        time: new Date(n.createdAt as string).toLocaleTimeString(),
        read: true // For now
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Fetch Notifications Error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
