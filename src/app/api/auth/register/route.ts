import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const supabase = createClient();

    // 1. Sign up user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (authError) {
      return NextResponse.json({ message: authError.message }, { status: authError.status || 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ message: "Failed to create auth user" }, { status: 500 });
    }

    // 2. Sync user to custom 'User' table via Supabase client
    // We use the Supabase Auth UUID as the internal User ID
    const { error: dbError } = await supabase
      .from('User')
      .insert({
        id: authData.user.id,
        name,
        email,
      });

    if (dbError) {
      console.error("DB Sync error:", dbError);
      // We don't necessarily fail the whole request because the auth user is created,
      // but it's good to log and handle.
    }

    return NextResponse.json({ 
      message: "User registered successfully", 
      user: {
        id: authData.user.id,
        email,
        name
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error("Registration error:", error);
    
    return NextResponse.json({ 
      message: "An unexpected error occurred during registration",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
