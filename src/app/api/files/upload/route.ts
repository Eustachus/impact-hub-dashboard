import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const taskId = formData.get("taskId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!taskId) {
      return NextResponse.json({ error: "taskId is required" }, { status: 400 });
    }

    // Verify user has access to the task
    const { data: taskData } = await supabase
      .from('Task')
      .select('id, creatorId, project:Project(workspaceId)')
      .eq('id', taskId)
      .maybeSingle();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const task = taskData as any;

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projectData = task.project as any;
    const workspaceId = Array.isArray(projectData) ? projectData[0]?.workspaceId : projectData?.workspaceId;

    // Check access: creator or workspace member
    if (task.creatorId !== user.id) {
      const { data: membership } = await supabase
        .from('WorkspaceMember')
        .select('id')
        .eq('workspaceId', workspaceId)
        .eq('userId', user.id)
        .maybeSingle();

      if (!membership) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `${user.id}/${taskId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('attachments')
      .getPublicUrl(filePath);

    // Determine file type category
    let type = "file";
    if (file.type.startsWith("image/")) type = "image";
    else if (file.type === "application/pdf") type = "pdf";
    else if (file.type.includes("zip") || file.type.includes("compressed")) type = "zip";

    // Create Attachment record
    const { data: attachment, error: dbError } = await supabase
      .from('Attachment')
      .insert({
        name: file.name,
        url: urlData.publicUrl,
        size: file.size,
        type,
        taskId,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json(attachment, { status: 201 });
  } catch (error: unknown) {
    console.error("File upload error:", (error as Error).message);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
