"use client";

import { useEffect, useRef, useState, useTransition, type ChangeEvent } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { submitPrediction } from "@/app/tippspiel/actions";
import { getTeamName } from "@/lib/teams";
import { formatPostDate } from "@/utils/format";
import type { Game } from "@/types";

interface PredictionInfo {
  predictedHome: number;
  predictedAway: number;
}

export interface ResultEntry {
  gameId: string;
  homeTeamId: string;
  awayTeamId: string;
  kickoff: string;
  predictedHome: number;
  predictedAway: number;
  homeScore?: number;
  awayScore?: number;
  pointsAwarded?: number;
}

interface TippspielTableProps {
  vorbereitungGames: Game[];
  hauptrundeGames: Game[];
  predictions: Record<string, PredictionInfo>;
  isAuthenticated: boolean;
}

function sanitizeDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 2);
}

interface TippspielRowProps {
  index: number;
  game: Game;
  initial: PredictionInfo | undefined;
  disabled: boolean;
}

function TippspielRow({ index, game, initial, disabled }: TippspielRowProps) {
  const [home, setHome] = useState(initial ? String(initial.predictedHome) : "");
  const [away, setAway] = useState(initial ? String(initial.predictedAway) : "");
  const [saved, setSaved] = useState<PredictionInfo | undefined>(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "error" | "saved">("idle");
  const [isPending, startTransition] = useTransition();
  const savedTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (savedTimeout.current) clearTimeout(savedTimeout.current);
    };
  }, []);

  const isDraw = home !== "" && away !== "" && Number(home) === Number(away);

  function trySave(nextHome: string, nextAway: string) {
    if (disabled) return;
    if (nextHome === "" || nextAway === "") return;
    const homeNum = Number(nextHome);
    const awayNum = Number(nextAway);
    if (homeNum === awayNum) return;
    if (saved && saved.predictedHome === homeNum && saved.predictedAway === awayNum) return;

    setStatus("saving");
    startTransition(async () => {
      const result = await submitPrediction(game._id, homeNum, awayNum);
      if (!result.success) {
        setStatus("error");
        return;
      }
      setSaved({ predictedHome: homeNum, predictedAway: awayNum });
      setStatus("saved");
      if (savedTimeout.current) clearTimeout(savedTimeout.current);
      savedTimeout.current = setTimeout(() => setStatus("idle"), 1800);
    });
  }

  function handleChange(setter: (v: string) => void) {
    return (e: ChangeEvent<HTMLInputElement>) => setter(sanitizeDigits(e.target.value));
  }

  const inputClass = (invalid: boolean) =>
    `h-8 w-full rounded-lg border text-center text-xs font-semibold text-white focus:outline-none disabled:opacity-40 sm:text-sm ${
      invalid
        ? "border-red-500 focus:border-red-500"
        : "border-white/15 bg-white/5 focus:border-tigers-secondary"
    }`;

  return (
    <div className="rounded-lg px-2 py-2 odd:bg-white/5 sm:px-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[10px] whitespace-nowrap text-white/60 sm:text-xs">
          {index}. Spieltag
        </span>
        <span className="text-[10px] whitespace-nowrap text-white/50 sm:text-xs">
          {formatPostDate(game.kickoff)}
        </span>
      </div>
      <div className="mt-1 grid grid-cols-[minmax(0,1fr)_2rem_auto_2rem_minmax(0,1fr)] items-center gap-1 sm:grid-cols-[minmax(0,1fr)_2.75rem_auto_2.75rem_minmax(0,1fr)] sm:gap-2.5">
        <span className="text-right text-[11px] font-medium text-white sm:text-sm">
          {getTeamName(game.homeTeamId)}
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={home}
          onChange={handleChange(setHome)}
          onBlur={() => trySave(home, away)}
          disabled={disabled || isPending}
          aria-label={`Tipp Heimtore ${getTeamName(game.homeTeamId)}`}
          className={inputClass(isDraw)}
        />
        <span className="text-center text-xs text-white/60 sm:text-sm">:</span>
        <input
          type="text"
          inputMode="numeric"
          value={away}
          onChange={handleChange(setAway)}
          onBlur={() => trySave(home, away)}
          disabled={disabled || isPending}
          aria-label={`Tipp Auswärtstore ${getTeamName(game.awayTeamId)}`}
          className={inputClass(isDraw)}
        />
        <span className="text-left text-[11px] font-medium text-white sm:text-sm">
          {getTeamName(game.awayTeamId)}
        </span>
      </div>

      {isDraw && (
        <p className="mt-1 text-center text-[10px] text-red-400">
          Ungültiger Tipp – ein Unentschieden ist nicht möglich.
        </p>
      )}
      {!isDraw && status === "error" && (
        <p className="mt-1 text-center text-[10px] text-red-400">
          Tipp konnte nicht gespeichert werden.
        </p>
      )}
      {!isDraw && status === "saved" && (
        <p className="mt-1 flex animate-[fadeIn_0.2s_ease-out] items-center justify-center gap-1 text-center text-[10px] font-semibold text-emerald-400">
          <Check size={12} />
          Tipp gespeichert
        </p>
      )}
    </div>
  );
}

function CompetitionTable({
  title,
  games,
  predictions,
  isAuthenticated,
}: {
  title: string;
  games: Game[];
  predictions: Record<string, PredictionInfo>;
  isAuthenticated: boolean;
}) {
  if (games.length === 0) return null;

  return (
    <div className="mt-8 first:mt-0">
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <div className="glass-panel-sm mt-3 divide-y divide-white/5 p-2 sm:p-3">
        {games.map((game, index) => {
          const deadlinePassed = game.status !== "scheduled" || new Date(game.kickoff) <= new Date();
          return (
            <TippspielRow
              key={game._id}
              index={index + 1}
              game={game}
              initial={predictions[game._id]}
              disabled={!isAuthenticated || deadlinePassed}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function TippspielTable({
  vorbereitungGames,
  hauptrundeGames,
  predictions,
  isAuthenticated,
}: TippspielTableProps) {
  return (
    <div>
      {!isAuthenticated && (
        <p className="glass-panel-sm mb-6 p-4 text-center text-sm text-white">
          Bitte{" "}
          <Link href="/login" className="text-tigers-secondary hover:underline">
            einloggen
          </Link>
          , um zu tippen.
        </p>
      )}

      <CompetitionTable
        title="Vorbereitung"
        games={vorbereitungGames}
        predictions={predictions}
        isAuthenticated={isAuthenticated}
      />
      <CompetitionTable
        title="Hauptrunde"
        games={hauptrundeGames}
        predictions={predictions}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}
