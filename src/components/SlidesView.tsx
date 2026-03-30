"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, BookOpen, Save, Download } from "lucide-react";
import { SlideData, Theme, Source, Template } from "@/lib/types";
import { exportToPptx } from "@/lib/export-pptx";
import Slide from "./Slide";
import SourcesModal from "./SourcesModal";
import SaveModal from "./SaveModal";

interface SlidesViewProps {
  slides: SlideData[];
  theme: Theme;
  sources: Source[];
  onBack: () => void;
  onTemplatesSaved: (templates: Template[]) => void;
  useTemplate: boolean;
}

export default function SlidesView({
  slides,
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

  const isLt = t.lt === true;
  const pct = ((cur + 1) / slides.length) * 100;

  const goNav = useCallback(
    (d: number) =>
      setCur((p) => Math.max(0, Math.min(slides.length - 1, p + d))),
    [slides.length]
  );

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
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

      {/* Top bar — always visible */}
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

      {/* Slide content */}
      <div key={cur} className="h-full w-full">
        <Slide slide={slides[cur]} theme={t} idx={cur} />
      </div>

      {/* Bottom nav — always visible */}
      <div className="absolute inset-x-0 bottom-0 z-50 flex items-center justify-between px-8 py-4">
        <div
          className="flex max-w-[60%] flex-wrap items-center gap-1.5 rounded-2xl px-3 py-2 backdrop-blur-xl"
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
