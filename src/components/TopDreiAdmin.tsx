"use client";

import { Medal } from "lucide-react";
import TopDreiStoryExport from "@/components/TopDreiStoryExport";
import type { LeaderboardEntry } from "@/components/Leaderboard";

interface TopDreiAdminProps {
  entries: LeaderboardEntry[];
}

const MEDALS = ["🥇", "🥈", "🥉"];

export default function TopDreiAdmin({ entries }: TopDreiAdminProps) {
  if (entries.length === 0) {
    return (
      <p className="glass-panel-sm p-4 text-sm text-white">Noch keine Punkte vergeben.</p>
    );
  }

  return (
    <div className="glass-panel p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Medal size={20} className="shrink-0 text-amber-300" />
          <h3 className="text-lg font-bold text-white">Gesamtrangliste Top 3</h3>
        </div>
        <TopDreiStoryExport entries={entries} />
      </div>

      <ul className="mt-4 space-y-2">
        {entries.map((entry, index) => (
          <li
            key={entry.userId}
            className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 odd:bg-white/5"
          >
            <span className="flex items-center gap-2 text-white">
              <span className="text-base">{MEDALS[index] ?? `${index + 1}.`}</span>
              <span className="font-semibold">{entry.name}</span>
            </span>
            <span className="font-semibold text-white">{entry.points} Pkt.</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
