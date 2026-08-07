"use client";

import { useState, useTransition, type ChangeEvent } from "react";
import Link from "next/link";
import { submitPrediction } from "@/app/tippspiel/actions";
import { getTeamName } from "@/lib/teams";
import { formatGameDate, formatPostDate } from "@/utils/format";
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
  results: ResultEntry[];
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
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [isPending, startTransition] = useTransition();

  function trySave(nextHome: string, nextAway: string) {
    if (disabled) return;
    if (nextHome === "" || nextAway === "") return;
    const homeNum = Number(nextHome);
    const awayNum = Number(nextAway);
    if (saved && saved.predictedHome === homeNum && saved.predictedAway === awayNum) return;

    setStatus("saving");
    startTransition(async () => {
      const result = await submitPrediction(game._id, homeNum, awayNum);
      if (!result.success) {
        setStatus("error");
        return;
      }
      setSaved({ predictedHome: homeNum, predictedAway: awayNum });
      setStatus("idle");
    });
  }

  function handleChange(setter: (v: string) => void) {
    return (e: ChangeEvent<HTMLInputElement>) => setter(sanitizeDigits(e.target.value));
  }

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
      <div className="mt-1 grid grid-cols-[minmax(0,1fr)_2.25rem_auto_2.25rem_minmax(0,1fr)] items-center gap-1.5 sm:gap-2.5">
        <span className="truncate text-right text-xs font-medium text-white sm:text-sm">
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
          className="h-8 w-full rounded-lg border border-white/15 bg-white/5 text-center text-sm font-semibold text-white focus:border-tigers-secondary focus:outline-none disabled:opacity-40"
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
          className="h-8 w-full rounded-lg border border-white/15 bg-white/5 text-center text-sm font-semibold text-white focus:border-tigers-secondary focus:outline-none disabled:opacity-40"
        />
        <span className="truncate text-left text-xs font-medium text-white sm:text-sm">
          {getTeamName(game.awayTeamId)}
        </span>
      </div>
      {status === "error" && (
        <p className="mt-1 text-center text-[10px] text-red-400">
          Tipp konnte nicht gespeichert werden.
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
  results,
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

      {results.length > 0 && (
        <div className="mt-10">
          <h3 className="text-lg font-bold text-white">Meine Ergebnisse</h3>
          <div className="glass-panel-sm mt-3 divide-y divide-white/5 p-2 sm:p-3">
            {results.map((entry) => (
              <div
                key={entry.gameId}
                className="flex flex-wrap items-center justify-between gap-2 px-1 py-2.5 sm:px-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {getTeamName(entry.homeTeamId)} vs. {getTeamName(entry.awayTeamId)}
                  </p>
                  <p className="text-[11px] text-white/60">{formatGameDate(entry.kickoff)}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-white sm:text-sm">
                  <span>
                    Tipp{" "}
                    <span className="font-semibold">
                      {entry.predictedHome}:{entry.predictedAway}
                    </span>
                  </span>
                  <span>
                    Ergebnis{" "}
                    <span className="font-semibold">
                      {entry.homeScore}:{entry.awayScore}
                    </span>
                  </span>
                </div>
                <span className="shrink-0 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-semibold text-white">
                  {entry.pointsAwarded ?? 0} Pkt.
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
