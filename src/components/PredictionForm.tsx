"use client";

import { useState } from "react";
import { getTeamName } from "@/lib/teams";
import type { Game } from "@/types";

interface PredictionFormProps {
  game: Game;
  onSubmit?: (predictedHome: number, predictedAway: number) => void;
}

function sanitizeDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 2);
}

export default function PredictionForm({ game, onSubmit }: PredictionFormProps) {
  const [home, setHome] = useState("");
  const [away, setAway] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const disabled = game.status !== "scheduled";
  const canSubmit = home !== "" && away !== "";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        setSubmitted(true);
        onSubmit?.(Number(home), Number(away));
      }}
    >
      <div className="flex flex-wrap items-center justify-center gap-3 text-center">
        <span className="text-base font-semibold text-white">
          {getTeamName(game.homeTeamId)}
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={home}
          onChange={(e) => {
            setHome(sanitizeDigits(e.target.value));
            setSubmitted(false);
          }}
          disabled={disabled}
          aria-label={`Tipp Heimtore ${getTeamName(game.homeTeamId)}`}
          className="glass-panel-sm h-14 w-14 shrink-0 text-center text-xl font-bold text-white focus:outline-none disabled:opacity-50"
        />
        <span className="text-xl font-bold text-white/60">:</span>
        <input
          type="text"
          inputMode="numeric"
          value={away}
          onChange={(e) => {
            setAway(sanitizeDigits(e.target.value));
            setSubmitted(false);
          }}
          disabled={disabled}
          aria-label={`Tipp Auswärtstore ${getTeamName(game.awayTeamId)}`}
          className="glass-panel-sm h-14 w-14 shrink-0 text-center text-xl font-bold text-white focus:outline-none disabled:opacity-50"
        />
        <span className="text-base font-semibold text-white">
          {getTeamName(game.awayTeamId)}
        </span>
      </div>

      <div className="mt-4 flex justify-center">
        <button
          type="submit"
          disabled={disabled || !canSubmit}
          className="rounded-full bg-tigers-secondary px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitted ? "Tipp gespeichert" : "Tipp abgeben"}
        </button>
      </div>
    </form>
  );
}
