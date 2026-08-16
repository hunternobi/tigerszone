"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { acceptGroupInvite, declineGroupInvite, type MyGroupInvite } from "@/app/gruppen/actions";

interface GroupInvitesProps {
  invites: MyGroupInvite[];
}

export default function GroupInvites({ invites }: GroupInvitesProps) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const visible = invites.filter((invite) => !dismissed.has(invite.inviteId));
  if (visible.length === 0) return null;

  function respond(inviteId: string, action: "accept" | "decline") {
    setError(null);
    setPendingId(inviteId);
    startTransition(async () => {
      const result =
        action === "accept" ? await acceptGroupInvite(inviteId) : await declineGroupInvite(inviteId);
      if (!result.success) {
        setError(result.error ?? "Aktion fehlgeschlagen.");
        setPendingId(null);
        return;
      }
      setDismissed((prev) => new Set(prev).add(inviteId));
      setPendingId(null);
      router.refresh();
    });
  }

  return (
    <div className="glass-panel mt-8 p-6">
      <h2 className="text-lg font-bold text-white">Gruppeneinladungen</h2>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      <div className="mt-4 space-y-3">
        {visible.map((invite) => (
          <div
            key={invite.inviteId}
            className="glass-panel-sm flex flex-wrap items-center justify-between gap-3 p-3"
          >
            <span className="flex items-center gap-2 text-sm text-white">
              <Users size={16} className="shrink-0 text-tigers-secondary" />
              <span>
                <span className="font-semibold">{invite.invitedByName}</span> hat dich zur Gruppe{" "}
                <span className="font-semibold">{invite.groupName}</span> eingeladen.
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                disabled={isPending && pendingId === invite.inviteId}
                onClick={() => respond(invite.inviteId, "accept")}
                className="rounded-full bg-tigers-secondary px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Annehmen
              </button>
              <button
                type="button"
                disabled={isPending && pendingId === invite.inviteId}
                onClick={() => respond(invite.inviteId, "decline")}
                className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Ablehnen
              </button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
