"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { saveGameResult } from "@/app/admin/actions";
import { getTeamName } from "@/lib/teams";
import { formatGameDate, formatGameTime } from "@/utils/format";
import type { Game, Overtime } from "@/types";

function sanitizeDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 2);
}

export default function GameResultForm({ game }: { game: Game }) {
  const [homeScore, setHomeScore] = useState(game.homeScore?.toString() ?? "");
  const [awayScore, setAwayScore] = useState(game.awayScore?.toString() ?? "");
  const [overtime, setOvertime] = useState<Overtime>(game.overtime ?? "REG");
  const [isDerby, setIsDerby] = useState(game.isDerby);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (homeScore === "" || awayScore === "") return;
    setError(null);
    startTransition(async () => {
      const result = await saveGameResult(
        game._id,
        Number(homeScore),
        Number(awayScore),
        overtime,
        isDerby
      );
      if (!result.success) {
        setError(result.error ?? "Speichern fehlgeschlagen.");
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel-sm flex flex-wrap items-center gap-4 p-5">
      <div className="min-w-[220px] flex-1">
        <p className="text-xs tracking-wide text-white/50 uppercase">
          {game.competition === "Vorbereitung"
            ? "Vorbereitung"
            : `DEL${game.matchday ? ` · ${game.matchday}` : ""}`}{" "}
          · {formatGameDate(game.kickoff)} {formatGameTime(game.kickoff)}
        </p>
        <p className="font-bold text-white">
          {getTeamName(game.homeTeamId)} vs. {getTeamName(game.awayTeamId)}
        </p>
      </div>

      <input
        type="text"
        inputMode="numeric"
        value={homeScore}
        onChange={(e) => setHomeScore(sanitizeDigits(e.target.value))}
        aria-label="Tore Heimteam"
        className="glass-panel-sm h-10 w-12 text-center text-white focus:outline-none"
      />
      <span className="text-white/60">:</span>
      <input
        type="text"
        inputMode="numeric"
        value={awayScore}
        onChange={(e) => setAwayScore(sanitizeDigits(e.target.value))}
        aria-label="Tore Auswärtsteam"
        className="glass-panel-sm h-10 w-12 text-center text-white focus:outline-none"
      />

      <select
        value={overtime}
        onChange={(e) => setOvertime(e.target.value as Overtime)}
        className="glass-panel-sm h-10 rounded-lg bg-transparent px-2 text-sm text-white"
      >
        <option className="text-black" value="REG">
          Regulär
        </option>
        <option className="text-black" value="OT">
          Verlängerung
        </option>
        <option className="text-black" value="SO">
          Penalty
        </option>
      </select>

      <label className="flex items-center gap-2 text-sm text-white/70">
        <input
          type="checkbox"
          checked={isDerby}
          onChange={(e) => setIsDerby(e.target.checked)}
        />
        Derby
      </label>

      <button
        type="submit"
        disabled={isPending || homeScore === "" || awayScore === ""}
        className="rounded-full bg-tigers-secondary px-4 py-2 text-xs font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Speichert…" : saved ? "Gespeichert" : "Speichern"}
      </button>

      {error && <p className="w-full text-sm text-red-400">{error}</p>}
    </form>
  );
}
