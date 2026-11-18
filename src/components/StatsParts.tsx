import type { ReactNode } from "react";

export const fmt = (value: number, digits = 0) =>
  value.toLocaleString("de-DE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

export const signed = (value: number, digits = 0) =>
  `${value > 0 ? "+" : ""}${fmt(value, digits)}`;

export function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="glass-panel p-5 sm:p-6">
      <h3 className="font-ui text-xl font-semibold tracking-tight text-white sm:text-2xl">
        {title}
      </h3>
      {subtitle && (
        <p className="mt-1 text-[0.875rem] leading-snug text-white/60">
          {subtitle}
        </p>
      )}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** One row of a ranking: rank, name, value, and a bar relative to the best value of the list. */
export function BarRow({
  rank,
  name,
  detail,
  value,
  fraction,
  highlight,
}: {
  rank: number;
  name: string;
  detail?: string;
  value: string;
  fraction: number;
  highlight: boolean;
}) {
  return (
    <li className="py-2.5 first:pt-0 last:pb-0">
      <div className="flex items-baseline justify-between gap-3">
        <span className="flex min-w-0 items-baseline gap-2">
          <span className="w-5 shrink-0 text-[0.875rem] font-semibold text-white/50 tabular-nums">
            {rank}
          </span>
          <span
            className={`font-ui truncate text-[1rem] tracking-tight ${
              highlight
                ? "font-semibold text-white"
                : "font-medium text-white/85"
            }`}
          >
            {name}
          </span>
          {detail && (
            <span className="shrink-0 text-[0.75rem] text-white/50">
              {detail}
            </span>
          )}
        </span>
        <span className="font-ui shrink-0 text-[1.0625rem] font-semibold text-white tabular-nums">
          {value}
        </span>
      </div>
      <div className="mt-1.5 ml-7 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${highlight ? "bg-white" : "bg-white/35"}`}
          style={{ width: `${Math.max(4, Math.round(fraction * 100))}%` }}
        />
      </div>
    </li>
  );
}

/** A big number with a label above and a small line below (team numbers with their place in the league). */
export function StatTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-3.5 py-3">
      <p className="font-ui text-[0.6875rem] font-semibold tracking-[0.12em] text-white/70 uppercase">
        {label}
      </p>
      <p className="font-ui mt-1 text-[1.75rem] leading-none font-semibold tracking-tight text-white tabular-nums">
        {value}
      </p>
      {sub && <p className="mt-1.5 text-[0.8125rem] text-white/70">{sub}</p>}
    </div>
  );
}

/** "Platz 3 von 14" */
export const placeOf = (rank: number, of: number) => `Platz ${rank} von ${of}`;
