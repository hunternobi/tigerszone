"use client";

import { useEffect, useRef, useState, useTransition, type ChangeEvent } from "react";
import { Check, Trophy } from "lucide-react";
import { submitBonusTip, type BonusField, type MyBonusPrediction } from "@/app/tippspiel/bonusActions";
import { DEL_CLUBS } from "@/lib/delClubs";
import { TIGERS_SKATERS } from "@/lib/tigersRoster";

interface BonusTipsCardProps {
  initial: MyBonusPrediction;
  isAuthenticated: boolean;
  locked: boolean;
}

interface FieldConfig {
  field: BonusField;
  label: string;
  options: { value: string; label: string }[];
}

const PLACEMENT_OPTIONS = Array.from({ length: 14 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1}. Platz`,
}));

const CLUB_OPTIONS = DEL_CLUBS.map((club) => ({ value: club.id, label: club.name }));

const SKATER_OPTIONS = TIGERS_SKATERS.map((player) => ({
  value: player.id,
  label: `#${player.number} ${player.name}`,
}));

const FIELDS: FieldConfig[] = [
  { field: "hauptrundensieger", label: "Hauptrundensieger", options: CLUB_OPTIONS },
  { field: "platzierungTigers", label: "Platzierung der Tigers", options: PLACEMENT_OPTIONS },
  { field: "topscorerTigers", label: "Topscorer der Tigers", options: SKATER_OPTIONS },
  { field: "meisteToreTigers", label: "Meiste Tore bei den Tigers", options: SKATER_OPTIONS },
];

function BonusTipField({
  field,
  label,
  options,
  initialValue,
  disabled,
}: FieldConfig & { initialValue: string; disabled: boolean }) {
  const [value, setValue] = useState(initialValue);
  const [saved, setSaved] = useState(initialValue);
  const [status, setStatus] = useState<"idle" | "saving" | "error" | "saved">("idle");
  const [isPending, startTransition] = useTransition();
  const savedTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (savedTimeout.current) clearTimeout(savedTimeout.current);
    };
  }, []);

  function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    setValue(next);
    if (next === "" || next === saved) return;

    setStatus("saving");
    startTransition(async () => {
      const result = await submitBonusTip("hauptrunde", field, next);
      if (!result.success) {
        setStatus("error");
        return;
      }
      setSaved(next);
      setStatus("saved");
      if (savedTimeout.current) clearTimeout(savedTimeout.current);
      savedTimeout.current = setTimeout(() => setStatus("idle"), 1800);
    });
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-amber-100/90">{label}</label>
      <select
        value={value}
        onChange={handleChange}
        disabled={disabled || isPending}
        className="glass-select h-9 w-full rounded-lg px-2 text-sm text-white focus:outline-none disabled:opacity-50"
      >
        <option className="text-black" value="">
          Bitte wählen
        </option>
        {options.map((option) => (
          <option key={option.value} className="text-black" value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {status === "error" && <p className="mt-1 text-[11px] text-red-400">Konnte nicht gespeichert werden.</p>}
      {status === "saved" && (
        <p className="mt-1 flex animate-[fadeIn_0.2s_ease-out] items-center gap-1 text-[11px] font-semibold text-emerald-400">
          <Check size={11} />
          Tipp gespeichert
        </p>
      )}
    </div>
  );
}

export default function BonusTipsCard({ initial, isAuthenticated, locked }: BonusTipsCardProps) {
  const disabled = !isAuthenticated || locked;

  return (
    <div className="glass-panel mb-8 border border-amber-300/30 bg-gradient-to-br from-amber-500/15 via-amber-400/5 to-transparent p-4 sm:p-6">
      <div className="flex items-center gap-2">
        <Trophy size={20} className="shrink-0 text-amber-300" />
        <h2 className="text-lg font-bold text-amber-100">Bonustipps</h2>
      </div>
      <p className="mt-2 text-sm text-amber-50/90">
        Tippe vor der Saison und sichere dir zusätzliche Punkte, jeder richtige Bonustipp erhält
        10 Extrapunkte am Ende der Hauptrunde.
      </p>

      {locked && (
        <p className="mt-3 text-xs font-semibold text-amber-200">
          Die Abgabe ist geschlossen – die Hauptrunde hat begonnen.
        </p>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {FIELDS.map((config) => (
          <BonusTipField
            key={config.field}
            {...config}
            initialValue={
              config.field === "platzierungTigers"
                ? initial.platzierungTigers != null
                  ? String(initial.platzierungTigers)
                  : ""
                : (initial[config.field] as string | undefined) ?? ""
            }
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}
