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
    const userId = user.id;

    // 1. Get project with workspace check
    const { data: project, error } = await supabase
      .from('Project')
      .select(`
        *,
        workspace:Workspace (
          members:WorkspaceMember (
            userId
          )
        ),
        members:ProjectMember (
          role,
          user:User (
            id,
            name,
            email,
            image
          )
        ),
        resources:Resource (*)
      `)
      .eq('id', params.id)
      .single();

    if (error || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // 2. Verify workspace membership
    const isMember = project.workspace.members.some((m: any) => m.userId === userId);
    if (!isMember) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 3. Get task count separately (Supabase doesn't support _count in composite selects easily)
    const { count: taskCount } = await supabase
      .from('Task')
      .select('*', { count: 'exact', head: true })
      .eq('projectId', params.id);

    return NextResponse.json({
      ...project,
      _count: { tasks: taskCount || 0 }
    });
  } catch (err: any) {
    console.error("Project fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const userId = user.id;

    // Access check
    const { data: projectAccess, error: accessError } = await supabase
      .from('Project')
      .select('id, workspaceId, workspace:Workspace(members:WorkspaceMember(userId))')
      .eq('id', params.id)
      .single();

    if (accessError || !projectAccess) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const isMember = (projectAccess.workspace as any).members.some((m: any) => m.userId === userId);
    if (!isMember) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { name, description, brief, icon, status, color } = await req.json();

    const { data: updatedProject, error: updateError } = await supabase
      .from('Project')
      .update({
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(brief !== undefined && { brief }),
        ...(icon !== undefined && { icon }),
        ...(status && { status }),
        ...(color && { color }),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json(updatedProject);
  } catch (err: any) {
    console.error("Project update error:", err);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const userId = user.id;

    // Access check
    const { data: projectAccess, error: accessError } = await supabase
      .from('Project')
      .select('id, workspaceId, workspace:Workspace(members:WorkspaceMember(userId))')
      .eq('id', params.id)
      .single();

    if (accessError || !projectAccess) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const isMember = (projectAccess.workspace as any).members.some((m: any) => m.userId === userId);
    if (!isMember) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { error: deleteError } = await supabase
      .from('Project')
      .delete()
      .eq('id', params.id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (err: any) {
    console.error("Project delete error:", err);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
