"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "@/components/Reveal";
import type { Sponsor } from "@/types";

const PLACEHOLDER_SPONSORS: Sponsor[] = [
  { _id: "1", name: "Sponsor 1", logoUrl: "", linkUrl: "#", order: 1 },
  { _id: "2", name: "Sponsor 2", logoUrl: "", linkUrl: "#", order: 2 },
  { _id: "3", name: "Sponsor 3", logoUrl: "", linkUrl: "#", order: 3 },
  { _id: "4", name: "Sponsor 4", logoUrl: "", linkUrl: "#", order: 4 },
];

const STEP_INTERVAL = 3000;
const SLIDE_DURATION = 600;

export default function SponsorBar() {
  const [index, setIndex] = useState(0);
  const [animated, setAnimated] = useState(true);
  const tileRef = useRef<HTMLAnchorElement>(null);
  const [step, setStep] = useState(0);

  const count = PLACEHOLDER_SPONSORS.length;
  const trackItems = [...PLACEHOLDER_SPONSORS, ...PLACEHOLDER_SPONSORS];

  useEffect(() => {
    function measure() {
      const tile = tileRef.current;
      if (!tile) return;
      const gap = parseFloat(getComputedStyle(tile.parentElement as HTMLElement).columnGap || "0");
      setStep(tile.getBoundingClientRect().width + gap);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => current + 1);
    }, STEP_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (index !== count) return;
    const timeout = setTimeout(() => {
      setAnimated(false);
      setIndex(0);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimated(true));
      });
    }, SLIDE_DURATION);
    return () => clearTimeout(timeout);
  }, [index, count]);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 text-center">
      <h2 className="text-3xl font-bold text-white">Unsere Partner</h2>
      <p className="mt-2 text-white/70">
        Gemeinsam mit starken Partnern machen wir TigersZone möglich
      </p>

      <Reveal>
        <div className="mt-10 overflow-hidden">
          <div
            className="flex gap-4"
            style={{
              transform: `translateX(-${index * step}px)`,
              transition: animated ? `transform ${SLIDE_DURATION}ms ease` : "none",
            }}
          >
            {trackItems.map((sponsor, i) => (
              <a
                key={`${sponsor._id}-${i}`}
                ref={i === 0 ? tileRef : undefined}
                href={sponsor.linkUrl}
                className="glass-panel-sm glass-interactive flex h-24 w-40 shrink-0 items-center justify-center text-white/50 hover:text-white/80 sm:w-48"
              >
                {sponsor.name}
              </a>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
