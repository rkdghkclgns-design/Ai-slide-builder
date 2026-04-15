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
  // GitHub Pages에서는 API 라우트가 동작하지 않으므로 Supabase Edge Function 직접 호출
  const url = _SB_URL
    ? `${_SB_URL}/functions/v1/gemini-proxy`
    : "/api/claude";

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (_SB_URL && _SB_KEY) {
    headers["Authorization"] = `Bearer ${_SB_KEY}`;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
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

export const _SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const _SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/** base64 data URL → Supabase Storage에 업로드 → public URL 반환 */
export async function uploadImageToStorage(dataUrl: string): Promise<string | null> {
  if (!_SB_URL || !_SB_KEY || !dataUrl.startsWith("data:")) return null;
  try {
    const [meta, base64] = dataUrl.split(",");
    const mime = meta.match(/data:([^;]+)/)?.[1] || "image/png";
    const ext = mime.split("/")[1] || "png";
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: mime });

    const fileName = `exports/img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const res = await fetch(`${_SB_URL}/storage/v1/object/templates/${fileName}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${_SB_KEY}`,
        "Content-Type": mime,
        "x-upsert": "true",
      },
      body: blob,
    });
    if (!res.ok) return null;
    return `${_SB_URL}/storage/v1/object/public/templates/${fileName}`;
  } catch {
    return null;
  }
}

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
