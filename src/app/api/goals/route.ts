import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const goals = await prisma.goal.findMany({
      include: {
        keyResults: true,
        owner: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    const formattedGoals = goals.map(g => {
      const avgProgress = g.keyResults.length > 0 
        ? g.keyResults.reduce((acc, kr) => acc + (kr.currentValue / kr.targetValue), 0) / g.keyResults.length
        : 0;

      return {
        id: g.id,
        title: g.title,
        owner: g.owner?.name || "Equipe",
        progress: Math.round(avgProgress * 100),
        status: g.status,
        color: g.status === 'ON_TRACK' ? 'bg-green-500' : g.status === 'AT_RISK' ? 'bg-orange-500' : 'bg-red-500'
      };
    });

    return NextResponse.json(formattedGoals);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
  }
}
