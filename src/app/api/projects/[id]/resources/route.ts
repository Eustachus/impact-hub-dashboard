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
    const { data: resources, error } = await supabase
      .from('Resource')
      .select('*')
      .eq('projectId', params.id)
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return NextResponse.json(resources);
  } catch (err: any) {
    console.error("Resources fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 });
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
    const { title, url, type } = await req.json();
    if (!title || !url) {
      return NextResponse.json({ error: "Title and URL are required" }, { status: 400 });
    }

    const { data: resource, error: insertError } = await supabase
      .from('Resource')
      .insert({
        title,
        url,
        type: type || "LINK",
        projectId: params.id
      })
      .select()
      .single();

    if (insertError) throw insertError;
    
    return NextResponse.json(resource);
  } catch (err: any) {
    console.error("Resource creation error:", err);
    return NextResponse.json({ error: "Failed to create resource" }, { status: 500 });
  }
}
