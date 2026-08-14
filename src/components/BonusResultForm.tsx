"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Check } from "lucide-react";
import { saveBonusResult, type BonusResultInput } from "@/app/admin/actions";
import type { BonusRound } from "@/models/BonusPrediction";
import { DEL_CLUBS } from "@/lib/delClubs";
import { TIGERS_SKATERS } from "@/lib/tigersRoster";

const CLUB_OPTIONS = DEL_CLUBS.map((club) => ({ value: club.id, label: club.name }));
const SKATER_OPTIONS = TIGERS_SKATERS.map((player) => ({
  value: player.id,
  label: `#${player.number} ${player.name}`,
}));
const PLACEMENT_OPTIONS = Array.from({ length: 14 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1}. Platz`,
}));

interface BonusResultFormProps {
  round: BonusRound;
  initial: BonusResultInput;
}

export default function BonusResultForm({ round, initial }: BonusResultFormProps) {
  const [hauptrundensieger, setHauptrundensieger] = useState(initial.hauptrundensieger ?? "");
  const [platzierungTigers, setPlatzierungTigers] = useState(
    initial.platzierungTigers != null ? String(initial.platzierungTigers) : ""
  );
  const [topscorerTigers, setTopscorerTigers] = useState(initial.topscorerTigers ?? "");
  const [meisteToreTigers, setMeisteToreTigers] = useState(initial.meisteToreTigers ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await saveBonusResult(round, {
        hauptrundensieger: hauptrundensieger || undefined,
        platzierungTigers: platzierungTigers ? Number(platzierungTigers) : undefined,
        topscorerTigers: topscorerTigers || undefined,
        meisteToreTigers: meisteToreTigers || undefined,
      });
      if (!result.success) {
        setError(result.error ?? "Speichern fehlgeschlagen.");
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel-sm p-4 sm:p-6">
      <p className="text-sm text-white">
        Richtige Auflösung für die Bonustipps. Jeder korrekte Tipp bringt allen Nutzern automatisch
        {" "}
        10 Punkte.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-white/80">Hauptrundensieger</label>
          <select
            value={hauptrundensieger}
            onChange={(e) => setHauptrundensieger(e.target.value)}
            className="glass-panel-sm h-9 w-full rounded-lg bg-transparent px-2 text-sm text-white focus:outline-none"
          >
            <option className="text-black" value="">
              Nicht festgelegt
            </option>
            {CLUB_OPTIONS.map((option) => (
              <option key={option.value} className="text-black" value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-white/80">Platzierung der Tigers</label>
          <select
            value={platzierungTigers}
            onChange={(e) => setPlatzierungTigers(e.target.value)}
            className="glass-panel-sm h-9 w-full rounded-lg bg-transparent px-2 text-sm text-white focus:outline-none"
          >
            <option className="text-black" value="">
              Nicht festgelegt
            </option>
            {PLACEMENT_OPTIONS.map((option) => (
              <option key={option.value} className="text-black" value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-white/80">Topscorer der Tigers</label>
          <select
            value={topscorerTigers}
            onChange={(e) => setTopscorerTigers(e.target.value)}
            className="glass-panel-sm h-9 w-full rounded-lg bg-transparent px-2 text-sm text-white focus:outline-none"
          >
            <option className="text-black" value="">
              Nicht festgelegt
            </option>
            {SKATER_OPTIONS.map((option) => (
              <option key={option.value} className="text-black" value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-white/80">
            Meiste Tore bei den Tigers
          </label>
          <select
            value={meisteToreTigers}
            onChange={(e) => setMeisteToreTigers(e.target.value)}
            className="glass-panel-sm h-9 w-full rounded-lg bg-transparent px-2 text-sm text-white focus:outline-none"
          >
            <option className="text-black" value="">
              Nicht festgelegt
            </option>
            {SKATER_OPTIONS.map((option) => (
              <option key={option.value} className="text-black" value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-4 flex items-center gap-1.5 rounded-full bg-tigers-secondary px-4 py-2 text-xs font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
      >
        {saved && !isPending && <Check size={14} />}
        {isPending ? "Speichert…" : saved ? "Gespeichert – Punkte vergeben" : "Auflösung speichern"}
      </button>

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </form>
  );
}
