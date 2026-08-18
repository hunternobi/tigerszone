"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Pencil } from "lucide-react";
import { updateUsername } from "@/app/profile/actions";

interface UsernameEditFormProps {
  name: string;
  nextNameChangeAt: string | null;
}

export default function UsernameEditForm({ name, nextNameChangeAt }: UsernameEditFormProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const locked = nextNameChangeAt != null && new Date(nextNameChangeAt) > new Date();
  const daysLeft = locked
    ? Math.ceil((new Date(nextNameChangeAt!).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
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
      <form onSubmit={handleSubmit} className="mt-1 flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoFocus
          className="glass-panel-sm min-w-0 flex-1 px-3 py-1.5 text-lg font-semibold text-white focus:outline-none"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-tigers-secondary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          Speichern
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white"
        >
          Abbrechen
        </button>
        {error && <p className="w-full text-xs text-red-400">{error}</p>}
      </form>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className="text-lg font-semibold text-white">{name}</p>
      <button
        type="button"
        onClick={startEdit}
        disabled={locked}
        aria-label="Benutzernamen bearbeiten"
        title={locked ? `Erneute Änderung in ${daysLeft} Tag${daysLeft === 1 ? "" : "en"} möglich` : undefined}
        className="rounded-full p-1.5 text-white transition hover:bg-white/10 hover:text-tigers-secondary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-white"
      >
        <Pencil size={14} />
      </button>
      {locked && (
        <span className="text-xs text-white/60">
          Änderung wieder in {daysLeft} Tag{daysLeft === 1 ? "" : "en"} möglich
        </span>
      )}
    </div>
  );
}
