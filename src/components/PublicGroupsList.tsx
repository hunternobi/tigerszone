"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { joinPublicGroup, type PublicGroup } from "@/app/gruppen/actions";

export default function PublicGroupsList({ groups }: { groups: PublicGroup[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (groups.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold text-white">Öffentliche Gruppen</h2>
      <p className="mt-1 text-sm text-white/60">
        Diesen Gruppen kannst du ohne Einladungslink direkt beitreten.
      </p>
      <div className="mt-4 space-y-3">
        {groups.map((group) => (
          <div
            key={group._id}
            className="glass-panel-sm flex items-center justify-between gap-4 p-4"
          >
            <div>
              <p className="font-bold text-white">{group.name}</p>
              <p className="text-xs text-white/50">
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
              className="glass-pill glass-pill-primary glass-interactive px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              Beitreten
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
