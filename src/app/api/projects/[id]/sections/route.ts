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
    const { data: sections, error } = await supabase
      .from('Section')
      .select('*')
      .eq('projectId', params.id)
      .order('order', { ascending: true });

    if (error) throw error;
    return NextResponse.json(sections);
  } catch (error: any) {
    console.error("Sections fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 });
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
    const { name, order } = await req.json();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const { data: section, error: insertError } = await supabase
      .from('Section')
      .insert({
        name,
        order: order || 0,
        projectId: params.id
      })
      .select()
      .single();

    if (insertError) throw insertError;
    
    return NextResponse.json(section);
  } catch (error: any) {
    console.error("Section creation error:", error);
    return NextResponse.json({ error: "Failed to create section" }, { status: 500 });
  }
}
