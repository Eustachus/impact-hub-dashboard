import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

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
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        workspace: {
          include: {
            members: {
              where: { userId }
            }
          }
        },
        _count: {
          select: { tasks: true }
        }
      }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // 2. Verify workspace membership
    if (project.workspace.members.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(project);
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
    const projectAccess = await prisma.project.findUnique({
      where: { id: params.id },
      select: {
        workspace: {
          select: {
            members: {
              where: { userId }
            }
          }
        }
      }
    });

    if (!projectAccess) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (projectAccess.workspace.members.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { name, description, brief, icon, status, color } = await req.json();

    const updatedProject = await prisma.project.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(brief !== undefined && { brief }),
        ...(icon !== undefined && { icon }),
        ...(status && { status }),
        ...(color && { color }),
      }
    });

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
    const projectAccess = await prisma.project.findUnique({
      where: { id: params.id },
      select: {
        workspace: {
          select: {
            members: {
              where: { userId }
            }
          }
        }
      }
    });

    if (!projectAccess) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (projectAccess.workspace.members.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.project.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (err: any) {
    console.error("Project delete error:", err);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
