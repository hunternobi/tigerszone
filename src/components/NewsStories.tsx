"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  Smartphone,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import { NEWS_STORIES_KEY, PLACE_STYLE, PRIZES } from "@/lib/prizes";

// Pages where a pop-up would be in the way.
const QUIET_PREFIXES = ["/admin", "/login", "/register", "/verify-email"];
const SLIDE_MS = 7000;

function alreadySeen(): boolean {
  try {
    return window.localStorage.getItem(NEWS_STORIES_KEY) !== null;
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    window.localStorage.setItem(NEWS_STORIES_KEY, "1");
  } catch {
    // Private mode: the stories may come back on the next visit, which is acceptable.
  }
}

const STATS = [
  "Head2Head",
  "Form",
  "Torhüter",
  "Tabelle",
  "Topscorer",
  "Strafminuten",
];

const ctaClass =
  "inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full bg-white px-5 text-[0.9375rem] font-semibold text-tigers-primary shadow-[0_6px_18px_rgba(0,0,0,0.35)] transition duration-200 hover:bg-white/90 active:scale-[0.96]";

function SlideFrame({
  icon,
  title,
  children,
  footer,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col px-6 pt-20 pb-7 text-center">
      <div className="flex flex-1 flex-col items-center justify-center">
        <span className="flex size-16 items-center justify-center rounded-[1.3rem] bg-gradient-to-b from-[#7a9be0] to-[#3a54a5] shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_8px_20px_rgba(0,0,0,0.35)]">
          {icon}
        </span>
        <h2 className="font-ui mt-5 text-[1.75rem] leading-[1.1] font-semibold tracking-tight text-balance text-white">
          {title}
        </h2>
        <div className="mt-3 w-full text-[0.9375rem] leading-snug text-white/85">
          {children}
        </div>
      </div>
      <div className="mt-5 flex justify-center">{footer}</div>
    </div>
  );
}

/**
 * One-time news in the format of Instagram stories: three slides with progress bars on top, tap on the right
 * or left side to go on or back, automatic advance, X to close.
 */
export default function NewsStories() {
  const pathname = usePathname();
  const quiet = QUIET_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const count = 3;

  useEffect(() => {
    if (quiet || alreadySeen()) return;
    const timer = setTimeout(() => setOpen(true), 900);
    return () => clearTimeout(timer);
  }, [quiet]);

  const close = useCallback(() => {
    markSeen();
    setOpen(false);
  }, []);

  const next = useCallback(
    () => setIndex((current) => Math.min(current + 1, count - 1)),
    [],
  );
  const previous = useCallback(
    () => setIndex((current) => Math.max(current - 1, 0)),
    [],
  );

  // Automatic advance; the last slide stays until it is closed.
  useEffect(() => {
    if (!open || index >= count - 1) return;
    const timer = setTimeout(next, SLIDE_MS);
    return () => clearTimeout(timer);
  }, [open, index, next]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") previous();
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, close, next, previous]);

  if (!open || quiet) return null;

  const slides = [
    <SlideFrame
      key="prizes"
      icon={<Trophy size={32} strokeWidth={2.2} className="text-white" />}
      title="Die Preise sind da!"
      footer={
        <Link href="/tippspiel/rangliste" onClick={close} className={ctaClass}>
          Jetzt Tabelle anzeigen
          <ArrowRight size={15} strokeWidth={2.5} />
        </Link>
      }
    >
      <p>
        Ein riesiges Dankeschön an unsere Unterstützer, die diese Preise
        möglich machen. Das können die besten Tipper der Hauptrunde gewinnen:
      </p>
      <ol className="mt-4 space-y-2 text-left">
        {PRIZES.map((prize) => {
          const style = PLACE_STYLE[prize.place];
          return (
            <li
              key={prize.place}
              className={`flex items-center gap-3 rounded-2xl border bg-white/10 p-2.5 ${style.glow}`}
            >
              <span
                className={`font-ui flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-b text-base font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] ${style.badge}`}
              >
                {prize.place}
              </span>
              <p className="font-ui text-[1rem] leading-tight font-semibold text-white">
                {prize.title}
              </p>
            </li>
          );
        })}
      </ol>
    </SlideFrame>,

    <SlideFrame
      key="stats"
      icon={<BarChart3 size={32} strokeWidth={2.2} className="text-white" />}
      title="Umfassende Statistiken"
      footer={
        <Link href="/community" onClick={close} className={ctaClass}>
          Zu den Statistiken
          <ArrowRight size={15} strokeWidth={2.5} />
        </Link>
      }
    >
      <p>
        Im Community-Bereich findest du jetzt umfassende Statistiken rund um
        die Tigers, für alle angemeldeten Tipper.
      </p>
      <ul className="mt-4 flex flex-wrap justify-center gap-2">
        {STATS.map((label) => (
          <li
            key={label}
            className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[0.8125rem] font-semibold text-white"
          >
            {label}
          </li>
        ))}
      </ul>
    </SlideFrame>,

    <SlideFrame
      key="design"
      icon={<Smartphone size={32} strokeWidth={2.2} className="text-white" />}
      title="Neues Design"
      footer={
        <button type="button" onClick={close} className={ctaClass}>
          Los geht&apos;s
          <Sparkles size={15} strokeWidth={2.5} />
        </button>
      }
    >
      <p>
        Wir haben das Design der ganzen Seite überarbeitet und noch besser fürs
        Handy optimiert: übersichtlicher, schneller und mit modernem
        Glas-Look.
      </p>
    </SlideFrame>,
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Neuigkeiten"
        onClick={(event) => event.stopPropagation()}
        style={{
          aspectRatio: "9 / 16",
          width: "min(24rem, calc((100dvh - 2rem) * 0.5625))",
        }}
        className="glass-panel relative overflow-hidden bg-gradient-to-b from-[#2a3a9e]/60 to-[#0a0f3d]/80"
      >
        {/* Tap areas: left third goes back, the rest goes on (buttons sit above them). */}
        <button
          type="button"
          aria-label="Zurück"
          onClick={previous}
          className="absolute inset-y-0 left-0 z-0 w-1/3"
        />
        <button
          type="button"
          aria-label="Weiter"
          onClick={next}
          className="absolute inset-y-0 right-0 z-0 w-2/3"
        />

        <div className="pointer-events-none relative z-10 h-full">
          <div className="pointer-events-auto absolute inset-x-0 top-0 px-4 pt-4">
            <div className="flex gap-1.5">
              {slides.map((slide, position) => (
                <span
                  key={slide.key}
                  className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25"
                >
                  <span
                    key={position === index ? `run-${index}` : position}
                    className="block h-full rounded-full bg-white"
                    style={{
                      width: position < index ? "100%" : "0%",
                      animation:
                        position === index && index < count - 1
                          ? `story-progress ${SLIDE_MS}ms linear forwards`
                          : undefined,
                      ...(position === index && index === count - 1
                        ? { width: "100%" }
                        : {}),
                    }}
                  />
                </span>
              ))}
            </div>
            <p className="mt-3 pr-12 text-left text-[0.75rem] font-semibold tracking-[0.12em] text-white/70 uppercase">
              Neu in der Deutschland-Cup-Pause
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Schließen"
            className="pointer-events-auto absolute top-6 right-2 flex size-11 items-center justify-center rounded-full text-white/85 transition hover:bg-white/15 hover:text-white"
          >
            <X size={22} />
          </button>

          <div className="pointer-events-none h-full [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
            {slides[index]}
          </div>
        </div>
      </div>
    </div>
  );
}
