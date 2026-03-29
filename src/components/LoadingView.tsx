"use client";

import { AlertTriangle, Loader2, Globe } from "lucide-react";
import { Source } from "@/lib/types";

interface LoadingViewProps {
  status: string;
  error: string;
  progress: number;
  sources: Source[];
  onBack: () => void;
}

export default function LoadingView({
  status,
  error,
  progress,
  sources,
  onBack,
}: LoadingViewProps) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-8"
      style={{
        background: "#09090b",
        fontFamily: "'Plus Jakarta Sans',sans-serif",
      }}
    >
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute rounded-full"
          style={{
            background: "#f97316",
            opacity: 0.06,
            filter: "blur(180px)",
            width: 500,
            height: 500,
            top: "10%",
            left: "30%",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            background: "#ec4899",
            opacity: 0.04,
            filter: "blur(180px)",
            width: 400,
            height: 400,
            bottom: "10%",
            right: "20%",
          }}
        />
      </div>

      <div className="animate-slide-up relative z-10 w-full max-w-lg space-y-8">
        <div className="space-y-4 text-center">
          {error ? (
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/10">
              <AlertTriangle className="h-10 w-10 text-red-400" />
            </div>
          ) : (
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
              <div
                className="absolute inset-0 rounded-3xl"
                style={{
                  background: `conic-gradient(from 0deg, #f97316 ${progress}%, transparent ${progress}%)`,
                  opacity: 0.2,
                }}
              />
              <div className="absolute inset-1 rounded-[20px] bg-[#09090b]" />
              <Loader2 className="relative z-10 h-8 w-8 animate-spin text-orange-500" />
            </div>
          )}
          <h2 className="shimmer-text text-xl font-bold text-white">
            {status}
          </h2>
          {!error && (
            <p className="text-sm text-white/30">
              {progress}% 완료
            </p>
          )}
          {error && (
            <pre className="max-h-60 overflow-auto whitespace-pre-wrap rounded-2xl bg-red-400/5 p-4 text-left text-xs text-red-400/80">
              {error}
            </pre>
          )}
        </div>

        {!error && (
          <div className="overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,.05)" }}>
            <div
              className="h-1.5 rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg,#f97316,#ec4899,#a855f7)",
              }}
            />
          </div>
        )}

        {sources.length > 0 && (
          <div className="rounded-2xl border border-white/8 bg-white/[.02] p-4 backdrop-blur-sm">
            <p className="mb-3 text-xs font-semibold text-white/40">
              수집된 출처 ({sources.length})
            </p>
            <div className="max-h-32 space-y-1.5 overflow-y-auto">
              {sources.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-xl p-2"
                  style={{
                    background: "rgba(255,255,255,.02)",
                    animationDelay: `${i * 100}ms`,
                  }}
                >
                  <Globe className="h-3.5 w-3.5 flex-shrink-0 text-cyan-400/40" />
                  <p className="flex-1 truncate text-xs text-white/40">
                    {s.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <button
            onClick={onBack}
            className="mx-auto block rounded-2xl border border-white/8 px-8 py-3 text-sm text-white/50 transition-all hover:border-white/15 hover:bg-white/5"
          >
            돌아가기
          </button>
        )}
      </div>
    </div>
  );
}
