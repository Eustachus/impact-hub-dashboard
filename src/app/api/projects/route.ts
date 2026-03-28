import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const supabase = createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Get workspace IDs where the user is a member
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId: user.id },
      select: { workspaceId: true }
    });

    const workspaceIds = memberships.map(m => m.workspaceId);

    if (workspaceIds.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Fetch projects for these workspaces with task counts
    const projects = await prisma.project.findMany({
      where: { workspaceId: { in: workspaceIds } },
      include: {
        _count: {
          select: { tasks: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(projects);
  } catch (error: any) {
    console.error("Fetch Projects Error details:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });
    return NextResponse.json({ error: "Failed to fetch projects", details: error.message }, { status: 500 });
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
    
    // 1. Find ANY workspace for this user
    let membership = await prisma.workspaceMember.findFirst({
      where: { userId: user.id },
      select: { workspaceId: true }
    });

    let workspaceId;

    // 2. If no workspace, create a default one
    if (!membership) {
      const newWorkspace = await prisma.workspace.create({
        data: {
          name: "Mon Espace",
          members: {
            create: {
              userId: user.id,
              role: "ADMIN"
            }
          }
        }
      });
      workspaceId = newWorkspace.id;
    } else {
      workspaceId = membership.workspaceId;
    }

    // 3. Create project
    const project = await prisma.project.create({
      data: {
        name,
        description,
        color,
        workspaceId,
      }
    });
    
    return NextResponse.json(project);
  } catch (error: any) {
    console.error("Project Creation Error details:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });
    return NextResponse.json({ error: "Failed to create project", details: error.message }, { status: 500 });
  }
}
