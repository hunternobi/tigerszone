import {
  STRAUBING_TEAM_ID,
  type LeagueStats,
  type PlayerStat,
  type TeamSpecialStat,
  type TeamStanding,
} from "@/lib/pennyDel";

const fmt = (value: number, digits = 0) =>
  value.toLocaleString("de-DE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

const normalize = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

/** Finds the penny-del.org team for a club name of our own list ("Fischtown Pinguins Bremerhaven" vs "Pinguins Bremerhaven"). */
export function findOpponent(
  standings: TeamStanding[],
  clubName: string,
): TeamStanding | null {
  const wanted = normalize(clubName);
  return (
    standings.find((team) => {
      const candidate = normalize(team.name);
      return wanted.includes(candidate) || candidate.includes(wanted);
    }) ?? null
  );
}

interface Side {
  /** Big number. */
  value: string;
  /** Small line below the number. */
  note?: string;
  /** League rank (1 = best). */
  rank: number;
  /** The rank itself is the big number, so no "Platz" pill. */
  hideRank?: boolean;
  /** Text instead of a number (a player's name): smaller type. */
  text?: boolean;
}

interface Row {
  label: string;
  tigers: Side;
  opponent: Side;
}

/** Rank of `id` when sorting `items` by `pick`, highest first. */
function rankOf<T extends { teamId: number }>(
  items: T[],
  id: number,
  pick: (item: T) => number,
) {
  const sorted = [...items].sort((a, b) => pick(b) - pick(a));
  return sorted.findIndex((item) => item.teamId === id) + 1;
}

function bestScorerOf(players: PlayerStat[], teamId: number) {
  const skaters = players.filter((p) => p.position !== "G");
  const byScoring = [...skaters].sort(
    (a, b) => b.points - a.points || b.goals - a.goals,
  );
  const index = byScoring.findIndex((p) => p.teamId === teamId);
  return index < 0 ? null : { player: byScoring[index], rank: index + 1 };
}

const goalsAndAssists = (player: PlayerStat) =>
  `${player.goals} ${player.goals === 1 ? "Tor" : "Tore"} · ${player.assists} ${
    player.assists === 1 ? "Assist" : "Assists"
  }`;

function buildRows(stats: LeagueStats, opponent: TeamStanding): Row[] {
  const { standings, players, teamStats } = stats;
  const tigers = standings.find((team) => team.id === STRAUBING_TEAM_ID);
  if (!tigers) return [];

  const rows: Row[] = [
    {
      label: "Tabellenplatz",
      tigers: {
        value: `${tigers.rank}`,
        note: `${tigers.points} Punkte`,
        rank: tigers.rank,
        hideRank: true,
      },
      opponent: {
        value: `${opponent.rank}`,
        note: `${opponent.points} Punkte`,
        rank: opponent.rank,
        hideRank: true,
      },
    },
  ];

  const tigersScorer = bestScorerOf(players, tigers.id);
  const opponentScorer = bestScorerOf(players, opponent.id);
  if (tigersScorer && opponentScorer) {
    rows.push({
      label: "Top Scorer",
      tigers: {
        value: tigersScorer.player.name,
        note: goalsAndAssists(tigersScorer.player),
        rank: tigersScorer.rank,
        text: true,
      },
      opponent: {
        value: opponentScorer.player.name,
        note: goalsAndAssists(opponentScorer.player),
        rank: opponentScorer.rank,
        text: true,
      },
    });
  }

  const mine = teamStats.find((team) => team.teamId === tigers.id);
  const theirs = teamStats.find((team) => team.teamId === opponent.id);
  if (mine && theirs) {
    const side = (
      team: TeamSpecialStat,
      pick: (t: TeamSpecialStat) => number,
      note?: (t: TeamSpecialStat) => string,
    ): Side => ({
      value: `${fmt(pick(team), 1)} %`,
      note: note?.(team),
      rank: rankOf(teamStats, team.teamId, pick),
    });
    rows.push(
      {
        label: "Überzahl",
        tigers: side(mine, (t) => t.ppPct),
        opponent: side(theirs, (t) => t.ppPct),
      },
      {
        label: "Unterzahl",
        tigers: side(mine, (t) => t.pkPct),
        opponent: side(theirs, (t) => t.pkPct),
      },
      {
        label: "Schusseffizienz",
        tigers: side(mine, (t) => t.shootingPct),
        opponent: side(theirs, (t) => t.shootingPct),
      },
    );
  }
  return rows;
}

function RankPill({ rank, better }: { rank: number; better: boolean }) {
  return (
    <span
      className={`font-ui inline-flex items-center rounded-full border px-1.5 py-px text-[10px] font-semibold tabular-nums ${
        better
          ? "border-white/40 bg-white/20 text-white"
          : "border-white/15 bg-white/5 text-white/60"
      }`}
    >
      Platz {rank}
    </span>
  );
}

function SideCell({
  side,
  better,
  align,
}: {
  side: Side;
  better: boolean;
  align: "left" | "right";
}) {
  return (
    <div
      className={`flex min-w-0 flex-col gap-0.5 ${
        align === "right" ? "items-end text-right" : "items-start text-left"
      }`}
    >
      <p
        className={`font-ui leading-tight font-semibold tracking-tight tabular-nums ${
          side.text
            ? "line-clamp-2 text-[15px] break-words sm:text-[20px]"
            : "text-[24px] leading-none sm:text-[30px]"
        } ${better ? "text-white" : "text-white/60"}`}
      >
        {side.value}
      </p>
      {!side.hideRank && <RankPill rank={side.rank} better={better} />}
      {side.note && (
        <p className="max-w-full truncate text-[11px] leading-snug text-white/50">
          {side.note}
        </p>
      )}
    </div>
  );
}

/** Tigers against their next opponent, one comparison row per category with the league rank of each side. */
export default function Head2Head({
  stats,
  opponent,
}: {
  stats: LeagueStats;
  opponent: TeamStanding;
}) {
  const tigers = stats.standings.find((team) => team.id === STRAUBING_TEAM_ID);
  const rows = buildRows(stats, opponent);
  if (!tigers || rows.length === 0) return null;

  return (
    <section data-liquid-glass="card" className="glass-panel p-4 sm:p-6">
      <p className="font-ui text-[10px] font-semibold tracking-[0.14em] text-white/60 uppercase">
        Head2Head
      </p>
      <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-2">
        <h3 className="font-ui text-[15px] leading-tight font-semibold tracking-tight break-words text-white sm:text-2xl">
          {tigers.name}
        </h3>
        <span className="text-[11px] font-medium text-white/50">vs.</span>
        <h3 className="font-ui text-right text-[15px] leading-tight font-semibold tracking-tight break-words text-white sm:text-2xl">
          {opponent.name}
        </h3>
      </div>

      <ul className="mt-4 divide-y divide-white/10">
        {rows.map((row) => {
          const tigersBetter = row.tigers.rank < row.opponent.rank;
          const opponentBetter = row.opponent.rank < row.tigers.rank;
          return (
            <li key={row.label} className="py-3 first:pt-1.5 last:pb-0">
              <p className="font-ui mb-2 text-center text-[11px] font-semibold tracking-[0.12em] text-white/70 uppercase">
                {row.label}
              </p>
              <div className="grid grid-cols-2 gap-x-3">
                <SideCell
                  side={row.tigers}
                  better={tigersBetter}
                  align="left"
                />
                <SideCell
                  side={row.opponent}
                  better={opponentBetter}
                  align="right"
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
