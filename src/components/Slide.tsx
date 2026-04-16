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

/* ═══ PPTX 스타일 템플릿 — CSS 기반 (배경 이미지 없음) ═══ */
const TF = "'맑은 고딕','Malgun Gothic','Pretendard',sans-serif";
const CY = "#06B6D4"; // 시안
const RD = "#EF4444"; // 레드
const SK = "#38BDF8"; // 스카이
const GR = "#94A3B8"; // 그레이
const BG = "#0F172A"; // 배경 네이비
const BG_LIGHT = "#1E293B"; // 밝은 네이비

/** 배경 그라디언트 데코 (CSS 전용, 항상 동일 위치) */
function TemplateBG() {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at top right, rgba(56,189,248,0.08), transparent 60%), radial-gradient(ellipse at bottom left, rgba(6,182,212,0.05), transparent 60%), ${BG}`,
        }}
      />
      {/* 상단 액센트 라인 */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{ height: 3, background: `linear-gradient(90deg, ${CY}, ${SK}, transparent)` }}
      />
    </>
  );
}

/* ═══ TemplateSlide — 타입별 CSS 레이아웃 ═══ */
function TemplateSlide({ slide: s, idx: _idx }: { slide: SlideData; idx: number }) {
  const type = s.type || "content";
  const items = s.items || [];
  const gi = (i: number) => {
    const it = items[i];
    return it ? (typeof it === "string" ? { t: it, d: undefined } : { t: it.title, d: it.desc }) : null;
  };

  /* 공통 컨테이너 */
  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div className="relative h-full w-full overflow-hidden" style={{ fontFamily: TF, background: BG }}>
      <TemplateBG />
      <div className="relative z-10 h-full w-full flex flex-col animate-slide-up" style={{ padding: "6% 7%" }}>
        {children}
      </div>
    </div>
  );

  /* 커버 */
  if (type === "cover") {
    return (
      <Shell>
        <div className="flex h-full flex-col justify-end pb-[8%]">
          <div
            className="mb-6"
            style={{ width: 80, height: 4, background: `linear-gradient(90deg, ${CY}, ${SK})` }}
          />
          <h1 className="text-5xl font-extrabold leading-tight md:text-6xl" style={{ color: "#F8FAFC" }}>
            {s.title}
          </h1>
          {s.subtitle && (
            <p className="mt-4 text-xl" style={{ color: CY }}>
              {s.subtitle}
            </p>
          )}
        </div>
      </Shell>
    );
  }

  /* Intro (개요) */
  if (type === "intro") {
    return (
      <Shell>
        <div className="flex h-full flex-col items-center justify-center text-center space-y-5">
          <span className="text-xs tracking-[.3em] uppercase font-bold" style={{ color: SK }}>Introduction</span>
          <div style={{ width: 60, height: 2, background: SK }} />
          <h2 className="text-3xl font-bold max-w-3xl" style={{ color: "#F8FAFC" }}>{s.title}</h2>
          {s.description && (
            <p className="max-w-2xl text-base leading-relaxed" style={{ color: "#CBD5E1" }}>
              {s.description}
            </p>
          )}
        </div>
      </Shell>
    );
  }

  /* Section 구분 */
  if (type === "section") {
    return (
      <Shell>
        <div className="flex h-full flex-col items-center justify-center text-center space-y-4">
          <span className="text-sm font-bold tracking-wider" style={{ color: SK }}>
            PART {s.partNumber || "•"}
          </span>
          <div style={{ width: 50, height: 2, background: SK }} />
          <h1 className="text-4xl font-bold max-w-3xl" style={{ color: "#F8FAFC" }}>{s.title}</h1>
          {s.subtitle && <p className="text-base" style={{ color: GR }}>{s.subtitle}</p>}
        </div>
      </Shell>
    );
  }

  /* Objectives / ThreeCards (3카드) */
  if (type === "objectives" || type === "threeCards") {
    const icons = type === "objectives" ? ["🎯", "✓", "★"] : ["⚖️", "🛡️", "🔔"];
    return (
      <Shell>
        <h2 className="text-2xl font-bold mb-2" style={{ color: CY }}>{s.title}</h2>
        <div style={{ width: 50, height: 2, background: SK, marginBottom: 24 }} />
        <div className="grid grid-cols-3 gap-4 flex-1 content-start">
          {[0, 1, 2].map(i => {
            const it = gi(i);
            if (!it) return null;
            return (
              <div
                key={i}
                className="rounded-xl p-5 flex flex-col"
                style={{
                  background: `linear-gradient(135deg, ${BG_LIGHT}, rgba(15,23,42,0.6))`,
                  border: "1px solid rgba(56,189,248,0.2)",
                }}
              >
                <div
                  className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ background: "rgba(6,182,212,0.15)" }}
                >
                  <span style={{ color: CY, fontSize: 20 }}>{icons[i]}</span>
                </div>
                <h4 className="text-base font-bold mb-2" style={{ color: "#F8FAFC" }}>{it.t}</h4>
                {it.d && <p className="text-sm leading-relaxed" style={{ color: "#CBD5E1" }}>{it.d}</p>}
              </div>
            );
          })}
        </div>
      </Shell>
    );
  }

  /* TwoColumn (2열) */
  if (type === "twoColumn") {
    const icons = ["💡", "🎯"];
    const colors = [CY, SK];
    return (
      <Shell>
        <h2 className="text-2xl font-bold mb-2" style={{ color: CY }}>{s.title}</h2>
        <div style={{ width: 50, height: 2, background: SK, marginBottom: 24 }} />
        <div className="grid grid-cols-2 gap-5 flex-1 content-start">
          {[0, 1].map(i => {
            const it = gi(i);
            if (!it) return null;
            return (
              <div
                key={i}
                className="rounded-xl p-6"
                style={{
                  background: `linear-gradient(135deg, ${BG_LIGHT}, rgba(15,23,42,0.6))`,
                  border: `1px solid ${colors[i]}33`,
                }}
              >
                <h3 className="mb-3 flex items-center gap-2 text-lg font-bold" style={{ color: "#F8FAFC" }}>
                  <span style={{ color: colors[i] }}>{icons[i]}</span>{it.t}
                </h3>
                {it.d && <p className="text-sm leading-relaxed" style={{ color: "#CBD5E1" }}>{it.d}</p>}
              </div>
            );
          })}
        </div>
      </Shell>
    );
  }

  /* CaseStudy */
  if (type === "caseStudy") {
    return (
      <Shell>
        <span className="text-xs font-bold uppercase tracking-[.25em] mb-3" style={{ color: RD }}>
          Case Study
        </span>
        <h2 className="text-2xl font-bold mb-3" style={{ color: CY }}>{s.title}</h2>
        <div style={{ width: 50, height: 2, background: RD, marginBottom: 20 }} />
        <div className="flex-1 grid grid-cols-5 gap-6 items-start">
          <div className="col-span-3 space-y-3">
            {s.description && (
              <p className="text-sm leading-relaxed" style={{ color: "#CBD5E1" }}>{s.description}</p>
            )}
          </div>
          <div
            className="col-span-2 rounded-xl overflow-hidden aspect-video"
            style={{ background: BG_LIGHT, border: "1px solid rgba(148,163,184,0.15)" }}
          >
            {s.imageUrl ? (
              <SlideImage src={s.imageUrl} tm={GR} cb={BG_LIGHT} />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs" style={{ color: GR }}>
                사례 이미지
              </div>
            )}
          </div>
        </div>
      </Shell>
    );
  }

  /* Summary (소결/인용) */
  if (type === "summary") {
    return (
      <Shell>
        <div className="flex h-full flex-col items-center justify-center text-center space-y-6 px-8">
          <span className="text-xs tracking-[.3em] uppercase font-bold" style={{ color: SK }}>Summary</span>
          <div style={{ width: 60, height: 2, background: SK }} />
          <span className="text-6xl font-serif leading-none" style={{ color: CY, opacity: 0.3 }}>&ldquo;</span>
          <h3 className="text-2xl md:text-3xl font-bold max-w-3xl leading-relaxed" style={{ color: "#F8FAFC" }}>
            {s.quote || s.title}
          </h3>
          {s.author && <p className="text-sm" style={{ color: GR }}>— {s.author}</p>}
          {s.description && <p className="text-sm max-w-2xl" style={{ color: "#CBD5E1" }}>{s.description}</p>}
        </div>
      </Shell>
    );
  }

  /* Table (비교표) */
  if (type === "table") {
    return (
      <Shell>
        <h2 className="text-2xl font-bold mb-2" style={{ color: CY }}>{s.title}</h2>
        <div style={{ width: 50, height: 2, background: SK, marginBottom: 24 }} />
        {s.tableHeaders && s.tableRows && (
          <div className="overflow-hidden rounded-xl" style={{ border: `1px solid rgba(56,189,248,0.2)` }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(56,189,248,0.1)" }}>
                  {s.tableHeaders.map((h, i) => (
                    <th key={i} className="px-5 py-3 text-left font-bold" style={{ color: CY }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {s.tableRows.map((row, ri) => (
                  <tr key={ri} style={{ borderTop: "1px solid rgba(148,163,184,0.1)" }}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-5 py-3" style={{ color: ci === 0 ? "#F8FAFC" : "#CBD5E1", fontWeight: ci === 0 ? 600 : 400 }}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Shell>
    );
  }

  /* Closing (마무리) */
  if (type === "closing") {
    return (
      <Shell>
        <div className="flex h-full flex-col items-center justify-center text-center space-y-6">
          <div style={{ width: 80, height: 4, background: `linear-gradient(90deg, ${CY}, ${SK})` }} />
          <h1 className="text-5xl font-extrabold" style={{ color: "#F8FAFC" }}>
            {s.title || "감사합니다"}
          </h1>
          <p className="text-base" style={{ color: GR }}>Thank You</p>
        </div>
      </Shell>
    );
  }

  /* Content (일반) — 폴백 */
  return (
    <Shell>
      <h2 className="text-2xl font-bold mb-2" style={{ color: CY }}>{s.title}</h2>
      <div style={{ width: 50, height: 2, background: SK, marginBottom: 20 }} />
      {s.description && (
        <p className="text-base leading-relaxed mb-4" style={{ color: "#CBD5E1" }}>{s.description}</p>
      )}
      {items.length > 0 && (
        <div className="space-y-3 flex-1 content-start">
          {items.map((_, i) => {
            const it = gi(i);
            if (!it) return null;
            return (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg p-3"
                style={{ background: "rgba(30,41,59,0.5)", border: "1px solid rgba(56,189,248,0.1)" }}
              >
                <span style={{ color: CY, fontSize: 16, lineHeight: 1.4 }}>▸</span>
                <div>
                  <p className="text-sm font-bold" style={{ color: "#F8FAFC" }}>{it.t}</p>
                  {it.d && <p className="text-sm mt-1" style={{ color: "#CBD5E1" }}>{it.d}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Shell>
  );
}

export default function Slide({ slide: s, theme: t, idx }: SlideProps) {
  if (!s) return null;

  // PPTX 템플릿 테마일 때 별도 렌더링
  if (t.id === "pptxTemplate") {
    return <TemplateSlide slide={s} idx={idx} />;
  }

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
