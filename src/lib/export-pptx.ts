import PptxGenJS from "pptxgenjs";
import { SlideData, Theme } from "./types";

function hexColor(rgba: string): string {
  // Extract hex from various formats
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

export async function exportToPptx(
  slides: SlideData[],
  theme: Theme,
  title?: string
): Promise<void> {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "AI Slide Builder";
  pptx.title = title || "AI Generated Presentation";

  const bgColor = hexColor(theme.bg);
  const textColor = hexColor(theme.tp);
  const subColor = hexColor(theme.ts);
  const a1 = hexColor(theme.a1);
  const a2 = hexColor(theme.a2);
  const cardBg = theme.lt ? "F5F5F5" : "1A1A2E";

  for (const s of slides) {
    const slide = pptx.addSlide();
    slide.background = { color: bgColor };
    const type = s.type || "content";

    if (type === "cover") {
      if (s.badge) {
        slide.addText(s.badge, {
          x: 1,
          y: 1.5,
          w: 3,
          fontSize: 10,
          fontFace: "Arial",
          color: a1,
          bold: true,
        });
      }
      slide.addText(
        [
          { text: s.title || "", options: { fontSize: 44, bold: true, color: textColor, breakLine: true } },
          ...(s.titleGrad
            ? [{ text: s.titleGrad, options: { fontSize: 44, bold: true, color: a1, breakLine: true } }]
            : []),
          ...(s.subtitle
            ? [{ text: "\n" + s.subtitle, options: { fontSize: 18, color: subColor } }]
            : []),
        ],
        { x: 1, y: 2, w: 8, h: 4, valign: "middle" }
      );
      if (s.imageUrl && !s.imageUrl.startsWith("data:")) {
        slide.addImage({ path: s.imageUrl, x: 9, y: 1, w: 3.5, h: 3.5 });
      }
    } else if (type === "closing") {
      slide.addText(
        [
          { text: s.title || "감사합니다", options: { fontSize: 48, bold: true, color: textColor, breakLine: true } },
          ...(s.titleGrad
            ? [{ text: s.titleGrad, options: { fontSize: 48, bold: true, color: a2 } }]
            : []),
          ...(s.subtitle
            ? [{ text: "\n" + s.subtitle, options: { fontSize: 18, color: subColor } }]
            : []),
        ],
        { x: 1, y: 2.5, w: 11, h: 3, align: "center", valign: "middle" }
      );
    } else if (type === "quote") {
      if (s.sectionLabel) {
        slide.addText(s.sectionLabel, {
          x: 1,
          y: 0.8,
          w: 5,
          fontSize: 10,
          fontFace: "Arial",
          color: a1,
          bold: true,
        });
      }
      slide.addText(s.title || "", {
        x: 1,
        y: 1.5,
        w: 11,
        fontSize: 32,
        fontFace: "Arial",
        bold: true,
        color: textColor,
        align: "center",
      });
      slide.addText(`"${s.quote || ""}"`, {
        x: 1.5,
        y: 3,
        w: 10,
        fontSize: 18,
        fontFace: "Arial",
        italic: true,
        color: subColor,
        align: "center",
      });
      if (s.author) {
        slide.addText(`— ${s.author}`, {
          x: 1.5,
          y: 4.5,
          w: 10,
          fontSize: 12,
          color: subColor,
          align: "center",
        });
      }
    } else {
      // content / comparison
      if (s.sectionLabel) {
        slide.addText(s.sectionLabel, {
          x: 0.8,
          y: 0.5,
          w: 5,
          fontSize: 10,
          fontFace: "Arial",
          color: a1,
          bold: true,
        });
      }
      slide.addText(s.title || "Slide", {
        x: 0.8,
        y: 0.9,
        w: 8,
        fontSize: 28,
        fontFace: "Arial",
        bold: true,
        color: textColor,
      });

      if (s.description) {
        slide.addText(s.description, {
          x: 0.8,
          y: 1.8,
          w: 7,
          fontSize: 14,
          color: subColor,
          lineSpacing: 22,
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
            x,
            y,
            w: cardW,
            h: 1.5,
            fill: { color: cardBg },
            rectRadius: 0.1,
          });
          slide.addText(
            [
              { text: itemTitle, options: { fontSize: 13, bold: true, color: textColor, breakLine: true } },
              ...(itemDesc
                ? [{ text: itemDesc, options: { fontSize: 11, color: subColor } }]
                : []),
            ],
            { x: x + 0.2, y: y + 0.2, w: cardW - 0.4, h: 1.1 }
          );
        });
      }

      if (s.imageUrl && !s.imageUrl.startsWith("data:")) {
        slide.addImage({
          path: s.imageUrl,
          x: 8.5,
          y: 1.8,
          w: 4,
          h: 2.5,
          rounding: true,
        });
      }
    }
  }

  await pptx.writeFile({ fileName: `${title || "presentation"}.pptx` });
}
