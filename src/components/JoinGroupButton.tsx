"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { joinGroupByInviteCode } from "@/app/gruppen/actions";
import { PillActionButton } from "@/components/PillButton";

export default function JoinGroupButton({
  inviteCode,
}: {
  inviteCode: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div>
      <PillActionButton
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await joinGroupByInviteCode(inviteCode);
            if (!result.success) {
              setError(result.error ?? "Beitritt fehlgeschlagen.");
              return;
            }
            router.push("/gruppen");
            router.refresh();
          })
        }
      >
        {isPending ? "Trete bei…" : "Jetzt beitreten"}
      </PillActionButton>
      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
    </div>
  );
}
