"use client";

import Link from "next/link";
import { useState } from "react";
import Leaderboard, { type LeaderboardEntry } from "@/components/Leaderboard";

interface LeaderboardWidgetProps {
  globalEntries: LeaderboardEntry[];
  groupEntries: LeaderboardEntry[];
  hasActiveGroup: boolean;
}

type Tab = "global" | "gruppe";

export default function LeaderboardWidget({
  globalEntries,
  groupEntries,
  hasActiveGroup,
}: LeaderboardWidgetProps) {
  const [tab, setTab] = useState<Tab>("global");

  return (
    <div>
      <div className="mb-3 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("global")}
          className={`glass-pill glass-interactive flex-1 px-4 py-2 text-sm font-semibold text-white ${
            tab === "global" ? "glass-pill-primary" : ""
          }`}
        >
          Global
        </button>
        <button
          type="button"
          onClick={() => setTab("gruppe")}
          className={`glass-pill glass-interactive flex-1 px-4 py-2 text-sm font-semibold text-white ${
            tab === "gruppe" ? "glass-pill-primary" : ""
          }`}
        >
          Gruppe
        </button>
      </div>

      {tab === "global" ? (
        <Leaderboard entries={globalEntries} title="Gesamtrangliste" medals />
      ) : hasActiveGroup ? (
        <Leaderboard entries={groupEntries} title="Gruppenrangliste" />
      ) : (
        <div className="glass-panel p-6 text-center text-sm text-white/60">
          Keine aktive Gruppe.{" "}
          <Link href="/gruppen" className="text-tigers-secondary hover:underline">
            Gruppe erstellen oder beitreten
          </Link>
        </div>
      )}
    </div>
  );
}
