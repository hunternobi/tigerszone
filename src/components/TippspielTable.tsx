"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
} from "react";
import PillButton from "@/components/PillButton";
import SavedBadge, { SAVED_BADGE_MS } from "@/components/SavedBadge";
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
      document.querySelectorAll<HTMLInputElement>(
        "input[data-tip-input]:not(:disabled)",
      ),
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

function TippspielRow({
  index,
  game,
  initial,
  disabled,
  started,
}: TippspielRowProps) {
  const [home, setHome] = useState(
    initial ? String(initial.predictedHome) : "",
  );
  const [away, setAway] = useState(
    initial ? String(initial.predictedAway) : "",
  );
  const [saved, setSaved] = useState<PredictionInfo | undefined>(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "error" | "saved">(
    "idle",
  );
  const [isPending, startTransition] = useTransition();
  const savedTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

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
    if (
      saved &&
      saved.predictedHome === homeNum &&
      saved.predictedAway === awayNum
    )
      return;

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
      savedTimeout.current = setTimeout(
        () => setStatus("idle"),
        SAVED_BADGE_MS,
      );
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
    `h-11 w-full rounded-xl border text-center text-[17px] font-semibold tabular-nums text-white transition focus:outline-none disabled:opacity-40 sm:h-9 sm:text-base ${
      invalid
        ? "border-red-500/80 bg-red-500/10 focus:border-red-400"
        : "border-white/25 bg-white/15 focus:border-white/70 focus:bg-white/20"
    }`;

  return (
    <div
      className={`px-3 py-3.5 sm:px-4 sm:py-3 ${started ? "opacity-60" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-xs font-medium whitespace-nowrap text-white/60">
          {index}. Spieltag
          {game.isDerby && (
            <span
              title="Derby"
              className="rounded-full border border-amber-300/30 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-amber-100 uppercase"
            >
              Doppelte Punkte
            </span>
          )}
        </span>
        <span className="relative text-xs whitespace-nowrap text-white/60">
          <span
            className={`transition-opacity duration-200 ${status === "saved" && !isDraw ? "opacity-0" : ""}`}
          >
            {formatPostDate(game.kickoff)} · {formatGameTime(game.kickoff)} Uhr
          </span>
          {status === "saved" && !isDraw && (
            <span className="absolute inset-y-0 right-0 flex items-center">
              <SavedBadge />
            </span>
          )}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-[minmax(0,1fr)_3.25rem] items-center gap-x-3 gap-y-2 sm:mt-1 sm:grid-cols-[minmax(0,1fr)_2.75rem_auto_2.75rem_minmax(0,1fr)] sm:gap-x-2.5 sm:gap-y-0">
        <span className="col-start-1 row-start-1 text-left font-ui text-[17px] font-medium tracking-tight text-white sm:col-auto sm:row-auto sm:text-right sm:text-base">
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
        <span className="hidden text-center text-base text-white/60 sm:block">
          :
        </span>
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
        <span className="col-start-1 row-start-2 text-left font-ui text-[17px] font-medium tracking-tight text-white sm:col-auto sm:row-auto sm:text-base">
          {getTeamName(game.awayTeamId)}
        </span>
      </div>

      {isDraw && (
        <p className="mt-1.5 text-center text-[11px] text-red-300">
          Ungültiger Tipp – ein Unentschieden ist nicht möglich.
        </p>
      )}
      {!isDraw && status === "error" && (
        <p className="mt-1.5 text-center text-[11px] text-red-300">
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
    <div className="first:mt-0">
      <h2 className="font-ui text-[22px] font-semibold tracking-tight text-white sm:text-3xl">
        {title}
      </h2>
      <div
        data-liquid-glass="card"
        className="glass-panel mt-3 divide-y divide-white/10 p-1.5 sm:p-2"
      >
        {games.map((game, index) => {
          const deadlinePassed =
            game.status !== "scheduled" || new Date(game.kickoff) <= new Date();
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
        <div className="px-2 pt-4 pb-2 lg:hidden">
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { points: SCORING.WINNER, label: "Sieger" },
              {
                points: SCORING.GOAL_DIFF - SCORING.WINNER,
                label: "Tordifferenz",
              },
              {
                points: SCORING.EXACT_SCORE - SCORING.GOAL_DIFF,
                label: "Ergebnis",
              },
            ].map((rule) => (
              <div
                key={rule.label}
                className="flex min-w-0 flex-col items-center justify-center rounded-2xl bg-white/10 px-1 py-2.5"
              >
                <p className="font-ui text-lg font-semibold tabular-nums text-white">
                  +{rule.points}
                </p>
                <p className="text-[11px] leading-tight text-white/70">
                  {rule.label}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-1 py-2.5 text-center">
            <p className="font-ui text-lg font-semibold text-white">
              ×{SCORING.DERBY_MULTIPLIER}
            </p>
            <p className="text-[11px] leading-tight text-white/70">
              Derbys zählen doppelt
            </p>
          </div>
          <p className="mt-2 text-center text-xs text-white/60">
            Tippabgabe endet mit Spielbeginn
          </p>
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
        <div
          data-liquid-glass="card"
          className="glass-panel mb-8 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 p-4 sm:p-5"
        >
          <p className="font-ui text-[17px] font-semibold tracking-tight text-white">
            Melde dich an, um zu tippen.
          </p>
          <PillButton href="/login">Einloggen</PillButton>
        </div>
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
