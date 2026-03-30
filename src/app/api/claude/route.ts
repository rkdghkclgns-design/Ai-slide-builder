import { NextRequest, NextResponse } from "next/server";
import { getApiKey } from "@/lib/supabase";

export async function GET() {
  return NextResponse.json({ status: "ok", service: "gemini" });
}

interface GeminiContent {
  role: string;
  parts: { text: string }[];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { system, userContent, useSearch } = body as {
      system: string | null;
      userContent: string;
      useSearch: boolean;
    };

    // Supabase에서 Google API Key 조회
    const apiKey = await getApiKey("google");
    if (!apiKey) {
      return NextResponse.json(
        {
          type: "error",
          error: {
            message:
              "Google API Key가 설정되지 않았습니다. Supabase api_keys 테이블에 service='google' 키를 추가해주세요.",
          },
        },
        { status: 500 }
      );
    }

    // Gemini API 호출
    const contents: GeminiContent[] = [];

    if (system) {
      contents.push({ role: "user", parts: [{ text: system }] });
      contents.push({
        role: "model",
        parts: [{ text: "네, 이해했습니다. 지시에 따르겠습니다." }],
      });
    }

    const userText = useSearch
      ? `${userContent}\n\n(최신 정보를 포함하여 답변해주세요. 출처가 있다면 URL과 제목을 포함해주세요.)`
      : userContent;

    contents.push({ role: "user", parts: [{ text: userText }] });

    const geminiBody = {
      contents,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    };

    const model = "gemini-2.5-flash";
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const res = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiBody),
    });

    const json = await res.json();

    if (!res.ok) {
      const errMsg =
        json.error?.message || JSON.stringify(json).substring(0, 300);
      return NextResponse.json(
        { type: "error", error: { message: `Gemini API: ${errMsg}` } },
        { status: res.status }
      );
    }

    // Gemini 응답을 통일된 형식으로 변환
    const text =
      json.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text || "")
        .join("") || "";

    // 웹 검색 시뮬레이션: 텍스트에서 URL 패턴 추출
    const sources: { title: string; url: string }[] = [];
    if (useSearch) {
      const urlRegex = /https?:\/\/[^\s)}\]"']+/g;
      const urls = text.match(urlRegex) || [];
      for (const url of urls.slice(0, 10)) {
        if (!sources.some((s) => s.url === url)) {
          const domain = new URL(url).hostname.replace("www.", "");
          sources.push({ title: domain, url });
        }
      }
    }

    return NextResponse.json({
      content: [
        ...(sources.length > 0
          ? [
              {
                type: "web_search_tool_result",
                content: sources.map((s) => ({
                  type: "web_search_result",
                  title: s.title,
                  url: s.url,
                })),
              },
            ]
          : []),
        { type: "text", text },
      ],
      stop_reason: "end_turn",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { type: "error", error: { message } },
      { status: 500 }
    );
  }
}
