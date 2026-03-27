import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const userId = (session.user as { id: string }).id;
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { creatorId: userId },
          { assignees: { some: { userId } } },
          { project: { workspace: { members: { some: { userId } } } } }
        ]
      },
      include: { project: true },
      orderBy: { updatedAt: "desc" }
    });
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}
