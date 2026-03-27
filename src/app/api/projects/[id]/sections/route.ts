import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const sections = await (prisma as any).section.findMany({
      where: { projectId: params.id },
      orderBy: { order: "asc" }
    });
    return NextResponse.json(sections);
  } catch (error) {
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

    const project = await (prisma as any).project.update({
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
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create section" }, { status: 500 });
  }
}
