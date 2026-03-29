"use client";

import { Theme } from "@/lib/types";

interface MiniPreviewProps {
  theme: Theme;
}

export default function MiniPreview({ theme: t }: MiniPreviewProps) {
  return (
    <div
      className="relative aspect-video w-full overflow-hidden rounded-xl"
      style={{ background: t.bg, border: `1px solid ${t.cd}` }}
    >
      <div
        className="absolute rounded-full"
        style={{
          background: t.a1,
          opacity: t.go * 1.5,
          filter: "blur(30px)",
          width: 80,
          height: 80,
          top: "-15%",
          left: "-8%",
        }}
      />
      <div className="relative z-10 flex h-full flex-col justify-center p-3">
        <div
          className="mb-1 h-1.5 rounded-sm"
          style={{ width: "65%", background: t.tp, opacity: 0.7 }}
        />
        <div
          className="mb-2 h-1 rounded-sm"
          style={{
            width: "45%",
            background: `linear-gradient(90deg,${t.a1},${t.a2})`,
            opacity: 0.8,
          }}
        />
        <div className="mt-auto flex gap-1">
          {[t.a1, t.a2, t.a3].map((c, i) => (
            <div
              key={i}
              className="h-3 flex-1 rounded-sm"
              style={{ background: c, opacity: 0.12 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
