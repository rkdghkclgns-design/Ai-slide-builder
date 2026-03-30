import { Source } from "./types";

interface ClaudeMessage {
  type?: string;
  content?: Array<{
    type: string;
    text?: string;
    content?: Array<{
      type: string;
      title?: string;
      url?: string;
    }>;
  }>;
  stop_reason?: string;
  error?: { message?: string };
}

export async function ask(
  system: string | null,
  userContent: string,
  useSearch = false
): Promise<ClaudeMessage> {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, userContent, useSearch }),
  });

  if (!res.ok) {
    let errorMsg = `HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      errorMsg = errJson.error?.message || JSON.stringify(errJson).substring(0, 200);
    } catch {
      // non-JSON error response
    }
    throw new Error(`API Error: ${errorMsg}`);
  }

  const json = await res.json();
  if (json.type === "error") {
    throw new Error(
      `API Error: ${json.error?.message || JSON.stringify(json.error)}`
    );
  }
  return json;
}

export function pullText(d: ClaudeMessage): string {
  if (!d?.content) return "";
  return d.content
    .filter((b) => b.type === "text")
    .map((b) => b.text || "")
    .join("\n");
}

export function pullSources(d: ClaudeMessage): Source[] {
  const out: Source[] = [];
  if (!d?.content) return out;
  for (const b of d.content) {
    if (b.type === "web_search_tool_result" && Array.isArray(b.content)) {
      for (const r of b.content) {
        if (
          r.type === "web_search_result" &&
          r.title &&
          r.url &&
          !out.some((x) => x.url === r.url)
        )
          out.push({ title: r.title, url: r.url });
      }
    }
  }
  return out;
}

export function tryParse(raw: string | undefined): Record<string, unknown> | null {
  if (!raw?.trim()) return null;
  const c = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  try {
    return JSON.parse(c);
  } catch {
    // try to extract JSON object
  }
  let depth = 0;
  let start = -1;
  for (let i = 0; i < c.length; i++) {
    if (c[i] === "{") {
      if (depth === 0) start = i;
      depth++;
    }
    if (c[i] === "}") {
      depth--;
      if (depth === 0 && start >= 0) {
        try {
          return JSON.parse(c.substring(start, i + 1));
        } catch {
          start = -1;
        }
      }
    }
  }
  return null;
}

const _SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const _SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function generateImage(prompt: string): Promise<string | null> {
  try {
    // 프론트엔드에서 Supabase Edge Function 직접 호출 (Vercel 10초 타임아웃 우회)
    const url = _SB_URL
      ? `${_SB_URL}/functions/v1/image-gen`
      : "/api/images"; // 폴백: Vercel 프록시
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (_SB_KEY) headers["Authorization"] = `Bearer ${_SB_KEY}`;

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ prompt }),
    });
    const json = await res.json();
    return json.url || null;
  } catch {
    return null;
  }
}
