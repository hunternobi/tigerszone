"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ChevronDown } from "lucide-react";
import { setActiveGroup, type MyGroup } from "@/app/gruppen/actions";
import Leaderboard, { type LeaderboardEntry } from "@/components/Leaderboard";

interface GroupListProps {
  groups: MyGroup[];
  activeGroupId: string | null;
  leaderboards: Record<string, LeaderboardEntry[]>;
}

export default function GroupList({ groups, activeGroupId, leaderboards }: GroupListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const isActive = group._id === activeGroupId;
        const isExpanded = expandedId === group._id;
        const inviteLink = `/gruppen/join/${group.inviteCode}`;
        const inviteText = `${group.ownerName} hat dich eingeladen, der Tippspiel-Gruppe ${group.name} beizutreten. Link: `;

        return (
          <div
            key={group._id}
            className={`glass-panel-sm p-5 ${isActive ? "border-tigers-secondary" : ""}`}
          >
            <div
              role="button"
              tabIndex={0}
              onClick={() => setExpandedId(isExpanded ? null : group._id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setExpandedId(isExpanded ? null : group._id);
                }
              }}
              className="flex w-full cursor-pointer items-center justify-between gap-4 text-left"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-white">{group.name}</p>
                  <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase">
                    {group.isPublic ? "Öffentlich" : "Privat"}
                  </span>
                </div>
                <p className="text-xs text-white">
                  {group.memberCount} Mitglieder{group.isOwner ? " · Ersteller" : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  disabled={isActive || isPending}
                  onClick={(e) => {
                    e.stopPropagation();
                    startTransition(async () => {
                      await setActiveGroup(group._id);
                      router.refresh();
                    });
                  }}
                  className="glass-pill glass-pill-primary glass-interactive px-4 py-2 text-xs font-semibold text-white disabled:pointer-events-none disabled:opacity-50"
                >
                  {isActive ? "Aktiv" : "Auswählen"}
                </button>
                <ChevronDown
                  size={18}
                  className={`text-white transition-transform ${isExpanded ? "rotate-180" : ""}`}
                />
              </div>
            </div>

            {group.isPublic ? (
              <p className="mt-3 text-xs text-white">
                Öffentliche Gruppe – sichtbar in „Öffentliche Gruppen&quot; für alle Nutzer.
              </p>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(
                    `${inviteText}${window.location.origin}${inviteLink}`
                  );
                }}
                className="mt-3 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-xs text-white transition hover:bg-white/10"
              >
                {inviteText}
                {inviteLink}
                <span className="text-white"> (klicken zum Kopieren)</span>
              </button>
            )}

            {isExpanded && (
              <div className="mt-4">
                <Leaderboard
                  entries={leaderboards[group._id] ?? []}
                  title={`Rangliste: ${group.name}`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
