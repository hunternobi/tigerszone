"use client";

import Link from "next/link";
import { useState } from "react";
import Leaderboard, { type LeaderboardEntry } from "@/components/Leaderboard";
import { setActiveGroup } from "@/app/gruppen/actions";
import GlassButtonExact from "@/components/GlassButtonExact";
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
    groupLeaderboards.find((group) => group.groupId === activeGroupId)?.groupId ??
      groupLeaderboards[0]?.groupId ??
      null
  );

  const selectedGroup = groupLeaderboards.find((group) => group.groupId === selectedGroupId);

  function handleGroupChange(groupId: string) {
    setSelectedGroupId(groupId);
    setActiveGroup(groupId);
  }

  return (
    <div>
      <div className="mb-3 flex gap-2">
        <GlassButtonExact
          type="button"
          size="0.875rem"
          wrapperClassName="flex-1"
          className={`block w-full text-center ${tab === "global" ? "" : "opacity-60"}`}
          onClick={() => setTab("global")}
        >
          Global
        </GlassButtonExact>
        <GlassButtonExact
          type="button"
          size="0.875rem"
          wrapperClassName="flex-1"
          className={`block w-full text-center ${tab === "gruppe" ? "" : "opacity-60"}`}
          onClick={() => setTab("gruppe")}
        >
          Gruppe
        </GlassButtonExact>
      </div>

      {tab === "global" ? (
        <Leaderboard
          entries={globalEntries}
          title="Gesamtrangliste"
          medals
          footer={
            <Link
              href="/tippspiel/rangliste"
              className="block text-center text-xs font-semibold text-white underline underline-offset-2"
            >
              Gesamte Rangliste ansehen
            </Link>
          }
        />
      ) : groupLeaderboards.length === 0 ? (
        <div className="glass-panel p-6 text-center text-sm text-white">
          Keine aktive Gruppe.{" "}
          <Link href="/gruppen" className="text-tigers-secondary hover:underline">
            Gruppe erstellen oder beitreten
          </Link>
        </div>
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
            entries={selectedGroup?.entries ?? []}
            title={selectedGroup ? `Rangliste: ${selectedGroup.groupName}` : "Gruppenrangliste"}
          />
        </div>
      )}
    </div>
  );
}
