import { Trophy } from "lucide-react";
import { getDelClubName } from "@/lib/delClubs";
import { getPlayerName } from "@/lib/tigersRoster";
import type { MyBonusPrediction } from "@/app/tippspiel/bonusActions";

interface MyBonusSummaryProps {
  bonusHauptrunde: MyBonusPrediction;
  bonusPlayoffs: MyBonusPrediction;
}

function BonusRound({ title, prediction }: { title: string; prediction: MyBonusPrediction }) {
  const rows = [
    {
      label: "Hauptrundensieger",
      value: prediction.hauptrundensieger ? getDelClubName(prediction.hauptrundensieger) : null,
    },
    {
      label: "Platzierung der Tigers",
      value: prediction.platzierungTigers != null ? `${prediction.platzierungTigers}. Platz` : null,
    },
    {
      label: "Topscorer der Tigers",
      value: prediction.topscorerTigers ? getPlayerName(prediction.topscorerTigers) : null,
    },
    {
      label: "Meiste Tore bei den Tigers",
      value: prediction.meisteToreTigers ? getPlayerName(prediction.meisteToreTigers) : null,
    },
  ];
  const hasAny = rows.some((row) => row.value);

  return (
    <div>
      <p className="text-xs font-semibold tracking-wide text-amber-100/70 uppercase">{title}</p>
      {hasAny ? (
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          {rows.map((row) => (
            <div key={row.label}>
              <p className="mb-1 text-xs font-semibold text-amber-100/90">{row.label}</p>
              <div className="glass-panel-sm flex h-9 items-center rounded-lg border-amber-300/20 px-2 text-sm text-white">
                {row.value}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-amber-50/70">Noch keine Bonustipps abgegeben.</p>
      )}
    </div>
  );
}

export default function MyBonusSummary({ bonusHauptrunde, bonusPlayoffs }: MyBonusSummaryProps) {
  return (
    <div className="glass-panel mt-8 border border-amber-300/30 bg-gradient-to-br from-amber-500/15 via-amber-400/5 to-transparent p-4 sm:p-6">
      <div className="flex items-center gap-2">
        <Trophy size={20} className="shrink-0 text-amber-300" />
        <h2 className="text-lg font-bold text-amber-100">Bonustipps</h2>
      </div>

      <div className="mt-4 space-y-6">
        <BonusRound title="Hauptrunde" prediction={bonusHauptrunde} />
        <BonusRound title="Playoffs" prediction={bonusPlayoffs} />
      </div>
    </div>
  );
}
