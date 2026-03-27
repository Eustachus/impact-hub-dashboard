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
    const resources = await (prisma as any).projectResource.findMany({
      where: { projectId: params.id },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(resources);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { title, url, type } = await req.json();
    if (!title || !url) {
      return NextResponse.json({ error: "Title and URL are required" }, { status: 400 });
    }

    const project = await (prisma as any).project.update({
      where: { id: params.id },
      data: {
        resources: {
          create: {
            title,
            url,
            type: type || "LINK",
          }
        }
      },
      include: { resources: true }
    });
    
    return NextResponse.json(project.resources[project.resources.length - 1]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create resource" }, { status: 500 });
  }
}
