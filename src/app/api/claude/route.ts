import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET() {
  return NextResponse.json({ status: "ok", service: "gemini-edge-function" });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Supabase Edge Function 호출 (GEMINI_API_KEY 시크릿 사용)
    const res = await fetch(
      `${SUPABASE_URL}/functions/v1/gemini-proxy`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(body),
      }
    );

    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { type: "error", error: { message } },
      { status: 500 }
    );
  }
}
