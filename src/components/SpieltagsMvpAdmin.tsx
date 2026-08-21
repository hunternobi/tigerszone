"use client";

import { useState } from "react";
import { Check, Copy, Trophy } from "lucide-react";
import { getTeamName } from "@/lib/teams";
import { formatPostDate } from "@/utils/format";
import type { SpieltagsMvpData } from "@/lib/leaderboard";
import SpieltagsMvpStoryExport from "@/components/SpieltagsMvpStoryExport";

interface SpieltagsMvpAdminProps {
  mvp: SpieltagsMvpData;
}

function buildCopyText(mvp: SpieltagsMvpData): string {
  const lines: string[] = ["🏆 Spieltags-MVP"];
  if (mvp.date) lines.push(formatPostDate(mvp.date));
  lines.push("");

  for (const game of mvp.games) {
    lines.push(
      `${getTeamName(game.homeTeamId)} ${game.homeScore}:${game.awayScore} ${getTeamName(game.awayTeamId)}`
    );
  }
  lines.push("");

  if (mvp.entries.length === 0) {
    lines.push("Diesmal hat niemand das genaue Ergebnis getroffen.");
  } else {
    lines.push("Diese Tipper haben das Ergebnis exakt getroffen:");
    for (const entry of mvp.entries) lines.push(`🐯 ${entry.name}`);
  }

  return lines.join("\n");
}

export default function SpieltagsMvpAdmin({ mvp }: SpieltagsMvpAdminProps) {
  const [copied, setCopied] = useState(false);

  if (!mvp.date) {
    return (
      <p className="glass-panel-sm p-4 text-sm text-white">
        Noch kein ausgewerteter Spieltag vorhanden.
      </p>
    );
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(buildCopyText(mvp));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="glass-panel p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Trophy size={20} className="shrink-0 text-tigers-secondary" />
          <h3 className="text-lg font-bold text-white">Spieltags-MVP</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="glass-pill glass-interactive flex shrink-0 items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            {copied ? "Kopiert!" : "Text kopieren"}
          </button>
          <SpieltagsMvpStoryExport mvp={mvp} />
        </div>
      </div>

      <p className="mt-2 text-xs text-white/70">{formatPostDate(mvp.date)}</p>

      <div className="mt-3 space-y-1">
        {mvp.games.map((game, index) => (
          <p key={index} className="text-sm font-semibold text-white">
            {getTeamName(game.homeTeamId)} {game.homeScore}:{game.awayScore}{" "}
            {getTeamName(game.awayTeamId)}
          </p>
        ))}
      </div>

      {mvp.entries.length === 0 ? (
        <p className="mt-4 text-sm text-white">
          Diesmal hat niemand das genaue Ergebnis getroffen.
        </p>
      ) : (
        <ul className="mt-4 flex flex-wrap gap-2">
          {mvp.entries.map((entry) => (
            <li
              key={entry.userId}
              className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-semibold text-white"
            >
              {entry.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
