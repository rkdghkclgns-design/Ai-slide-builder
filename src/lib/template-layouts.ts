/**
 * 슬라이드_양식_템플릿.pptx의 14가지 레이아웃 정의
 * 원본 PPTX XML에서 추출한 정확한 색상/위치/구조
 */

export const TC = {
  dark: "#0F172A",     // 메인 다크 배경
  white: "#F8FAFC",    // 메인 밝은 배경/텍스트
  cyan: "#06B6D4",     // 시안 액센트
  sky: "#38BDF8",      // 스카이블루 액센트
  red: "#EF4444",      // 레드 액센트
  gray: "#94A3B8",     // 회색 서브텍스트
  lightGray: "#E2E8F0",// 밝은 회색 카드배경
  border: "#CBD5E1",   // 카드 테두리
};

/** AI 슬라이드 타입 → 원본 템플릿 슬라이드 매핑 */
export type TemplateLayout =
  | "cover"        // 슬라이드 1: 커버 (다크배경 + 배경이미지)
  | "intro"        // 슬라이드 2: 소개 (다크배경 + Introduction 라벨)
  | "objectives"   // 슬라이드 3: 목표 (밝은배경 + 3카드)
  | "section"      // 슬라이드 4: 파트 구분 (다크배경 + Part N)
  | "twoColumn"    // 슬라이드 5: 2열 카드 (밝은배경 + 다크카드 2개)
  | "example"      // 슬라이드 6: 예시 (밝은배경 + 불릿 + 이미지)
  | "caseStudy"    // 슬라이드 7: 케이스 (밝은배경 + 2이미지 카드)
  | "threeCards"   // 슬라이드 8: 3카드 (밝은배경 + 3열)
  | "summary"      // 슬라이드 9: 소결 (다크배경 + 큰따옴표)
  | "imageText"    // 슬라이드 10: 텍스트+이미지 (밝은배경)
  | "caseDetail"   // 슬라이드 11: 케이스 상세 (밝은배경)
  | "keyValue"     // 슬라이드 12: 키-값 정리 (밝은배경)
  | "table"        // 슬라이드 13: 비교표 (밝은배경)
  | "closing";     // 슬라이드 14: 마무리 (다크배경)

export function isDarkLayout(layout: TemplateLayout): boolean {
  return ["cover", "intro", "section", "summary", "closing"].includes(layout);
}
