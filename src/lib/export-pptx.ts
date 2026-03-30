import PptxGenJS from "pptxgenjs";
import { SlideData, Theme } from "./types";
import { DEFAULT_TEMPLATE, PptxTemplatePreset } from "./pptx-templates";

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

interface StyleSet {
  bgColor: string;
  titleColor: string;
  subColor: string;
  accentColor: string;
  accent2Color: string;
  cardBg: string;
  fontFace: string;
  coverBg: string;
  closingBg: string;
  closingTitle: string;
  closingSub: string;
  contentBg: string;
}

function buildStyles(theme: Theme, useTemplate: boolean): StyleSet {
  if (useTemplate) {
    const t = DEFAULT_TEMPLATE;
    return {
      bgColor: t.content.bgColor,
      titleColor: t.content.titleColor,
      subColor: t.content.textColor,
      accentColor: t.content.accentColor,
      accent2Color: "C0504D",
      cardBg: t.content.cardBg,
      fontFace: t.fontFace,
      coverBg: t.cover.bgColor,
      closingBg: t.closing.bgColor,
      closingTitle: t.closing.titleColor,
      closingSub: t.closing.subtitleColor,
      contentBg: t.content.bgColor,
    };
  }
  return {
    bgColor: hexColor(theme.bg),
    titleColor: hexColor(theme.tp),
    subColor: hexColor(theme.ts),
    accentColor: hexColor(theme.a1),
    accent2Color: hexColor(theme.a2),
    cardBg: theme.lt ? "F5F5F5" : "1A1A2E",
    fontFace: "Arial",
    coverBg: hexColor(theme.bg),
    closingBg: hexColor(theme.bg),
    closingTitle: hexColor(theme.tp),
    closingSub: hexColor(theme.ts),
    contentBg: hexColor(theme.bg),
  };
}

