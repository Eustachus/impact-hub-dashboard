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
      .select('organizationId, id')
      .eq('userId', user.id);
    
    const organizationIds = memberships?.map(m => m.organizationId) || [];
    const memberIds = memberships?.map(m => m.id) || [];

    // 2. Fetch tasks for the user's organizations with project details
    const { data: tasks, error: fetchError } = await supabase
      .from('Task')
      .select('*, project:Project!inner(*)')
      .in('organizationId', organizationIds)
      .order('updatedAt', { ascending: false });

    if (fetchError) throw fetchError;

    return NextResponse.json(tasks || []);
  } catch (error) {
    console.error("Fetch Tasks Error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}
