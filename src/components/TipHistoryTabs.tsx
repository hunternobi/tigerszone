"use client";

import { useState } from "react";
import { getTeamById, getTeamName } from "@/lib/teams";
import { formatGameTime, formatPostDate } from "@/utils/format";
import type { PredictionHistoryEntry } from "@/lib/predictions";
import type { Competition } from "@/types";

export interface TipHistoryEntry extends PredictionHistoryEntry {
  hidden?: boolean;
}

interface TipHistoryTabsProps {
  entries: TipHistoryEntry[];
  defaultTab?: Competition;
}

const TABS: { key: Competition; label: string }[] = [
  { key: "Vorbereitung", label: "Vorbereitung" },
  { key: "DEL", label: "Hauptrunde" },
  { key: "Playoffs", label: "Playoffs" },
];

const STATUS_LABELS: Record<string, string> = {
  live: "Live",
  postponed: "Verschoben",
  cancelled: "Abgesagt",
};

const GRID_COLUMNS = "grid-cols-[minmax(0,1fr)_2rem_2rem_2.75rem]";

function TeamName({ teamId }: { teamId: string }) {
  const shortName = getTeamById(teamId)?.shortName ?? getTeamName(teamId);
  return (
    <span className="text-sm font-medium text-white">
      <span className="sm:hidden">{shortName}</span>
      <span className="hidden sm:inline">{getTeamName(teamId)}</span>
    </span>
  );
}

function ScoreBox({ value }: { value: number }) {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-sm font-semibold text-white">
      {value}
    </span>
  );
}

function ResultCell({ value }: { value: number | undefined }) {
  return (
    <span className="text-center text-sm font-semibold text-white/75">
      {value === undefined ? <span className="text-white/35">–</span> : value}
    </span>
  );
}

function PointsBadge({ entry }: { entry: TipHistoryEntry }) {
  if (entry.status !== "finished") {
    return <span className="text-center text-sm text-white/35">–</span>;
  }
  const points = entry.pointsAwarded ?? 0;
  return (
    <span
      className={`self-center rounded-full border px-2 py-1 text-center text-xs font-bold ${
        points > 0
          ? "border-emerald-300/30 bg-emerald-400/15 text-emerald-300"
          : "border-white/15 bg-white/5 text-white/60"
      }`}
    >
      {points > 0 ? `+${points}` : "0"}
    </span>
  );
}

export default function TipHistoryTabs({ entries, defaultTab = "Vorbereitung" }: TipHistoryTabsProps) {
  const [tab, setTab] = useState<Competition>(defaultTab);
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
        <div className="glass-panel-sm mt-4 p-2 sm:p-3">
          <div
            className={`grid ${GRID_COLUMNS} gap-x-2 px-3 pt-1 pb-1 text-[10px] font-semibold tracking-wide text-white/50 uppercase`}
          >
            <span />
            <span className="text-center">Tipp</span>
            <span className="text-center">Erg.</span>
            <span className="text-center">Pkt.</span>
          </div>
          <div className="divide-y divide-white/5">
            {filtered.map((entry) => {
              const statusLabel = STATUS_LABELS[entry.status];
              return (
                <div key={entry.gameId} className="rounded-lg px-3 py-2 odd:bg-white/5">
                  <p className="text-[11px] text-white/50">
                    {formatPostDate(entry.kickoff)} · {formatGameTime(entry.kickoff)} Uhr
                    {statusLabel ? ` · ${statusLabel}` : ""}
                  </p>
                  <div className={`mt-1 grid ${GRID_COLUMNS} items-center gap-x-2 gap-y-1`}>
                    <TeamName teamId={entry.homeTeamId} />
                    {entry.hidden ? (
                      <p className="col-span-3 row-span-2 self-center text-right text-[11px] leading-tight text-white/60">
                        Tipp abgegeben – sichtbar nach dem Eröffnungsbully
                      </p>
                    ) : (
                      <>
                        <ScoreBox value={entry.predictedHome} />
                        <ResultCell value={entry.status === "finished" ? entry.homeScore : undefined} />
                        <span className="row-span-2 flex justify-center">
                          <PointsBadge entry={entry} />
                        </span>
                      </>
                    )}
                    <TeamName teamId={entry.awayTeamId} />
                    {!entry.hidden && (
                      <>
                        <ScoreBox value={entry.predictedAway} />
                        <ResultCell value={entry.status === "finished" ? entry.awayScore : undefined} />
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
