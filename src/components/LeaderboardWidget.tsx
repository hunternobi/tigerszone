"use client";

import Link from "next/link";
import { useState } from "react";
import Leaderboard, { type LeaderboardEntry } from "@/components/Leaderboard";
import { setActiveGroup } from "@/app/gruppen/actions";
import { ChevronRight } from "lucide-react";
import GroupSelect from "@/components/GroupSelect";
import type { GroupLeaderboardData } from "@/lib/leaderboard";

interface LeaderboardWidgetProps {
  globalEntries: LeaderboardEntry[];
  groupLeaderboards: GroupLeaderboardData[];
  activeGroupId: string | null;
}

type Tab = "global" | "gruppe";

export default function LeaderboardWidget({
  globalEntries,
  groupLeaderboards,
  activeGroupId,
}: LeaderboardWidgetProps) {
  const [tab, setTab] = useState<Tab>("global");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(
    groupLeaderboards.find((group) => group.groupId === activeGroupId)
      ?.groupId ??
      groupLeaderboards[0]?.groupId ??
      null,
  );

  const selectedGroup = groupLeaderboards.find(
    (group) => group.groupId === selectedGroupId,
  );

  function handleGroupChange(groupId: string) {
    setSelectedGroupId(groupId);
    setActiveGroup(groupId);
  }

  return (
    <div>
      {/* Segmented control, iOS style: a dark track with a white thumb on the active tab. */}
      <div
        role="tablist"
        className="mb-3 flex rounded-full border border-white/15 bg-white/10 p-1"
      >
        {(["global", "gruppe"] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={`min-h-[36px] flex-1 rounded-full text-[0.9375rem] font-semibold transition ${
              tab === value
                ? "bg-white text-tigers-primary shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                : "text-white/75 hover:text-white"
            }`}
          >
            {value === "global" ? "Global" : "Gruppe"}
          </button>
        ))}
      </div>

      {/* One persistent glass surface; only its content changes with the tab. */}
      <div data-liquid-glass="card" className="glass-panel p-5">
        {tab === "global" ? (
          <Leaderboard
            bare
            entries={globalEntries}
            title="Gesamtrangliste"
            footer={
              <Link
                href="/tippspiel/rangliste"
                className="flex min-h-[44px] items-center justify-center gap-1 text-[0.9375rem] font-semibold text-white/85 transition hover:text-white"
              >
                Gesamte Rangliste ansehen
                <ChevronRight size={16} />
              </Link>
            }
          />
        ) : groupLeaderboards.length === 0 ? (
          <p className="py-2 text-center text-[0.9375rem] text-white/80">
            Keine aktive Gruppe.{" "}
            <Link
              href="/gruppen"
              className="font-semibold text-white underline underline-offset-2"
            >
              Gruppe erstellen oder beitreten
            </Link>
          </p>
        ) : (
          <div>
            {groupLeaderboards.length > 1 && (
              <GroupSelect
                options={groupLeaderboards.map((group) => ({
                  groupId: group.groupId,
                  groupName: group.groupName,
                }))}
                value={selectedGroupId}
                onChange={handleGroupChange}
              />
            )}
            <Leaderboard
              bare
              entries={selectedGroup?.entries ?? []}
              title={
                selectedGroup
                  ? `Rangliste: ${selectedGroup.groupName}`
                  : "Gruppenrangliste"
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
