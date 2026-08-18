"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { createGroup } from "@/app/gruppen/actions";
import GlassButtonExact from "@/components/GlassButtonExact";

export default function CreateGroupForm() {
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createGroup(name, isPublic);
      if (!result.success) {
        setError(result.error ?? "Gruppe konnte nicht erstellt werden.");
        return;
      }
      setName("");
      setIsPublic(false);
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

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setIsPublic(false)}
          className={`glass-pill glass-interactive flex-1 px-4 py-2 text-xs font-semibold text-white ${
            !isPublic ? "glass-pill-primary" : ""
          }`}
        >
          Privat
        </button>
        <button
          type="button"
          onClick={() => setIsPublic(true)}
          className={`glass-pill glass-interactive flex-1 px-4 py-2 text-xs font-semibold text-white ${
            isPublic ? "glass-pill-primary" : ""
          }`}
        >
          Öffentlich
        </button>
      </div>
      <p className="mt-2 text-xs text-white">
        {isPublic
          ? "Jeder Nutzer kann direkt beitreten."
          : "Beitritt über Einladungslink oder indem du Spieler direkt in der Gruppe einlädst."}
      </p>

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      <GlassButtonExact
        type="submit"
        size="0.875rem"
        wrapperClassName="mt-4 block w-full"
        className="block w-full text-center"
        disabled={isPending || name.trim().length < 2}
      >
        {isPending ? "Wird erstellt…" : "Gruppe erstellen"}
      </GlassButtonExact>
    </form>
  );
}
