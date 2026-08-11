"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Check } from "lucide-react";
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
    <form onSubmit={handleSubmit} className="glass-panel-sm p-3 sm:p-5">
      <div>
        <p className="text-[10px] tracking-wide text-white uppercase sm:text-xs">
          {game.competition === "Vorbereitung"
            ? "Vorbereitung"
            : `DEL${game.matchday ? ` · ${game.matchday}` : ""}`}{" "}
          · {formatGameDate(game.kickoff)} {formatGameTime(game.kickoff)}
        </p>
        <p className="text-sm font-bold text-white sm:text-base">
          {getTeamName(game.homeTeamId)} vs. {getTeamName(game.awayTeamId)}
        </p>
      </div>

      <div className="mt-3 flex items-center gap-1.5 sm:gap-3">
        <input
          type="text"
          inputMode="numeric"
          value={homeScore}
          onChange={(e) => setHomeScore(sanitizeDigits(e.target.value))}
          aria-label="Tore Heimteam"
          className="glass-panel-sm h-8 w-8 shrink-0 text-center text-sm text-white focus:outline-none sm:h-10 sm:w-12 sm:text-base"
        />
        <span className="shrink-0 text-white">:</span>
        <input
          type="text"
          inputMode="numeric"
          value={awayScore}
          onChange={(e) => setAwayScore(sanitizeDigits(e.target.value))}
          aria-label="Tore Auswärtsteam"
          className="glass-panel-sm h-8 w-8 shrink-0 text-center text-sm text-white focus:outline-none sm:h-10 sm:w-12 sm:text-base"
        />

        <select
          value={overtime}
          onChange={(e) => setOvertime(e.target.value as Overtime)}
          className="glass-panel-sm h-8 min-w-0 flex-1 rounded-lg bg-transparent px-1.5 text-[11px] text-white sm:h-10 sm:flex-none sm:px-2 sm:text-sm"
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

        <label className="flex shrink-0 items-center gap-1 text-xs text-white sm:gap-2 sm:text-sm">
          <input
            type="checkbox"
            checked={isDerby}
            onChange={(e) => setIsDerby(e.target.checked)}
          />
          <span className="hidden sm:inline">Derby</span>
          <span className="sm:hidden">D</span>
        </label>

        <button
          type="submit"
          disabled={isPending || homeScore === "" || awayScore === ""}
          aria-label="Ergebnis speichern"
          className="flex h-8 shrink-0 items-center justify-center rounded-full bg-tigers-secondary px-2.5 text-xs font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:h-auto sm:px-4 sm:py-2"
        >
          <Check size={14} className="sm:hidden" />
          <span className="hidden sm:inline">
            {isPending ? "Speichert…" : saved ? "Gespeichert" : "Speichern"}
          </span>
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </form>
  );
}
