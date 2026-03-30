/** PPTX 템플릿 프리셋 — 슬라이드_양식_템플릿.pptx에서 추출한 스타일 */

export interface PptxTemplatePreset {
  name: string;
  fontFace: string;
  cover: {
    bgColor: string;
    titleColor: string;
    subtitleColor: string;
    accentColor: string;
  };
  content: {
    bgColor: string;
    titleColor: string;
    textColor: string;
    accentColor: string;
    cardBg: string;
    cardBorder: string;
  };
  closing: {
    bgColor: string;
    titleColor: string;
    subtitleColor: string;
  };
}

export const DEFAULT_TEMPLATE: PptxTemplatePreset = {
  name: "슬라이드 양식 템플릿",
  fontFace: "맑은 고딕",
  cover: {
    bgColor: "1F497D",
    titleColor: "FFFFFF",
    subtitleColor: "B8CCE4",
    accentColor: "4F81BD",
  },
  content: {
    bgColor: "FFFFFF",
    titleColor: "1F497D",
    textColor: "333333",
    accentColor: "4F81BD",
    cardBg: "EBF1F8",
    cardBorder: "B8CCE4",
  },
  closing: {
    bgColor: "1F497D",
    titleColor: "FFFFFF",
    subtitleColor: "B8CCE4",
  },
};
