"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Globe, Lock, Pencil, Users } from "lucide-react";
import { renameGroup, type MyGroup } from "@/app/gruppen/actions";
import GroupMemberTable from "@/components/GroupMemberTable";
import GroupShareMenu from "@/components/GroupShareMenu";
import type { LeaderboardEntry } from "@/components/Leaderboard";

interface GroupListProps {
  groups: MyGroup[];
  leaderboards: Record<string, LeaderboardEntry[]>;
  /** Groups outside this set (search filter) are hidden, not unmounted: every card is a glass surface. */
  visibleIds?: Set<string>;
}

export default function GroupList({
  groups,
  leaderboards,
  visibleIds,
}: GroupListProps) {
  const router = useRouter();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [renameError, setRenameError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  // Every group starts expanded (top 3 of the ranking); only groups the user collapsed are tracked.
  const [closedIds, setClosedIds] = useState<Record<string, boolean>>({});

  function toggleOpen(groupId: string) {
    setClosedIds((current) => ({ ...current, [groupId]: !current[groupId] }));
  }

  function startRename(group: MyGroup) {
    setRenamingId(group._id);
    setNameDraft(group.name);
    setRenameError(null);
  }

  function submitRename(e: FormEvent, groupId: string) {
    e.preventDefault();
    e.stopPropagation();
    setRenameError(null);
    startTransition(async () => {
      const result = await renameGroup(groupId, nameDraft);
      if (!result.success) {
        setRenameError(result.error ?? "Umbenennen fehlgeschlagen.");
        return;
      }
      setRenamingId(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const isRenaming = renamingId === group._id;
        const canManage =
          group.viewerRole === "owner" || group.viewerRole === "assistant";
        const isOpen = !closedIds[group._id];

        return (
          <div
            key={group._id}
            data-liquid-glass="card"
            className={`glass-panel p-4 sm:p-5 ${visibleIds && !visibleIds.has(group._id) ? "hidden" : ""}`}
          >
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1 text-left">
                {isRenaming ? (
                  <form
                    onSubmit={(e) => submitRename(e, group._id)}
                    className="flex flex-wrap items-center gap-2"
                  >
                    <input
                      type="text"
                      value={nameDraft}
                      onChange={(e) => setNameDraft(e.target.value)}
                      autoFocus
                      className="h-10 min-w-0 flex-1 rounded-xl border border-white/20 bg-white/15 px-3 text-[16px] text-white focus:border-white/60 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isPending}
                      className="shrink-0 rounded-full bg-white px-3.5 py-2 text-[13px] font-semibold text-tigers-primary disabled:opacity-50"
                    >
                      Speichern
                    </button>
                    <button
                      type="button"
                      onClick={() => setRenamingId(null)}
                      className="shrink-0 rounded-full border border-white/20 px-3.5 py-2 text-[13px] font-semibold text-white"
                    >
                      Abbrechen
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <p className="font-ui min-w-0 text-[20px] leading-tight font-semibold tracking-tight break-words text-white">
                      {group.name}
                    </p>
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => startRename(group)}
                        aria-label="Gruppennamen bearbeiten"
                        className="shrink-0 rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                  </div>
                )}
                {isRenaming && renameError && (
                  <p className="mt-1 text-xs text-red-300">{renameError}</p>
                )}

                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-white/60">
                  <span className="inline-flex items-center gap-1">
                    {group.isPublic ? <Globe size={12} /> : <Lock size={12} />}
                    {group.isPublic ? "Öffentlich" : "Privat"}
                  </span>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Users size={12} />
                    {group.memberCount}{" "}
                    {group.memberCount === 1 ? "Mitglied" : "Mitglieder"}
                  </span>
                </p>
              </div>

              <GroupShareMenu group={group} />
              <button
                type="button"
                onClick={() => toggleOpen(group._id)}
                aria-expanded={isOpen}
                aria-label={
                  isOpen ? "Rangliste einklappen" : "Rangliste ausklappen"
                }
                className="relative h-10 w-10 shrink-0 appearance-none rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/15 active:scale-[0.94]"
              >
                <ChevronDown
                  size={18}
                  className={`absolute inset-0 m-auto transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            {isOpen && (
              <div className="mt-4">
                <GroupMemberTable
                  groupId={group._id}
                  entries={leaderboards[group._id] ?? []}
                  title="Rangliste"
                  viewerRole={group.viewerRole}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
