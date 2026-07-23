"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { createGroup } from "@/app/gruppen/actions";

export default function CreateGroupForm() {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createGroup(name);
      if (!result.success) {
        setError(result.error ?? "Gruppe konnte nicht erstellt werden.");
        return;
      }
      setName("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel h-fit p-6">
      <h2 className="text-lg font-bold text-white">Neue Gruppe erstellen</h2>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Gruppenname"
        className="glass-panel-sm mt-4 w-full px-4 py-2 text-white focus:outline-none"
      />
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={isPending || name.trim().length < 2}
        className="mt-4 w-full rounded-full bg-tigers-secondary px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Wird erstellt…" : "Gruppe erstellen"}
      </button>
    </form>
  );
}
