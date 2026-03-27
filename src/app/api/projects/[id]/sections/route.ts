import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sections = await (prisma as any).section.findMany({
      where: { projectId: params.id },
      orderBy: { order: "asc" }
    });
    return NextResponse.json(sections);
  } catch {
    return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { name, order } = await req.json();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        sections: {
          create: {
            name,
            order: order || 0,
          }
        }
      },
      include: { sections: true }
    });
    
    return NextResponse.json(project.sections[project.sections.length - 1]);
  } catch {
    return NextResponse.json({ error: "Failed to create section" }, { status: 500 });
  }
}
