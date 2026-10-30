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

const GRID_COLUMNS = "grid-cols-[minmax(0,1fr)_2.25rem_2.25rem_3rem]";

function TeamName({ teamId }: { teamId: string }) {
  const shortName = getTeamById(teamId)?.shortName ?? getTeamName(teamId);
  return (
    <span className="font-ui text-[1rem] font-medium tracking-tight text-white">
      <span className="sm:hidden">{shortName}</span>
      <span className="hidden sm:inline">{getTeamName(teamId)}</span>
    </span>
  );
}

function ScoreBox({ value }: { value: number }) {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/15 text-[1rem] font-semibold text-white tabular-nums">
      {value}
    </span>
  );
}

function ResultCell({ value }: { value: number | undefined }) {
  return (
    <span className="text-center text-[1rem] font-semibold text-white/75 tabular-nums">
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
      className={`self-center rounded-full border px-2.5 py-1 text-center text-[0.8125rem] font-bold tabular-nums ${
        points > 0
          ? "border-emerald-300/30 bg-emerald-400/15 text-emerald-300"
          : "border-white/15 bg-white/10 text-white/60"
      }`}
    >
      {points > 0 ? `+${points}` : "0"}
    </span>
  );
}

export default function TipHistoryTabs({
  entries,
  defaultTab = "Vorbereitung",
}: TipHistoryTabsProps) {
  const [tab, setTab] = useState<Competition>(defaultTab);
  const filtered = entries.filter((entry) => entry.competition === tab);

  return (
    <div data-liquid-glass="card" className="glass-panel mt-6 p-4 sm:p-6">
      <h2 className="font-ui text-xl font-semibold tracking-tight text-white sm:text-2xl">
        Tipphistorie
      </h2>

      {/* Segmented control, iOS style */}
      <div
        role="tablist"
        className="mt-3 flex rounded-full border border-white/15 bg-white/10 p-1"
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`min-h-[36px] flex-1 rounded-full px-1 text-[0.8125rem] font-semibold transition sm:text-[0.9375rem] ${
              tab === t.key
                ? "bg-white text-tigers-primary shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                : "text-white/75 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-4 text-[0.9375rem] text-white/65">
          Noch keine Tipps in dieser Kategorie.
        </p>
      ) : (
        <div className="mt-4">
          <div
            className={`grid ${GRID_COLUMNS} gap-x-2 px-1 pb-1 text-[0.6875rem] font-semibold tracking-wide text-white/55 uppercase`}
          >
            <span />
            <span className="text-center">Tipp</span>
            <span className="text-center">Erg.</span>
            <span className="text-center">Pkt.</span>
          </div>
          <div className="divide-y divide-white/10">
            {filtered.map((entry) => {
              const statusLabel = STATUS_LABELS[entry.status];
              return (
                <div key={entry.gameId} className="px-1 py-3">
                  <p className="text-[0.75rem] font-medium text-white/60">
                    {formatPostDate(entry.kickoff)} ·{" "}
                    {formatGameTime(entry.kickoff)} Uhr
                    {statusLabel ? ` · ${statusLabel}` : ""}
                  </p>
                  <div
                    className={`mt-1.5 grid ${GRID_COLUMNS} items-center gap-x-2 gap-y-1.5`}
                  >
                    <TeamName teamId={entry.homeTeamId} />
                    {entry.hidden ? (
                      <p className="col-span-3 row-span-2 self-center text-right text-[0.75rem] leading-tight text-white/65">
                        Tipp abgegeben – sichtbar nach dem Eröffnungsbully
                      </p>
                    ) : (
                      <>
                        <ScoreBox value={entry.predictedHome} />
                        <ResultCell
                          value={
                            entry.status === "finished"
                              ? entry.homeScore
                              : undefined
                          }
                        />
                        <span className="row-span-2 flex justify-center">
                          <PointsBadge entry={entry} />
                        </span>
                      </>
                    )}
                    <TeamName teamId={entry.awayTeamId} />
                    {!entry.hidden && (
                      <>
                        <ScoreBox value={entry.predictedAway} />
                        <ResultCell
                          value={
                            entry.status === "finished"
                              ? entry.awayScore
                              : undefined
                          }
                        />
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
