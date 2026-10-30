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
  /** Numeric value for the comparison bar. */
  raw: number;
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

function buildRows(stats: LeagueStats, opponent: TeamStanding): Row[] {
  const { standings, players, teamStats } = stats;
  const tigers = standings.find((team) => team.id === STRAUBING_TEAM_ID);
  if (!tigers) return [];

  const rows: Row[] = [
    {
      label: "Tabelle",
      tigers: {
        value: `${tigers.points}`,
        note: `Punkte · ${tigers.gp} Spiele`,
        rank: tigers.rank,
        raw: tigers.pointsPerGame,
      },
      opponent: {
        value: `${opponent.points}`,
        note: `Punkte · ${opponent.gp} Spiele`,
        rank: opponent.rank,
        raw: opponent.pointsPerGame,
      },
    },
  ];

  const tigersScorer = bestScorerOf(players, tigers.id);
  const opponentScorer = bestScorerOf(players, opponent.id);
  if (tigersScorer && opponentScorer) {
    rows.push({
      label: "Top Scorer",
      tigers: {
        value: `${tigersScorer.player.points}`,
        note: tigersScorer.player.name,
        rank: tigersScorer.rank,
        raw: tigersScorer.player.points,
      },
      opponent: {
        value: `${opponentScorer.player.points}`,
        note: opponentScorer.player.name,
        rank: opponentScorer.rank,
        raw: opponentScorer.player.points,
      },
    });
  }

  const mine = teamStats.find((team) => team.teamId === tigers.id);
  const theirs = teamStats.find((team) => team.teamId === opponent.id);
  if (mine && theirs) {
    const side = (
      team: TeamSpecialStat,
      pick: (t: TeamSpecialStat) => number,
      note: (t: TeamSpecialStat) => string,
    ): Side => ({
      value: `${fmt(pick(team), 1)} %`,
      note: note(team),
      rank: rankOf(teamStats, team.teamId, pick),
      raw: pick(team),
    });
    const ppNote = (t: TeamSpecialStat) => `${t.ppGoals} von ${t.ppChances}`;
    const pkNote = (t: TeamSpecialStat) =>
      `${t.pkChances - t.pkGoalsAgainst} von ${t.pkChances} überstanden`;
    const shotNote = (t: TeamSpecialStat) => `der Schüsse aufs Tor treffen`;
    rows.push(
      {
        label: "Überzahl",
        tigers: side(mine, (t) => t.ppPct, ppNote),
        opponent: side(theirs, (t) => t.ppPct, ppNote),
      },
      {
        label: "Unterzahl",
        tigers: side(mine, (t) => t.pkPct, pkNote),
        opponent: side(theirs, (t) => t.pkPct, pkNote),
      },
      {
        label: "Schusseffizienz",
        tigers: side(mine, (t) => t.shootingPct, shotNote),
        opponent: side(theirs, (t) => t.shootingPct, shotNote),
      },
    );
  }
  return rows;
}

function RankPill({ rank, better }: { rank: number; better: boolean }) {
  return (
    <span
      className={`font-ui inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
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
      className={`flex min-w-0 flex-col gap-1 ${
        align === "right" ? "items-end text-right" : "items-start text-left"
      }`}
    >
      <p
        className={`font-ui text-[28px] leading-none font-semibold tracking-tight tabular-nums sm:text-[34px] ${
          better ? "text-white" : "text-white/60"
        }`}
      >
        {side.value}
      </p>
      <RankPill rank={side.rank} better={better} />
      {side.note && (
        <p className="max-w-full truncate text-[12px] leading-snug text-white/50">
          {side.note}
        </p>
      )}
    </div>
  );
}

function CompareBar({ left, right }: { left: Side; right: Side }) {
  const total = left.raw + right.raw || 1;
  const leftShare = Math.max(6, Math.min(94, (left.raw / total) * 100));
  const leftBetter = left.rank < right.rank;
  const rightBetter = right.rank < left.rank;
  return (
    <div className="mt-2.5 flex h-1.5 gap-1" aria-hidden="true">
      <div className="flex justify-end" style={{ width: `${leftShare}%` }}>
        <div
          className={`h-full w-full rounded-full ${leftBetter ? "bg-white" : "bg-white/30"}`}
        />
      </div>
      <div className="flex flex-1">
        <div
          className={`h-full w-full rounded-full ${rightBetter ? "bg-white" : "bg-white/30"}`}
        />
      </div>
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
    <section data-liquid-glass="card" className="glass-panel p-5 sm:p-6">
      <p className="font-ui text-[11px] font-semibold tracking-[0.14em] text-white/60 uppercase">
        Head2Head
      </p>
      <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-3">
        <h3 className="font-ui text-[19px] leading-tight font-semibold tracking-tight text-white sm:text-2xl">
          {tigers.name}
        </h3>
        <span className="text-[13px] font-medium text-white/50">vs.</span>
        <h3 className="font-ui text-right text-[19px] leading-tight font-semibold tracking-tight text-white sm:text-2xl">
          {opponent.name}
        </h3>
      </div>

      <ul className="mt-4 divide-y divide-white/10">
        {rows.map((row) => {
          const tigersBetter = row.tigers.rank < row.opponent.rank;
          const opponentBetter = row.opponent.rank < row.tigers.rank;
          return (
            <li key={row.label} className="py-4 first:pt-2 last:pb-0">
              <p className="font-ui mb-2.5 text-center text-[12px] font-semibold tracking-[0.12em] text-white/70 uppercase">
                {row.label}
              </p>
              <div className="grid grid-cols-2 gap-x-4">
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
              <CompareBar left={row.tigers} right={row.opponent} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
