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

  if (type === "cover") {
    // 커버: Navy 배경 + 좌측 액센트 바 + 큰 제목
    slide.background = { color: T.navy };
    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: 0.18, h: "100%",
      fill: { color: T.blue },
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.18, y: 4.8, w: 12.82, h: 0.04,
      fill: { color: T.blue },
    });
    slide.addText(s.title || "", {
      x: 0.8, y: 1.2, w: 10, h: 2,
      fontSize: 40, fontFace: T.font, bold: true,
      color: T.white, valign: "bottom",
    });
    if (s.subtitle) {
      slide.addText(s.subtitle, {
        x: 0.8, y: 3.5, w: 10,
        fontSize: 18, fontFace: T.font,
        color: T.lightBlue,
      });
    }
    // 슬라이드 번호
    slide.addText("AI Slide Builder", {
      x: 9, y: 6.5, w: 4,
      fontSize: 9, fontFace: T.font,
      color: T.lightBlue, align: "right",
    });
  } else if (type === "closing") {
    // 마무리: Navy 배경 + 중앙 메시지
    slide.background = { color: T.navy };
    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: 0.18, h: "100%",
      fill: { color: T.blue },
    });
    slide.addText(s.title || "감사합니다", {
      x: 1, y: 2, w: 11, h: 3,
      fontSize: 44, fontFace: T.font, bold: true,
      color: T.white, align: "center", valign: "middle",
    });
    if (s.subtitle) {
      slide.addText(s.subtitle, {
        x: 1, y: 5, w: 11,
        fontSize: 16, fontFace: T.font,
        color: T.lightBlue, align: "center",
      });
    }
  } else if (type === "quote") {
    // 인용/소결: 흰 배경 + 상단바 + 큰 따옴표 + 중앙 텍스트
    slide.background = { color: T.white };
    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: "100%", h: 0.06,
      fill: { color: T.blue },
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: 0.18, h: "100%",
      fill: { color: T.navy },
    });
    // 큰 따옴표
    slide.addText("\u201C", {
      x: 1, y: 0.8, w: 1,
      fontSize: 72, fontFace: "Georgia",
      color: T.blue,
    });
    if (s.sectionLabel) {
      slide.addText(s.sectionLabel, {
        x: 0.8, y: 0.4, w: 4,
        fontSize: 10, fontFace: T.font, bold: true,
        color: T.blue, charSpacing: 2,
      });
    }
    slide.addText(s.title || "", {
      x: 1.5, y: 1.5, w: 10,
      fontSize: 28, fontFace: T.font, bold: true,
      color: T.navy, align: "center",
    });
    slide.addText(s.quote || s.description || "", {
      x: 1.5, y: 2.8, w: 10, h: 2.5,
      fontSize: 16, fontFace: T.font, italic: true,
      color: T.midGray, align: "center", valign: "middle",
      lineSpacing: 26,
    });
    if (s.author) {
      slide.addText(`\u2014 ${s.author}`, {
        x: 1.5, y: 5.5, w: 10,
        fontSize: 12, fontFace: T.font,
        color: T.midGray, align: "center",
      });
    }
    // 페이지 번호
    slide.addText(`${idx + 1} / ${total}`, {
      x: 11.5, y: 6.8, w: 1.5,
      fontSize: 8, fontFace: T.font,
      color: T.midGray, align: "right",
    });
  } else {
    // 콘텐츠: 흰 배경 + 상단바 + 좌측 사이드바 + 카드 그리드
    slide.background = { color: T.white };
    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: "100%", h: 0.06,
      fill: { color: T.blue },
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: 0.18, h: "100%",
      fill: { color: T.navy },
    });

    // 섹션 라벨
    if (s.sectionLabel) {
      slide.addText(s.sectionLabel.toUpperCase(), {
        x: 0.8, y: 0.35, w: 5,
        fontSize: 9, fontFace: T.font, bold: true,
        color: T.blue, charSpacing: 3,
      });
    }

    // 제목
    slide.addText(s.title || "", {
      x: 0.8, y: 0.7, w: 11,
      fontSize: 26, fontFace: T.font, bold: true,
      color: T.navy,
    });

    // 제목 밑 액센트 라인
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.8, y: 1.45, w: 2.5, h: 0.04,
      fill: { color: accent },
    });

    // 설명 텍스트
    let contentY = 1.7;
    if (s.description) {
      slide.addText(s.description, {
        x: 0.8, y: contentY, w: 11,
        fontSize: 13, fontFace: T.font,
        color: T.darkGray, lineSpacing: 22,
      });
      contentY += 1.2;
    }

    // 아이템 카드
    if (s.items && s.items.length > 0) {
      const itemCount = s.items.length;
      const cols = itemCount <= 3 ? itemCount : itemCount <= 4 ? 2 : 3;
      const cardW = (11.4 - (cols - 1) * 0.3) / cols;
      const cardH = 1.6;

      s.items.forEach((item, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = 0.8 + col * (cardW + 0.3);
        const y = contentY + row * (cardH + 0.25);
        const itemTitle = typeof item === "string" ? item : item.title;
        const itemDesc = typeof item !== "string" ? item.desc : undefined;

        // 카드 배경
        slide.addShape(pptx.ShapeType.roundRect, {
          x, y, w: cardW, h: cardH,
          fill: { color: T.lightGray },
          rectRadius: 0.08,
          line: { color: T.lightBlue, width: 0.8 },
        });

        // 카드 상단 액센트
        slide.addShape(pptx.ShapeType.rect, {
          x: x + 0.15, y, w: cardW - 0.3, h: 0.04,
          fill: { color: accent },
        });

        // 카드 텍스트
        slide.addText(
          [
            {
              text: itemTitle,
              options: {
                fontSize: 12, bold: true, color: T.navy,
                breakLine: true,
              },
            },
            ...(itemDesc
              ? [{
                  text: "\n" + itemDesc,
                  options: { fontSize: 10, color: T.midGray },
                }]
              : []),
          ],
          {
            x: x + 0.2, y: y + 0.2, w: cardW - 0.4, h: cardH - 0.3,
            fontFace: T.font, valign: "top",
          }
        );
      });
    }

    // 페이지 번호
    slide.addText(`${idx + 1} / ${total}`, {
      x: 11.5, y: 6.8, w: 1.5,
      fontSize: 8, fontFace: T.font,
      color: T.midGray, align: "right",
    });
  }
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
  }
}

/* ═══ PUBLIC: PPTX 내보내기 ═══ */
export async function exportToPptx(
  slides: SlideData[],
  theme: Theme,
  title?: string,
  useTemplate = false
): Promise<void> {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "AI Slide Builder";
  pptx.title = title || "AI Generated Presentation";

  if (useTemplate) {
    slides.forEach((s, i) => buildTemplateSlide(pptx, s, i, slides.length));
  } else {
    slides.forEach((s) => buildDefaultSlide(pptx, s, theme));
  }

  await pptx.writeFile({ fileName: `${title || "presentation"}.pptx` });
}
