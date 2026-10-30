"use client";

import { useRef, useState, useTransition } from "react";
import { updateFavoritePlayer } from "@/app/profile/actions";
import CustomSelect from "@/components/CustomSelect";
import SavedBadge, { SAVED_BADGE_MS } from "@/components/SavedBadge";
import { TIGERS_ROSTER } from "@/lib/tigersRoster";

interface FavoritePlayerSelectProps {
  initialPlayerId: string;
}

const OPTIONS = [
  { value: "", label: "Kein Lieblingsspieler ausgewählt" },
  ...TIGERS_ROSTER.map((player) => ({
    value: player.id,
    label: `#${player.number} ${player.name}`,
  })),
];

export default function FavoritePlayerSelect({
  initialPlayerId,
}: FavoritePlayerSelectProps) {
  const [value, setValue] = useState(initialPlayerId);
  const [status, setStatus] = useState<"idle" | "saving" | "error" | "saved">(
    "idle",
  );
  const [isPending, startTransition] = useTransition();
  const savedTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  function handleChange(next: string) {
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
      savedTimeout.current = setTimeout(
        () => setStatus("idle"),
        SAVED_BADGE_MS,
      );
    });
  }

  return (
    <div>
      <div className="flex h-[22px] items-center justify-between gap-2">
        <label className="font-ui text-[0.6875rem] font-semibold tracking-[0.14em] text-white/60 uppercase">
          Lieblingsspieler
        </label>
        {status === "saved" && <SavedBadge label="Gespeichert" />}
      </div>
      <div className="mt-1.5">
        <CustomSelect
          value={value}
          onChange={handleChange}
          options={OPTIONS}
          disabled={isPending}
          aria-label="Lieblingsspieler"
        />
      </div>
      {status === "error" && (
        <p className="mt-1.5 text-xs text-red-300">
          Konnte nicht gespeichert werden.
        </p>
      )}
    </div>
  );
}
