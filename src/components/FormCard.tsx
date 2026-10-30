import { getDelClubName } from "@/lib/delClubs";
import type { Game } from "@/types";

const TIGERS_ID = "straubing-tigers";

type Outcome = "W" | "OTW" | "OTL" | "L";

function outcomeOf(game: Game): Outcome | null {
  if (game.homeScore === undefined || game.awayScore === undefined) return null;
  const home = game.homeTeamId === TIGERS_ID;
  const own = home ? game.homeScore : game.awayScore;
  const other = home ? game.awayScore : game.homeScore;
  const extra = game.overtime === "OT" || game.overtime === "SO";
  if (own > other) return extra ? "OTW" : "W";
  return extra ? "OTL" : "L";
}

const OUTCOME_STYLE: Record<Outcome, { letter: string; className: string }> = {
  W: {
    letter: "S",
    className: "border-emerald-300/40 bg-emerald-400/25 text-emerald-200",
  },
  OTW: {
    letter: "S",
    className: "border-emerald-300/30 bg-emerald-400/15 text-emerald-200",
  },
  OTL: {
    letter: "N",
    className: "border-amber-300/30 bg-amber-400/15 text-amber-200",
  },
  L: {
    letter: "N",
    className: "border-red-300/40 bg-red-400/25 text-red-200",
  },
};

const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "short",
    timeZone: "Europe/Berlin",
  });

/** The Tigers' last finished games: a row of result dots and one line per game with the final score. */
export default function FormCard({ games }: { games: Game[] }) {
  // Newest first, five games.
  const recent = games.slice(-5).reverse();
  if (recent.length === 0) return null;

  return (
    <section data-liquid-glass="card" className="glass-panel p-4 sm:p-6">
      <h3 className="font-ui text-[1.25rem] font-semibold tracking-tight text-white sm:text-2xl">
        Form
      </h3>
      <p className="mt-1 text-[0.8125rem] leading-snug text-white/60">
        Die letzten {recent.length} Spiele, Tigers-Tore zuerst
      </p>

      <div className="mt-4 flex gap-2">
        {[...recent].reverse().map((game) => {
          const outcome = outcomeOf(game);
          const style = outcome ? OUTCOME_STYLE[outcome] : null;
          return (
            <span
              key={game._id}
              className={`font-ui flex size-9 items-center justify-center rounded-full border text-[0.875rem] font-bold ${
                style?.className ?? "border-white/20 bg-white/10 text-white"
              }`}
            >
              {style?.letter ?? "–"}
            </span>
          );
        })}
      </div>

      <ul className="mt-4 divide-y divide-white/10">
        {recent.map((game) => {
          const home = game.homeTeamId === TIGERS_ID;
          const opponent = getDelClubName(
            home ? game.awayTeamId : game.homeTeamId,
          );
          const outcome = outcomeOf(game);
          const style = outcome ? OUTCOME_STYLE[outcome] : null;
          const extra =
            game.overtime === "OT"
              ? " n. V."
              : game.overtime === "SO"
                ? " n. P."
                : "";
          return (
            <li
              key={game._id}
              className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
            >
              <span className="min-w-0">
                <span className="font-ui block truncate text-[1rem] font-medium tracking-tight text-white">
                  {home ? "gegen" : "bei"} {opponent}
                </span>
                <span className="text-[0.8125rem] text-white/60">
                  {formatDay(game.kickoff)}
                  {game.matchday ? ` · ${game.matchday}. Spieltag` : ""}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="font-ui text-[1.0625rem] font-semibold text-white tabular-nums">
                  {home ? game.homeScore : game.awayScore}:
                  {home ? game.awayScore : game.homeScore}
                  <span className="text-[0.75rem] font-normal text-white/60">
                    {extra}
                  </span>
                </span>
                <span
                  className={`font-ui flex size-6 items-center justify-center rounded-full border text-[0.75rem] font-bold ${
                    style?.className ?? ""
                  }`}
                >
                  {style?.letter}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
