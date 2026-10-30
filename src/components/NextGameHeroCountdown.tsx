"use client";

import { useEffect, useState } from "react";

interface NextGameHeroCountdownProps {
  kickoff: string;
}

interface Part {
  value: number;
  unit: string;
}

function toParts(ms: number): Part[] {
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return [{ value: days, unit: days === 1 ? "Tag" : "Tage" }, { value: hours, unit: "Std." }];
  if (hours > 0) return [{ value: hours, unit: "Std." }, { value: minutes, unit: "Min." }];
  return [{ value: minutes, unit: "Min." }];
}

export default function NextGameHeroCountdown({ kickoff }: NextGameHeroCountdownProps) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // Time is read on the client only (no hydration mismatch); the display changes by the minute,
    // so ticking every 10 s keeps it accurate without churn.
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const interval = setInterval(tick, 10_000);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [kickoff]);

  if (now === null) return null;

  const remaining = new Date(kickoff).getTime() - now;

  if (remaining <= 0) {
    return (
      <div>
        <p className="flex items-center gap-2 text-[1.625rem] leading-none font-semibold tracking-tight text-white sm:text-4xl">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-70" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
          </span>
          Live
        </p>
        <p className="mt-1 text-[0.6875rem] text-white/55 sm:text-xs">Das Spiel läuft</p>
      </div>
    );
  }

  return (
    <div className="tabular-nums">
      <p className="flex items-baseline gap-x-2 text-white">
        {toParts(remaining).map((part) => (
          <span key={part.unit} className="whitespace-nowrap">
            <span className="text-[1.625rem] leading-none font-semibold tracking-tight sm:text-4xl">
              {part.value}
            </span>
            <span className="ml-1 text-[0.8125rem] font-medium text-white/60 sm:text-base">{part.unit}</span>
          </span>
        ))}
      </p>
      <p className="mt-1 text-[0.6875rem] text-white/55 sm:text-xs">bis zum Anpfiff</p>
    </div>
  );
}
