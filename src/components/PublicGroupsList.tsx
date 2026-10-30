"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { joinPublicGroup, type PublicGroup } from "@/app/gruppen/actions";
import { PillActionButton } from "@/components/PillButton";

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
    <div className="mt-10">
      <h2 className="font-ui text-[1.375rem] font-semibold tracking-tight text-white sm:text-3xl">
        Öffentliche Gruppen
      </h2>
      <p className="mt-1 text-[0.9375rem] leading-snug text-white/70">
        Diesen Gruppen kannst du ohne Einladungslink direkt beitreten.
      </p>

      <div
        data-liquid-glass="card"
        className="glass-panel mt-3 divide-y divide-white/10"
      >
        {groups.length === 0 ? (
          <p className="p-5 text-[0.9375rem] text-white/75">
            Keine Gruppen gefunden.
          </p>
        ) : (
          groups.map((group) => (
            <div
              key={group._id}
              className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5"
            >
              <div className="min-w-0 flex-1">
                <p className="font-ui text-[1.0625rem] leading-snug font-semibold tracking-tight break-words text-white">
                  {group.name}
                </p>
                <p className="mt-0.5 text-[0.8125rem] text-white/60">
                  {group.memberCount}{" "}
                  {group.memberCount === 1 ? "Mitglied" : "Mitglieder"} ·
                  Ersteller: {group.ownerName}
                </p>
              </div>
              <PillActionButton
                compact
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await joinPublicGroup(group._id);
                    router.refresh();
                  })
                }
              >
                Beitreten
              </PillActionButton>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
