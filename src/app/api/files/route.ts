import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const userId = user.id;
    
    // Fetch all attachments with task/project/workspace context
    const { data: files, error } = await supabase
      .from('Attachment')
      .select(`
        *,
        task:Task (
          id,
          title,
          creatorId,
          creator:User ( name ),
          assignees:TaskAssignee ( userId ),
          project:Project (
            workspace:Workspace (
              members:WorkspaceMember ( userId )
            )
          )
        )
      `)
      .order('createdAt', { ascending: false });

    if (error) throw error;

    // Filter by access rights in memory for complex OR logic across joins
    const formattedFiles = files
      .filter((f: any) => {
        const task = f.task;
        if (!task) return false;

        const isCreator = task.creatorId === userId;
        const isAssignee = task.assignees?.some((a: any) => a.userId === userId);
        const isWorkspaceMember = task.project?.workspace?.members?.some((m: any) => m.userId === userId);

        return isCreator || isAssignee || isWorkspaceMember;
      })
      .map((f: any) => ({
        id: f.id,
        name: f.name,
        type: f.type,
        size: (f.size / 1024 / 1024).toFixed(1) + " MB",
        date: new Date(f.createdAt).toLocaleDateString(),
        user: f.task?.creator?.name || "Système",
        taskTitle: f.task?.title
      }));

    return NextResponse.json(formattedFiles);
  } catch (error: any) {
    console.error("Files API error:", error);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}
