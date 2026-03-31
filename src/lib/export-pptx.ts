import PptxGenJS from "pptxgenjs";
import { SlideData, Theme } from "./types";

function hexColor(rgba: string): string {
  const hex = rgba.match(/#([A-Fa-f0-9]{6})/)?.[1];
  if (hex) return hex;
  const rgb = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgb) {
    return [rgb[1], rgb[2], rgb[3]]
      .map((n) => parseInt(n).toString(16).padStart(2, "0"))
      .join("");
  }
  return "FFFFFF";
}

/* ═══ 템플릿 색상/폰트 (슬라이드_양식_템플릿.pptx 기반) ═══ */
const T = {
  navy: "1F497D",
  blue: "4F81BD",
  red: "C0504D",
  green: "9BBB59",
  white: "FFFFFF",
  lightBlue: "D6E4F0",
  lightGray: "F2F2F2",
  darkGray: "333333",
  midGray: "666666",
  font: "맑은 고딕",
};

/* ═══ PPTX 공통 헬퍼 ═══ */
function addDarkBg(slide: ReturnType<PptxGenJS["addSlide"]>) {
  slide.background = { color: T.navy };
}
function addLightBg(slide: ReturnType<PptxGenJS["addSlide"]>) {
  slide.background = { color: "F5F7FA" };
}
function addSidebar(pptx: PptxGenJS, slide: ReturnType<PptxGenJS["addSlide"]>) {
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.18, h: "100%", fill: { color: T.blue } });
}
function addTopLine(pptx: PptxGenJS, slide: ReturnType<PptxGenJS["addSlide"]>) {
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 0.06, fill: { color: T.blue } });
}
function addPageNum(slide: ReturnType<PptxGenJS["addSlide"]>, idx: number, total: number, dark: boolean) {
  slide.addText(`${idx + 1} / ${total}`, { x: 11.5, y: 6.8, w: 1.5, fontSize: 8, fontFace: T.font, color: dark ? "666666" : T.midGray, align: "right" });
}
function getItemData(s: SlideData, i: number) {
  const it = (s.items || [])[i];
  if (!it) return null;
  return typeof it === "string" ? { t: it, d: undefined } : { t: it.title, d: it.desc };
}

