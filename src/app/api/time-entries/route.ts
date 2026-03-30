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
        task:Task (
          title,
          project:Project (
            name
          )
        )
      `)
      .eq('userId', user.id)
      .order('date', { ascending: false })
      .limit(10);

    if (fetchError) throw fetchError;

    const formatted = entries.map((e: Record<string, unknown>) => {
      const task = e.task as Record<string, unknown> | undefined;
      const project = task?.project as Record<string, unknown> | undefined;
      return {
        id: e.id,
        task: task?.title || "Tâche inconnue",
        project: project?.name || "Projet inconnu",
        duration: Math.floor((e.duration as number) / 3600) + "h " + Math.floor(((e.duration as number) % 3600) / 60) + "m",
        date: new Date(e.date as string).toLocaleDateString()
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch time entries" }, { status: 500 });
  }
}
