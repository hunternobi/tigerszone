import { getDelClubName } from "@/lib/delClubs";
import { getPlayerName } from "@/lib/tigersRoster";
import type { MyBonusPrediction } from "@/app/tippspiel/bonusActions";

interface MyBonusSummaryProps {
  bonusHauptrunde: MyBonusPrediction;
  bonusPlayoffs: MyBonusPrediction;
}

function BonusRound({
  title,
  prediction,
}: {
  title: string;
  prediction: MyBonusPrediction;
}) {
  const rows = [
    {
      label: "Hauptrundensieger",
      value: prediction.hauptrundensieger
        ? getDelClubName(prediction.hauptrundensieger)
        : null,
    },
    {
      label: "Platzierung der Tigers",
      value:
        prediction.platzierungTigers != null
          ? `${prediction.platzierungTigers}. Platz`
          : null,
    },
    {
      label: "Topscorer der Tigers",
      value: prediction.topscorerTigers
        ? getPlayerName(prediction.topscorerTigers)
        : null,
    },
    {
      label: "Meiste Tore bei den Tigers",
      value: prediction.meisteToreTigers
        ? getPlayerName(prediction.meisteToreTigers)
        : null,
    },
  ];
  const hasAny = rows.some((row) => row.value);

  return (
    <div>
      <h3 className="font-ui text-xl font-semibold tracking-tight text-white">
        {title}
      </h3>
      {hasAny ? (
        <div className="mt-3 divide-y divide-white/10">
          {rows.map((row) => (
            <div key={row.label} className="py-3 first:pt-0 last:pb-0">
              <p className="text-[13px] font-medium text-white/60">
                {row.label}
              </p>
              <p className="mt-0.5 text-[17px] font-semibold text-white">
                {row.value ?? (
                  <span className="font-normal text-white/40">–</span>
                )}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-[15px] text-white/65">
          Noch keine Bonustipps abgegeben.
        </p>
      )}
    </div>
  );
}

export default function MyBonusSummary({
  bonusHauptrunde,
  bonusPlayoffs,
}: MyBonusSummaryProps) {
  return (
    <div data-liquid-glass="card" className="glass-panel mt-6 p-5 sm:p-6">
      {/* Amber wash that stays when the glass shader replaces the surface's own background. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-amber-400/20 via-amber-300/5 to-transparent"
      />
      <div className="relative divide-y divide-white/10 *:py-6 first:*:pt-0 last:*:pb-0">
        <BonusRound title="Hauptrunde" prediction={bonusHauptrunde} />
        <BonusRound title="Playoffs" prediction={bonusPlayoffs} />
      </div>
    </div>
  );
}
