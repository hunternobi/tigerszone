"use client";

import Image from "next/image";
import type { ReactNode } from "react";

interface FadingBackgroundProps {
  src: string;
  alt?: string;
  opacity?: number;
  blurPx?: number;
  overlayClassName?: string;
  scaleClassName?: string;
  children: ReactNode;
}

export default function FadingBackground({
  src,
  alt = "",
  opacity = 1,
  blurPx = 0,
  overlayClassName,
  scaleClassName = "scale-105",
  children,
}: FadingBackgroundProps) {
  return (
    <div className="relative -mt-[72px] overflow-hidden">
      <div
        style={{ opacity, filter: blurPx ? `blur(${blurPx}px)` : undefined }}
        className={`pointer-events-none fixed inset-0 -z-10 ${scaleClassName}`}
      >
        <Image src={src} alt={alt} fill priority className="object-cover object-center" />
      </div>

      {overlayClassName && (
        <div
          style={{ opacity }}
          className={`pointer-events-none fixed inset-0 -z-10 ${overlayClassName}`}
        />
      )}

      <div className="relative z-10 pt-[72px]">{children}</div>
    </div>
  );
}
