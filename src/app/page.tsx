"use client";

import { useState, useEffect } from "react";
import { SlideData, Source, Template, Theme, ViewState } from "@/lib/types";
import { THEMES } from "@/lib/themes";
import { storageGet } from "@/lib/storage";
import BuildView from "@/components/BuildView";
import LoadingView from "@/components/LoadingView";
import SlidesView from "@/components/SlidesView";

export default function Home() {
  const [view, setView] = useState<ViewState>("build");
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [theme, setTheme] = useState<Theme>(THEMES.neonGaming);
  const [sources, setSources] = useState<Source[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    const saved = storageGet<Template[]>("slide-tpls");
    if (saved) setTemplates(saved);
  }, []);

  if (view === "loading") {
    return (
      <LoadingView
        status={status}
        error={error}
        progress={progress}
        sources={sources}
        onBack={() => {
          setView("build");
          setError("");
        }}
      />
    );
  }

  if (view === "slides" && slides.length > 0) {
    return (
      <SlidesView
        slides={slides}
        theme={theme}
        sources={sources}
        onBack={() => setView("build")}
        onTemplatesSaved={setTemplates}
      />
    );
  }

  return (
    <BuildView
      onGenerated={(newSlides, newTheme, newSources) => {
        setSlides(newSlides);
        setTheme(newTheme);
        setSources(newSources);
        setView("slides");
      }}
      onLoadingStart={() => {
        setView("loading");
        setError("");
        setSources([]);
        setProgress(10);
      }}
      onStatusChange={setStatus}
      onProgressChange={setProgress}
      onError={setError}
      templates={templates}
      onTemplatesChange={setTemplates}
    />
  );
}
