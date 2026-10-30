"use client";

import { useState } from "react";
import { LocateFixed, Search } from "lucide-react";
import Leaderboard, { type LeaderboardEntry } from "@/components/Leaderboard";

/** The full ranking with a search field and, for signed-in players, a jump to their own place. */
export default function GlobalRanking({
  entries,
  meId,
}: {
  entries: LeaderboardEntry[];
  meId?: string;
}) {
  const [query, setQuery] = useState("");
  const ranked = entries.map((entry, index) => ({ ...entry, rank: index + 1 }));
  const needle = query.trim().toLowerCase();
  const shown = needle
    ? ranked.filter((entry) => entry.name.toLowerCase().includes(needle))
    : ranked;
  const myRank = meId
    ? ranked.find((entry) => entry.userId === meId)?.rank
    : undefined;

  function jumpToMe() {
    setQuery("");
    // Wait a tick so the full list is back before scrolling.
    setTimeout(
      () =>
        document
          .querySelector("[data-me]")
          ?.scrollIntoView({ behavior: "smooth", block: "center" }),
      50,
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2.5">
        <label className="relative min-w-0 flex-1">
          <Search
            size={17}
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-white/60"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Spieler suchen"
            aria-label="Spieler suchen"
            className="h-[44px] w-full rounded-full border border-white/20 bg-white/10 pr-4 pl-11 text-[1.0625rem] text-white placeholder:text-white/55 focus:border-white/50 focus:outline-none"
          />
        </label>
        {myRank && (
          <button
            type="button"
            onClick={jumpToMe}
            className="font-ui flex h-[44px] shrink-0 items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-4 text-[0.875rem] font-semibold text-white transition active:scale-[0.96]"
          >
            <LocateFixed size={16} />
            Platz {myRank}
          </button>
        )}
      </div>

      <div className="mt-4">
        <Leaderboard
          entries={shown}
          highlightUserId={meId}
          title={
            needle
              ? `${shown.length} von ${entries.length} Spielern`
              : `${entries.length} Spieler`
          }
        />
      </div>
    </div>
  );
}
