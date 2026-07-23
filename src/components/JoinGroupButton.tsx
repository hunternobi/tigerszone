"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { joinGroupByInviteCode } from "@/app/gruppen/actions";

export default function JoinGroupButton({ inviteCode }: { inviteCode: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div>
      <button
        type="button"
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
        className="glass-pill glass-pill-primary glass-interactive px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        {isPending ? "Trete bei…" : "Jetzt beitreten"}
      </button>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  );
}
