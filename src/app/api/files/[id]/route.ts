import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Get the attachment with its task to check access
    const { data: attachmentData, error: fetchError } = await supabase
      .from('Attachment')
      .select('*, task:Task(creatorId)')
      .eq('id', params.id)
      .maybeSingle();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attachment = attachmentData as any;

    if (fetchError || !attachment) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Only task creator can delete
    if (attachment.task?.creatorId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete from Supabase Storage if url is a storage path
    if (attachment.url) {
      try {
        const urlPath = new URL(attachment.url).pathname;
        const storagePath = urlPath.split('/storage/v1/object/public/attachments/')[1];
        if (storagePath) {
          await supabase.storage.from('attachments').remove([storagePath]);
        }
      } catch {
        // URL might not be a Supabase storage URL, skip storage cleanup
      }
    }

    // Delete attachment record
    const { error: deleteError } = await supabase
      .from('Attachment')
      .delete()
      .eq('id', params.id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ message: "File deleted successfully" });
  } catch (error: unknown) {
    console.error("File delete error:", (error as Error).message);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
