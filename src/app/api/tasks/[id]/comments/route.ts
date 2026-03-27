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
    const comments = await prisma.comment.findMany({
      where: { taskId: params.id },
      include: { user: { select: { name: true, image: true } } },
      orderBy: { createdAt: "asc" }
    });
    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { content } = await req.json();
    if (!content) return NextResponse.json({ error: "Content is required" }, { status: 400 });

    const comment = await prisma.comment.create({
      data: {
        content,
        taskId: params.id,
        userId: (session.user as any).id
      },
      include: { user: { select: { name: true, image: true } } }
    });
    return NextResponse.json(comment);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
