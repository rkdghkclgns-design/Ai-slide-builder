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

/* ═══ 원본 PPTX 배경이미지 기반 템플릿 ═══ */
const TF = "'맑은 고딕','Malgun Gothic','Pretendard',sans-serif";
const CY = "#06B6D4"; // 시안
const RD = "#EF4444"; // 레드
const SK = "#38BDF8"; // 스카이
const GR = "#94A3B8"; // 그레이

/** AI 타입 → 원본 템플릿 슬라이드 번호 매핑 */
function getTemplateNum(type: string, idx: number): number {
  switch (type) {
    case "cover": return 1;
    case "intro": return 2;
    case "objectives": return idx === 2 ? 3 : 8; // 3카드
    case "section": return 4;
    case "twoColumn": return 5;
    case "example": return 6;
    case "caseStudy": return idx % 2 === 0 ? 7 : 11;
    case "threeCards": return 8;
    case "summary": return 9;
    case "imageText": return 10;
    case "caseDetail": return 11;
    case "keyValue": return 12;
    case "table": return 13;
    case "closing": return 14;
    default: return 8; // content → 3카드 레이아웃
  }
}

/* ═══ 원본 배경이미지 기반 TemplateSlide ═══ */
function TemplateSlide({ slide: s, idx }: { slide: SlideData; idx: number }) {
  const type = s.type || "content";
  const tplNum = getTemplateNum(type, idx);
  const items = s.items || [];
  const gi = (i: number) => { const it = items[i]; return it ? (typeof it === "string" ? { t: it, d: undefined } : { t: it.title, d: it.desc }) : null; };

  return (
    <div className="relative h-full w-full" style={{ fontFamily: TF, background: "#0F172A" }}>
      {/* 원본 슬라이드 배경 이미지 */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${process.env.NEXT_PUBLIC_BASE_PATH || ""}/slide-${tplNum}.png)`, backgroundSize: "cover" }}
      />

      {/* 텍스트 오버레이 — 원본 플레이스홀더 위치에 맞춤 */}
      <div className="absolute inset-0 z-10 flex flex-col justify-center animate-slide-up" style={{ padding: "8% 6%" }}>

        {/* 슬라이드 1: 커버 */}
        {tplNum === 1 && (
          <div className="flex h-full items-end pb-[15%]">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold md:text-5xl" style={{ color: "#F8FAFC" }}>{s.title}</h1>
              {s.subtitle && <p className="text-xl" style={{ color: CY }}>{s.subtitle}</p>}
            </div>
          </div>
        )}

        {/* 슬라이드 2: Introduction */}
        {tplNum === 2 && (
          <div className="flex flex-col items-center text-center space-y-4 pt-[5%]">
            <span className="text-xs tracking-[.3em] uppercase" style={{ color: GR }}>Introduction</span>
            <div className="mx-auto" style={{ width: 60, height: 2, background: SK }} />
            <h2 className="text-3xl font-bold" style={{ color: "#F8FAFC" }}>{s.title}</h2>
            {s.description && <p className="max-w-2xl text-sm leading-relaxed" style={{ color: GR }}>{s.description}</p>}
          </div>
        )}

        {/* 슬라이드 3/8: 3카드 (objectives/threeCards) */}
        {(tplNum === 3 || tplNum === 8) && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold" style={{ color: CY }}>{s.title}</h2>
            <div className="grid grid-cols-3 gap-4 mt-4">
              {items.slice(0, 3).map((_, i) => { const it = gi(i); return it ? (
                <div key={i} className="rounded-xl p-5" style={{ background: "rgba(15,23,42,.7)", border: "1px solid rgba(148,163,184,.15)" }}>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "rgba(6,182,212,.15)" }}>
                    <span style={{ color: CY, fontSize: 18 }}>{["⚖️", "🛡️", "🔔"][i % 3]}</span>
                  </div>
                  <h4 className="text-sm font-bold" style={{ color: "#F8FAFC" }}>{it.t}</h4>
                  {it.d && <p className="mt-1 text-xs" style={{ color: GR }}>{it.d}</p>}
                </div>
              ) : null; })}
            </div>
            {s.description && <p className="text-center text-xs" style={{ color: GR }}>{s.description}</p>}
          </div>
        )}

        {/* 슬라이드 4: Part 구분 */}
        {tplNum === 4 && (
          <div className="flex flex-col items-center text-center space-y-3">
            <span className="text-sm" style={{ color: SK }}>Part {s.partNumber || 1}</span>
            <div className="mx-auto" style={{ width: 50, height: 2, background: SK }} />
            <h1 className="text-4xl font-bold" style={{ color: "#F8FAFC" }}>{s.title}</h1>
            {s.subtitle && <p className="text-base" style={{ color: GR }}>{s.subtitle}</p>}
          </div>
        )}

        {/* 슬라이드 5: 2열 카드 */}
        {tplNum === 5 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold" style={{ color: CY }}>{s.title}</h2>
            <div className="grid grid-cols-2 gap-5">
              {[0, 1].map(i => { const it = gi(i); return it ? (
                <div key={i} className="rounded-xl p-5" style={{ background: "rgba(15,23,42,.6)", border: "1px solid rgba(148,163,184,.12)" }}>
                  <h3 className="mb-2 flex items-center gap-2 text-base font-bold" style={{ color: "#F8FAFC" }}>
                    <span style={{ color: [CY, RD][i] }}>{["🤖", "💡"][i]}</span>{it.t}
                  </h3>
                  {it.d && <p className="text-sm leading-relaxed" style={{ color: GR }}>{it.d}</p>}
                </div>
              ) : null; })}
            </div>
          </div>
        )}

        {/* 슬라이드 6: 예시 (좌 텍스트 + 우 이미지영역) */}
        {tplNum === 6 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold" style={{ color: CY }}>{s.title} <span style={{ color: GR }}>[예시]</span></h2>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                {items.map((_, i) => { const it = gi(i); return it ? (
                  <div key={i} className="flex items-start gap-2">
                    <span style={{ color: GR }}>•</span>
                    <p className="text-sm" style={{ color: "#F8FAFC" }}><b>{it.t}</b>{it.d ? `: ${it.d}` : ""}</p>
                  </div>
                ) : null; })}
              </div>
              {s.imageUrl && <div className="overflow-hidden rounded-xl" style={{ border: "1px solid rgba(148,163,184,.15)" }}><SlideImage src={s.imageUrl} tm={GR} cb="rgba(15,23,42,.5)" /></div>}
            </div>
          </div>
        )}

        {/* 슬라이드 7: Case Study 2열 이미지 */}
        {tplNum === 7 && (
          <div className="space-y-5">
            <span className="text-xs font-bold uppercase tracking-[.25em]" style={{ color: RD }}>Case Study</span>
            <div className="grid grid-cols-2 gap-5">
              {items.slice(0, 2).map((_, i) => { const it = gi(i); return it ? (
                <div key={i}>
                  <h3 className="mb-3 text-xl font-bold" style={{ color: CY }}>{it.t}</h3>
                  <div className="rounded-xl" style={{ background: "rgba(15,23,42,.5)", border: "1px solid rgba(148,163,184,.12)", height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {s.imageUrl ? <SlideImage src={s.imageUrl} tm={GR} cb="rgba(15,23,42,.5)" /> : <span style={{ color: GR, fontSize: 12 }}>이미지</span>}
                  </div>
                </div>
              ) : null; })}
            </div>
          </div>
        )}

        {/* 슬라이드 9: 소결 */}
        {tplNum === 9 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold" style={{ color: CY }}>{s.title || "소결"}</h2>
            <div className="flex flex-col items-center text-center space-y-4 pt-4">
              <span className="text-4xl" style={{ color: GR }}>&ldquo;</span>
              <h3 className="text-2xl font-bold" style={{ color: "#F8FAFC" }}>{s.quote || s.title}</h3>
              {s.description && <p className="text-sm" style={{ color: GR }}>{s.description}</p>}
            </div>
          </div>
        )}

        {/* 슬라이드 10: 텍스트+이미지 */}
        {tplNum === 10 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold" style={{ color: CY }}>{s.title}</h2>
            <div className="grid grid-cols-2 gap-6 items-start">
              <div className="space-y-3">
                {s.description && <p className="text-sm leading-relaxed" style={{ color: "#F8FAFC" }}>{s.description}</p>}
                {items.map((_, i) => { const it = gi(i); return it ? <p key={i} className="text-sm font-bold" style={{ color: "#F8FAFC" }}>{it.t}</p> : null; })}
              </div>
              {s.imageUrl && <div className="overflow-hidden rounded-xl" style={{ border: "1px solid rgba(148,163,184,.15)" }}><SlideImage src={s.imageUrl} tm={GR} cb="rgba(15,23,42,.5)" /></div>}
            </div>
          </div>
        )}

        {/* 슬라이드 11: Case Study 상세 */}
        {tplNum === 11 && (
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-[.25em]" style={{ color: RD }}>Case Study</span>
            <div className="grid grid-cols-2 gap-6 items-start">
              <div className="space-y-3">
                <h2 className="text-2xl font-bold" style={{ color: CY }}>{s.title}</h2>
                {s.description && <p className="text-sm leading-relaxed" style={{ color: GR }}>{s.description}</p>}
              </div>
              {s.imageUrl && <div className="overflow-hidden rounded-xl" style={{ border: "1px solid rgba(148,163,184,.15)" }}><SlideImage src={s.imageUrl} tm={GR} cb="rgba(15,23,42,.5)" /></div>}
            </div>
          </div>
        )}

        {/* 슬라이드 12: 키-값 정리 */}
        {tplNum === 12 && (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold" style={{ color: CY }}>{s.title}</h2>
            <div className="rounded-xl p-5 space-y-3" style={{ background: "rgba(15,23,42,.6)", border: "1px solid rgba(148,163,184,.1)" }}>
              {items.map((_, i) => { const it = gi(i); return it ? (
                <div key={i} className="flex items-center gap-2">
                  <span style={{ color: SK }}>✓</span>
                  <span className="text-sm font-bold" style={{ color: "#F8FAFC" }}>{it.t}</span>
                  {it.d && <span className="text-sm" style={{ color: GR }}>: {it.d}</span>}
                </div>
              ) : null; })}
            </div>
          </div>
        )}

        {/* 슬라이드 13: 비교표 */}
        {tplNum === 13 && (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold" style={{ color: CY }}>{s.title}</h2>
            {s.tableHeaders && s.tableRows && (
              <table className="w-full text-sm">
                <thead><tr style={{ borderBottom: `2px solid ${SK}` }}>
                  {s.tableHeaders.map((h, i) => <th key={i} className="px-4 py-3 text-left" style={{ color: CY }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {s.tableRows.map((row, ri) => (
                    <tr key={ri} style={{ borderBottom: "1px solid rgba(148,163,184,.1)" }}>
                      {row.map((cell, ci) => <td key={ci} className="px-4 py-3" style={{ color: ci === 0 ? "#F8FAFC" : GR }}>{cell}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* 슬라이드 14: 마무리 */}
        {tplNum === 14 && (
          <div className="flex h-full items-end pb-[15%]">
            <h1 className="text-4xl font-bold" style={{ color: "#F8FAFC" }}>{s.title || "감사합니다"}</h1>
          </div>
        )}

        {/* 폴백: 매핑 안 된 타입 → 기본 콘텐츠 */}
        {![1,2,3,4,5,6,7,8,9,10,11,12,13,14].includes(tplNum) && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold" style={{ color: CY }}>{s.title}</h2>
            {s.description && <p className="text-sm" style={{ color: GR }}>{s.description}</p>}
          </div>
        )}
      </div>
    </div>
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
