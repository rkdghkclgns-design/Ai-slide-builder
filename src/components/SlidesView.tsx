"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, BookOpen, Save, Download, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { SlideData, Theme, Source, Template } from "@/lib/types";
import { exportToPptx } from "@/lib/export-pptx";
import Slide from "./Slide";
import SourcesModal from "./SourcesModal";
import SaveModal from "./SaveModal";

/* ── 스크립트 렌더러: 단락 구분 + 강조 컬러링 ── */
function ScriptRenderer({ text }: { text: string }) {
  // 메타 라벨 제거: (도입), (핵심 설명), (전환), (보충 설명) 등
  const cleaned = text
    .replace(/\(도입[^)]*\)\s*/g, "")
    .replace(/\(핵심\s*설명[^)]*\)\s*/g, "")
    .replace(/\(보충\s*설명[^)]*\)\s*/g, "")
    .replace(/\(전환[^)]*\)\s*/g, "")
    .replace(/\(연결[^)]*\)\s*/g, "")
    .replace(/\(마무리[^)]*\)\s*/g, "")
    .trim();

  const paragraphs = cleaned.split(/\n\n+|\n/).filter((p) => p.trim());

  return (
    <div className="space-y-4" style={{ fontFamily: "'맑은 고딕','Malgun Gothic',sans-serif", lineHeight: "2" }}>
      {paragraphs.map((p, i) => (
        <p key={i} className="text-sm text-white/80">
          <HighlightText text={p} isFirst={i === 0} />
        </p>
      ))}
    </div>
  );
}

