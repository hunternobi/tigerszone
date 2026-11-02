"use client";

import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import SharedGlass from "@/components/SharedGlass";

interface FadingBackgroundProps {
  src: string;
  mobileSrc?: string;
  alt?: string;
  opacity?: number;
  blurPx?: number;
  overlayClassName?: string;
  scaleClassName?: string;
  children: ReactNode;
}

export default function FadingBackground({
  src,
  mobileSrc,
  alt = "",
  opacity = 1,
  blurPx = 0,
  overlayClassName,
  scaleClassName = "scale-100",
  children,
}: FadingBackgroundProps) {
  return (
    <div data-glass-scope className="relative -mt-[4.5rem] overflow-hidden">
      <div
        data-page-background
        style={
          {
            opacity,
            "--page-bg-blur": blurPx ? `${blurPx}px` : undefined,
          } as CSSProperties
        }
        className={`page-bg pointer-events-none fixed inset-x-0 top-0 -z-10 h-[100lvh] transform-gpu ${scaleClassName}`}
      >
        {mobileSrc ? (
          <>
            <Image
              src={mobileSrc}
              alt={alt}
              fill
              priority
              className="object-cover object-center sm:hidden"
            />
            <Image
              src={src}
              alt={alt}
              fill
              priority
              className="hidden object-cover object-center sm:block"
            />
          </>
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            priority
            className="object-cover object-center"
          />
        )}
      </div>

      <SharedGlass
        src={src}
        mobileSrc={mobileSrc}
        opacity={opacity}
        blurPx={blurPx}
      />

      {overlayClassName && (
        <div
          style={{ opacity }}
          className={`pointer-events-none fixed inset-0 -z-10 ${overlayClassName}`}
        />
      )}

      <div className="relative z-10 pt-[4.5rem]">{children}</div>
    </div>
  );
}
