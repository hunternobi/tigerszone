"use client";

import { useState } from "react";
import type { Game } from "@/types";

interface PredictionFormProps {
  game: Game;
  onSubmit?: (predictedHome: number, predictedAway: number) => void;
}

const SCORE_PATTERN = /^\s*(\d{1,2})\s*[:\-]\s*(\d{1,2})\s*$/;

export default function PredictionForm({ game, onSubmit }: PredictionFormProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const disabled = game.status !== "scheduled";

  return (
    <form
      className="flex flex-wrap items-center gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const match = value.match(SCORE_PATTERN);
        if (!match) {
          setError("Bitte im Format 3:2 eingeben");
          return;
        }
        setError(null);
        setSubmitted(true);
        onSubmit?.(Number(match[1]), Number(match[2]));
      }}
    >
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setError(null);
          setSubmitted(false);
        }}
        placeholder="z.B. 3:2"
        disabled={disabled}
        aria-label="Getipptes Ergebnis"
        className="w-28 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-center text-white placeholder:text-white/30 focus:border-tigers-secondary focus:outline-none disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled}
        className="rounded-full bg-tigers-secondary px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitted ? "Tipp gespeichert" : "Tipp abgeben"}
      </button>
      {error && <p className="w-full text-xs text-red-400">{error}</p>}
    </form>
  );
}
