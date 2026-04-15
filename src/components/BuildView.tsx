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
  useTemplate: boolean;
  onUseTemplateChange: (v: boolean) => void;
}

export default function BuildView({
  onGenerated,
  onLoadingStart,
  onStatusChange,
  onProgressChange,
  onError,
  templates,
  onTemplatesChange,
  useTemplate,
  onUseTemplateChange,
}: BuildViewProps) {
  const [mode, setMode] = useState<InputMode>("command");
  const [cmd, setCmd] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [url, setUrl] = useState("");
  const [slideCount, setSlideCount] = useState<number | "">(8);
  const [duration, setDuration] = useState<number | "">(15);
  const [themeId, setThemeId] = useState("pptxTemplate");
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

      /* ── STEP 1: 리서치 ── */
      onStatusChange("심층 리서치 중...");
      if (mode === "command") {
        const r = await ask(
          `당신은 교육 콘텐츠 리서치 전문가입니다. 주어진 주제에 대해 ${sc}장 슬라이드, ${dur}분 강의에 사용할 수 있는 깊이 있는 자료를 작성하세요.

반드시 포함:
1. 정의 및 개념 정리 (명확한 용어 설명)
2. 역사적 배경과 발전 과정 (연도, 사건)
3. 핵심 데이터와 통계 (구체적 수치 10개 이상)
4. 주요 원리/메커니즘 상세 설명
5. 실제 사례 및 케이스 스터디 (기업명, 결과 포함) 최소 3개
6. 비교 분석 (장단점, 대안 비교표)
7. 전문가 의견 및 인용
8. 실무 적용 방법 및 팁
9. 미래 전망 및 트렌드
10. 핵심 요약 및 시사점

각 항목을 3-5문장 이상으로 구체적 수치와 함께 상세하게 작성하세요. 분량이 많을수록 좋습니다.`,
          cmd.trim(),
          true
        );
        srcs = pullSources(r);
        data = pullText(r);
        if (!data.trim()) throw new Error("리서치 결과가 비어있습니다.");
      } else if (mode === "url") {
        const r = await ask(
          `이 URL의 모든 내용을 깊이 있게 분석하세요. 핵심 논점, 구체적 수치, 사례, 인용구를 빠짐없이 정리하세요. 분량이 많을수록 좋습니다.`,
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

      /* ── STEP 2: 목차 설계 ── */
      onProgressChange(30);
      onStatusChange("강의 목차 설계 중...");

      const secPerSlide = Math.round((dur / sc) * 60);
      const outlineRes = await ask(null, `당신은 교육과정 설계 전문가(Curriculum Designer)입니다.

아래 리서치 내용으로 ${sc}장 슬라이드, 총 ${dur}분 강의의 상세 목차를 설계하세요.

## 필수 구조 (교안 도우미 규격 — 반드시 준수)
슬라이드는 반드시 다음 순서로 시작해야 합니다:
1번: 표지(cover) — 강의 제목과 부제
2번: 개요(intro) — 이 강의의 배경, 필요성, 다룰 내용 소개
3번: 학습 목표(objectives) — 이 강의를 마치면 할 수 있는 것 3가지

이후 본론:
4번~: 핵심 내용 — section으로 대주제 구분, 하위에 상세 슬라이드
- 개념 정의 → 이론 설명 → 구체적 예시 → 사례 분석 흐름
- 비교표(table), 사례연구(caseStudy) 적극 활용
- 5-8장마다 중간 요약(summary) 배치

마무리:
마지막-1번: 핵심 요약(summary) — 전체 내용 정리
마지막번: 마무리(closing)

## 규칙
- 각 슬라이드의 제목과 다룰 핵심 내용을 1줄로 구체적으로 작성
- 같은 type이 3번 이상 연속 금지
- section 슬라이드는 대주제 전환 시에만 사용

JSON만 출력:
{"outline":[{"idx":1,"title":"슬라이드 제목","type":"cover","topic":"다룰 내용 한줄 요약"},{"idx":2,...},...]}

리서치 내용:
${data.substring(0, 6000)}`, false);

      const outlineRaw = pullText(outlineRes);
      const outlineParsed = tryParse(outlineRaw) as { outline?: Array<{ idx: number; title: string; type: string; topic: string }> } | null;
      const outline = outlineParsed?.outline || [];

      /* ── STEP 3: 배치 슬라이드 생성 ── */
      onProgressChange(40);
      const BATCH = 10;
      const totalBatches = Math.ceil(sc / BATCH);
      let allSlides: SlideData[] = [];

      const typeSpec = `## type별 필수 필드
- "cover": title, subtitle
- "intro": title, description (개요 — 3-5문장. 이 강의의 배경, 필요성, 다룰 내용을 소개)
- "objectives": title, items (학습 목표 — 반드시 3개, 각 {title, desc}. "~할 수 있다" 형식)
- "section": partNumber, title, subtitle
- "twoColumn": title, items (반드시 2개, 각 {title, desc} — desc 3문장 이상)
- "threeCards": title, items (반드시 3개, 각 {title, desc} — desc 3문장 이상)
- "caseStudy": sectionLabel="Case Study", title, description (5문장 이상. 반드시 기업명/제품명, 도입 배경, 적용 방법, 결과(수치), 시사점 포함)
- "summary": title, quote (핵심 문장), author (선택)
- "table": title, tableHeaders (3-4개), tableRows (5-7행, 실제 비교 데이터)
- "content": title, description (3문장 이상), items (3-5개, 각 desc 2문장 이상)
- "closing": title`;

      for (let batch = 0; batch < totalBatches; batch++) {
        const isFirst = batch === 0;
        const batchStart = batch * BATCH;
        const batchSize = Math.min(BATCH, sc - allSlides.length);
        const batchNum = batch + 1;

        onStatusChange(`슬라이드 생성 중... (${batchNum}/${totalBatches})`);
        onProgressChange(40 + Math.round((batch / totalBatches) * 40));

        const batchOutline = outline.slice(batchStart, batchStart + batchSize);
        const outlineGuide = batchOutline.length > 0
          ? `\n\n## 이 배치의 목차 (반드시 이 순서와 type을 따르세요):\n${batchOutline.map((o) => `${o.idx}. [${o.type}] ${o.title} — ${o.topic}`).join("\n")}`
          : "";

        const prompt = `당신은 전문 강사이자 교안 작성 전문가입니다.
정확히 ${batchSize}개의 슬라이드를 생성하세요 (전체 ${sc}장 중 ${allSlides.length + 1}~${allSlides.length + batchSize}번째).

${typeSpec}

## 콘텐츠 품질 기준 (교안 도우미 수준 — 매우 중요!)
1. 설계 의도 부합성: 목차의 의도와 내용이 정확히 일치해야 합니다.
2. 대상 수준 적합성: 초보자도 이해할 수 있되, 전문 용어는 유지하고 괄호 안에 풀어쓴 정의를 병기하세요.
3. 사실 기반: 근거 없는 단정이나 추측 금지. 구체적 수치, 연도, 기업명을 포함하세요.
4. 분량 기준:
   - description: 최소 4문장 (배경→핵심→사례→의의)
   - items desc: 최소 3문장 (정의→설명→예시)
   - table: 실제 비교 데이터 5행 이상
   - caseStudy: 기업명, 도입시기, 적용방법, 결과(수치), 시사점 5문장 이상
5. 빈 필드, "...", 일반적 문구("다양한 분야에서 활용됩니다" 등) 절대 금지
6. 구조 연결성: 개요→학습목표→핵심내용→사례→정리 흐름이 자연스러워야 합니다.

## script 작성 기준 (강사 대본 — 바로 강의 가능 수준)
각 슬라이드에 "script" 필드 추가. 강사가 이 대본만 읽으면 바로 수업 가능해야 합니다.
- 분량: 약 ${secPerSlide}초 (${Math.round(secPerSlide * 3)}자 내외)
- 필수 구성:
  (1) 도입 한줄: "자, 이제 [주제]에 대해 알아보겠습니다." 또는 질문형 도입
  (2) 핵심 설명 (3-5문장): 슬라이드 내용을 구체적으로 풀어서 설명. 수치/사례 반드시 인용.
  (3) 보충 설명: 비유, 실제 사례, "예를 들면~" 표현 활용
  (4) 전환: "다음으로 [다음 주제]를 살펴보겠습니다." 자연스러운 연결
- 톤: 합쇼체(~합니다, ~입니다). 전문적이면서 이해하기 쉬운 강의 톤.
- 청중 참여: "여러분은 어떻게 생각하시나요?", "혹시 경험이 있으신가요?" 등 간간이 활용
${useImages ? '\n- 각 슬라이드에 "imagePrompt"(영문 40-80단어, 교육 자료 스타일 일러스트) 추가' : ""}

[자체 검증] 초안 작성 후 아래 확인 후 최종본만 출력:
- 모든 description이 4문장 이상인가?
- 모든 items desc가 3문장 이상인가?
- 빈 필드나 플레이스홀더가 없는가?
- script가 실제 강의 가능한 수준인가?

JSON만 출력 (마크다운 코드블록 없이): {"slides":[...]}
${outlineGuide}

## 리서치 내용:
${data.substring(0, 6000)}`;

        try {
          const res = await ask(null, prompt, false);
          const raw = pullText(res);
          const parsed = tryParse(raw) as { slides?: SlideData[] } | null;
          if (parsed?.slides?.length) {
            allSlides = [...allSlides, ...parsed.slides];
          }
        } catch (e) {
          if (isFirst) throw e;
        }
      }

      if (!allSlides.length) {
        throw new Error("슬라이드 생성 실패: 결과가 비어있습니다.");
      }

      if (useImages) {
        onStatusChange("AI 이미지 생성 중...");
        onProgressChange(80);

        // 슬라이드별 이미지 프롬프트 구성 (교안 도우미 수준)
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
            ? `Clean professional digital illustration for education slide about: ${context}. Style: modern flat design, suitable for lecture material. 16:9 aspect ratio. No text overlay.`
            : "Modern abstract education presentation visual, clean flat design, 16:9";
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

      const finalTheme = useTemplate
        ? THEMES.pptxTemplate
        : chosenTheme || THEMES.neonGaming;

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

        {/* PPTX Template — 기본 고정 양식 */}
        <div
          className="rounded-3xl border p-5 backdrop-blur-xl"
          style={{
            borderColor: "rgba(79,129,189,.25)",
            background: "rgba(79,129,189,.06)",
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-base">📄</span>
            <h3 className="flex-1 text-sm font-semibold text-white">
              기본 양식 — 슬라이드 템플릿
            </h3>
            <span className="rounded-lg bg-blue-500/20 px-2.5 py-1 text-[10px] font-bold text-blue-300">
              고정
            </span>
          </div>
          <p className="mt-2 text-xs text-blue-300/50">
            슬라이드 양식 템플릿(Navy/맑은고딕) 서식이 기본 적용됩니다. 아래에서 다른 테마를 선택할 수 있습니다.
          </p>
        </div>

        {/* Theme — optional alternative */}
        <div className="space-y-4 rounded-3xl border border-white/8 bg-white/[.03] p-5 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-white/25" />
            <h3 className="flex-1 text-sm font-semibold text-white">
              테마 변경 <span className="text-white/30 text-xs font-normal">(선택)</span>
            </h3>
            <button
              onClick={() => {
                if (themeId !== "pptxTemplate") {
                  setThemeId("pptxTemplate");
                  onUseTemplateChange(true);
                  setAiTheme(false);
                }
              }}
              className="flex items-center gap-1 rounded-xl border px-3 py-2 text-xs font-medium transition-all hover:bg-white/5"
              style={{
                borderColor: themeId === "pptxTemplate" ? "#4F81BD40" : "rgba(255,255,255,.08)",
                color: themeId === "pptxTemplate" ? "#4F81BD" : "rgba(255,255,255,.4)",
              }}
            >
              📄 기본
            </button>
            {templates.length > 0 && (
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="flex items-center gap-1 rounded-xl border px-3 py-2 text-xs font-medium transition-all hover:bg-white/5"
                style={{
                  borderColor: showTemplates ? "#f9731630" : "rgba(255,255,255,.08)",
                  color: showTemplates ? "#f97316" : "rgba(255,255,255,.4)",
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
                borderColor: aiTheme ? "#a78bfa30" : "rgba(255,255,255,.08)",
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
                      onUseTemplateChange(tp.tid === "pptxTemplate");
                      setAiTheme(false);
                      setShowTemplates(false);
                    }}
                  >
                    <span>{th.ic}</span>
                    <span className="flex-1 truncate text-sm text-white/60">{tp.name}</span>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        const next = templates.filter((x) => x.id !== tp.id);
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
              {Object.values(THEMES).filter((th) => th.id !== "pptxTemplate").map((th) => (
                <div key={th.id} className="space-y-2">
                  <button
                    onClick={() => {
                      setThemeId(th.id);
                      onUseTemplateChange(false);
                    }}
                    className="relative w-full overflow-hidden rounded-2xl border p-1.5 transition-all hover:scale-105"
                    style={{
                      borderColor: themeId === th.id ? th.a1 + "60" : "rgba(255,255,255,.05)",
                      boxShadow: themeId === th.id ? `0 0 20px ${th.a1}15` : "none",
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
