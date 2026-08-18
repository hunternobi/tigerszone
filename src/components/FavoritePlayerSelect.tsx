"use client";

import { useRef, useState, useTransition, type ChangeEvent } from "react";
import { Check } from "lucide-react";
import { updateFavoritePlayer } from "@/app/profile/actions";
import { TIGERS_ROSTER } from "@/lib/tigersRoster";

interface FavoritePlayerSelectProps {
  initialPlayerId: string;
}

export default function FavoritePlayerSelect({ initialPlayerId }: FavoritePlayerSelectProps) {
  const [value, setValue] = useState(initialPlayerId);
  const [status, setStatus] = useState<"idle" | "saving" | "error" | "saved">("idle");
  const [isPending, startTransition] = useTransition();
  const savedTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    setValue(next);
    setStatus("saving");
    startTransition(async () => {
      const result = await updateFavoritePlayer(next);
      if (!result.success) {
        setStatus("error");
        return;
      }
      setStatus("saved");
      if (savedTimeout.current) clearTimeout(savedTimeout.current);
      savedTimeout.current = setTimeout(() => setStatus("idle"), 1800);
    });
  }

  return (
    <div>
      <label className="mb-1 block text-sm text-white">Lieblingsspieler</label>
      <select
        value={value}
        onChange={handleChange}
        disabled={isPending}
        className="glass-panel-sm h-10 w-full max-w-xs rounded-lg border-white/15 bg-transparent px-3 text-sm text-white focus:outline-none disabled:opacity-50"
      >
        <option className="text-black" value="">
          Kein Lieblingsspieler ausgewählt
        </option>
        {TIGERS_ROSTER.map((player) => (
          <option key={player.id} className="text-black" value={player.id}>
            #{player.number} {player.name}
          </option>
        ))}
      </select>
      {status === "error" && (
        <p className="mt-1 text-xs text-red-400">Konnte nicht gespeichert werden.</p>
      )}
      {status === "saved" && (
        <p className="mt-1 flex animate-[fadeIn_0.2s_ease-out] items-center gap-1 text-xs font-semibold text-emerald-400">
          <Check size={12} />
          Gespeichert
        </p>
      )}
    </div>
  );
}
