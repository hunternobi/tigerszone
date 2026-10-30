"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { createGroup } from "@/app/gruppen/actions";
import { PillActionButton } from "@/components/PillButton";

/** Lives inside the glass card of "Meine Gruppen" (no panel of its own). */
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
    <form onSubmit={handleSubmit} className="p-4 sm:p-5">
      <h3 className="font-ui text-xl font-semibold tracking-tight text-white">
        Neue Gruppe erstellen
      </h3>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Gruppenname"
        aria-label="Gruppenname"
        className="mt-3 h-11 w-full rounded-xl border border-white/20 bg-white/15 px-3.5 text-[1rem] text-white placeholder:text-white/50 focus:border-white/60 focus:outline-none"
      />

      {/* Segmented control, iOS style */}
      <div
        role="tablist"
        className="mt-3 flex rounded-full border border-white/15 bg-white/10 p-1"
      >
        {([false, true] as const).map((value) => (
          <button
            key={String(value)}
            type="button"
            role="tab"
            aria-selected={isPublic === value}
            onClick={() => setIsPublic(value)}
            className={`min-h-[36px] flex-1 rounded-full text-[0.9375rem] font-semibold transition ${
              isPublic === value
                ? "bg-white text-tigers-primary shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                : "text-white/75 hover:text-white"
            }`}
          >
            {value ? "Öffentlich" : "Privat"}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[0.8125rem] leading-snug text-white/65">
        {isPublic
          ? "Jeder Nutzer kann direkt beitreten."
          : "Beitritt über Einladungslink oder indem du Spieler direkt in der Gruppe einlädst."}
      </p>

      {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
      <div className="mt-4">
        <PillActionButton
          type="submit"
          disabled={isPending || name.trim().length < 2}
        >
          {isPending ? "Wird erstellt…" : "Gruppe erstellen"}
        </PillActionButton>
      </div>
    </form>
  );
}
