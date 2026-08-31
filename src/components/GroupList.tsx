"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { renameGroup, type MyGroup } from "@/app/gruppen/actions";
import GroupMemberTable from "@/components/GroupMemberTable";
import GroupShareMenu from "@/components/GroupShareMenu";
import type { LeaderboardEntry } from "@/components/Leaderboard";

interface GroupListProps {
  groups: MyGroup[];
  leaderboards: Record<string, LeaderboardEntry[]>;
}

export default function GroupList({ groups, leaderboards }: GroupListProps) {
  const router = useRouter();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [renameError, setRenameError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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
        const canManage = group.viewerRole === "owner" || group.viewerRole === "assistant";

        return (
          <div key={group._id} className="glass-panel-sm p-4 sm:p-5">
            <div className="text-left">
              {isRenaming ? (
                <form
                  onClick={(e) => e.stopPropagation()}
                  onSubmit={(e) => submitRename(e, group._id)}
                  className="flex flex-wrap items-center gap-2"
                >
                  <input
                    type="text"
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    autoFocus
                    className="glass-panel-sm min-w-0 flex-1 px-3 py-1.5 text-sm text-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isPending}
                    className="shrink-0 rounded-full bg-tigers-secondary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    Speichern
                  </button>
                  <button
                    type="button"
                    onClick={() => setRenamingId(null)}
                    className="shrink-0 rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Abbrechen
                  </button>
                </form>
              ) : (
                <div className="flex items-start gap-2">
                  <p className="min-w-0 flex-1 font-bold break-words text-white">{group.name}</p>
                  {canManage && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        startRename(group);
                      }}
                      aria-label="Gruppennamen bearbeiten"
                      className="shrink-0 rounded-full p-1.5 -m-1.5 text-white transition hover:bg-white/10 hover:text-tigers-secondary"
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                </div>
              )}
              {isRenaming && renameError && (
                <p className="mt-1 text-xs text-red-400">{renameError}</p>
              )}

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-white">{group.memberCount} Mitglieder</p>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase">
                    {group.isPublic ? "Öffentlich" : "Privat"}
                  </span>
                  <GroupShareMenu group={group} />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <GroupMemberTable
                groupId={group._id}
                entries={leaderboards[group._id] ?? []}
                title="Rangliste"
                viewerRole={group.viewerRole}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
