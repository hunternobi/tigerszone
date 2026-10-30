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
        Die letzten {recent.length} Spiele der Tigers
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
          const outcome = outcomeOf(game);
          const style = outcome ? OUTCOME_STYLE[outcome] : null;
          const extra =
            game.overtime === "OT"
              ? "n. V."
              : game.overtime === "SO"
                ? "n. P."
                : "";
          const teams = [
            { id: game.homeTeamId, score: game.homeScore },
            { id: game.awayTeamId, score: game.awayScore },
          ];
          return (
            <li key={game._id} className="py-3 first:pt-0 last:pb-0">
              <p className="text-[0.75rem] text-white/60">
                {formatDay(game.kickoff)}
                {game.matchday ? ` · ${game.matchday}. Spieltag` : ""}
                {extra && ` · ${extra}`}
              </p>
              <div className="mt-1.5 flex items-center gap-3">
                <div className="min-w-0 flex-1 space-y-1.5">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <span
                        className={`font-ui min-w-0 truncate text-[1rem] tracking-tight ${
                          team.id === TIGERS_ID
                            ? "font-semibold text-white"
                            : "font-medium text-white/85"
                        }`}
                      >
                        {getDelClubName(team.id)}
                      </span>
                      <span className="font-ui flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-[1.0625rem] font-semibold text-white tabular-nums">
                        {team.score}
                      </span>
                    </div>
                  ))}
                </div>
                <span
                  className={`font-ui flex size-7 shrink-0 items-center justify-center rounded-full border text-[0.8125rem] font-bold ${
                    style?.className ?? ""
                  }`}
                >
                  {style?.letter}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