/* ── 텍스트 강조: 숫자/퍼센트/기업명/키워드 컬러링 ── */
function HighlightText({ text, isFirst }: { text: string; isFirst: boolean }) {
  // 강조 패턴: 숫자+단위, 퍼센트, 따옴표 안 텍스트, 영문 고유명사
  const parts = text.split(
    /(\d[\d,.]*\s*(?:%|퍼센트|억|조|만|개|명|건|달러|원|위|배|년|월|GB|TB|MB)|\d{4}년|'[^']+?'|"[^"]+?"|「[^」]+」|『[^』]+』)/g
  );

  return (
    <>
      {parts.map((part, j) => {
        if (!part) return null;
        // 숫자+단위 또는 연도
        if (/^\d[\d,.]*\s*(%|퍼센트|억|조|만|개|명|건|달러|원|위|배|년|월|GB|TB|MB)$/.test(part) || /^\d{4}년$/.test(part)) {
          return <span key={j} style={{ color: "#60A5FA", fontWeight: 700 }}>{part}</span>;
        }
        // 따옴표 안 텍스트
        if (/^['""「『]/.test(part)) {
          return <span key={j} style={{ color: "#34D399", fontWeight: 600 }}>{part}</span>;
        }
        return <span key={j}>{part}</span>;
      })}
    </>
  );
}

interface SlidesViewProps {
  slides: SlideData[];
  theme: Theme;
  sources: Source[];
  onBack: () => void;
  onTemplatesSaved: (templates: Template[]) => void;
  useTemplate: boolean;
}

export default function SlidesView({
  slides: initialSlides,
  theme: t,
  sources,
  onBack,
  onTemplatesSaved,
  useTemplate,
}: SlidesViewProps) {
  const [cur, setCur] = useState(0);
  const [showSrc, setShowSrc] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showScript, setShowScript] = useState(true);
  const [editSlides, setEditSlides] = useState<SlideData[]>(initialSlides);
  const [editMode, setEditMode] = useState(-1);

  const slides = editSlides;
  const isLt = t.lt === true;
  const pct = ((cur + 1) / slides.length) * 100;

  const goNav = useCallback(
    (d: number) =>
      setCur((p) => Math.max(0, Math.min(slides.length - 1, p + d))),
    [slides.length]
  );

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      // script textarea에 포커스가 있으면 키보드 내비게이션 비활성화
      if ((e.target as HTMLElement)?.tagName === "TEXTAREA") return;
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goNav(1);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goNav(-1);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [goNav]);

  const updateScript = (idx: number, script: string) => {
    setEditSlides((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, script } : s))
    );
  };

  return (
    <div
      className="relative h-screen w-full select-none overflow-hidden"
      style={{ fontFamily: t.bf, background: t.bg }}
    >
      <style>{`
        *{box-sizing:border-box}
        body{margin:0;background:${t.bg}}
      `}</style>

      {/* Scanlines */}
      {t.sc && (
        <div
          className="pointer-events-none fixed inset-0 z-[998]"
          style={{
            opacity: 0.02,
            backgroundImage:
              "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,.04) 2px,rgba(255,255,255,.04) 4px)",
          }}
        />
      )}

      {/* Noise */}
      <svg
        className="pointer-events-none fixed inset-0 z-[999] h-full w-full"
        style={{ opacity: isLt ? 0.008 : 0.015 }}
      >
        <filter id="g">
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".75"
            numOctaves="4"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#g)" />
      </svg>

      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-3">
        <div
          className="flex items-center gap-2 rounded-2xl px-3 py-2 backdrop-blur-xl"
          style={{ background: "rgba(15,23,42,.75)" }}
        >
          {[
            { onClick: onBack, icon: <ChevronLeft className="h-3.5 w-3.5" />, label: "돌아가기" },
            ...(sources.length > 0
              ? [{ onClick: () => setShowSrc(true), icon: <BookOpen className="h-3.5 w-3.5" />, label: `출처(${sources.length})` }]
              : []),
            { onClick: () => setShowSave(true), icon: <Save className="h-3.5 w-3.5" />, label: "서식 저장" },
            {
              onClick: () => setShowScript(!showScript),
              icon: <FileText className="h-3.5 w-3.5" />,
              label: showScript ? "스크립트 닫기" : "스크립트",
            },
          ].map((btn, i) => (
            <button
              key={i}
              onClick={btn.onClick}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white/80 transition-all hover:bg-white/10 hover:text-white"
            >
              {btn.icon}
              {btn.label}
            </button>
          ))}
          <button
            onClick={async () => {
              setExporting(true);
              try {
                await exportToPptx(slides, t, "presentation", useTemplate);
              } catch {
                // silently fail
              } finally {
                setExporting(false);
              }
            }}
            disabled={exporting}
            className="flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-white/25"
          >
            <Download className="h-3.5 w-3.5" />
            {exporting ? "내보내는 중..." : "PPTX 다운로드"}
          </button>
        </div>
        <div
          className="flex w-40 items-center gap-2 rounded-2xl px-3 py-2 backdrop-blur-xl"
          style={{ background: "rgba(15,23,42,.75)" }}
        >
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg,#4F81BD,#C0504D)",
              }}
            />
          </div>
          <span className="text-[10px] font-medium text-white/60">
            {cur + 1}/{slides.length}
          </span>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex h-full">
        {/* Slide content */}
        <div className={`${showScript ? "w-[65%]" : "w-full"} h-full transition-all duration-300`}>
          <div key={cur} className="h-full w-full">
            <Slide slide={slides[cur]} theme={t} idx={cur} />
          </div>
        </div>

        {/* Script panel */}
        {showScript && (
          <div
            className="w-[35%] h-full flex flex-col border-l z-40 overflow-hidden"
            style={{
              borderColor: "rgba(255,255,255,.1)",
              background: "rgba(15,23,42,.95)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Script header */}
            <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,.08)" }}>
              <FileText className="h-4 w-4 text-blue-400" />
              <h3 className="flex-1 text-sm font-bold text-white">
                발표 스크립트
              </h3>
              <span className="text-[10px] text-white/30">
                슬라이드 {cur + 1}/{slides.length}
              </span>
            </div>

            {/* Current slide title */}
            <div className="px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,.05)" }}>
              <p className="text-xs text-blue-300/60 truncate">
                {slides[cur]?.type?.toUpperCase() || "CONTENT"} — {slides[cur]?.title || "제목 없음"}
              </p>
            </div>

            {/* Script display with paragraph breaks and keyword highlighting */}
            <div className="flex-1 overflow-auto">
              {editMode === cur ? (
                <div className="p-5">
                  <textarea
                    value={slides[cur]?.script || ""}
                    onChange={(e) => updateScript(cur, e.target.value)}
                    onBlur={() => setEditMode(-1)}
                    autoFocus
                    placeholder="강의 스크립트를 입력하세요..."
                    className="w-full h-full min-h-[300px] resize-none rounded-xl border bg-transparent p-4 text-sm text-white/80 placeholder-white/20 outline-none focus:border-blue-500/30"
                    style={{
                      borderColor: "rgba(255,255,255,.08)",
                      lineHeight: "2",
                      fontFamily: "'맑은 고딕','Malgun Gothic',sans-serif",
                    }}
                  />
                </div>
              ) : (
                <div
                  className="p-5 cursor-pointer hover:bg-white/[.02] transition-colors"
                  onClick={() => setEditMode(cur)}
                  title="클릭하여 편집"
                >
                  {slides[cur]?.script ? (
                    <ScriptRenderer text={slides[cur].script!} />
                  ) : (
                    <p className="text-sm text-white/20 italic">클릭하여 스크립트를 입력하세요...</p>
                  )}
                </div>
              )}
            </div>

            {/* Slide navigation in script panel */}
            <div
              className="flex items-center justify-between px-5 py-3 border-t"
              style={{ borderColor: "rgba(255,255,255,.08)" }}
            >
              <div className="flex gap-1 overflow-x-auto max-w-[70%]">
                {slides.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setCur(i)}
                    className="flex-shrink-0 rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-all"
                    style={{
                      background: i === cur ? "rgba(79,129,189,.2)" : "transparent",
                      color: i === cur ? "#4F81BD" : "rgba(255,255,255,.3)",
                      border: `1px solid ${i === cur ? "rgba(79,129,189,.3)" : "transparent"}`,
                    }}
                  >
                    {i + 1}
                    {s.script ? "" : ""}
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => goNav(-1)}
                  disabled={cur === 0}
                  className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 disabled:opacity-30"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => goNav(1)}
                  disabled={cur === slides.length - 1}
                  className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 disabled:opacity-30"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="absolute inset-x-0 bottom-0 z-50 flex items-center justify-between px-8 py-4">
        <div
          className={`flex max-w-[60%] flex-wrap items-center gap-1.5 rounded-2xl px-3 py-2 backdrop-blur-xl ${showScript ? "max-w-[40%]" : ""}`}
          style={{ background: "rgba(15,23,42,.7)" }}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCur(i)}
              className="h-1.5 rounded-full transition-all duration-500"
              style={
                i === cur
                  ? {
                      width: 28,
                      background: "#4F81BD",
                      boxShadow: "0 0 8px rgba(79,129,189,.5)",
                    }
                  : {
                      width: 8,
                      background: "rgba(255,255,255,.2)",
                    }
              }
            />
          ))}
        </div>
        <div
          className="flex items-center gap-2 rounded-2xl px-2 py-1.5 backdrop-blur-xl"
          style={{ background: "rgba(15,23,42,.7)" }}
        >
          {([-1, 1] as const).map((d) => {
            const disabled =
              d === -1 ? cur === 0 : cur === slides.length - 1;
            return (
              <button
                key={d}
                onClick={() => goNav(d)}
                disabled={disabled}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 transition-all hover:bg-white/15 hover:text-white"
                style={{ opacity: disabled ? 0.3 : 1 }}
              >
                {d === -1 ? (
                  <ChevronLeft className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      {showSrc && (
        <SourcesModal sources={sources} onClose={() => setShowSrc(false)} />
      )}
      {showSave && (
        <SaveModal
          themeId={t.id}
          onClose={() => setShowSave(false)}
          onSaved={onTemplatesSaved}
        />
      )}
    </div>
  );
}
