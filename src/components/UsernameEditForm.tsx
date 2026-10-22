"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Pencil } from "lucide-react";
import { updateUsername } from "@/app/profile/actions";
import { PillActionButton } from "@/components/PillButton";

interface UsernameEditFormProps {
  name: string;
  nextNameChangeAt: string | null;
}

export default function UsernameEditForm({
  name,
  nextNameChangeAt,
}: UsernameEditFormProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const locked =
    nextNameChangeAt != null && new Date(nextNameChangeAt) > new Date();
  const daysLeft = locked
    ? Math.ceil(
        (new Date(nextNameChangeAt!).getTime() - Date.now()) /
          (24 * 60 * 60 * 1000),
      )
    : 0;

  function startEdit() {
    setDraft(name);
    setError(null);
    setEditing(true);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateUsername(draft);
      if (!result.success) {
        setError(result.error ?? "Konnte nicht gespeichert werden.");
        return;
      }
      setEditing(false);
      router.refresh();
    });
  }

  if (editing) {
    return (
      <form
        onSubmit={handleSubmit}
        className="mt-2 flex flex-wrap items-center gap-2"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoFocus
          aria-label="Benutzername"
          className="h-11 min-w-0 flex-1 rounded-xl border border-white/20 bg-white/15 px-3.5 text-[17px] font-semibold text-white focus:border-white/60 focus:outline-none"
        />
        <PillActionButton type="submit" compact disabled={isPending}>
          Speichern
        </PillActionButton>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="min-h-[34px] rounded-full border border-white/20 px-3.5 text-[13px] font-semibold text-white transition hover:bg-white/10"
        >
          Abbrechen
        </button>
        {error && <p className="w-full text-xs text-red-300">{error}</p>}
      </form>
    );
  }

  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
      <p className="font-ui min-w-0 text-[22px] font-semibold tracking-tight break-words text-white">
        {name}
      </p>
      <button
        type="button"
        onClick={startEdit}
        disabled={locked}
        aria-label="Benutzernamen bearbeiten"
        title={
          locked
            ? `Erneute Änderung in ${daysLeft} Tag${daysLeft === 1 ? "" : "en"} möglich`
            : undefined
        }
        className="rounded-full border border-white/15 bg-white/10 p-2 text-white/80 transition hover:bg-white/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/10"
      >
        <Pencil size={14} />
      </button>
      {locked && (
        <span className="w-full text-[13px] text-white/60">
          Änderung wieder in {daysLeft} Tag{daysLeft === 1 ? "" : "en"} möglich
        </span>
      )}
    </div>
  );
}
