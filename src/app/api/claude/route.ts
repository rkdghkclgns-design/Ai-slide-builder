import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { type: "error", error: { message: "ANTHROPIC_API_KEY not configured" } },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

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
