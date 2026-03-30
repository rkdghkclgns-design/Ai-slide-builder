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

/* ═══ 템플릿 공통 요소 ═══ */
const C = { navy: "#1a2744", blue: "#4F81BD", red: "#C0504D", green: "#9BBB59" };
const TF = "'맑은 고딕','Malgun Gothic',sans-serif";

function TplShell({ dark, children, idx }: { dark: boolean; children: React.ReactNode; idx: number }) {
  return (
    <div className="relative flex h-full flex-col" style={{ fontFamily: TF, background: dark ? C.navy : "#f5f7fa" }}>
      {dark && <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(/template-bg.png)", opacity: 0.9 }} />}
      <div className="absolute left-0 top-0 h-full" style={{ width: 6, background: C.blue }} />
      {!dark && <div className="absolute left-0 right-0 top-0" style={{ height: 4, background: C.blue }} />}
      <div className="relative z-10 flex flex-1 flex-col justify-center px-16">{children}</div>
      <div className="absolute bottom-4 right-6 text-xs" style={{ color: dark ? "rgba(255,255,255,.3)" : "#999" }}>{idx + 1}</div>
    </div>
  );
}

function TplCard({ title, desc, accent = C.blue }: { title: string; desc?: string; accent?: string }) {
  return (
    <div className="rounded-2xl border p-5" style={{ background: "#fff", borderColor: "#d6e4f0", borderTop: `3px solid ${accent}` }}>
      <h4 className="mb-1.5 text-sm font-bold" style={{ color: C.navy }}>{title}</h4>
      {desc && <p className="text-xs leading-relaxed" style={{ color: "#666" }}>{desc}</p>}
    </div>
  );
}

function TplTitle({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="space-y-2">
      {label && <span className="text-xs font-bold uppercase tracking-widest" style={{ color: C.blue }}>{label}</span>}
      <h2 className="text-3xl font-bold md:text-4xl" style={{ color: C.navy }}>{children}</h2>
      <div style={{ width: 80, height: 3, background: C.blue, borderRadius: 2 }} />
    </div>
  );
}

/* ═══ PPTX 템플릿 스타일 슬라이드 ═══ */
function TemplateSlide({ slide: s, idx }: { slide: SlideData; idx: number }) {
  const type = s.type || "content";
  const isDark = ["cover", "closing", "intro", "section", "summary"].includes(type);
  const items = s.items || [];
  const getItem = (i: number) => { const it = items[i]; return it ? (typeof it === "string" ? { title: it, desc: undefined } : { title: it.title, desc: it.desc }) : null; };

  return (
    <TplShell dark={isDark} idx={idx}>
      {/* ── 커버 ── */}
      {type === "cover" && (
        <div className="animate-slide-up space-y-4 text-center">
          <h1 className="text-5xl font-bold leading-tight md:text-6xl" style={{ color: "#fff" }}>{s.title}</h1>
          {s.subtitle && <p className="mx-auto max-w-2xl text-lg" style={{ color: "rgba(255,255,255,.6)" }}>{s.subtitle}</p>}
        </div>
      )}

      {/* ── 소개 (다크) ── */}
      {type === "intro" && (
        <div className="animate-slide-up space-y-5">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: C.blue }}>Introduction</span>
          <h2 className="text-4xl font-bold" style={{ color: "#fff" }}>{s.title}</h2>
          {s.description && <p className="max-w-3xl text-base leading-relaxed" style={{ color: "rgba(255,255,255,.65)" }}>{s.description}</p>}
        </div>
      )}

      {/* ── 목표/요약 (3카드 밝은) ── */}
      {type === "objectives" && (
        <div className="animate-slide-up space-y-5">
          <TplTitle label={s.sectionLabel}>{s.title}</TplTitle>
          {s.description && <p className="text-sm" style={{ color: "#555" }}>{s.description}</p>}
          <div className="grid gap-4 md:grid-cols-3">
            {items.map((_, i) => { const it = getItem(i); return it ? <TplCard key={i} title={it.title} desc={it.desc} accent={[C.blue, C.red, C.green][i % 3]} /> : null; })}
          </div>
        </div>
      )}

      {/* ── 섹션 구분 (다크) ── */}
      {type === "section" && (
        <div className="animate-slide-up space-y-3 text-center">
          <span className="text-lg font-bold" style={{ color: C.blue }}>Part {s.partNumber || idx}</span>
          <h1 className="text-5xl font-bold" style={{ color: "#fff" }}>{s.title}</h1>
          {s.subtitle && <p className="text-lg" style={{ color: "rgba(255,255,255,.5)" }}>{s.subtitle}</p>}
        </div>
      )}

      {/* ── 2열 콘텐츠 ── */}
      {type === "twoColumn" && (
        <div className="animate-slide-up space-y-5">
          <TplTitle>{s.title}</TplTitle>
          <div className="grid gap-5 md:grid-cols-2">
            {[0, 1].map(i => { const it = getItem(i); return it ? (
              <div key={i} className="rounded-2xl p-6" style={{ background: C.navy }}>
                <h3 className="mb-2 text-lg font-bold" style={{ color: "#fff" }}>{it.title}</h3>
                {it.desc && <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,.6)" }}>{it.desc}</p>}
              </div>
            ) : null; })}
          </div>
        </div>
      )}

      {/* ── 3카드 ── */}
      {type === "threeCards" && (
        <div className="animate-slide-up space-y-5">
          <TplTitle label={s.sectionLabel}>{s.title}</TplTitle>
          <div className="grid gap-4 md:grid-cols-3">
            {items.slice(0, 3).map((_, i) => { const it = getItem(i); return it ? <TplCard key={i} title={it.title} desc={it.desc} accent={[C.blue, C.red, C.green][i % 3]} /> : null; })}
          </div>
        </div>
      )}

      {/* ── 케이스 스터디 ── */}
      {type === "caseStudy" && (
        <div className="animate-slide-up space-y-5">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: C.red }}>Case Study</span>
          <h2 className="text-3xl font-bold" style={{ color: C.navy }}>{s.title}</h2>
          <div style={{ width: 60, height: 3, background: C.red, borderRadius: 2 }} />
          {s.description && <p className="max-w-3xl text-base leading-relaxed" style={{ color: "#444" }}>{s.description}</p>}
          {items.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {items.map((_, i) => { const it = getItem(i); return it ? <TplCard key={i} title={it.title} desc={it.desc} accent={C.red} /> : null; })}
            </div>
          )}
        </div>
      )}

      {/* ── 소결 (다크) ── */}
      {type === "summary" && (
        <div className="animate-slide-up mx-auto max-w-3xl space-y-6 text-center">
          <span className="text-6xl" style={{ color: C.blue, fontFamily: "Georgia,serif" }}>&ldquo;</span>
          <h2 className="text-3xl font-bold" style={{ color: "#fff" }}>{s.title}</h2>
          <p className="text-lg italic leading-relaxed" style={{ color: "rgba(255,255,255,.65)" }}>{s.quote || s.description}</p>
          {s.author && <p className="text-sm" style={{ color: "rgba(255,255,255,.4)" }}>&mdash; {s.author}</p>}
        </div>
      )}

      {/* ── 비교표 ── */}
      {type === "table" && (
        <div className="animate-slide-up space-y-5">
          <TplTitle>{s.title}</TplTitle>
          {s.tableHeaders && s.tableRows && (
            <div className="overflow-hidden rounded-xl border" style={{ borderColor: "#d6e4f0" }}>
              <table className="w-full text-sm">
                <thead><tr style={{ background: C.navy }}>
                  {s.tableHeaders.map((h, i) => <th key={i} className="px-4 py-3 text-left font-bold" style={{ color: "#fff" }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {s.tableRows.map((row, ri) => (
                    <tr key={ri} style={{ background: ri % 2 === 0 ? "#fff" : "#f0f4f8" }}>
                      {row.map((cell, ci) => <td key={ci} className="px-4 py-3" style={{ color: ci === 0 ? C.navy : "#444", fontWeight: ci === 0 ? 600 : 400 }}>{cell}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── 일반 콘텐츠 (기존) ── */}
      {(type === "content" || type === "comparison" || type === "quote") && (
        <div className="animate-slide-up space-y-5">
          <TplTitle label={s.sectionLabel}>{s.title}</TplTitle>
          {s.description && <p className="max-w-3xl text-base leading-relaxed" style={{ color: "#444" }}>{s.description}</p>}
          {type === "quote" && s.quote && <p className="text-lg italic" style={{ color: "#555" }}>&ldquo;{s.quote}&rdquo;</p>}
          {items.length > 0 && (
            <div className={items.length <= 3 ? "grid gap-4 md:grid-cols-3" : "grid gap-4 md:grid-cols-2"}>
              {items.map((_, i) => { const it = getItem(i); return it ? <TplCard key={i} title={it.title} desc={it.desc} /> : null; })}
            </div>
          )}
        </div>
      )}

      {/* ── 마무리 ── */}
      {type === "closing" && (
        <div className="animate-slide-up space-y-3 text-center">
          <h1 className="text-5xl font-bold md:text-6xl" style={{ color: "#fff" }}>{s.title || "감사합니다"}</h1>
          {s.subtitle && <p className="text-lg" style={{ color: "rgba(255,255,255,.5)" }}>{s.subtitle}</p>}
        </div>
      )}
    </TplShell>
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
