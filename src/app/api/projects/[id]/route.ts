import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function checkProjectAccess(supabase: ReturnType<typeof createClient>, projectId: string, userId: string) {
  // 1. Get the project with its workspace
  const { data: projectData, error } = await supabase
    .from('Project')
    .select('*, workspace:Workspace!inner(*)')
    .eq('id', projectId)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const project = projectData as any;

  if (error || !project) return { project: null, hasAccess: false };

  // 2. Check if user is a member of the workspace
  const { data: membership } = await supabase
    .from('WorkspaceMember')
    .select('id')
    .eq('userId', userId)
    .eq('workspaceId', project.workspaceId)
    .maybeSingle();

  return { project, hasAccess: !!membership };
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { project, hasAccess } = await checkProjectAccess(supabase, params.id, user.id);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get task count
    const { count } = await supabase
      .from('Task')
      .select('*', { count: 'exact', head: true })
      .eq('projectId', params.id);

    return NextResponse.json({
      ...project,
      _count: { tasks: count || 0 }
    });
  } catch (err: unknown) {
    console.error("Project fetch error:", (err as Error).message);
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
    const { hasAccess } = await checkProjectAccess(supabase, params.id, user.id);

    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { name, description, brief, icon, status, color } = await req.json();

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (brief !== undefined) updateData.brief = brief;
    if (icon !== undefined) updateData.icon = icon;
    if (status !== undefined) updateData.status = status;
    if (color !== undefined) updateData.color = color;

    const { data: updatedProject, error: updateError } = await supabase
      .from('Project')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json(updatedProject);
  } catch (err: unknown) {
    console.error("Project update error:", (err as Error).message);
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
    const { hasAccess } = await checkProjectAccess(supabase, params.id, user.id);

    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { error: deleteError } = await supabase
      .from('Project')
      .delete()
      .eq('id', params.id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (err: unknown) {
    console.error("Project delete error:", (err as Error).message);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
