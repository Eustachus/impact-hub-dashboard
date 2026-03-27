import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const projects = await prisma.project.findMany({
      where: {
        workspace: {
          members: {
            some: { userId: (session.user as { id: string }).id }
          }
        }
      },
      include: {
        _count: {
          select: { tasks: true }
        }
      },
      orderBy: { updatedAt: "desc" }
    });
    return NextResponse.json(projects);
  } catch {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { name, description, color } = await req.json();
    
    // 1. Find ANY workspace for this user
    let workspace = await prisma.workspace.findFirst({
      where: {
        members: { some: { userId: (session.user as { id: string }).id } }
      }
    });

    // 2. If no workspace, create a default one
    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          name: "Mon Espace",
          members: {
            create: { userId: (session.user as { id: string }).id, role: "ADMIN" }
          }
        }
      });
    }

    // 3. Create project
    const project = await prisma.project.create({
      data: {
        name,
        description,
        color,
        workspaceId: workspace.id,
      }
    });
    return NextResponse.json(project);
  } catch (error) {
    console.error("Project Creation Error:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
