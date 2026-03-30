"use client";

import { useState, useEffect } from "react";
import { ImageIcon, AlertCircle } from "lucide-react";

interface SlideImageProps {
  src?: string;
  tm: string;
  cb: string;
}

export default function SlideImage({ src, tm, cb }: SlideImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!src) return;
    setLoaded(false);
    setErrored(false);
    setTimedOut(false);

    const timer = setTimeout(() => {
      if (!loaded) setTimedOut(true);
    }, 20000);

    return () => clearTimeout(timer);
  }, [src]);

  if (!src) return null;

  if (errored || timedOut) {
    return (
      <div
        className="mt-4 flex items-center justify-center gap-2 rounded-2xl py-8"
        style={{ background: cb }}
      >
        <AlertCircle className="h-4 w-4" style={{ color: tm }} />
        <span className="text-xs" style={{ color: tm }}>
          이미지를 불러올 수 없습니다
        </span>
      </div>
    );
  }

  return (
    <div className="relative mt-4 max-h-56 overflow-hidden rounded-2xl">
      {!loaded && (
        <div
          className="absolute inset-0 flex animate-pulse items-center justify-center rounded-2xl"
          style={{ background: cb }}
        >
          <ImageIcon className="h-6 w-6" style={{ color: tm }} />
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="w-full rounded-2xl object-cover transition-opacity duration-500"
        style={{ maxHeight: 224, opacity: loaded ? 1 : 0 }}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
      />
    </div>
  );
}
