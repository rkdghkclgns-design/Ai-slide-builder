"use client";

import { Play } from "lucide-react";
import { SlideData, Theme } from "@/lib/types";
import SlideImage from "./SlideImage";

interface SlideProps {
  slide: SlideData;
  theme: Theme;
  idx: number;
}

function GlowOrb({
  colors,
  theme,
}: {
  colors: string[];
  theme: Theme;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {colors.map((c, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            background: c,
            opacity: theme.go,
            filter: "blur(140px)",
            width: 500,
            height: 500,
            ...([
              { top: "-15%", left: "-10%" },
              { bottom: "-15%", right: "-10%" },
            ][i] || { top: "-10%", left: "-5%" }),
          }}
        />
      ))}
    </div>
  );
}

function GridOverlay({ theme }: { theme: Theme }) {
  if (!theme.gr) return null;
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        opacity: 0.03,
        backgroundImage: `linear-gradient(${theme.a1}4d 1px,transparent 1px),linear-gradient(90deg,${theme.a1}4d 1px,transparent 1px)`,
        backgroundSize: "60px 60px",
      }}
    />
  );
}

export default function Slide({ slide: s, theme: t, idx }: SlideProps) {
  if (!s) return null;

  const accentColors = [t.a1, t.a2, t.a3];
  const accent = accentColors[idx % 3];
  const slideType = s.type || "content";
  const imgProps = { src: s.imageUrl, tm: t.tm, cb: t.cb };

  if (slideType === "cover") {
    return (
      <div className="relative flex h-full flex-col items-center justify-center px-8 text-center">
        <GlowOrb colors={[t.a1, t.a2]} theme={t} />
        <GridOverlay theme={t} />
        <div className="animate-slide-up relative z-10 space-y-6">
          {s.badge && (
            <div
              className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-bold uppercase"
              style={{
                fontFamily: t.hf,
                color: t.a1,
                borderColor: t.a1 + "25",
                background: t.a1 + "08",
                letterSpacing: ".2em",
              }}
            >
              <Play className="h-3 w-3" fill={t.a1} />
              {s.badge}
            </div>
          )}
          <h1
            className="text-6xl leading-none tracking-tight md:text-7xl lg:text-8xl"
            style={{ fontFamily: t.hf, fontWeight: 700 }}
          >
            <span style={{ color: t.tp }}>{s.title}</span>
            {s.titleGrad && (
              <>
                <br />
                <span
                  style={{
                    background: `linear-gradient(135deg,${t.a1},${t.a2},${t.a3})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {s.titleGrad}
                </span>
              </>
            )}
          </h1>
          {s.subtitle && (
            <p
              className="mx-auto max-w-lg text-lg"
              style={{ color: t.ts }}
            >
              {s.subtitle}
            </p>
          )}
          <SlideImage {...imgProps} />
        </div>
      </div>
    );
  }

  if (slideType === "closing") {
    return (
      <div className="relative flex h-full flex-col items-center justify-center px-8 text-center">
        <GlowOrb colors={[t.a1, t.a2]} theme={t} />
        <GridOverlay theme={t} />
        <div className="animate-slide-up relative z-10 space-y-6">
          <h2
            className="text-5xl leading-none tracking-tight md:text-7xl"
            style={{ fontFamily: t.hf, fontWeight: 700 }}
          >
            <span style={{ color: t.tp }}>{s.title}</span>
            {s.titleGrad && (
              <>
                <br />
                <span
                  style={{
                    background: `linear-gradient(135deg,${t.a2},${t.a3})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {s.titleGrad}
                </span>
              </>
            )}
          </h2>
          {s.subtitle && (
            <p className="text-xl" style={{ color: t.ts }}>
              {s.subtitle}
            </p>
          )}
          {s.footer && (
            <div
              className="inline-block rounded-2xl border px-6 py-3 text-xs"
              style={{
                fontFamily: t.hf,
                borderColor: t.cd,
                background: t.cb,
                color: t.tm,
              }}
            >
              {s.footer}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (slideType === "quote") {
    return (
      <div className="relative flex h-full flex-col items-center justify-center px-12 text-center">
        <GlowOrb colors={[t.a3]} theme={t} />
        <div className="animate-slide-up relative z-10 max-w-3xl space-y-6">
          {s.sectionLabel && (
            <span
              className="inline-block text-xs font-bold uppercase"
              style={{
                fontFamily: t.hf,
                color: t.a3,
                letterSpacing: ".25em",
              }}
            >
              {s.sectionLabel}
            </span>
          )}
          <h2
            className="text-4xl tracking-tight md:text-5xl"
            style={{ fontFamily: t.hf, fontWeight: 700, color: t.tp }}
          >
            {s.title}
          </h2>
          <p
            className="text-xl font-light leading-relaxed"
            style={{ color: t.ts }}
          >
            {s.quote}
          </p>
          {s.author && (
            <p className="text-sm" style={{ color: t.tm }}>
              {s.author}
            </p>
          )}
          <SlideImage {...imgProps} />
        </div>
      </div>
    );
  }

  if (slideType === "comparison") {
    return (
      <div className="relative flex h-full flex-col justify-center px-12 md:px-20">
        <GlowOrb colors={[t.a1, t.a2]} theme={t} />
        <div className="animate-slide-up relative z-10 mx-auto w-full max-w-5xl space-y-6">
          <div>
            {s.sectionLabel && (
              <span
                className="inline-block text-xs font-bold uppercase"
                style={{
                  fontFamily: t.hf,
                  color: t.a2,
                  letterSpacing: ".25em",
                }}
              >
                {s.sectionLabel}
              </span>
            )}
            <h2
              className="mt-2 text-4xl tracking-tight md:text-5xl"
              style={{ fontFamily: t.hf, fontWeight: 700, color: t.tp }}
            >
              {s.title}
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {[s.left, s.right].map((side, si) =>
              side ? (
                <div
                  key={si}
                  className="rounded-2xl border p-6"
                  style={{ borderColor: t.cd, background: t.cb }}
                >
                  <h3
                    className="mb-3 text-xl font-bold"
                    style={{
                      fontFamily: t.hf,
                      color: accentColors[si],
                    }}
                  >
                    {side.title}
                  </h3>
                  <div className="space-y-2">
                    {(side.items || []).map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div
                          className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                          style={{ background: accentColors[si] }}
                        />
                        <span className="text-sm" style={{ color: t.ts }}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null
            )}
          </div>
          {s.sources && (
            <p className="text-[10px]" style={{ color: t.tm }}>
              출처: {s.sources}
            </p>
          )}
        </div>
      </div>
    );
  }

  // content (default)
  return (
    <div className="relative flex h-full flex-col justify-center px-12 md:px-20">
      <GlowOrb colors={[accent]} theme={t} />
      <GridOverlay theme={t} />
      <div className="animate-slide-up relative z-10 mx-auto w-full max-w-5xl space-y-6">
        <div>
          {s.sectionLabel && (
            <span
              className="inline-block text-xs font-bold uppercase"
              style={{
                fontFamily: t.hf,
                color: accent,
                letterSpacing: ".25em",
              }}
            >
              {s.sectionLabel}
            </span>
          )}
          <h2
            className="mt-2 text-4xl tracking-tight md:text-5xl"
            style={{ fontFamily: t.hf, fontWeight: 700, color: t.tp }}
          >
            {s.title || "Slide"}
          </h2>
        </div>
        <SlideImage {...imgProps} />
        {s.description && (
          <p
            className="max-w-3xl text-lg leading-relaxed"
            style={{ color: t.ts }}
          >
            {s.description}
          </p>
        )}
        {s.items && s.items.length > 0 && (
          <div
            className={
              s.items.length <= 3
                ? "grid gap-4 md:grid-cols-3"
                : "grid gap-4 md:grid-cols-2"
            }
          >
            {s.items.map((item, i) => (
              <div
                key={i}
                className="rounded-2xl border p-5 transition-colors"
                style={{ borderColor: t.cd, background: t.cb }}
              >
                <h4
                  className="mb-1.5 text-sm font-bold"
                  style={{ fontFamily: t.hf, color: t.tp }}
                >
                  {typeof item === "string" ? item : item.title}
                </h4>
                {typeof item !== "string" && item.desc && (
                  <p className="text-sm" style={{ color: t.ts }}>
                    {item.desc}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
        {s.sources && (
          <p className="text-[10px]" style={{ color: t.tm }}>
            출처: {s.sources}
          </p>
        )}
      </div>
    </div>
  );
}
