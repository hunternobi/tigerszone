"use client";

import { useState } from "react";
import { getTeamName } from "@/lib/teams";
import { formatGameDate, formatGameTime } from "@/utils/format";
import type { PredictionHistoryEntry } from "@/lib/predictions";
import type { Competition } from "@/types";

export interface TipHistoryEntry extends PredictionHistoryEntry {
  hidden?: boolean;
}

interface TipHistoryTabsProps {
  entries: TipHistoryEntry[];
}

const TABS: { key: Competition; label: string }[] = [
  { key: "Vorbereitung", label: "Vorbereitung" },
  { key: "DEL", label: "Hauptrunde" },
  { key: "Playoffs", label: "Playoffs" },
];

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Ausstehend",
  live: "Live",
  finished: "Beendet",
  postponed: "Verschoben",
  cancelled: "Abgesagt",
};

export default function TipHistoryTabs({ entries }: TipHistoryTabsProps) {
  const [tab, setTab] = useState<Competition>("Vorbereitung");
  const filtered = entries.filter((entry) => entry.competition === tab);

  return (
    <div className="glass-panel mt-8 p-4 sm:p-6">
      <h2 className="text-lg font-bold text-white">Tipphistorie</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              tab === t.key
                ? "border-tigers-secondary bg-tigers-secondary/20 text-white"
                : "border-white/15 text-white/70 hover:bg-white/5"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-4 text-sm text-white/60">Noch keine Tipps in dieser Kategorie.</p>
      ) : (
        <div className="glass-panel-sm mt-4 divide-y divide-white/5 p-2 sm:p-3">
          {filtered.map((entry) => (
            <div
              key={entry.gameId}
              className="flex flex-wrap items-center justify-between gap-2 px-1 py-2.5 sm:px-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {getTeamName(entry.homeTeamId)} vs. {getTeamName(entry.awayTeamId)}
                </p>
                <p className="text-[11px] text-white/60">
                  {formatGameDate(entry.kickoff)} · {formatGameTime(entry.kickoff)} Uhr
                </p>
              </div>

              {entry.hidden ? (
                <p className="text-xs text-white/60">
                  Tipp abgegeben – sichtbar nach dem Eröffnungsbully
                </p>
              ) : (
                <>
                  <div className="flex items-center gap-3 text-xs text-white sm:text-sm">
                    <span>
                      Tipp{" "}
                      <span className="font-semibold">
                        {entry.predictedHome}:{entry.predictedAway}
                      </span>
                    </span>
                    {entry.status === "finished" ? (
                      <span>
                        Ergebnis{" "}
                        <span className="font-semibold">
                          {entry.homeScore}:{entry.awayScore}
                        </span>
                      </span>
                    ) : (
                      <span className="text-white/60">
                        {STATUS_LABELS[entry.status] ?? entry.status}
                      </span>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-semibold text-white">
                    {entry.status === "finished" ? `${entry.pointsAwarded ?? 0} Pkt.` : "– Pkt."}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