/* ═══ 템플릿 모드: 원본 PPTX 레이아웃 재현 ═══ */
function buildTemplateSlide(
  pptx: PptxGenJS,
  s: SlideData,
  idx: number,
  total: number
) {
  const slide = pptx.addSlide();
  const type = s.type || "content";
  const accentColors = [T.blue, T.red, T.green];
  const accent = accentColors[idx % 3];

  const isDark = ["cover", "closing", "intro", "section", "summary"].includes(type);
  if (isDark) addDarkBg(slide); else addLightBg(slide);
  addSidebar(pptx, slide);
  if (!isDark) addTopLine(pptx, slide);

  if (type === "cover") {
    slide.addText(s.title || "", { x: 0.8, y: 1.5, w: 10, h: 2, fontSize: 40, fontFace: T.font, bold: true, color: T.white, valign: "bottom" });
    if (s.subtitle) slide.addText(s.subtitle, { x: 0.8, y: 3.8, w: 10, fontSize: 18, fontFace: T.font, color: T.lightBlue });
    slide.addText("AI Slide Builder", { x: 9, y: 6.5, w: 4, fontSize: 9, fontFace: T.font, color: T.lightBlue, align: "right" });
  } else if (type === "closing") {
    slide.addText(s.title || "\uac10\uc0ac\ud569\ub2c8\ub2e4", { x: 1, y: 2, w: 11, h: 3, fontSize: 44, fontFace: T.font, bold: true, color: T.white, align: "center", valign: "middle" });
    if (s.subtitle) slide.addText(s.subtitle, { x: 1, y: 5, w: 11, fontSize: 16, fontFace: T.font, color: T.lightBlue, align: "center" });
  } else if (type === "intro") {
    slide.addText("INTRODUCTION", { x: 0.8, y: 0.8, w: 5, fontSize: 10, fontFace: T.font, bold: true, color: T.blue, charSpacing: 3 });
    slide.addText(s.title || "", { x: 0.8, y: 1.5, w: 10, fontSize: 32, fontFace: T.font, bold: true, color: T.white });
    if (s.description) slide.addText(s.description, { x: 0.8, y: 3, w: 10, h: 3, fontSize: 14, fontFace: T.font, color: T.lightBlue, lineSpacing: 24 });
  } else if (type === "section") {
    slide.addText(`Part ${s.partNumber || idx}`, { x: 0.8, y: 2, w: 11, fontSize: 18, fontFace: T.font, bold: true, color: T.blue, align: "center" });
    slide.addText(s.title || "", { x: 0.8, y: 2.8, w: 11, fontSize: 40, fontFace: T.font, bold: true, color: T.white, align: "center" });
    if (s.subtitle) slide.addText(s.subtitle, { x: 0.8, y: 4.2, w: 11, fontSize: 16, fontFace: T.font, color: T.lightBlue, align: "center" });
  } else if (type === "summary" || type === "quote") {
    slide.addText("\u201C", { x: 1, y: 0.8, w: 1, fontSize: 72, fontFace: "Georgia", color: T.blue });
    slide.addText(s.title || "", { x: 1.5, y: 1.5, w: 10, fontSize: 28, fontFace: T.font, bold: true, color: isDark ? T.white : T.navy, align: "center" });
    slide.addText(s.quote || s.description || "", { x: 1.5, y: 2.8, w: 10, h: 2.5, fontSize: 16, fontFace: T.font, italic: true, color: isDark ? T.lightBlue : T.midGray, align: "center", valign: "middle", lineSpacing: 26 });
    if (s.author) slide.addText(`\u2014 ${s.author}`, { x: 1.5, y: 5.5, w: 10, fontSize: 12, fontFace: T.font, color: T.midGray, align: "center" });
  } else if (type === "twoColumn") {
    slide.addText(s.title || "", { x: 0.8, y: 0.7, w: 11, fontSize: 26, fontFace: T.font, bold: true, color: T.navy });
    slide.addShape(pptx.ShapeType.rect, { x: 0.8, y: 1.4, w: 2.5, h: 0.04, fill: { color: accent } });
    [0, 1].forEach(i => {
      const it = getItemData(s, i);
      if (!it) return;
      const x = 0.8 + i * 5.7;
      slide.addShape(pptx.ShapeType.roundRect, { x, y: 1.8, w: 5.4, h: 4, fill: { color: T.navy }, rectRadius: 0.15 });
      slide.addText(it.t, { x: x + 0.4, y: 2.2, w: 4.6, fontSize: 16, fontFace: T.font, bold: true, color: T.white });
      if (it.d) slide.addText(it.d, { x: x + 0.4, y: 3.2, w: 4.6, h: 2, fontSize: 12, fontFace: T.font, color: T.lightBlue, lineSpacing: 20 });
    });
  } else if (type === "table") {
    slide.addText(s.title || "", { x: 0.8, y: 0.7, w: 11, fontSize: 26, fontFace: T.font, bold: true, color: T.navy });
    slide.addShape(pptx.ShapeType.rect, { x: 0.8, y: 1.4, w: 2.5, h: 0.04, fill: { color: accent } });
    if (s.tableHeaders && s.tableRows) {
      const rows = [s.tableHeaders, ...s.tableRows];
      slide.addTable(
        rows.map((r, ri) => r.map(c => ({ text: c, options: { fontSize: 11, fontFace: T.font, color: ri === 0 ? T.white : T.darkGray, bold: ri === 0 } }))),
        { x: 0.8, y: 1.8, w: 11.4, colW: Array(s.tableHeaders.length).fill(11.4 / s.tableHeaders.length), border: { type: "solid", pt: 0.5, color: T.lightBlue }, autoPage: false, rowH: rows.map((_, i) => i === 0 ? 0.5 : 0.4) }
      );
      // Header row background - add manually via shape
      slide.addShape(pptx.ShapeType.rect, { x: 0.8, y: 1.8, w: 11.4, h: 0.5, fill: { color: T.navy } });
    }
  } else {
    // content, threeCards, objectives, caseStudy, comparison — 카드 기반
    const label = type === "caseStudy" ? "CASE STUDY" : s.sectionLabel?.toUpperCase();
    const labelColor = type === "caseStudy" ? T.red : T.blue;
    if (label) slide.addText(label, { x: 0.8, y: 0.35, w: 5, fontSize: 9, fontFace: T.font, bold: true, color: labelColor, charSpacing: 3 });
    slide.addText(s.title || "", { x: 0.8, y: label ? 0.7 : 0.5, w: 11, fontSize: 26, fontFace: T.font, bold: true, color: T.navy });
    slide.addShape(pptx.ShapeType.rect, { x: 0.8, y: label ? 1.45 : 1.2, w: 2.5, h: 0.04, fill: { color: accent } });
    let cY = label ? 1.7 : 1.5;
    if (s.description) {
      slide.addText(s.description, { x: 0.8, y: cY, w: 11, fontSize: 13, fontFace: T.font, color: T.darkGray, lineSpacing: 22 });
      cY += 1.2;
    }
    if (s.items && s.items.length > 0) {
      const n = s.items.length;
      const cols = n <= 3 ? n : n <= 4 ? 2 : 3;
      const cW = (11.4 - (cols - 1) * 0.3) / cols;
      const cH = 1.6;
      s.items.forEach((item, i) => {
        const col = i % cols; const row = Math.floor(i / cols);
        const x = 0.8 + col * (cW + 0.3); const y = cY + row * (cH + 0.25);
        const iT = typeof item === "string" ? item : item.title;
        const iD = typeof item !== "string" ? item.desc : undefined;
        const ac = accentColors[i % 3];
        slide.addShape(pptx.ShapeType.roundRect, { x, y, w: cW, h: cH, fill: { color: T.lightGray }, rectRadius: 0.08, line: { color: T.lightBlue, width: 0.8 } });
        slide.addShape(pptx.ShapeType.rect, { x: x + 0.15, y, w: cW - 0.3, h: 0.04, fill: { color: ac } });
        slide.addText([{ text: iT, options: { fontSize: 12, bold: true, color: T.navy, breakLine: true } }, ...(iD ? [{ text: "\n" + iD, options: { fontSize: 10, color: T.midGray } }] : [])], { x: x + 0.2, y: y + 0.2, w: cW - 0.4, h: cH - 0.3, fontFace: T.font, valign: "top" });
      });
    }
  }
  // 이미지 추가 — 타입별 위치 지정, 겹침 방지
  const skipImageTypes = ["twoColumn", "table", "threeCards", "objectives", "cover", "closing"];
  if (s.imageUrl && !isDark && !skipImageTypes.includes(type)) {
    const imgData = s.imageUrl.startsWith("data:") ? { data: s.imageUrl } : { path: s.imageUrl };
    try {
      // content/caseStudy: 우측 하단, 카드 아래
      slide.addImage({ ...imgData, x: 8.5, y: 4.5, w: 3.5, h: 2, rounding: true });
    } catch { /* skip */ }
  }

  addPageNum(slide, idx, total, isDark);
}

