"use client";

import { useEffect, useRef, useState, useTransition, type ChangeEvent } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { submitPrediction } from "@/app/tippspiel/actions";
import { SCORING } from "@/lib/constants";
import { getTeamName } from "@/lib/teams";
import { formatGameTime, formatPostDate } from "@/utils/format";
import type { Game } from "@/types";

interface PredictionInfo {
  predictedHome: number;
  predictedAway: number;
}

interface TippspielTableProps {
  hauptrundeGames: Game[];
  predictions: Record<string, PredictionInfo>;
  isAuthenticated: boolean;
}

function sanitizeDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 2);
}

// Moves to the next open tip field after the first digit (or closes the keyboard after the last
// one). Deferred so the state update lands first - blurring saves with the freshly typed value.
function advanceFocus(current: HTMLInputElement) {
  setTimeout(() => {
    const inputs = Array.from(
      document.querySelectorAll<HTMLInputElement>("input[data-tip-input]:not(:disabled)")
    );
    const index = inputs.indexOf(current);
    const next = index >= 0 ? inputs[index + 1] : undefined;
    if (next) {
      next.focus();
      next.select();
    } else {
      current.blur();
    }
  }, 0);
}

interface TippspielRowProps {
  index: number;
  game: Game;
  initial: PredictionInfo | undefined;
  disabled: boolean;
  started: boolean;
}

function TippspielRow({ index, game, initial, disabled, started }: TippspielRowProps) {
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

  function handleChange(setter: (v: string) => void, previous: string) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      const next = sanitizeDigits(e.target.value);
      setter(next);
      if (previous === "" && next.length === 1) advanceFocus(e.currentTarget);
    };
  }

  const inputClass = (invalid: boolean) =>
    `h-11 w-full rounded-lg border text-center text-base font-semibold text-white focus:outline-none disabled:opacity-40 sm:h-8 sm:text-sm ${
      invalid
        ? "border-red-500 focus:border-red-500"
        : "border-white/15 bg-white/5 focus:border-tigers-secondary"
    }`;

  return (
    <div className={`rounded-lg px-3 py-3 odd:bg-white/5 sm:px-3 sm:py-2 ${started ? "opacity-60" : ""}`}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs whitespace-nowrap text-white/60">{index}. Spieltag</span>
        <span className="text-xs whitespace-nowrap text-white/50">
          {formatPostDate(game.kickoff)} · {formatGameTime(game.kickoff)} Uhr
        </span>
      </div>
      <div className="mt-2 grid grid-cols-[minmax(0,1fr)_3.25rem] items-center gap-x-3 gap-y-2 sm:mt-1 sm:grid-cols-[minmax(0,1fr)_2.75rem_auto_2.75rem_minmax(0,1fr)] sm:gap-x-2.5 sm:gap-y-0">
        <span className="col-start-1 row-start-1 text-left text-[15px] font-medium text-white sm:col-auto sm:row-auto sm:text-right sm:text-sm">
          {getTeamName(game.homeTeamId)}
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={home}
          onChange={handleChange(setHome, home)}
          data-tip-input
          onBlur={() => trySave(home, away)}
          disabled={disabled || isPending}
          aria-label={`Tipp Heimtore ${getTeamName(game.homeTeamId)}`}
          className={`col-start-2 row-start-1 sm:col-auto sm:row-auto ${inputClass(isDraw)}`}
        />
        <span className="hidden text-center text-sm text-white/60 sm:block">:</span>
        <input
          type="text"
          inputMode="numeric"
          value={away}
          onChange={handleChange(setAway, away)}
          data-tip-input
          onBlur={() => trySave(home, away)}
          disabled={disabled || isPending}
          aria-label={`Tipp Auswärtstore ${getTeamName(game.awayTeamId)}`}
          className={`col-start-2 row-start-2 sm:col-auto sm:row-auto ${inputClass(isDraw)}`}
        />
        <span className="col-start-1 row-start-2 text-left text-[15px] font-medium text-white sm:col-auto sm:row-auto sm:text-sm">
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
              index={game.matchday ?? index + 1}
              game={game}
              initial={predictions[game._id]}
              disabled={!isAuthenticated || deadlinePassed}
              started={deadlinePassed}
            />
          );
        })}
        <div className="pt-3 pb-1 lg:hidden">
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { points: SCORING.WINNER, label: "Richtiger Sieger" },
              { points: SCORING.GOAL_DIFF - SCORING.WINNER, label: "Richtige Tordifferenz" },
              { points: SCORING.EXACT_SCORE - SCORING.GOAL_DIFF, label: "Richtiges Ergebnis" },
            ].map((rule) => (
              <div key={rule.label} className="rounded-xl bg-white/5 px-1 py-2">
                <p className="text-base font-bold text-white">+{rule.points}</p>
                <p className="text-[11px] leading-tight text-white/70">{rule.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-center text-xs text-white/60">Tippabgabe endet mit Spielbeginn</p>
        </div>
      </div>
    </div>
  );
}

export default function TippspielTable({
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
        title="Hauptrunde"
        games={hauptrundeGames}
        predictions={predictions}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}
