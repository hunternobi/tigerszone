"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

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
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgOpacity = useTransform(scrollYProgress, [0, 1], [opacity, 0]);

  return (
    <div ref={ref} className="relative -mt-[72px] overflow-hidden">
      <motion.div
        style={{ opacity: bgOpacity, filter: blurPx ? `blur(${blurPx}px)` : undefined }}
        className={`pointer-events-none fixed inset-0 -z-10 ${scaleClassName}`}
      >
        <Image src={src} alt={alt} fill priority className="object-cover object-center" />
      </motion.div>

      {overlayClassName && (
        <motion.div
          style={{ opacity: bgOpacity }}
          className={`pointer-events-none fixed inset-0 -z-10 ${overlayClassName}`}
        />
      )}

      <div className="relative z-10 pt-[72px]">{children}</div>
    </div>
  );
}
