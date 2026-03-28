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
    const { data: comments, error } = await supabase
      .from('Comment')
      .select(`
        *,
        user:User (
          name,
          email
        )
      `)
      .eq('taskId', params.id)
      .order('createdAt', { ascending: true });

    if (error) throw error;
    return NextResponse.json(comments);
  } catch (error: any) {
    console.error("Comments fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch task comments" }, { status: 500 });
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
    const { content } = await req.json();
    if (!content) return NextResponse.json({ error: "Content is required" }, { status: 400 });

    const { data: comment, error: insertError } = await supabase
      .from('Comment')
      .insert({
        content,
        taskId: params.id,
        userId: user.id
      })
      .select(`
        *,
        user:User (
          name,
          email
        )
      `)
      .single();

    if (insertError) throw insertError;
    return NextResponse.json(comment);
  } catch (error: any) {
    console.error("Comment creation error:", error);
    return NextResponse.json({ error: "Failed to create task comment" }, { status: 500 });
  }
}
