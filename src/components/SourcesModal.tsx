"use client";

import { X, Globe } from "lucide-react";
import { Source } from "@/lib/types";

interface SourcesModalProps {
  sources: Source[];
  onClose: () => void;
}

export default function SourcesModal({ sources, onClose }: SourcesModalProps) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,.8)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0c0d14]/95 p-6 backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">
            출처{" "}
            <span className="ml-1 text-sm font-normal text-white/40">
              ({sources.length})
            </span>
          </h3>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 transition-colors hover:bg-white/10"
          >
            <X className="h-4 w-4 text-white/60" />
          </button>
        </div>
        <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
          {sources.map((s, i) => (
            <a
              key={i}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 rounded-2xl p-3 transition-colors hover:bg-white/5"
            >
              <span className="w-5 text-right font-mono text-xs text-white/15">
                {i + 1}
              </span>
              <Globe className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400/40 transition-colors group-hover:text-cyan-400/70" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white/70 group-hover:text-white/90">
                  {s.title}
                </p>
                <p className="truncate text-xs text-cyan-400/30 group-hover:text-cyan-400/50">
                  {s.url}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
