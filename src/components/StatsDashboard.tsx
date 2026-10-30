import type { ReactNode } from "react";
import GoalieCard, { type GoalieView } from "@/components/GoalieCard";
import StatsPicker from "@/components/StatsPicker";
import Head2Head, { findOpponent } from "@/components/Head2Head";
import {
  STRAUBING_TEAM_ID,
  type GoalieStat,
  type LeagueStats,
  type PlayerStat,
  type TeamStanding,
} from "@/lib/pennyDel";

const LABEL_CLASS =
  "font-ui text-[0.6875rem] font-semibold tracking-[0.14em] text-white/60 uppercase";

const fmt = (value: number, digits = 0) =>
  value.toLocaleString("de-DE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

const signed = (value: number, digits = 0) =>
  `${value > 0 ? "+" : ""}${fmt(value, digits)}`;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("de-DE", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  });

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section data-liquid-glass="card" className="glass-panel p-5 sm:p-6">
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
function BarRow({
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

function topBy(
  players: PlayerStat[],
  pick: (p: PlayerStat) => number | null,
  count: number,
) {
  return players
    .filter((player) => pick(player) !== null)
    .sort((a, b) => (pick(b) as number) - (pick(a) as number))
    .slice(0, count);
}

function StandingsCard({ standings }: { standings: TeamStanding[] }) {
  return (
    <Card title="Tabelle" subtitle="Hauptrunde, nach Punkten">
      <div className="grid grid-cols-[1.5rem_minmax(0,1fr)_2rem_2.5rem_2.25rem] items-center gap-x-2 px-2 pb-1.5 text-[0.6875rem] font-semibold tracking-wide text-white/50 uppercase">
        <span>#</span>
        <span>Team</span>
        <span className="text-right">Sp</span>
        <span className="text-right">TD</span>
        <span className="text-right">Pkt</span>
      </div>
      <ol className="space-y-0.5">
        {standings.map((team) => {
          const isTigers = team.id === STRAUBING_TEAM_ID;
          return (
            <li
              key={team.id}
              className={`grid grid-cols-[1.5rem_minmax(0,1fr)_2rem_2.5rem_2.25rem] items-center gap-x-2 rounded-xl px-2 py-2 text-[0.9375rem] tabular-nums ${
                isTigers
                  ? "bg-white/15 font-semibold text-white"
                  : "text-white/80"
              }`}
            >
              <span className="text-white/50">{team.rank}</span>
              <span className="font-ui truncate tracking-tight">
                {team.name}
              </span>
              <span className="text-right text-white/70">{team.gp}</span>
              <span className="text-right text-white/70">
                {signed(team.gd)}
              </span>
              <span className="text-right font-semibold text-white">
                {team.points}
              </span>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

export default function StatsDashboard({
  stats,
  opponentName,
}: {
  stats: LeagueStats;
  /** Name of the next opponent; the Head2Head card is shown when it can be matched to a DEL team. */
  opponentName?: string | null;
}) {
  const opponent = opponentName
    ? findOpponent(stats.standings, opponentName)
    : null;
  const { standings, players } = stats;
  const tigersSkaters = players.filter(
    (player) => player.teamId === STRAUBING_TEAM_ID && player.position !== "G",
  );
  const scorers = topBy(tigersSkaters, (p) => p.points, 5);
  const scorerMax = scorers[0]?.points || 1;

  const withXg = tigersSkaters.filter(
    (p) => p.xg !== null && p.xgDiff !== null && (p.xg ?? 0) >= 1,
  );
  const overperformers = topBy(withXg, (p) => p.xgDiff, 3).filter(
    (p) => (p.xgDiff ?? 0) > 0,
  );
  const underperformers = topBy(withXg, (p) => -(p.xgDiff ?? 0), 3).filter(
    (p) => (p.xgDiff ?? 0) < 0,
  );

  const pimLeaders = topBy(tigersSkaters, (p) => p.pim, 3).filter(
    (p) => p.pim > 0,
  );

  // Goalies need some playing time before a league rank means anything.
  const MIN_MINUTES = 180;
  const qualified = stats.goalies.filter((g) => g.minutes >= MIN_MINUTES);
  const rankIn = (
    goalie: GoalieStat,
    better: (a: GoalieStat, b: GoalieStat) => number,
  ) =>
    goalie.minutes >= MIN_MINUTES
      ? [...qualified].sort(better).findIndex((g) => g.id === goalie.id) + 1
      : null;
  const tigersGoalies: GoalieView[] = stats.goalies
    .filter((g) => g.teamId === STRAUBING_TEAM_ID)
    .sort((a, b) => b.minutes - a.minutes)
    .map((g) => ({
      id: String(g.id ?? g.name),
      name: g.name,
      lastName: g.name.split(" ").slice(-1)[0],
      gp: g.gp,
      minutes: g.minutes,
      svPct: g.svPct,
      gaa: g.gaa,
      svRank: rankIn(g, (a, b) => b.svPct - a.svPct),
      gaaRank: rankIn(g, (a, b) => a.gaa - b.gaa),
    }));

  return (
    <div className="space-y-6">
      {opponent && <Head2Head stats={stats} opponent={opponent} />}
      <StatsPicker
        initial="torhueter"
        options={[
          {
            value: "xg",
            label: "Expected Goals",
            content: (
              <Card
                title="Glück oder Können?"
                subtitle="Tore im Vergleich zu den Torchancen (Expected Goals)"
              >
                <div className="space-y-5">
                  {overperformers.length > 0 && (
                    <div>
                      <p className={LABEL_CLASS}>Mehr Tore als erwartet</p>
                      <ul className="mt-2 divide-y divide-white/10">
                        {overperformers.map((player) => (
                          <XgRow
                            key={player.id ?? player.name}
                            player={player}
                          />
                        ))}
                      </ul>
                    </div>
                  )}
                  {underperformers.length > 0 && (
                    <div>
                      <p className={LABEL_CLASS}>Weniger Tore als erwartet</p>
                      <ul className="mt-2 divide-y divide-white/10">
                        {underperformers.map((player) => (
                          <XgRow
                            key={player.id ?? player.name}
                            player={player}
                          />
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            ),
          },
          {
            value: "strafminuten",
            label: "Strafminuten",
            content: (
              <Card
                title="Strafminuten"
                subtitle="Die meisten Strafminuten bei den Tigers"
              >
                <ol>
                  {pimLeaders.map((player, index) => (
                    <BarRow
                      key={player.id ?? player.name}
                      rank={index + 1}
                      name={player.name}
                      value={`${fmt(player.pim)} Min.`}
                      fraction={player.pim / (pimLeaders[0]?.pim || 1)}
                      highlight={index === 0}
                    />
                  ))}
                </ol>
              </Card>
            ),
          },
          {
            value: "tabelle",
            label: "Tabelle",
            content: <StandingsCard standings={standings} />,
          },
          {
            value: "topscorer",
            label: "Topscorer",
            content: (
              <Card
                title="Topscorer der Tigers"
                subtitle="Tore und Assists zusammen"
              >
                <ol>
                  {scorers.map((player, index) => (
                    <BarRow
                      key={player.id ?? player.name}
                      rank={index + 1}
                      name={player.name}
                      detail={`${player.goals} T · ${player.assists} A`}
                      value={fmt(player.points)}
                      fraction={player.points / scorerMax}
                      highlight={index === 0}
                    />
                  ))}
                </ol>
              </Card>
            ),
          },
          {
            value: "torhueter",
            label: "Torhüter",
            content: <GoalieCard goalies={tigersGoalies} />,
          },
        ]}
      />

      <p className="px-2 text-center text-[0.75rem] leading-relaxed text-white/50">
        Stand {formatDate(stats.fetchedAt)} Uhr · aktualisiert sich nach jedem
        Spieltag · Quelle: penny-del.org
      </p>
    </div>
  );
}

function XgRow({ player }: { player: PlayerStat }) {
  const diff = player.xgDiff ?? 0;
  return (
    <li className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
      <span className="min-w-0">
        <span className="font-ui block truncate text-[1rem] font-medium tracking-tight text-white">
          {player.name}
        </span>
        <span className="text-[0.8125rem] text-white/60">
          {player.goals} Tore · {fmt(player.xg ?? 0, 1)} erwartet
        </span>
      </span>
      <span
        className={`shrink-0 rounded-full border px-2.5 py-1 text-[0.8125rem] font-bold tabular-nums ${
          diff > 0
            ? "border-emerald-300/30 bg-emerald-400/15 text-emerald-300"
            : "border-red-300/30 bg-red-400/15 text-red-300"
        }`}
      >
        {signed(diff, 1)}
      </span>
    </li>
  );
}
