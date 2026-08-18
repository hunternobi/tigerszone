import { getDelClubName } from "@/lib/delClubs";
import { getPlayerName } from "@/lib/tigersRoster";
import type { MyBonusPrediction } from "@/app/tippspiel/bonusActions";

interface MyBonusSummaryProps {
  bonusHauptrunde: MyBonusPrediction;
  bonusPlayoffs: MyBonusPrediction;
}

function BonusSummary({ title, prediction }: { title: string; prediction: MyBonusPrediction }) {
  const rows = [
    {
      label: "Hauptrundensieger",
      value: prediction.hauptrundensieger ? getDelClubName(prediction.hauptrundensieger) : null,
    },
    {
      label: "Platzierung Tigers",
      value: prediction.platzierungTigers != null ? `${prediction.platzierungTigers}. Platz` : null,
    },
    {
      label: "Topscorer Tigers",
      value: prediction.topscorerTigers ? getPlayerName(prediction.topscorerTigers) : null,
    },
    {
      label: "Meiste Tore Tigers",
      value: prediction.meisteToreTigers ? getPlayerName(prediction.meisteToreTigers) : null,
    },
  ];
  const hasAny = rows.some((row) => row.value);

  return (
    <div>
      <p className="text-xs font-semibold tracking-wide text-white/70 uppercase">{title}</p>
      {hasAny ? (
        <dl className="mt-2 grid gap-2 sm:grid-cols-2">
          {rows.map((row) => (
            <div key={row.label} className="rounded-lg bg-white/5 px-3 py-2">
              <dt className="text-[11px] text-white/60">{row.label}</dt>
              <dd className="text-sm font-semibold text-white">{row.value ?? "–"}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-2 text-sm text-white/60">Noch keine Bonustipps abgegeben.</p>
      )}
    </div>
  );
}

export default function MyBonusSummary({ bonusHauptrunde, bonusPlayoffs }: MyBonusSummaryProps) {
  return (
    <div className="glass-panel mt-8 p-4 sm:p-6">
      <h2 className="text-lg font-bold text-white">Bonustipps</h2>
      <div className="mt-3 space-y-4">
        <BonusSummary title="Hauptrunde" prediction={bonusHauptrunde} />
        <BonusSummary title="Playoffs" prediction={bonusPlayoffs} />
      </div>
    </div>
  );
}
