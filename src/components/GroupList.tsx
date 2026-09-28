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
}

export default function GroupList({ groups, leaderboards }: GroupListProps) {
  const router = useRouter();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [renameError, setRenameError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [openIds, setOpenIds] = useState<Record<string, boolean>>(() =>
    groups[0] ? { [groups[0]._id]: true } : {}
  );

  function toggleOpen(groupId: string) {
    setOpenIds((current) => ({ ...current, [groupId]: !current[groupId] }));
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
        const canManage = group.viewerRole === "owner" || group.viewerRole === "assistant";
        const isOpen = Boolean(openIds[group._id]);

        return (
          <div key={group._id} className="glass-panel-sm p-4 sm:p-5">
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
                  <div className="flex items-center gap-1.5">
                    <p className="min-w-0 break-words text-lg font-bold text-white">{group.name}</p>
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => startRename(group)}
                        aria-label="Gruppennamen bearbeiten"
                        className="shrink-0 rounded-full p-1.5 text-white transition hover:bg-white/10 hover:text-tigers-secondary"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                  </div>
                )}
                {isRenaming && renameError && (
                  <p className="mt-1 text-xs text-red-400">{renameError}</p>
                )}

                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/80">
                  <span className="inline-flex items-center gap-1">
                    {group.isPublic ? <Globe size={12} /> : <Lock size={12} />}
                    {group.isPublic ? "Öffentlich" : "Privat"}
                  </span>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Users size={12} />
                    {group.memberCount} {group.memberCount === 1 ? "Mitglied" : "Mitglieder"}
                  </span>
                </p>
              </div>

              <GroupShareMenu group={group} />
              <button
                type="button"
                onClick={() => toggleOpen(group._id)}
                aria-expanded={isOpen}
                aria-label={isOpen ? "Rangliste einklappen" : "Rangliste ausklappen"}
                className="glass-panel-sm glass-interactive flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
              >
                <ChevronDown
                  size={18}
                  className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            {isOpen && (
              <div className="mt-4 border-t border-white/10 pt-4">
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
