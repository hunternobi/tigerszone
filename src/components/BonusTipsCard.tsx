"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Clock } from "lucide-react";
import SavedBadge, { SAVED_BADGE_MS } from "@/components/SavedBadge";
import {
  submitBonusTip,
  type BonusField,
  type MyBonusPrediction,
} from "@/app/tippspiel/bonusActions";
import { DEL_CLUBS } from "@/lib/delClubs";
import { TIGERS_SKATERS } from "@/lib/tigersRoster";
import CustomSelect from "@/components/CustomSelect";

interface BonusTipsCardProps {
  initial: MyBonusPrediction;
  isAuthenticated: boolean;
  deadline: string | null;
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return "Abgabe geschlossen";

  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) return `Noch ${days} Tag${days === 1 ? "" : "e"} ${hours} Std.`;
  if (hours > 0) return `Noch ${hours} Std. ${minutes} Min.`;
  return `Noch ${minutes} Min.`;
}

function DeadlineCountdown({ deadline }: { deadline: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // Timer callbacks only: setting state straight in the effect body would render twice.
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const interval = setInterval(tick, 30000);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [deadline]);

  if (now === null) return null;

  const remaining = new Date(deadline).getTime() - now;

  return (
    <span className="flex shrink-0 items-center gap-1 rounded-full border border-amber-300/30 bg-amber-500/15 px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap text-amber-100 sm:text-xs">
      <Clock size={12} className="shrink-0" />
      {formatRemaining(remaining)}
    </span>
  );
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

const CLUB_OPTIONS = DEL_CLUBS.map((club) => ({
  value: club.id,
  label: club.name,
}));

const SKATER_OPTIONS = TIGERS_SKATERS.map((player) => ({
  value: player.id,
  label: `#${player.number} ${player.name}`,
}));

const FIELDS: FieldConfig[] = [
  {
    field: "hauptrundensieger",
    label: "Hauptrundensieger",
    options: CLUB_OPTIONS,
  },
  {
    field: "platzierungTigers",
    label: "Platzierung der Tigers",
    options: PLACEMENT_OPTIONS,
  },
  {
    field: "topscorerTigers",
    label: "Topscorer der Tigers",
    options: SKATER_OPTIONS,
  },
  {
    field: "meisteToreTigers",
    label: "Meiste Tore bei den Tigers",
    options: SKATER_OPTIONS,
  },
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
  const [status, setStatus] = useState<"idle" | "saving" | "error" | "saved">(
    "idle",
  );
  const [isPending, startTransition] = useTransition();
  const savedTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    return () => {
      if (savedTimeout.current) clearTimeout(savedTimeout.current);
    };
  }, []);

  function handleChange(next: string) {
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
      savedTimeout.current = setTimeout(
        () => setStatus("idle"),
        SAVED_BADGE_MS,
      );
    });
  }

  return (
    <div>
      <div className="mb-1.5 flex h-[22px] items-center justify-between gap-2">
        <label className="text-[13px] font-medium text-white/70">{label}</label>
        {status === "saved" && <SavedBadge />}
      </div>
      <CustomSelect
        value={value}
        onChange={handleChange}
        options={options}
        disabled={disabled || isPending}
        aria-label={label}
      />
      {status === "error" && (
        <p className="mt-1.5 text-[11px] text-red-300">
          Konnte nicht gespeichert werden.
        </p>
      )}
    </div>
  );
}

export default function BonusTipsCard({
  initial,
  isAuthenticated,
  deadline,
}: BonusTipsCardProps) {
  const disabled = !isAuthenticated;

  return (
    <div data-liquid-glass="card" className="glass-panel p-4 sm:p-6">
      {/* Amber wash that stays when the glass shader replaces the surface's own background. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-amber-400/20 via-amber-300/5 to-transparent"
      />
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-ui text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Bonustipps
          </h2>
          {deadline && <DeadlineCountdown deadline={deadline} />}
        </div>
        <p className="mt-2 text-[15px] leading-snug text-white/75">
          Tippe vor der Saison und sichere dir zusätzliche Punkte, jeder
          richtige Bonustipp erhält 10 Extrapunkte am Ende der Hauptrunde.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {FIELDS.map((config) => (
            <BonusTipField
              key={config.field}
              {...config}
              initialValue={
                config.field === "platzierungTigers"
                  ? initial.platzierungTigers != null
                    ? String(initial.platzierungTigers)
                    : ""
                  : ((initial[config.field] as string | undefined) ?? "")
              }
              disabled={disabled}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