/* ═══ 기본 모드: 웹 테마 색상 기반 ═══ */
function buildDefaultSlide(
  pptx: PptxGenJS,
  s: SlideData,
  theme: Theme
) {
  const slide = pptx.addSlide();
  const type = s.type || "content";
  const bg = hexColor(theme.bg);
  const tp = hexColor(theme.tp);
  const ts = hexColor(theme.ts);
  const a1 = hexColor(theme.a1);
  const cardBg = theme.lt ? "F5F5F5" : "1A1A2E";

  slide.background = { color: bg };

  if (type === "cover") {
    slide.addText(
      [
        { text: s.title || "", options: { fontSize: 44, bold: true, color: tp, breakLine: true } },
        ...(s.subtitle
          ? [{ text: "\n" + s.subtitle, options: { fontSize: 18, color: ts } }]
          : []),
      ],
      { x: 1, y: 2, w: 8, h: 4, valign: "middle", fontFace: "Arial" }
    );
  } else if (type === "closing") {
    slide.addText(s.title || "감사합니다", {
      x: 1, y: 2.5, w: 11, h: 3,
      fontSize: 48, fontFace: "Arial", bold: true,
      color: tp, align: "center", valign: "middle",
    });
  } else if (type === "quote") {
    slide.addText(s.title || "", {
      x: 1, y: 1.5, w: 11,
      fontSize: 32, fontFace: "Arial", bold: true,
      color: tp, align: "center",
    });
    slide.addText(`\u201C${s.quote || ""}\u201D`, {
      x: 1.5, y: 3, w: 10,
      fontSize: 18, fontFace: "Arial", italic: true,
      color: ts, align: "center",
    });
  } else {
    slide.addText(s.title || "", {
      x: 0.8, y: 0.9, w: 8,
      fontSize: 28, fontFace: "Arial", bold: true,
      color: tp,
    });
    if (s.description) {
      slide.addText(s.description, {
        x: 0.8, y: 1.8, w: 7,
        fontSize: 14, fontFace: "Arial",
        color: ts, lineSpacing: 22,
      });
    }
    if (s.items && s.items.length > 0) {
      const cols = s.items.length <= 3 ? 3 : 2;
      const cardW = cols === 3 ? 3.5 : 5.2;
      const startY = s.description ? 3.2 : 2.2;
      s.items.forEach((item, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = 0.8 + col * (cardW + 0.3);
        const y = startY + row * 1.8;
        const title = typeof item === "string" ? item : item.title;
        const desc = typeof item !== "string" ? item.desc : undefined;
        slide.addShape(pptx.ShapeType.roundRect, {
          x, y, w: cardW, h: 1.5,
          fill: { color: cardBg }, rectRadius: 0.1,
        });
        slide.addText(
          [
            { text: title, options: { fontSize: 13, bold: true, color: tp, breakLine: true } },
            ...(desc ? [{ text: desc, options: { fontSize: 11, color: ts } }] : []),
          ],
          { x: x + 0.2, y: y + 0.2, w: cardW - 0.4, h: 1.1, fontFace: "Arial" }
        );
      });
    }
    // 기본 모드 이미지 추가
    if (s.imageUrl) {
      if (s.imageUrl.startsWith("data:")) {
        slide.addImage({ data: s.imageUrl, x: 8, y: 1.5, w: 4.2, h: 2.5, rounding: true });
      } else {
        try { slide.addImage({ path: s.imageUrl, x: 8, y: 1.5, w: 4.2, h: 2.5, rounding: true }); } catch {}
      }
    }
  }
}

