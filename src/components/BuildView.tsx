"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  Upload,
  Link2,
  FileText,
  X,
  LayoutGrid,
  Clock,
  ImageIcon,
  Palette,
  FolderOpen,
  Wand2,
  Check,
  Trash2,
  Sparkles,
  Loader2,
} from "lucide-react";
import { THEMES } from "@/lib/themes";
import { storageGet, storageSet } from "@/lib/storage";
import { ask, pullText, pullSources, tryParse, generateImage } from "@/lib/api";
import {
  InputMode,
  SlideData,
  Source,
  Template,
  Theme,
} from "@/lib/types";
import MiniPreview from "./MiniPreview";

interface BuildViewProps {
  onGenerated: (
    slides: SlideData[],
    theme: Theme,
    sources: Source[]
  ) => void;
  onLoadingStart: () => void;
  onStatusChange: (status: string) => void;
  onProgressChange: (progress: number) => void;
  onError: (error: string) => void;
  templates: Template[];
  onTemplatesChange: (templates: Template[]) => void;
}

export default function BuildView({
  onGenerated,
  onLoadingStart,
  onStatusChange,
  onProgressChange,
  onError,
  templates,
  onTemplatesChange,
}: BuildViewProps) {
  const [mode, setMode] = useState<InputMode>("command");
  const [cmd, setCmd] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [url, setUrl] = useState("");
  const [slideCount, setSlideCount] = useState<number | "">(8);
  const [duration, setDuration] = useState<number | "">(15);
  const [themeId, setThemeId] = useState("neonGaming");
  const [aiTheme, setAiTheme] = useState(false);
  const [useImages, setUseImages] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const sc = typeof slideCount === "number" ? slideCount : 0;
  const dur = typeof duration === "number" ? duration : 0;
  const canGo =
    !busy &&
    sc >= 1 &&
    dur >= 1 &&
    (mode === "command"
      ? cmd.trim().length >= 2
      : mode === "file"
        ? !!file
        : url.trim().length > 5);

  const handleFile = (f: File) => {
    setFile(f);
    const ext = f.name.split(".").pop()?.toLowerCase();
    const reader = new FileReader();
    if (ext === "md" || ext === "txt") {
      reader.onload = (e) => setFileContent(e.target?.result as string);
      reader.readAsText(f);
    } else {
      reader.onload = (e) =>
        setFileContent((e.target?.result as string).split(",")[1]);
      reader.readAsDataURL(f);
    }
  };

  const generate = async () => {
    if (!canGo) return;
    setBusy(true);
    onLoadingStart();
    onProgressChange(10);
    const chosenTheme = aiTheme ? null : THEMES[themeId];

    try {
      let data = "";
      let srcs: Source[] = [];

      onStatusChange("콘텐츠 수집 중...");
      if (mode === "command") {
        const r = await ask(
          "신뢰 출처 기반으로 검색하여 핵심 데이터를 정리해주세요.",
          cmd.trim(),
          true
        );
        srcs = pullSources(r);
        data = pullText(r);
        if (!data.trim()) throw new Error("리서치 결과가 비어있습니다.");
      } else if (mode === "url") {
        const r = await ask(
          "이 URL의 내용을 검색하여 요약해주세요.",
          url.trim(),
          true
        );
        srcs = pullSources(r);
        data = pullText(r);
      } else {
        const ext = file!.name.split(".").pop()?.toLowerCase();
        data =
          ext === "md" || ext === "txt"
            ? fileContent
            : "파일 내용 기반으로 프레젠테이션을 만들어주세요.";
      }

      onProgressChange(40);
      onStatusChange("슬라이드 생성 중...");

      const n = Math.min(sc, 8);
      const slidePrompt = `아래 내용으로 ${n}개 슬라이드를 만들어주세요.
첫 슬라이드: type "cover", 마지막: type "closing", 나머지: "content" 또는 "quote".
${useImages ? `각 슬라이드에 반드시 "imagePrompt" 필드를 추가하세요.
imagePrompt 작성 규칙:
- 반드시 영문으로 작성
- 슬라이드의 핵심 내용과 직접적으로 관련된 구체적 장면 묘사
- "professional photograph of..." 또는 "illustration showing..." 으로 시작
- 슬라이드 제목+설명의 핵심 키워드를 반드시 포함
- 40-80단어로 상세하게 작성
예: "professional photograph of a diverse team of engineers collaborating around a holographic AI interface in a modern glass office, with data visualizations floating in the air, warm lighting"` : ""}
JSON만 출력: {"slides":[{"type":"cover","title":"제목","subtitle":"설명"},{"type":"content","title":"제목","description":"내용","items":[{"title":"항목","desc":"설명"}]},{"type":"closing","title":"감사합니다"}]}

내용:
${data.substring(0, 1200)}`;

      const slideRes = await ask(null, slidePrompt, false);
      const raw = pullText(slideRes);
      const parsed = tryParse(raw) as { slides?: SlideData[]; recommendedTheme?: string } | null;

      if (!parsed?.slides?.length) {
        throw new Error(
          `슬라이드 파싱 실패.\n\nAPI 응답 (처음 300자):\n${raw?.substring(0, 300) || "(빈 응답)"}\n\nstop_reason: ${slideRes.stop_reason || "unknown"}`
        );
      }

      let allSlides = parsed.slides;

      if (sc > 8) {
        const extraBatches = Math.ceil((sc - allSlides.length) / 6);
        for (let b = 0; b < extraBatches && allSlides.length < sc; b++) {
          onStatusChange(`추가 슬라이드 생성 ${b + 1}/${extraBatches}...`);
          onProgressChange(60 + Math.round((b / extraBatches) * 30));
          const need = Math.min(6, sc - allSlides.length);
          try {
            const extra = await ask(
              null,
              `아래 내용으로 슬라이드 ${need}개 추가 생성. type "content" 또는 "quote"만. JSON: {"slides":[...]}. 내용:\n${data.substring(0, 800)}`,
              false
            );
            const ep = tryParse(pullText(extra)) as { slides?: SlideData[] } | null;
            if (ep?.slides?.length) allSlides = [...allSlides, ...ep.slides];
          } catch {
            // continue with what we have
          }
        }
      }

      if (useImages) {
        onStatusChange("AI 이미지 생성 중...");
        onProgressChange(80);

        // 슬라이드별 이미지 프롬프트 구성
        const prompts = allSlides.map((s) => {
          if (s.imagePrompt) return s.imagePrompt;
          const context = [
            s.title,
            s.description,
            ...(Array.isArray(s.items)
              ? s.items.map((it) => (typeof it === "string" ? it : it.title))
              : []),
          ]
            .filter(Boolean)
            .join(", ");
          return context
            ? `professional photograph related to: ${context}. Style: clean, modern, high quality`
            : "modern abstract business presentation visual";
        });

        // 2개씩 순차 배치로 생성 (rate limit 방지)
        const imageUrls: (string | null)[] = new Array(prompts.length).fill(null);
        const batchSize = 2;
        for (let i = 0; i < prompts.length; i += batchSize) {
          const batch = prompts.slice(i, i + batchSize);
          const results = await Promise.allSettled(
            batch.map((p) => generateImage(p))
          );
          results.forEach((r, j) => {
            imageUrls[i + j] = r.status === "fulfilled" ? r.value : null;
          });
          onStatusChange(`이미지 생성 중... (${Math.min(i + batchSize, prompts.length)}/${prompts.length})`);
          onProgressChange(80 + Math.round(((i + batchSize) / prompts.length) * 15));
        }

        allSlides = allSlides.map((s, i) =>
          imageUrls[i] ? { ...s, imageUrl: imageUrls[i]! } : s
        );
      }

      const finalTheme =
        chosenTheme ||
        (parsed.recommendedTheme && THEMES[parsed.recommendedTheme]) ||
        THEMES.neonGaming;

      onProgressChange(100);
      onStatusChange("완료!");
      setTimeout(() => onGenerated(allSlides, finalTheme, srcs), 300);
    } catch (e) {
      onStatusChange("오류 발생");
      onError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const modeOptions: { id: InputMode; icon: typeof Search; label: string }[] = [
    { id: "command", icon: Search, label: "리서치" },
    { id: "file", icon: Upload, label: "파일" },
    { id: "url", icon: Link2, label: "URL" },
  ];

  const suggestions = ["2025 AI 시장 전망", "게임 산업 트렌드", "React vs Vue"];

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-auto p-6"
      style={{
        background: "#09090b",
        fontFamily: "'Plus Jakarta Sans',sans-serif",
      }}
    >
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute rounded-full"
          style={{
            background: "#f97316",
            opacity: 0.05,
            filter: "blur(180px)",
            width: 600,
            height: 600,
            top: "-20%",
            left: "-10%",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            background: "#a855f7",
            opacity: 0.03,
            filter: "blur(180px)",
            width: 500,
            height: 500,
            bottom: "-15%",
            right: "-5%",
          }}
        />
      </div>

      <div className="animate-slide-up relative z-10 w-full max-w-2xl space-y-6 py-8">
        {/* Header */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-orange-500/20 bg-orange-500/5 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-orange-400">
            <Sparkles className="h-3.5 w-3.5" />
            AI Slide Builder
          </div>
          <h1 className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent">
            프레젠테이션 생성기
          </h1>
          <p className="mx-auto max-w-md text-sm text-white/30">
            주제를 입력하면 AI가 리서치부터 슬라이드 구성까지 자동으로
            완성합니다
          </p>
        </div>

        {/* Input Card — Glass */}
        <div className="rounded-3xl border border-white/8 bg-white/[.03] p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <h3 className="flex-1 text-sm font-semibold text-white">
              콘텐츠 입력
            </h3>
            <div className="flex overflow-hidden rounded-xl border border-white/8 bg-white/[.02]">
              {modeOptions.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setMode(id)}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-all"
                  style={{
                    background:
                      mode === id
                        ? "rgba(249,115,22,.12)"
                        : "transparent",
                    color:
                      mode === id ? "#f97316" : "rgba(255,255,255,.35)",
                  }}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {mode === "command" && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
                <input
                  type="text"
                  value={cmd}
                  onChange={(e) => setCmd(e.target.value)}
                  placeholder="예: 2025년 AI 시장 동향"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && canGo) generate();
                  }}
                  className="w-full rounded-2xl border border-white/8 bg-white/[.03] py-4 pl-12 pr-4 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-orange-500/30 focus:bg-white/[.05]"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((x) => (
                  <button
                    key={x}
                    onClick={() => setCmd(x)}
                    className="rounded-xl border border-white/6 px-3.5 py-2 text-[11px] font-medium text-white/30 transition-all hover:border-white/15 hover:bg-white/5 hover:text-white/50"
                  >
                    {x}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === "file" && (
            <div
              className="cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors hover:bg-white/[.02]"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files.length)
                  handleFile(e.dataTransfer.files[0]);
              }}
              style={{
                borderColor: file ? "#39ff1430" : "rgba(255,255,255,.08)",
              }}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".md,.txt,.pdf,.pptx"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFile(e.target.files[0]);
                }}
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="h-5 w-5" style={{ color: "#39ff14" }} />
                  <span className="text-sm font-medium text-white">
                    {file.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setFileContent("");
                    }}
                    className="ml-2 rounded-lg p-1.5 hover:bg-white/10"
                  >
                    <X className="h-3.5 w-3.5 text-white/40" />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="mx-auto mb-2 h-8 w-8 text-white/15" />
                  <p className="text-sm text-white/30">
                    파일 드래그 또는 클릭
                  </p>
                  <p className="mt-1 text-xs text-white/15">
                    .md, .txt, .pdf, .pptx
                  </p>
                </div>
              )}
            </div>
          )}

          {mode === "url" && (
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="URL 붙여넣기"
              className="w-full rounded-2xl border border-white/8 bg-white/[.03] px-5 py-4 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-orange-500/30 focus:bg-white/[.05]"
            />
          )}
        </div>

        {/* Settings Row */}
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              label: "슬라이드",
              value: slideCount,
              onChange: (v: string) => {
                const n = parseInt(v);
                setSlideCount(isNaN(n) ? "" : Math.max(1, Math.min(100, n)));
              },
              onBlur: () => {
                if (typeof slideCount !== "number" || slideCount < 1)
                  setSlideCount(8);
              },
              icon: LayoutGrid,
            },
            {
              label: "발표(분)",
              value: duration,
              onChange: (v: string) => {
                const n = parseInt(v);
                setDuration(isNaN(n) ? "" : Math.max(1, Math.min(480, n)));
              },
              onBlur: () => {
                if (typeof duration !== "number" || duration < 1)
                  setDuration(15);
              },
              icon: Clock,
            },
          ].map(({ label, value, onChange, onBlur, icon: Icon }) => (
            <div
              key={label}
              className="rounded-3xl border border-white/8 bg-white/[.03] p-5 backdrop-blur-xl"
            >
              <div className="mb-3 flex items-center gap-2">
                <Icon className="h-4 w-4 text-white/25" />
                <h3 className="text-sm font-semibold text-white">{label}</h3>
              </div>
              <input
                type="number"
                inputMode="numeric"
                min="1"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                className="w-full rounded-2xl border border-white/8 bg-white/[.03] px-4 py-3 text-center text-2xl font-bold text-white outline-none transition-colors focus:border-orange-500/30"
                style={{ fontFamily: "'Chakra Petch',monospace" }}
              />
            </div>
          ))}
        </div>

        {/* Images toggle */}
        <div
          className="rounded-3xl border p-5 backdrop-blur-xl transition-colors"
          style={{
            borderColor: useImages
              ? "rgba(57,255,20,.15)"
              : "rgba(255,255,255,.08)",
            background: useImages
              ? "rgba(57,255,20,.03)"
              : "rgba(255,255,255,.03)",
          }}
        >
          <div className="flex items-center gap-3">
            <ImageIcon className="h-4 w-4 text-white/25" />
            <h3 className="flex-1 text-sm font-semibold text-white">
              AI 이미지
            </h3>
            <button
              onClick={() => setUseImages(!useImages)}
              className="relative h-7 w-14 rounded-full transition-all"
              style={{
                background: useImages ? "#39ff14" : "rgba(255,255,255,.1)",
              }}
            >
              <div
                className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-lg transition-all"
                style={{ left: useImages ? 30 : 2 }}
              />
            </button>
          </div>
          {useImages && (
            <p className="mt-2 text-xs text-green-400/50">
              각 슬라이드에 AI 생성 이미지가 포함됩니다
            </p>
          )}
        </div>

        {/* Theme */}
        <div className="space-y-4 rounded-3xl border border-white/8 bg-white/[.03] p-5 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-white/25" />
            <h3 className="flex-1 text-sm font-semibold text-white">테마</h3>
            {templates.length > 0 && (
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="flex items-center gap-1 rounded-xl border px-3 py-2 text-xs font-medium transition-all hover:bg-white/5"
                style={{
                  borderColor: showTemplates
                    ? "#f9731630"
                    : "rgba(255,255,255,.08)",
                  color: showTemplates
                    ? "#f97316"
                    : "rgba(255,255,255,.4)",
                }}
              >
                <FolderOpen className="h-3 w-3" />
                서식({templates.length})
              </button>
            )}
            <button
              onClick={() => setAiTheme(!aiTheme)}
              className="flex items-center gap-1 rounded-xl border px-3 py-2 text-xs font-medium transition-all hover:bg-white/5"
              style={{
                borderColor: aiTheme
                  ? "#a78bfa30"
                  : "rgba(255,255,255,.08)",
                color: aiTheme ? "#a78bfa" : "rgba(255,255,255,.4)",
              }}
            >
              <Wand2 className="h-3 w-3" />
              AI
            </button>
          </div>

          {/* Saved templates */}
          {showTemplates && templates.length > 0 && (
            <div className="space-y-1 rounded-2xl border border-orange-500/10 bg-orange-500/[.03] p-3">
              {templates.map((tp) => {
                const th = THEMES[tp.tid];
                if (!th) return null;
                return (
                  <div
                    key={tp.id}
                    className="group flex cursor-pointer items-center gap-3 rounded-xl p-2.5 hover:bg-white/[.03]"
                    onClick={() => {
                      setThemeId(tp.tid);
                      setAiTheme(false);
                      setShowTemplates(false);
                    }}
                  >
                    <span>{th.ic}</span>
                    <span className="flex-1 truncate text-sm text-white/60">
                      {tp.name}
                    </span>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        const next = templates.filter(
                          (x) => x.id !== tp.id
                        );
                        onTemplatesChange(next);
                        storageSet("slide-tpls", next);
                      }}
                      className="rounded-lg p-1 opacity-0 transition-opacity hover:bg-white/10 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3 text-white/30" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Theme grid */}
          {!aiTheme && (
            <div className="grid grid-cols-5 gap-3">
              {Object.values(THEMES).map((th) => (
                <div key={th.id} className="space-y-2">
                  <button
                    onClick={() => setThemeId(th.id)}
                    className="relative w-full overflow-hidden rounded-2xl border p-1.5 transition-all hover:scale-105"
                    style={{
                      borderColor:
                        themeId === th.id
                          ? th.a1 + "60"
                          : "rgba(255,255,255,.05)",
                      boxShadow:
                        themeId === th.id
                          ? `0 0 20px ${th.a1}15`
                          : "none",
                    }}
                  >
                    {themeId === th.id && (
                      <div
                        className="absolute right-1.5 top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full"
                        style={{ background: th.a1 }}
                      >
                        <Check className="h-3 w-3 text-black" />
                      </div>
                    )}
                    <MiniPreview theme={th} />
                  </button>
                  <p className="text-center text-[10px] text-white/40">
                    {th.ic} {th.nm}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* AI theme */}
          {aiTheme && (
            <div className="flex items-center gap-3 rounded-2xl border border-dashed border-violet-400/15 bg-violet-400/[.03] p-5">
              <Wand2 className="h-5 w-5 text-violet-400" />
              <p className="text-sm text-white/40">
                AI가 콘텐츠에 최적화된 테마를 자동 선택합니다
              </p>
            </div>
          )}
        </div>

        {/* Generate Button */}
        <button
          onClick={generate}
          disabled={!canGo}
          className="group relative w-full overflow-hidden rounded-3xl py-5 text-base font-bold transition-all"
          style={{
            background: canGo
              ? "linear-gradient(135deg,#f97316,#ec4899,#a855f7)"
              : "rgba(255,255,255,.05)",
            color: canGo ? "#fff" : "rgba(255,255,255,.2)",
            cursor: canGo ? "pointer" : "not-allowed",
          }}
        >
          {canGo && (
            <div className="absolute inset-0 bg-white/0 transition-all group-hover:bg-white/10" />
          )}
          <span className="relative z-10 flex items-center justify-center gap-2">
            {busy ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                슬라이드 생성
              </>
            )}
          </span>
          {canGo && (
            <div
              className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
              style={{
                boxShadow:
                  "0 0 40px rgba(249,115,22,.3), 0 0 80px rgba(236,72,153,.15)",
              }}
            />
          )}
        </button>
      </div>
    </div>
  );
}
