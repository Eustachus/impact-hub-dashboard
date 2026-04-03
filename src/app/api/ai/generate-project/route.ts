import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "AI API key not configured" }, { status: 500 });

  try {
    const { prompt } = await req.json();
    if (!prompt || prompt.trim().length < 10) {
      return NextResponse.json({ error: "Please provide a description of at least 10 characters." }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const systemPrompt = `You are a project management assistant. Generate a structured project plan from a user description.

Respond ONLY with a valid JSON object matching this exact schema:
{
  "name": "Project name (short, clear)",
  "description": "Brief project description (2-3 sentences)",
  "sections": [
    {
      "name": "Phase/section name",
      "tasks": [
        { "title": "Task title", "priority": "LOW|MEDIUM|HIGH|URGENT", "description": "Optional task detail" }
      ]
    }
  ]
}

Rules:
- Generate 3-5 sections (phases)
- Each section should have 3-8 realistic, actionable tasks
- Priorities should be distributed realistically
- Tasks should be specific and actionable
- Language: match the language of the user's prompt (French if French, English if English)
- Do NOT include any text outside the JSON object`;

    const result = await model.generateContent(
      `${systemPrompt}\n\nProject description: ${prompt}`
    );

    const text = result.response.text();
    
    // Extract JSON from possible markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : text;
    
    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json({ error: "AI returned invalid JSON. Please try again." }, { status: 500 });
    }

    if (!parsed.name || !parsed.sections || !Array.isArray(parsed.sections)) {
      return NextResponse.json({ error: "AI response is missing required fields." }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error("AI generation error:", (error as Error).message);
    return NextResponse.json({ error: "Failed to generate project plan." }, { status: 500 });
  }
}
