import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    // 1. Find user by email
    const { data: targetUser, error: userError } = await supabase
      .from('User')
      .select('id, name, email')
      .eq('email', email)
      .maybeSingle();

    if (userError || !targetUser) {
      return NextResponse.json({ error: "User not found. They must register first." }, { status: 404 });
    }

    // 2. Only workspace admins can grant access
    const { data: adminWorkspaces } = await supabase
      .from('WorkspaceMember')
      .select('workspaceId')
      .eq('userId', user.id)
      .eq('role', 'ADMIN');

    if (!adminWorkspaces || adminWorkspaces.length === 0) {
      return NextResponse.json({ error: "Only workspace admins can grant access" }, { status: 403 });
    }

    // 3. Get projects only in admin's workspaces
    const { data: projects, error: projError } = await supabase
      .from('Project')
      .select('workspaceId')
      .in('workspaceId', adminWorkspaces.map(w => w.workspaceId));

    if (projError) throw projError;

    const workspaceIds = Array.from(new Set((projects || []).map(p => p.workspaceId)));

    if (workspaceIds.length === 0) {
      return NextResponse.json({ message: "No workspaces found", added: 0 });
    }

    // 3. Check which workspaces the user is already in
    const { data: existingMemberships } = await supabase
      .from('WorkspaceMember')
      .select('workspaceId')
      .eq('userId', targetUser.id)
      .in('workspaceId', workspaceIds);

    const existingWorkspaceIds = new Set((existingMemberships || []).map(m => m.workspaceId));
    const newWorkspaceIds = workspaceIds.filter(id => !existingWorkspaceIds.has(id));

    // 4. Add user to new workspaces
    if (newWorkspaceIds.length > 0) {
      const inserts = newWorkspaceIds.map(workspaceId => ({
        userId: targetUser.id,
        workspaceId,
        role: 'MEMBER',
      }));

      const { error: insertError } = await supabase
        .from('WorkspaceMember')
        .insert(inserts);

      if (insertError) throw insertError;
    }

    return NextResponse.json({
      user: { id: targetUser.id, name: targetUser.name, email: targetUser.email },
      totalWorkspaces: workspaceIds.length,
      alreadyMember: existingWorkspaceIds.size,
      added: newWorkspaceIds.length,
    });

  } catch (error: unknown) {
    console.error("Grant access error:", (error as Error).message);
    return NextResponse.json({ error: "Failed to grant access" }, { status: 500 });
  }
}