async function exportWithTemplate(
  slides: SlideData[],
  title: string
): Promise<void> {
  const res = await fetch("/api/export-pptx", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slides }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  if (!json.pptx) throw new Error("PPTX 생성 실패");

  // base64 → Blob → download
  const byteChars = atob(json.pptx);
  const byteArray = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteArray[i] = byteChars.charCodeAt(i);
  }
  const blob = new Blob([byteArray], {
    type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title}.pptx`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportToPptx(
  slides: SlideData[],
  theme: Theme,
  title?: string,
  useTemplate = false
): Promise<void> {
  const fileName = title || "presentation";

  if (useTemplate) {
    return exportWithTemplate(slides, fileName);
  }

  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "AI Slide Builder";
  pptx.title = title || "AI Generated Presentation";

  const st = buildStyles(theme, useTemplate);

  for (const s of slides) {
    const slide = pptx.addSlide();
    const type = s.type || "content";

    // --- COVER ---
    if (type === "cover") {
      slide.background = { color: st.coverBg };
      if (useTemplate) {
        // 왼쪽 액센트 바
        slide.addShape(pptx.ShapeType.rect, {
          x: 0, y: 0, w: 0.15, h: "100%",
          fill: { color: st.accentColor },
        });
      }
      if (s.badge) {
        slide.addText(s.badge, {
          x: 1, y: 1.5, w: 3,
          fontSize: 10, fontFace: st.fontFace,
          color: useTemplate ? st.closingSub : st.accentColor,
          bold: true,
        });
      }
      slide.addText(
        [
          { text: s.title || "", options: { fontSize: 44, bold: true, color: useTemplate ? "FFFFFF" : st.titleColor, breakLine: true } },
          ...(s.titleGrad
            ? [{ text: s.titleGrad, options: { fontSize: 44, bold: true, color: st.accentColor, breakLine: true } }]
            : []),
          ...(s.subtitle
            ? [{ text: "\n" + s.subtitle, options: { fontSize: 18, color: useTemplate ? st.closingSub : st.subColor } }]
            : []),
        ],
        { x: 1, y: 1.8, w: 8, h: 4, valign: "middle", fontFace: st.fontFace }
      );
    }

    // --- CLOSING ---
    else if (type === "closing") {
      slide.background = { color: st.closingBg };
      if (useTemplate) {
        slide.addShape(pptx.ShapeType.rect, {
          x: 0, y: 0, w: 0.15, h: "100%",
          fill: { color: st.accentColor },
        });
      }
      slide.addText(
        [
          { text: s.title || "감사합니다", options: { fontSize: 48, bold: true, color: st.closingTitle, breakLine: true } },
          ...(s.titleGrad
            ? [{ text: s.titleGrad, options: { fontSize: 48, bold: true, color: st.accentColor } }]
            : []),
          ...(s.subtitle
            ? [{ text: "\n" + s.subtitle, options: { fontSize: 18, color: st.closingSub } }]
            : []),
        ],
        { x: 1, y: 2.5, w: 11, h: 3, align: "center", valign: "middle", fontFace: st.fontFace }
      );
    }

    // --- QUOTE ---
    else if (type === "quote") {
      slide.background = { color: st.contentBg };
      if (useTemplate) {
        // 상단 액센트 라인
        slide.addShape(pptx.ShapeType.rect, {
          x: 0, y: 0, w: "100%", h: 0.08,
          fill: { color: st.accentColor },
        });
      }
      if (s.sectionLabel) {
        slide.addText(s.sectionLabel, {
          x: 1, y: 0.8, w: 5,
          fontSize: 10, fontFace: st.fontFace,
          color: st.accentColor, bold: true,
        });
      }
      slide.addText(s.title || "", {
        x: 1, y: 1.5, w: 11,
        fontSize: 32, fontFace: st.fontFace,
        bold: true, color: st.titleColor, align: "center",
      });
      slide.addText(`\u201C${s.quote || ""}\u201D`, {
        x: 1.5, y: 3, w: 10,
        fontSize: 18, fontFace: st.fontFace,
        italic: true, color: st.subColor, align: "center",
      });
      if (s.author) {
        slide.addText(`\u2014 ${s.author}`, {
          x: 1.5, y: 4.5, w: 10,
          fontSize: 12, fontFace: st.fontFace,
          color: st.subColor, align: "center",
        });
      }
    }

    // --- CONTENT ---
    else {
      slide.background = { color: st.contentBg };
      if (useTemplate) {
        slide.addShape(pptx.ShapeType.rect, {
          x: 0, y: 0, w: "100%", h: 0.08,
          fill: { color: st.accentColor },
        });
      }
      if (s.sectionLabel) {
        slide.addText(s.sectionLabel, {
          x: 0.8, y: 0.5, w: 5,
          fontSize: 10, fontFace: st.fontFace,
          color: st.accentColor, bold: true,
        });
      }
      slide.addText(s.title || "Slide", {
        x: 0.8, y: 0.9, w: 8,
        fontSize: 28, fontFace: st.fontFace,
        bold: true, color: st.titleColor,
      });

      if (s.description) {
        slide.addText(s.description, {
          x: 0.8, y: 1.8, w: 7,
          fontSize: 14, fontFace: st.fontFace,
          color: st.subColor, lineSpacing: 22,
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
          const itemTitle = typeof item === "string" ? item : item.title;
          const itemDesc = typeof item !== "string" ? item.desc : undefined;

          slide.addShape(pptx.ShapeType.roundRect, {
            x, y, w: cardW, h: 1.5,
            fill: { color: st.cardBg },
            rectRadius: 0.1,
            ...(useTemplate ? { line: { color: st.accentColor, width: 0.5 } } : {}),
          });
          slide.addText(
            [
              { text: itemTitle, options: { fontSize: 13, bold: true, color: st.titleColor, breakLine: true } },
              ...(itemDesc
                ? [{ text: itemDesc, options: { fontSize: 11, color: st.subColor } }]
                : []),
            ],
            { x: x + 0.2, y: y + 0.2, w: cardW - 0.4, h: 1.1, fontFace: st.fontFace }
          );
        });
      }
    }
  }

  await pptx.writeFile({ fileName: `${title || "presentation"}.pptx` });
}
