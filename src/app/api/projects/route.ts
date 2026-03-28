import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Get organization IDs where the user is a member
    const { data: memberships, error: memberError } = await supabase
      .from('Membership')
      .select('organizationId')
      .eq('userId', user.id);

    if (memberError) throw memberError;
    const organizationIds = memberships.map(m => m.organizationId);

    if (organizationIds.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Fetch projects for these organizations with task counts
    const { data: projects, error: projectError } = await supabase
      .from('Project')
      .select('*, tasks:Task(count)')
      .in('organizationId', organizationIds)
      .order('updatedAt', { ascending: false });

    if (projectError) throw projectError;

    // Format to match original output (_count)
    const formatted = projects.map(p => ({
      ...p,
      _count: {
        tasks: p.tasks?.[0]?.count || 0
      }
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Fetch Projects Error:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const supabase = createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, description, color } = await req.json();
    
    // 1. Find ANY organization for this user
    const { data: memberships, error: memberError } = await supabase
      .from('Membership')
      .select('organizationId')
      .eq('userId', user.id)
      .limit(1);

    if (memberError) throw memberError;

    let organizationId;

    // 2. If no organization, create a default one
    if (memberships.length === 0) {
      const { data: newOrg, error: orgError } = await supabase
        .from('Organization')
        .insert({ name: "Mon Espace", slug: `org-${Date.now()}` })
        .select()
        .single();

      if (orgError) throw orgError;
      organizationId = newOrg.id;

      const { error: memberCreateError } = await supabase
        .from('Membership')
        .insert({ userId: user.id, organizationId, role: "ADMIN" });

      if (memberCreateError) throw memberCreateError;
    } else {
      organizationId = memberships[0].organizationId;
    }

    // 3. Create project
    const { data: project, error: projectCreateError } = await supabase
      .from('Project')
      .insert({
        name,
        description,
        color,
        organizationId,
        createdBy: user.id,
      })
      .select()
      .single();

    if (projectCreateError) throw projectCreateError;
    
    return NextResponse.json(project);
  } catch (error) {
    console.error("Project Creation Error:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
