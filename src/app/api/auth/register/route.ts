import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ message: "User created", user }, { status: 201 });
  } catch (error: any) {
    console.error("Registration error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    
    // Check for specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json({ message: "A user with this email already exists" }, { status: 400 });
    }

    return NextResponse.json({ 
      message: "An error occurred during registration",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
