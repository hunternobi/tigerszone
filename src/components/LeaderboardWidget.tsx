"use client";

import { useState } from "react";
import Leaderboard, { type LeaderboardEntry } from "@/components/Leaderboard";

const GLOBAL_ENTRIES: LeaderboardEntry[] = [
  { userId: "1", name: "Manuel S.", points: 142 },
  { userId: "2", name: "Julia F.", points: 138 },
  { userId: "3", name: "Tobias E.", points: 127 },
  { userId: "4", name: "Lukas H.", points: 119 },
  { userId: "5", name: "Sabine W.", points: 108 },
];

const GROUP_ENTRIES: LeaderboardEntry[] = [
  { userId: "1", name: "Tobias E.", points: 127 },
  { userId: "2", name: "Michael K.", points: 121 },
  { userId: "3", name: "Anna P.", points: 96 },
  { userId: "4", name: "David R.", points: 84 },
];

type Tab = "global" | "gruppe";

export default function LeaderboardWidget() {
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

      <Leaderboard
        entries={tab === "global" ? GLOBAL_ENTRIES : GROUP_ENTRIES}
        title={tab === "global" ? "Gesamtrangliste" : "Gruppenrangliste"}
      />
    </div>
  );
}
