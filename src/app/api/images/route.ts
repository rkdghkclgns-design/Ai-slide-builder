import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    const res = await fetch(`${SUPABASE_URL}/functions/v1/image-gen`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ prompt }),
    });

    const json = await res.json();

    if (!res.ok || json.error) {
      return NextResponse.json(
        { error: json.error || "Image generation failed" },
        { status: res.status }
      );
    }

    return NextResponse.json({ url: json.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