/* ═══ 원본 PPTX 템플릿 사용 ═══ */
async function exportWithOriginalTemplate(
  slides: SlideData[],
  fileName: string
): Promise<void> {
  // base64 이미지 → Supabase Storage에 업로드 → URL로 변환 (413 방지)
  const { uploadImageToStorage } = await import("./api");
  const uploadedSlides = await Promise.all(
    slides.map(async (s) => {
      if (s.imageUrl?.startsWith("data:")) {
        const url = await uploadImageToStorage(s.imageUrl);
        return { ...s, imageUrl: url || undefined, imagePrompt: undefined };
      }
      return { ...s, imagePrompt: undefined };
    })
  );
  const res = await fetch("/api/export-pptx", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slides: uploadedSlides }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  if (!json.url) throw new Error("PPTX 생성 실패");

  const a = document.createElement("a");
  a.href = json.url;
  a.download = `${fileName}.pptx`;
  a.click();
}

/* ═══ PUBLIC: PPTX 내보내기 ═══ */
export async function exportToPptx(
  slides: SlideData[],
  theme: Theme,
  title?: string,
  useTemplate = false
): Promise<void> {
  const fileName = title || "presentation";

  if (useTemplate) {
    // 템플릿 ON → 원본 PPTX 파일 사용 (디자인 100% 유지, 텍스트만 교체)
    return exportWithOriginalTemplate(slides, fileName);
  }

  // 템플릿 OFF → pptxgenjs로 템플릿 스타일 생성
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "AI Slide Builder";
  pptx.title = fileName;
  slides.forEach((s, i) => buildTemplateSlide(pptx, s, i, slides.length));
  await pptx.writeFile({ fileName: `${fileName}.pptx` });
}
