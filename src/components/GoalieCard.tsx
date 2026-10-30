"use client";

import { useState } from "react";

export interface GoalieView {
  id: string;
  name: string;
  lastName: string;
  gp: number;
  minutes: number;
  svPct: number;
  gaa: number;
  /** League rank among goalies with enough playing time; null if too little. */
  svRank: number | null;
  gaaRank: number | null;
}

const fmt = (value: number, digits: number) =>
  value.toLocaleString("de-DE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

function Stat({
  label,
  value,
  rank,
}: {
  label: string;
  value: string;
  rank: number | null;
}) {
  return (
    <div className="min-w-0">
      <p className="font-ui text-[0.6875rem] font-semibold tracking-[0.12em] text-white/70 uppercase">
        {label}
      </p>
      <p className="font-ui mt-1 text-[1.875rem] leading-none font-semibold tracking-tight text-white tabular-nums">
        {value}
      </p>
      <span className="font-ui mt-1.5 inline-flex rounded-full border border-white/25 bg-white/10 px-1.5 py-px text-[0.625rem] font-semibold text-white tabular-nums">
        {rank ? `Platz ${rank}` : "zu wenig Einsatz"}
      </span>
    </div>
  );
}

/** The Tigers' goalies: pick one in a segmented control, see save percentage and goals against average. */
export default function GoalieCard({ goalies }: { goalies: GoalieView[] }) {
  const [selected, setSelected] = useState(goalies[0]?.id);
  const goalie = goalies.find((g) => g.id === selected) ?? goalies[0];
  if (!goalie) return null;

  return (
    <section data-liquid-glass="card" className="glass-panel p-4 sm:p-6">
      <p className="font-ui text-[0.625rem] font-semibold tracking-[0.14em] text-white/60 uppercase">
        Torhüter
      </p>

      <div
        className="mt-3 flex rounded-full border border-white/15 bg-white/10 p-1"
        role="tablist"
      >
        {goalies.map((g) => {
          const active = g.id === goalie.id;
          return (
            <button
              key={g.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSelected(g.id)}
              className={`font-ui min-w-0 flex-1 truncate rounded-full px-2 py-1.5 text-[0.8125rem] font-semibold transition ${
                active
                  ? "bg-white text-tigers-primary shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                  : "text-white/80"
              }`}
            >
              {g.lastName}
            </button>
          );
        })}
      </div>

      <h3 className="font-ui mt-4 text-[1.0625rem] leading-tight font-semibold tracking-tight break-words text-white sm:text-2xl">
        {goalie.name}
      </h3>
      <p className="mt-0.5 text-[0.75rem] text-white/60">
        {goalie.gp} {goalie.gp === 1 ? "Spiel" : "Spiele"} ·{" "}
        {fmt(goalie.minutes, 0)} Min.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-x-4">
        <Stat
          label="Fangquote"
          value={`${fmt(goalie.svPct, 1)} %`}
          rank={goalie.svRank}
        />
        <Stat
          label="Gegentorschnitt"
          value={fmt(goalie.gaa, 2)}
          rank={goalie.gaaRank}
        />
      </div>
    </section>
  );
}
