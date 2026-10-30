"use client";

import { createPortal } from "react-dom";
import { useState, useTransition } from "react";
import { signOut } from "next-auth/react";
import { Trash2 } from "lucide-react";
import { deleteMyAccount } from "@/app/profile/actions";

export default function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteMyAccount();
      if (!result.success) {
        setError(result.error ?? "Account konnte nicht gelöscht werden.");
        return;
      }
      await signOut({ callbackUrl: "/" });
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-4 text-[0.9375rem] font-semibold text-red-300 transition hover:bg-white/10 active:bg-white/15"
      >
        <Trash2 size={16} />
        Account löschen
      </button>

      {open &&
        createPortal(
          // Action sheet, iOS style: blurred backdrop, a popover with the warning and two stacked actions.
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
            onClick={() => !isPending && setOpen(false)}
          >
            <div
              className="glass-popover w-full max-w-sm rounded-3xl p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-ui text-center text-xl font-semibold tracking-tight text-white">
                Account löschen?
              </h3>
              <p className="mt-2 text-center text-[0.9375rem] leading-snug text-white/80">
                Alle deine Tipps, Bonustipps und Gruppenmitgliedschaften werden
                entfernt. Das kann nicht rückgängig gemacht werden.
              </p>

              {error && (
                <p className="mt-3 text-center text-xs text-red-300">{error}</p>
              )}

              <div className="mt-5 space-y-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="min-h-[48px] w-full rounded-2xl bg-red-500 text-[1rem] font-semibold text-white transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                >
                  {isPending ? "Wird gelöscht…" : "Ja, Account löschen"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                  className="min-h-[48px] w-full rounded-2xl bg-white/15 text-[1rem] font-semibold text-white transition hover:bg-white/20 active:scale-[0.98] disabled:opacity-50"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
