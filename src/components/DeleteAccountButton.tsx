"use client";

import { createPortal } from "react-dom";
import { useState, useTransition } from "react";
import { signOut } from "next-auth/react";
import { AlertTriangle, Trash2, X } from "lucide-react";
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
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 transition hover:underline"
      >
        <Trash2 size={13} />
        Account löschen
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => !isPending && setOpen(false)}
          >
            <div
              className="glass-panel w-full max-w-sm p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="shrink-0 text-red-400" />
                  <h3 className="text-base font-bold text-white">Account löschen</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                  aria-label="Schließen"
                  className="rounded-full p-1 text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="mt-3 text-sm text-white">
                Möchtest du deinen Account wirklich löschen? Alle deine Tipps, Bonustipps und
                Gruppenmitgliedschaften werden entfernt. Das kann nicht rückgängig gemacht werden.
              </p>

              {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                  className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="rounded-full bg-red-500 px-4 py-1.5 text-xs font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
                >
                  {isPending ? "Wird gelöscht…" : "Ja, Account löschen"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
