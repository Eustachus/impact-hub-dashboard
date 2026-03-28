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
    const sections = await prisma.section.findMany({
      where: { projectId: params.id },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(sections);
  } catch (error: any) {
    console.error("Sections fetch error details:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });
    return NextResponse.json({ 
      error: "Failed to fetch sections", 
      details: error.message,
      code: error.code 
    }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { name, order } = await req.json();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const section = await prisma.section.create({
      data: {
        name,
        order: order || 0,
        projectId: params.id
      }
    });

    return NextResponse.json(section);
  } catch (error: any) {
    console.error("Section creation error:", error);
    return NextResponse.json({ error: "Failed to create section" }, { status: 500 });
  }
}
