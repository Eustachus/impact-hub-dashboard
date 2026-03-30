import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get workspace IDs where the user is a member
    const { data: memberships } = await supabase
      .from('WorkspaceMember')
      .select('workspaceId')
      .eq('userId', user.id);

    const workspaceIds = memberships?.map(m => m.workspaceId) || [];

    if (workspaceIds.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch goals for these workspaces
    const { data: goals, error: fetchError } = await supabase
      .from('Goal')
      .select(`
        id,
        title,
        status,
        targetDate,
        period,
        keyResults:KeyResult (*),
        owner:User ( name )
      `)
      .in('workspaceId', workspaceIds)
      .order('createdAt', { ascending: false });

    if (fetchError) throw fetchError;

    const formattedGoals = (goals || []).map((g: Record<string, unknown>) => {
      const keyResults = (g.keyResults as Record<string, unknown>[]) || [];
      const owner = g.owner as Record<string, unknown> | undefined;
      const avgProgress = keyResults.length > 0
        ? keyResults.reduce((acc: number, kr: Record<string, unknown>) => acc + ((kr.currentValue as number) / (kr.targetValue as number)), 0) / keyResults.length
        : 0;

      return {
        id: g.id,
        title: g.title,
        owner: owner?.name || "Equipe",
        progress: Math.round(avgProgress * 100),
        status: g.status,
        period: g.period,
        targetDate: g.targetDate,
        keyResults,
        color: g.status === 'ON_TRACK' ? 'bg-green-500' : g.status === 'AT_RISK' ? 'bg-orange-500' : 'bg-red-500'
      };
    });

    return NextResponse.json(formattedGoals);
  } catch (error) {
    console.error("Fetch Goals Error:", error);
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description, period, targetDate, keyResults } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Find workspace for user
    const { data: membership } = await supabase
      .from('WorkspaceMember')
      .select('workspaceId')
      .eq('userId', user.id)
      .limit(1)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: "No workspace found" }, { status: 400 });
    }

    // Create goal
    const { data: goal, error: goalError } = await supabase
      .from('Goal')
      .insert({
        title,
        description: description || null,
        status: 'ON_TRACK',
        period: period || null,
        targetDate: targetDate ? new Date(targetDate).toISOString() : null,
        workspaceId: membership.workspaceId,
        ownerId: user.id,
      })
      .select()
      .single();

    if (goalError) throw goalError;

    // Create key results if provided
    if (keyResults && keyResults.length > 0) {
      const krInserts = keyResults.map((kr: Record<string, unknown>) => ({
        title: kr.title,
        type: kr.type || 'NUMERIC',
        currentValue: 0,
        targetValue: kr.targetValue || 100,
        unit: kr.unit || null,
        goalId: goal.id,
      }));

      const { error: krError } = await supabase
        .from('KeyResult')
        .insert(krInserts);

      if (krError) throw krError;
    }

    // Fetch full goal with key results for response
    const { data: fullGoal } = await supabase
      .from('Goal')
      .select('*, keyResults:KeyResult(*)')
      .eq('id', goal.id)
      .single();

    return NextResponse.json(fullGoal, { status: 201 });
  } catch (error: unknown) {
    console.error("Goal creation error:", (error as Error).message);
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
  }
}
