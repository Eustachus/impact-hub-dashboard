import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: entries, error: fetchError } = await supabase
      .from('TimeEntry')
      .select(`
        id,
        duration,
        date,
        description,
        task:Task (
          title,
          project:Project (
            name
          )
        )
      `)
      .eq('userId', user.id)
      .order('date', { ascending: false })
      .limit(20);

    if (fetchError) throw fetchError;

    const formatted = (entries || []).map((e: Record<string, unknown>) => {
      const task = e.task as Record<string, unknown> | undefined;
      const project = task?.project as Record<string, unknown> | undefined;
      return {
        id: e.id,
        description: e.description || (task as Record<string, unknown> | undefined)?.title || "Time entry",
        task: (task as Record<string, unknown> | undefined)?.title || "Tache inconnue",
        project: (project as Record<string, unknown> | undefined)?.name || "Projet inconnu",
        duration: e.duration as number,
        date: e.date ? new Date(e.date as string).toLocaleDateString() : "Today"
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch time entries" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const supabase = createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { duration, description } = await req.json();
    if (!duration || duration < 1) {
      return NextResponse.json({ error: "Duration is required" }, { status: 400 });
    }

    const { data: entry, error: insertError } = await supabase
      .from('TimeEntry')
      .insert({
        duration,
        description: description || null,
        date: new Date().toISOString(),
        userId: user.id,
        taskId: "00000000-0000-0000-0000-000000000000",
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json(entry, { status: 201 });
  } catch (error: unknown) {
    console.error("Time entry creation error:", (error as Error).message);
    return NextResponse.json({ error: "Failed to create time entry" }, { status: 500 });
  }
}
