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
      .filter((f: Record<string, unknown>) => {
        const task = f.task as Record<string, unknown> | undefined;
        if (!task) return false;

        const isCreator = task.creatorId === userId;
        const isAssignee = (task.assignees as Record<string, unknown>[] | undefined)?.some((a: Record<string, unknown>) => a.userId === userId);
        const isWorkspaceMember = (task.project as Record<string, unknown> | undefined)?.workspace
          ? ((task.project as Record<string, unknown>).workspace as Record<string, unknown>).members
            ? (((task.project as Record<string, unknown>).workspace as Record<string, unknown>).members as Record<string, unknown>[]).some((m: Record<string, unknown>) => m.userId === userId)
            : false
          : false;

        return isCreator || isAssignee || isWorkspaceMember;
      })
      .map((f: Record<string, unknown>) => {
        const task = f.task as Record<string, unknown> | undefined;
        const creator = task?.creator as Record<string, unknown> | undefined;
        return {
          id: f.id,
          name: f.name,
          type: f.type,
          size: ((f.size as number) / 1024 / 1024).toFixed(1) + " MB",
          date: new Date(f.createdAt as string).toLocaleDateString(),
          user: creator?.name || "Système",
          taskTitle: task?.title
        };
      });

    return NextResponse.json(formattedFiles);
  } catch (error: unknown) {
    console.error("Files API error:", error);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}
