export interface Theme {
  id: string;
  nm: string;
  ic: string;
  bg: string;
  cb: string;
  cd: string;
  hf: string;
  bf: string;
  fu: string;
  a1: string;
  a2: string;
  a3: string;
  tp: string;
  ts: string;
  tm: string;
  go: number;
  gr: boolean;
  sc: boolean;
  lt: boolean;
}

export interface SlideItem {
  title: string;
  desc?: string;
}

export interface SlideSide {
  title: string;
  items: string[];
}

export interface SlideData {
  type?:
    | "cover"
    | "intro"
    | "objectives"
    | "section"
    | "twoColumn"
    | "caseStudy"
    | "threeCards"
    | "summary"
    | "table"
    | "content"
    | "quote"
    | "comparison"
    | "example"
    | "imageText"
    | "caseDetail"
    | "keyValue"
    | "closing";
  title?: string;
  titleGrad?: string;
  subtitle?: string;
  badge?: string;
  description?: string;
  items?: (string | SlideItem)[];
  quote?: string;
  author?: string;
  sectionLabel?: string;
  footer?: string;
  left?: SlideSide;
  right?: SlideSide;
  sources?: string;
  imagePrompt?: string;
  imageUrl?: string;
  partNumber?: number;
  tableHeaders?: string[];
  tableRows?: string[][];
  script?: string;
}

export interface Source {
  title: string;
  url: string;
}

export interface Template {
  id: string;
  name: string;
  tid: string;
}

export type InputMode = "command" | "file" | "url";
export type ViewState = "build" | "loading" | "slides";
