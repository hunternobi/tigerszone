"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Pencil, Share2 } from "lucide-react";
import { renameGroup, type MyGroup } from "@/app/gruppen/actions";
import GroupMemberTable from "@/components/GroupMemberTable";
import type { LeaderboardEntry } from "@/components/Leaderboard";

interface GroupListProps {
  groups: MyGroup[];
  leaderboards: Record<string, LeaderboardEntry[]>;
}

export default function GroupList({ groups, leaderboards }: GroupListProps) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [renameError, setRenameError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function shareInvite(group: MyGroup) {
    const inviteLink = `${window.location.origin}/gruppen/join/${group.inviteCode}`;
    const text = `${group.ownerName} hat dich eingeladen, der Tippspiel-Gruppe ${group.name} beizutreten.`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "TigersZone Einladung", text, url: inviteLink });
      } catch {
        // Nutzer hat das Teilen-Menü abgebrochen.
      }
      return;
    }

    await navigator.clipboard.writeText(`${text} Link: ${inviteLink}`);
    setCopiedId(group._id);
    setTimeout(() => setCopiedId((id) => (id === group._id ? null : id)), 1800);
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
        const isExpanded = expandedId === group._id;
        const isRenaming = renamingId === group._id;
        const canManage = group.viewerRole === "owner" || group.viewerRole === "assistant";

        return (
          <div key={group._id} className="glass-panel-sm p-5">
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
              <div className="min-w-0 flex-1">
                {isRenaming ? (
                  <form
                    onClick={(e) => e.stopPropagation()}
                    onSubmit={(e) => submitRename(e, group._id)}
                    className="flex items-center gap-2"
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
                      className="rounded-full bg-tigers-secondary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      Speichern
                    </button>
                    <button
                      type="button"
                      onClick={() => setRenamingId(null)}
                      className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Abbrechen
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="truncate font-bold text-white">{group.name}</p>
                    <span className="shrink-0 rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase">
                      {group.isPublic ? "Öffentlich" : "Privat"}
                    </span>
                    {canManage && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          startRename(group);
                        }}
                        aria-label="Gruppennamen bearbeiten"
                        className="shrink-0 text-white/60 transition hover:text-white"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                  </div>
                )}
                {isRenaming && renameError && (
                  <p className="mt-1 text-xs text-red-400">{renameError}</p>
                )}
                <p className="text-xs text-white">{group.memberCount} Mitglieder</p>
              </div>
              <ChevronDown
                size={18}
                className={`shrink-0 text-white transition-transform ${isExpanded ? "rotate-180" : ""}`}
              />
            </div>

            {group.isPublic ? (
              <p className="mt-3 text-xs text-white">
                Öffentliche Gruppe – sichtbar in „Öffentliche Gruppen&quot; für alle Nutzer.
              </p>
            ) : (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                <span className="text-xs text-white">Private Gruppe – lade Freunde per Link ein.</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    shareInvite(group);
                  }}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-tigers-secondary px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                >
                  <Share2 size={14} />
                  {copiedId === group._id ? "Kopiert!" : "Teilen"}
                </button>
              </div>
            )}

            {isExpanded && (
              <div className="mt-4">
                <GroupMemberTable
                  groupId={group._id}
                  entries={leaderboards[group._id] ?? []}
                  title={`Rangliste: ${group.name}`}
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
