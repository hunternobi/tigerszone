"use client";

import { useEffect, useState } from "react";

interface NextGameHeroCountdownProps {
  kickoff: string;
}

function formatParts(ms: number): { value: string; label: string } {
  if (ms <= 0) return { value: "Live", label: "" };

  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return { value: String(days), label: `Tag${days === 1 ? "" : "e"} ${hours} Std. bis zum Spiel` };
  }
  if (hours > 0) {
    return { value: String(hours), label: `Std. ${minutes} Min. bis zum Spiel` };
  }
  return { value: String(minutes), label: "Min. bis zum Spiel" };
}

export default function NextGameHeroCountdown({ kickoff }: NextGameHeroCountdownProps) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [kickoff]);

  if (now === null) return null;

  const remaining = new Date(kickoff).getTime() - now;
  const { value, label } = formatParts(remaining);

  return (
    <>
      <p className="text-2xl font-bold text-tigers-secondary sm:text-3xl">{value}</p>
      <p className="text-xs text-white">{label}</p>
    </>
  );
}
