"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Trophy,
  X,
} from "lucide-react";
import { NEWS_STORIES_KEY, PLACE_STYLE, PRIZES } from "@/lib/prizes";

// Pages where a pop-up would be in the way.
const QUIET_PREFIXES = ["/admin", "/login", "/register", "/verify-email"];
const SLIDE_MS = 7000;

function alreadySeen(userId: string): boolean {
  try {
    return window.localStorage.getItem(`${NEWS_STORIES_KEY}:${userId}`) !== null;
  } catch {
    return false;
  }
}

function markSeen(userId: string) {
  try {
    window.localStorage.setItem(`${NEWS_STORIES_KEY}:${userId}`, "1");
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

function SlideFrame({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col px-10 pt-20 pb-7 text-center">
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
    </div>
  );
}

/**
 * One-time news in the format of Instagram stories: three slides with progress bars on top, tap on the right
 * or left side to go on or back, automatic advance, X to close.
 */
export default function NewsStories() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const quiet = QUIET_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const count = 3;

  useEffect(() => {
    // Only for signed-in users, once per account (and device).
    if (quiet || !userId || alreadySeen(userId)) return;
    const timer = setTimeout(() => setOpen(true), 900);
    return () => clearTimeout(timer);
  }, [quiet, userId]);

  const close = useCallback(() => {
    if (userId) markSeen(userId);
    setOpen(false);
  }, [userId]);

  const next = useCallback(
    () => setIndex((current) => Math.min(current + 1, count - 1)),
    [],
  );
  const previous = useCallback(
    () => setIndex((current) => Math.max(current - 1, 0)),
    [],
  );

  // Automatic advance; after the last slide the story closes.
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(index >= count - 1 ? close : next, SLIDE_MS);
    return () => clearTimeout(timer);
  }, [open, index, next, close]);

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
          className="absolute inset-y-0 left-0 z-0 flex w-1/3 items-center justify-start pl-1.5"
        >
          {index > 0 && (
            <ChevronLeft
              size={28}
              strokeWidth={2.5}
              className="rounded-full bg-black/25 p-1 text-white/85"
            />
          )}
        </button>
        <button
          type="button"
          aria-label="Weiter"
          onClick={next}
          className="absolute inset-y-0 right-0 z-0 flex w-2/3 items-center justify-end pr-1.5"
        >
          {index < count - 1 && (
            <ChevronRight
              size={28}
              strokeWidth={2.5}
              className="rounded-full bg-black/25 p-1 text-white/85"
            />
          )}
        </button>

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
                        position === index
                          ? `story-progress ${SLIDE_MS}ms linear forwards`
                          : undefined,
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
