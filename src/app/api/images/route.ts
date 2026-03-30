import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function POST(req: NextRequest) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.json(
      { error: `Supabase 환경변수 미설정. URL=${!!SUPABASE_URL}, KEY=${!!SUPABASE_ANON_KEY}` },
      { status: 500 }
    );
  }

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

    if (!res.ok) {
      let errorMsg = `HTTP ${res.status}`;
      try {
        const json = await res.json();
        errorMsg = json.error || JSON.stringify(json).substring(0, 200);
      } catch {
        errorMsg = await res.text().catch(() => errorMsg);
      }
      return NextResponse.json({ error: errorMsg }, { status: res.status });
    }

    const json = await res.json();
    return NextResponse.json({ url: json.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
