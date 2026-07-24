"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

interface FadingBackgroundProps {
  src: string;
  alt?: string;
  opacity?: number;
  blurPx?: number;
  children: ReactNode;
}

export default function FadingBackground({
  src,
  alt = "",
  opacity = 1,
  blurPx = 0,
  children,
}: FadingBackgroundProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgOpacity = useTransform(scrollYProgress, [0, 1], [opacity, 0]);

  return (
    <div ref={ref} className="relative overflow-hidden">
      <motion.div
        style={{ opacity: bgOpacity, filter: blurPx ? `blur(${blurPx}px)` : undefined }}
        className="pointer-events-none absolute inset-0 -z-10 max-sm:h-[70vh] scale-105"
      >
        <Image src={src} alt={alt} fill priority className="object-cover object-center" />
      </motion.div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
