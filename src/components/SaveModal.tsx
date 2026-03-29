"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { storageGet, storageSet } from "@/lib/storage";
import { Template } from "@/lib/types";

interface SaveModalProps {
  themeId: string;
  onClose: () => void;
  onSaved: (templates: Template[]) => void;
}

export default function SaveModal({
  themeId,
  onClose,
  onSaved,
}: SaveModalProps) {
  const [name, setName] = useState("");

  const handleSave = () => {
    if (!name.trim()) return;
    const all = storageGet<Template[]>("slide-tpls") || [];
    const next = [
      ...all,
      { id: Date.now().toString(), name: name.trim(), tid: themeId },
    ];
    storageSet("slide-tpls", next);
    onSaved(next);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,.8)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm space-y-5 rounded-3xl border border-white/10 bg-[#0c0d14]/95 p-6 backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="flex items-center gap-2 text-lg font-bold text-white">
          <Save className="h-5 w-5 text-orange-400" />
          서식 저장
        </h3>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="서식 이름을 입력하세요"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-orange-500/40"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
          }}
        />
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="w-full rounded-2xl py-3 text-sm font-bold transition-all"
          style={{
            background: name.trim()
              ? "linear-gradient(135deg,#f97316,#ec4899)"
              : "rgba(255,255,255,.05)",
            color: name.trim() ? "#fff" : "rgba(255,255,255,.2)",
          }}
        >
          저장
        </button>
      </div>
    </div>
  );
}
