"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";

interface SlideImageProps {
  src?: string;
  tm: string;
  cb: string;
}

export default function SlideImage({ src, tm, cb }: SlideImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  if (!src || errored) return null;

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
