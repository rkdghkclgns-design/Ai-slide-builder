import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function GET() {
  return NextResponse.json({
    status: SUPABASE_URL ? "ok" : "missing_env",
    service: "gemini-edge-function",
    hasUrl: !!SUPABASE_URL,
    hasKey: !!SUPABASE_ANON_KEY,
  });
}

export async function POST(req: NextRequest) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.json(
      {
        type: "error",
        error: {
          message: `Supabase 환경변수 미설정. URL=${!!SUPABASE_URL}, KEY=${!!SUPABASE_ANON_KEY}`,
        },
      },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();

    const res = await fetch(`${SUPABASE_URL}/functions/v1/gemini-proxy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      let errorMsg = `HTTP ${res.status}`;
      try {
        const json = await res.json();
        errorMsg = json.error?.message || JSON.stringify(json).substring(0, 300);
      } catch {
        errorMsg = await res.text().catch(() => errorMsg);
      }
      return NextResponse.json(
        { type: "error", error: { message: errorMsg } },
        { status: res.status }
      );
    }

    const json = await res.json();
    return NextResponse.json(json);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { type: "error", error: { message } },
      { status: 500 }
    );
  }
}
