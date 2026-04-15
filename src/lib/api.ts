import { Source } from "./types";

export const _SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const _SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/* ═══ Gemini 응답 타입 ═══ */
interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
    finishReason?: string;
  }>;
  error?: { message?: string };
}

/* ═══ 통합 응답 타입 (기존 코드 호환) ═══ */
export interface AskResult {
  text: string;
  sources: Source[];
  stop_reason?: string;
}

/* ═══ Gemini Edge Function 호출 ═══ */
export async function ask(
  system: string | null,
  userContent: string,
  _useSearch = false
): Promise<AskResult> {
  if (!_SB_URL || !_SB_KEY) {
    throw new Error("Supabase 환경변수가 설정되지 않았습니다.");
  }

  const content = system
    ? `${system}\n\n${userContent}`
    : userContent;

  const res = await fetch(`${_SB_URL}/functions/v1/gemini-proxy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${_SB_KEY}`,
    },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    let errorMsg = `HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      errorMsg = errJson.error || errJson.details || JSON.stringify(errJson).substring(0, 300);
    } catch {
      // non-JSON
    }
    throw new Error(`API Error: ${errorMsg}`);
  }

  const json: GeminiResponse = await res.json();

  if (json.error) {
    throw new Error(`API Error: ${json.error.message || JSON.stringify(json.error)}`);
  }

  const text = json.candidates?.[0]?.content?.parts
    ?.map((p) => p.text || "")
    .join("\n") || "";

  return {
    text,
    sources: [],
    stop_reason: json.candidates?.[0]?.finishReason,
  };
}

/* ═══ 텍스트 추출 (호환 래퍼) ═══ */
export function pullText(d: AskResult): string {
  return d?.text || "";
}

/* ═══ 출처 추출 (호환 래퍼) ═══ */
export function pullSources(d: AskResult): Source[] {
  return d?.sources || [];
}

/* ═══ JSON 파싱 유틸 ═══ */
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

/* ═══ Storage 업로드 ═══ */
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

/* ═══ AI 이미지 생성 ═══ */
export async function generateImage(prompt: string): Promise<string | null> {
  try {
    if (!_SB_URL || !_SB_KEY) return null;
    const res = await fetch(`${_SB_URL}/functions/v1/image-gen`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${_SB_KEY}`,
      },
      body: JSON.stringify({ prompt }),
    });
    const json = await res.json();
    return json.url || null;
  } catch {
    return null;
  }
}
