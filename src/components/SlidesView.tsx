"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, BookOpen, Save } from "lucide-react";
import { SlideData, Theme, Source, Template } from "@/lib/types";
import Slide from "./Slide";
import SourcesModal from "./SourcesModal";
import SaveModal from "./SaveModal";

interface SlidesViewProps {
  slides: SlideData[];
  theme: Theme;
  sources: Source[];
  onBack: () => void;
  onTemplatesSaved: (templates: Template[]) => void;
}

export default function SlidesView({
  slides,
  theme: t,
  sources,
  onBack,
  onTemplatesSaved,
}: SlidesViewProps) {
  const [cur, setCur] = useState(0);
  const [showSrc, setShowSrc] = useState(false);
  const [showSave, setShowSave] = useState(false);

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

      {/* Top bar — glass pill */}
      <div className="absolute inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-medium backdrop-blur-md transition-all hover:scale-105"
            style={{
              borderColor: t.cd,
              background: `${t.cb}`,
              color: t.tm,
            }}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            돌아가기
          </button>
          {sources.length > 0 && (
            <button
              onClick={() => setShowSrc(true)}
              className="flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-medium backdrop-blur-md transition-all hover:scale-105"
              style={{ borderColor: t.cd, background: t.cb, color: t.tm }}
            >
              <BookOpen className="h-3.5 w-3.5" />
              출처({sources.length})
            </button>
          )}
          <button
            onClick={() => setShowSave(true)}
            className="flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-medium backdrop-blur-md transition-all hover:scale-105"
            style={{ borderColor: t.cd, background: t.cb, color: t.tm }}
          >
            <Save className="h-3.5 w-3.5" />
            서식 저장
          </button>
        </div>
        <div className="flex w-44 items-center gap-3">
          <div
            className="h-1.5 flex-1 overflow-hidden rounded-full"
            style={{
              background: isLt ? "rgba(0,0,0,.06)" : "rgba(255,255,255,.05)",
            }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: `linear-gradient(90deg,${t.a1},${t.a2})`,
              }}
            />
          </div>
          <span
            className="text-[10px] font-medium"
            style={{ fontFamily: t.hf, color: t.tm }}
          >
            {cur + 1}/{slides.length}
          </span>
        </div>
      </div>

      {/* Slide content */}
      <div key={cur} className="h-full w-full">
        <Slide slide={slides[cur]} theme={t} idx={cur} />
      </div>

      {/* Bottom nav — glass pill */}
      <div className="absolute inset-x-0 bottom-0 z-50 flex items-center justify-between px-8 py-5">
        <div className="flex max-w-[60%] flex-wrap items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCur(i)}
              className="h-1.5 rounded-full transition-all duration-500"
              style={
                i === cur
                  ? {
                      width: 32,
                      background: t.a1,
                      boxShadow: `0 0 12px ${t.a1}50`,
                    }
                  : {
                      width: 8,
                      background: isLt
                        ? "rgba(0,0,0,.1)"
                        : "rgba(255,255,255,.08)",
                    }
              }
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          {([-1, 1] as const).map((d) => {
            const disabled =
              d === -1 ? cur === 0 : cur === slides.length - 1;
            return (
              <button
                key={d}
                onClick={() => goNav(d)}
                disabled={disabled}
                className="flex h-11 w-11 items-center justify-center rounded-xl border backdrop-blur-md transition-all hover:scale-110"
                style={{
                  borderColor: t.cd,
                  background: t.cb,
                  color: disabled ? t.tm : t.ts,
                  opacity: disabled ? 0.4 : 1,
                }}
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
