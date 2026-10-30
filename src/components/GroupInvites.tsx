"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  acceptGroupInvite,
  declineGroupInvite,
  type MyGroupInvite,
} from "@/app/gruppen/actions";
import { PillActionButton } from "@/components/PillButton";

interface GroupInvitesProps {
  invites: MyGroupInvite[];
}

export default function GroupInvites({ invites }: GroupInvitesProps) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // No invites at load time: nothing to render. Once the last one is answered the card is hidden, not
  // unmounted (it is a glass surface that has to stay mounted).
  if (invites.length === 0) return null;
  const visible = invites.filter((invite) => !dismissed.has(invite.inviteId));

  function respond(inviteId: string, action: "accept" | "decline") {
    setError(null);
    setPendingId(inviteId);
    startTransition(async () => {
      const result =
        action === "accept"
          ? await acceptGroupInvite(inviteId)
          : await declineGroupInvite(inviteId);
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
    <div
      data-liquid-glass="card"
      className={`glass-panel mt-6 p-5 ${visible.length === 0 ? "hidden" : ""}`}
    >
      <h2 className="font-ui text-xl font-semibold tracking-tight text-white">
        Gruppeneinladungen
      </h2>
      {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
      <div className="mt-2 divide-y divide-white/10">
        {visible.map((invite) => (
          <div
            key={invite.inviteId}
            className="flex flex-wrap items-center justify-between gap-3 py-3.5"
          >
            <p className="min-w-0 flex-1 text-[1rem] leading-snug text-white/85">
              <span className="font-semibold text-white">
                {invite.invitedByName}
              </span>{" "}
              hat dich zur Gruppe{" "}
              <span className="font-semibold text-white">
                {invite.groupName}
              </span>{" "}
              eingeladen.
            </p>
            <span className="flex shrink-0 items-center gap-2">
              <PillActionButton
                compact
                disabled={isPending && pendingId === invite.inviteId}
                onClick={() => respond(invite.inviteId, "accept")}
              >
                Annehmen
              </PillActionButton>
              <button
                type="button"
                disabled={isPending && pendingId === invite.inviteId}
                onClick={() => respond(invite.inviteId, "decline")}
                className="min-h-[34px] rounded-full border border-white/20 px-3.5 text-[0.8125rem] font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
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
