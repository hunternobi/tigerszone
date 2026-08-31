"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { joinPublicGroup, type PublicGroup } from "@/app/gruppen/actions";

interface PublicGroupsListProps {
  groups: PublicGroup[];
  hasResultsBeforeFilter?: boolean;
}

export default function PublicGroupsList({
  groups,
  hasResultsBeforeFilter = true,
}: PublicGroupsListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (groups.length === 0 && !hasResultsBeforeFilter) return null;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold text-white">Öffentliche Gruppen</h2>
      <p className="mt-1 text-sm text-white">
        Diesen Gruppen kannst du ohne Einladungslink direkt beitreten.
      </p>
      {groups.length === 0 ? (
        <p className="glass-panel-sm mt-4 p-4 text-sm text-white">Keine Gruppen gefunden.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {groups.map((group) => (
            <div
              key={group._id}
              className="glass-panel-sm flex items-start justify-between gap-3 p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-bold break-words text-white">{group.name}</p>
                <p className="text-xs text-white">
                  {group.memberCount} Mitglieder · Ersteller: {group.ownerName}
                </p>
              </div>
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await joinPublicGroup(group._id);
                    router.refresh();
                  })
                }
                className="glass-pill glass-pill-primary glass-interactive shrink-0 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
              >
                Beitreten
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
