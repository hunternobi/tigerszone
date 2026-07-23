"use client";

import Link from "next/link";
import { useEffect, useState, useTransition, type FormEvent } from "react";
import { useSession } from "next-auth/react";
import { getMyPrediction, submitPrediction } from "@/app/tippspiel/actions";
import { getTeamName } from "@/lib/teams";
import type { Game } from "@/types";

interface PredictionFormProps {
  game: Game;
}

function sanitizeDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 2);
}

export default function PredictionForm({ game }: PredictionFormProps) {
  const { status } = useSession();
  const [home, setHome] = useState("");
  const [away, setAway] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const deadlinePassed = game.status !== "scheduled" || new Date(game.kickoff) <= new Date();

  useEffect(() => {
    setHome("");
    setAway("");
    setSaved(false);
    setError(null);

    if (status !== "authenticated") return;

    getMyPrediction(game._id).then((existing) => {
      if (existing) {
        setHome(String(existing.predictedHome));
        setAway(String(existing.predictedAway));
        setSaved(true);
      }
    });
  }, [game._id, status]);

  const canSubmit = home !== "" && away !== "";

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    startTransition(async () => {
      const result = await submitPrediction(game._id, Number(home), Number(away));
      if (!result.success) {
        setError(result.error ?? "Tipp konnte nicht gespeichert werden.");
        return;
      }
      setSaved(true);
    });
  }

  if (status === "loading") {
    return null;
  }

  if (status !== "authenticated") {
    return (
      <p className="text-center text-sm text-white/60">
        Bitte{" "}
        <Link href="/login" className="text-tigers-secondary hover:underline">
          einloggen
        </Link>
        , um zu tippen.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
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
            setSaved(false);
          }}
          disabled={deadlinePassed || isPending}
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
            setSaved(false);
          }}
          disabled={deadlinePassed || isPending}
          aria-label={`Tipp Auswärtstore ${getTeamName(game.awayTeamId)}`}
          className="glass-panel-sm h-14 w-14 shrink-0 text-center text-xl font-bold text-white focus:outline-none disabled:opacity-50"
        />
        <span className="text-base font-semibold text-white">
          {getTeamName(game.awayTeamId)}
        </span>
      </div>

      {error && <p className="mt-3 text-center text-sm text-red-400">{error}</p>}

      <div className="mt-4 flex justify-center">
        <button
          type="submit"
          disabled={deadlinePassed || isPending || !canSubmit}
          className="rounded-full bg-tigers-secondary px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Speichert…" : saved ? "Tipp gespeichert" : "Tipp abgeben"}
        </button>
      </div>
    </form>
  );
}
