import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Slide Builder",
  description: "AI 기반 프레젠테이션 생성기",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Chakra+Petch:wght@400;500;600;700&family=Sora:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&family=Manrope:wght@400;500;600;700;800&family=Nunito+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700;800&family=Source+Sans+3:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
