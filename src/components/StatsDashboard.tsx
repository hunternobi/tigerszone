import GoalieCard, { type GoalieView } from "@/components/GoalieCard";
import SegmentedSwitch from "@/components/SegmentedSwitch";
import { buildFaceoffList, buildShotOptions } from "@/components/ShotStats";
import { BarRow, Card, fmt, signed } from "@/components/StatsParts";
import StatsPicker from "@/components/StatsPicker";
import Head2Head, { findOpponent } from "@/components/Head2Head";
import {
  STRAUBING_TEAM_ID,
  type GoalieStat,
  type LeagueStats,
  type PlayerStat,
  type TeamStanding,
} from "@/lib/pennyDel";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("de-DE", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  });


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
  initialStat,
}: {
  /** Which statistic the picker shows first (from the ?stat= link on the landing page). */
  initialStat?: string;
  stats: LeagueStats;
  /** Name of the next opponent; the Head2Head card is shown when it can be matched to a DEL team. */
  opponentName?: string | null;
}) {
  const faceoffList = buildFaceoffList(stats);
  const opponent = opponentName
    ? findOpponent(stats.standings, opponentName)
    : null;
  const { standings, players } = stats;
  const tigersSkaters = players.filter(
    (player) => player.teamId === STRAUBING_TEAM_ID && player.position !== "G",
  );
  // Every outfield player of the Tigers, ranked by points, goals or assists (equal values share a rank).
  const scorerLists = (
    [
      { value: "gesamt", label: "Gesamt", caption: "Tore und Assists zusammen", pick: (p: PlayerStat) => p.points },
      { value: "tore", label: "Tore", caption: "Die meisten Tore", pick: (p: PlayerStat) => p.goals },
      { value: "assists", label: "Assists", caption: "Die meisten Assists", pick: (p: PlayerStat) => p.assists },
    ] as const
  ).map(({ value, label, caption, pick }) => {
    const sorted = [...tigersSkaters].sort(
      (a, b) => pick(b) - pick(a) || b.points - a.points,
    );
    const best = pick(sorted[0]) || 1;
    return {
      value,
      label,
      caption,
      content: (
        <ol>
          {sorted.map((player, index) => {
            const rank = sorted.findIndex((p) => pick(p) === pick(player)) + 1;
            return (
              <BarRow
                key={player.id ?? player.name}
                rank={rank}
                name={player.name}
                detail={
                  value === "gesamt"
                    ? `${player.goals} T · ${player.assists} A`
                    : undefined
                }
                value={fmt(pick(player))}
                fraction={pick(player) / best}
                highlight={rank === 1 && index === 0}
              />
            );
          })}
        </ol>
      ),
    };
  });

  const pimLeaders = topBy(tigersSkaters, (p) => p.pim, 10).filter(
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
      <div>
        <h2 className="font-ui mb-3 text-[1.375rem] font-semibold tracking-tight text-white sm:text-3xl">
          Weitere Statistiken
        </h2>
        <StatsPicker
          initial={initialStat ?? "torhueter"}
          options={[
            {
              value: "strafminuten",
              label: "Strafminuten",
              content: (
                <Card
                  title="Strafminuten"
                  subtitle="Die Top 10 mit den meisten Strafminuten bei den Tigers"
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
                <Card title="Topscorer der Tigers">
                  <SegmentedSwitch
                    ariaLabel="Topscorer nach"
                    options={scorerLists}
                  />
                </Card>
              ),
            },
            {
              value: "schuesse",
              label: "Schüsse",
              content: (
                <Card title="Schüsse">
                  <SegmentedSwitch
                    ariaLabel="Schüsse nach"
                    options={buildShotOptions(stats)}
                  />
                </Card>
              ),
            },
            ...(faceoffList
              ? [
                  {
                    value: "bullys",
                    label: "Bullys",
                    content: (
                      <Card
                        title="Bullys"
                        subtitle="Gewonnene Bullys in %, Spieler ab 30 Bullys."
                      >
                        {faceoffList}
                      </Card>
                    ),
                  },
                ]
              : []),
            {
              value: "torhueter",
              label: "Torhüter",
              content: <GoalieCard goalies={tigersGoalies} />,
            },
          ]}
        />
      </div>

      <p className="px-2 text-center text-[0.75rem] leading-relaxed text-white/50">
        Stand {formatDate(stats.fetchedAt)} Uhr · Quelle: penny-del.org
      </p>
    </div>
  );
}
