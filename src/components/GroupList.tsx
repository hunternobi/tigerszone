"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setActiveGroup, type MyGroup } from "@/app/gruppen/actions";

interface GroupListProps {
  groups: MyGroup[];
  activeGroupId: string | null;
}

export default function GroupList({ groups, activeGroupId }: GroupListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (groups.length === 0) {
    return (
      <p className="glass-panel p-6 text-sm text-white/60">
        Du bist noch in keiner Gruppe. Erstelle rechts deine erste Gruppe oder nutze einen
        Einladungslink von einem Freund.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const isActive = group._id === activeGroupId;
        const inviteLink = `/gruppen/join/${group.inviteCode}`;
        const inviteText = `${group.ownerName} hat dich eingeladen, der Tippspiel-Gruppe ${group.name} beizutreten. Link: `;

        return (
          <div
            key={group._id}
            className={`glass-panel-sm p-5 ${isActive ? "border-tigers-secondary" : ""}`}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-white">{group.name}</p>
                <p className="text-xs text-white/50">
                  {group.memberCount} Mitglieder{group.isOwner ? " · Ersteller" : ""}
                </p>
              </div>
              <button
                type="button"
                disabled={isActive || isPending}
                onClick={() =>
                  startTransition(async () => {
                    await setActiveGroup(group._id);
                    router.refresh();
                  })
                }
                className="glass-pill glass-pill-primary glass-interactive px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
              >
                {isActive ? "Aktiv" : "Auswählen"}
              </button>
            </div>
            <button
              type="button"
              onClick={() =>
                navigator.clipboard.writeText(`${inviteText}${window.location.origin}${inviteLink}`)
              }
              className="mt-3 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-xs text-white/60 transition hover:bg-white/10"
            >
              {inviteText}
              {inviteLink}
              <span className="text-white/40"> (klicken zum Kopieren)</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
