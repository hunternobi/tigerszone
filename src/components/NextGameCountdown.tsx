"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock } from "lucide-react";
import { getTeamName } from "@/lib/teams";
import { formatGameDate, formatGameTime } from "@/utils/format";

function formatRemaining(ms: number): string {
  if (ms <= 0) return "Anpfiff läuft";

  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `Noch ${days} Tag${days === 1 ? "" : "e"} ${hours} Std.`;
  if (hours > 0) return `Noch ${hours} Std. ${minutes} Min.`;
  return `Noch ${minutes}:${String(seconds).padStart(2, "0")} Min.`;
}

interface NextGameCountdownProps {
  homeTeamId: string;
  awayTeamId: string;
  kickoff: string;
}

export default function NextGameCountdown({
  homeTeamId,
  awayTeamId,
  kickoff,
}: NextGameCountdownProps) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [kickoff]);

  if (now === null) return null;

  const remaining = new Date(kickoff).getTime() - now;
  const isUrgent = remaining > 0 && remaining <= 10 * 60 * 1000;

  return (
    <div className="glass-panel-sm mt-4 flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4">
      <div>
        <p className="text-xs font-semibold tracking-wide text-white uppercase">
          Nächstes Spiel
        </p>
        <p className="text-sm font-bold text-white sm:text-base">
          {getTeamName(homeTeamId)} vs. {getTeamName(awayTeamId)}
        </p>
        <div className="mt-1 flex flex-wrap gap-3 text-xs text-white">
          <span className="flex items-center gap-1">
            <Calendar size={12} /> {formatGameDate(kickoff)}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} /> {formatGameTime(kickoff)} Uhr
          </span>
        </div>
      </div>
      <p
        className={`text-sm font-semibold whitespace-nowrap sm:text-base ${
          isUrgent ? "text-red-400" : "text-white"
        }`}
      >
        {formatRemaining(remaining)}
      </p>
    </div>
  );
}
