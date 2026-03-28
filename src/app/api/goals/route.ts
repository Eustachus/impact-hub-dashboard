import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Get organization IDs where user is a member
    const { data: memberships } = await supabase
      .from('Membership')
      .select('organizationId')
      .eq('userId', user.id);
    const organizationIds = memberships?.map(m => m.organizationId) || [];

    if (organizationIds.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Fetch goals for these organizations
    const { data: goals, error: fetchError } = await supabase
      .from('Goal')
      .select(`
        id,
        title,
        status,
        keyResults:KeyResult (*),
        owner:User ( name )
      `)
      .in('organizationId', organizationIds)
      .order('createdAt', { ascending: false });

    if (fetchError) throw fetchError;

    const formattedGoals = (goals || []).map((g: any) => {
      const keyResults = g.keyResults || [];
      const avgProgress = keyResults.length > 0 
        ? keyResults.reduce((acc: number, kr: any) => acc + (kr.currentValue / kr.targetValue), 0) / keyResults.length
        : 0;

      return {
        id: g.id,
        title: g.title,
        owner: g.owner?.name || "Equipe",
        progress: Math.round(avgProgress * 100),
        status: g.status,
        color: g.status === 'ON_TRACK' ? 'bg-green-500' : g.status === 'AT_RISK' ? 'bg-orange-500' : 'bg-red-500'
      };
    });

    return NextResponse.json(formattedGoals);
  } catch (error) {
    console.error("Fetch Goals Error:", error);
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
  }
}
