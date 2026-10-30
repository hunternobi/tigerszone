"use client";

import { useEffect, useState } from "react";
import { Calendar, Check, Clock } from "lucide-react";
import { getTeamById, getTeamName } from "@/lib/teams";
import { formatGameDate, formatGameTime } from "@/utils/format";

const shortTeamName = (teamId: string) =>
  getTeamById(teamId)?.shortName ?? getTeamName(teamId);

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

/** Scrolls to the tip fields of a game and puts the cursor into the first one. */
function focusTipField(gameId: string) {
  const field = document.querySelector<HTMLInputElement>(
    `input[data-game-id="${gameId}"]:not(:disabled)`,
  );
  if (!field) return;
  field.scrollIntoView({ behavior: "smooth", block: "center" });
  field.focus({ preventScroll: true });
  field.select();
}

interface NextGameCountdownProps {
  gameId: string;
  /** Show "Dein Tipp ..." (only for signed-in users). */
  showTipStatus: boolean;
  prediction?: { predictedHome: number; predictedAway: number };
  homeTeamId: string;
  awayTeamId: string;
  kickoff: string;
}

export default function NextGameCountdown({
  gameId,
  showTipStatus,
  prediction,
  homeTeamId,
  awayTeamId,
  kickoff,
}: NextGameCountdownProps) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // Timer callbacks only: setting state straight in the effect body would render twice.
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const interval = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [kickoff]);

  const remaining = now === null ? null : new Date(kickoff).getTime() - now;
  const isUrgent =
    remaining !== null && remaining > 0 && remaining <= 10 * 60 * 1000;

  // The card itself always renders (it is a glass surface that must exist when the shader starts);
  // only the live countdown waits for the client clock.
  return (
    <div
      data-liquid-glass="card"
      className="glass-panel mt-5 p-4 sm:mt-6 sm:p-5"
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-ui text-[0.6875rem] font-semibold tracking-[0.14em] text-white/60 uppercase sm:text-xs">
          Nächstes Spiel
        </p>
        <p
          className={`font-ui text-[0.8125rem] font-semibold whitespace-nowrap tabular-nums sm:text-sm ${
            isUrgent ? "text-red-400" : "text-white/85"
          }`}
        >
          {remaining === null ? " " : formatRemaining(remaining)}
        </p>
      </div>

      <p className="font-ui mt-1.5 text-[1.375rem] leading-[1.15] font-semibold tracking-tight text-balance text-white sm:text-3xl">
        <span className="sm:hidden">
          {shortTeamName(homeTeamId)}{" "}
          <span className="font-medium text-white/50">vs.</span>{" "}
          {shortTeamName(awayTeamId)}
        </span>
        <span className="hidden sm:inline">
          {getTeamName(homeTeamId)}{" "}
          <span className="font-medium text-white/50">vs.</span>{" "}
          {getTeamName(awayTeamId)}
        </span>
      </p>

      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[0.8125rem] text-white/70 sm:text-sm">
        <span className="flex items-center gap-1.5">
          <Calendar size={13} /> {formatGameDate(kickoff)}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={13} /> {formatGameTime(kickoff)} Uhr
        </span>
      </div>

      {showTipStatus && (
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
          {prediction ? (
            <p className="font-ui flex items-center gap-1.5 text-[0.9375rem] font-semibold text-white">
              <Check size={16} strokeWidth={3} className="text-emerald-300" />
              Dein Tipp {prediction.predictedHome}:{prediction.predictedAway}
            </p>
          ) : (
            <p className="font-ui text-[0.9375rem] font-semibold text-amber-200">
              Noch kein Tipp abgegeben
            </p>
          )}
          <button
            type="button"
            onClick={() => focusTipField(gameId)}
            className="font-ui min-h-[36px] shrink-0 rounded-full border border-white/25 bg-white/15 px-4 text-[0.8125rem] font-semibold text-white transition active:scale-[0.96]"
          >
            {prediction ? "Ändern" : "Jetzt tippen"}
          </button>
        </div>
      )}
    </div>
  );
}
