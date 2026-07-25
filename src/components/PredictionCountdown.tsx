"use client";

import { useEffect, useState } from "react";

function formatRemaining(ms: number): string {
  if (ms <= 0) return "Tippabgabe beendet";

  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `Noch ${days} Tag${days === 1 ? "" : "e"} ${hours} Std.`;
  if (hours > 0) return `Noch ${hours} Std. ${minutes} Min.`;
  return `Noch ${minutes}:${String(seconds).padStart(2, "0")} Min.`;
}

export default function PredictionCountdown({ kickoff }: { kickoff: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [kickoff]);

  if (now === null) return null;

  const remaining = new Date(kickoff).getTime() - now;
  const isUrgent = remaining <= 10 * 60 * 1000;

  return (
    <p
      className={`text-center text-xs font-semibold ${isUrgent ? "text-red-400" : "text-white/60"}`}
    >
      {formatRemaining(remaining)}
    </p>
  );
}
