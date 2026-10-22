import type { ReactNode } from "react";
import {
  STRAUBING_TEAM_ID,
  type LeagueStats,
  type PlayerStat,
  type TeamStanding,
} from "@/lib/pennyDel";

const LABEL_CLASS =
  "font-ui text-[11px] font-semibold tracking-[0.14em] text-white/60 uppercase";

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
        <p className="mt-1 text-[14px] leading-snug text-white/60">
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
          <span className="w-5 shrink-0 text-[14px] font-semibold text-white/50 tabular-nums">
            {rank}
          </span>
          <span
            className={`font-ui truncate text-[16px] tracking-tight ${
              highlight
                ? "font-semibold text-white"
                : "font-medium text-white/85"
            }`}
          >
            {name}
          </span>
          {detail && (
            <span className="shrink-0 text-[12px] text-white/50">{detail}</span>
          )}
        </span>
        <span className="font-ui shrink-0 text-[17px] font-semibold text-white tabular-nums">
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

function SummaryTile({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div>
      <p className={LABEL_CLASS}>{label}</p>
      <p className="font-ui mt-1 text-[30px] leading-none font-semibold tracking-tight text-white tabular-nums">
        {value}
      </p>
      <p className="mt-1.5 text-[13px] leading-snug text-white/60">{note}</p>
    </div>
  );
}

function StandingsCard({ standings }: { standings: TeamStanding[] }) {
  return (
    <Card title="Tabelle" subtitle="Hauptrunde, nach Punkten">
      <div className="grid grid-cols-[1.5rem_minmax(0,1fr)_2rem_2.5rem_2.25rem] items-center gap-x-2 px-2 pb-1.5 text-[11px] font-semibold tracking-wide text-white/50 uppercase">
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
              className={`grid grid-cols-[1.5rem_minmax(0,1fr)_2rem_2.5rem_2.25rem] items-center gap-x-2 rounded-xl px-2 py-2 text-[15px] tabular-nums ${
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

export default function StatsDashboard({ stats }: { stats: LeagueStats }) {
  const { standings, players } = stats;
  const tigers = standings.find((team) => team.id === STRAUBING_TEAM_ID);
  const tigersPlayers = players.filter(
    (player) => player.teamId === STRAUBING_TEAM_ID,
  );
  const skaters = players.filter((player) => player.position !== "G");
  const tigersSkaters = tigersPlayers.filter(
    (player) => player.position !== "G",
  );

  const scorers = topBy(tigersSkaters, (p) => p.points, 5);
  const scorerMax = scorers[0]?.points || 1;

  const leagueGoals = topBy(skaters, (p) => p.goals, 5);
  const goalsMax = leagueGoals[0]?.goals || 1;

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

  // "Fun" records: league-wide best, plus the best Tigers player with his league rank.
  const records = [
    {
      label: "Schnellster Läufer",
      unit: "km/h",
      digits: 1,
      pick: (p: PlayerStat) => p.topSpeed,
    },
    {
      label: "Härtester Schuss",
      unit: "km/h",
      digits: 1,
      pick: (p: PlayerStat) => p.topShot,
    },
    {
      label: "Längste Laufstrecke",
      unit: "km",
      digits: 1,
      pick: (p: PlayerStat) => p.distanceKm,
    },
  ].map((record) => {
    const ranked = topBy(skaters, record.pick, skaters.length);
    const leader = ranked[0];
    const bestTiger = ranked.find((p) => p.teamId === STRAUBING_TEAM_ID);
    return {
      ...record,
      leader,
      bestTiger,
      tigerRank: bestTiger ? ranked.indexOf(bestTiger) + 1 : null,
    };
  });

  const goalDiffVsXg = tigers ? tigers.gf - tigers.xgf : 0;

  return (
    <div className="space-y-6">
      {tigers && (
        <section data-liquid-glass="card" className="glass-panel p-5 sm:p-6">
          <p className={LABEL_CLASS}>
            Straubing Tigers · Saison {stats.seasonLabel}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-6">
            <SummaryTile
              label="Platz"
              value={`${tigers.rank}.`}
              note={`von ${standings.length} Teams`}
            />
            <SummaryTile
              label="Punkte"
              value={fmt(tigers.points)}
              note={`${fmt(tigers.pointsPerGame, 2)} pro Spiel · ${tigers.gp} Spiele`}
            />
            <SummaryTile
              label="Tore"
              value={`${tigers.gf}:${tigers.ga}`}
              note={`Tordifferenz ${signed(tigers.gd)}`}
            />
            <SummaryTile
              label="Effizienz"
              value={signed(goalDiffVsXg, 0)}
              note={
                goalDiffVsXg >= 0
                  ? `Tore mehr als erwartet (${fmt(tigers.xgf)} xG)`
                  : `Tore weniger als erwartet (${fmt(tigers.xgf)} xG)`
              }
            />
          </div>
        </section>
      )}

      <StandingsCard standings={standings} />

      {scorers.length > 0 && (
        <Card title="Topscorer der Tigers" subtitle="Tore und Assists zusammen">
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
      )}

      {leagueGoals.length > 0 && (
        <Card
          title="Torjäger der Liga"
          subtitle="Die meisten Tore der Hauptrunde"
        >
          <ol>
            {leagueGoals.map((player, index) => (
              <BarRow
                key={player.id ?? player.name}
                rank={index + 1}
                name={player.name}
                detail={player.teamAbbr}
                value={fmt(player.goals)}
                fraction={player.goals / goalsMax}
                highlight={player.teamId === STRAUBING_TEAM_ID}
              />
            ))}
          </ol>
        </Card>
      )}

      {(overperformers.length > 0 || underperformers.length > 0) && (
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
                    <XgRow key={player.id ?? player.name} player={player} />
                  ))}
                </ul>
              </div>
            )}
            {underperformers.length > 0 && (
              <div>
                <p className={LABEL_CLASS}>Weniger Tore als erwartet</p>
                <ul className="mt-2 divide-y divide-white/10">
                  {underperformers.map((player) => (
                    <XgRow key={player.id ?? player.name} player={player} />
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

      <Card title="Rekorde" subtitle="Bestwerte der Liga und der beste Tiger">
        <ul className="divide-y divide-white/10">
          {records.map((record) =>
            record.leader ? (
              <li key={record.label} className="py-3.5 first:pt-0 last:pb-0">
                <p className={LABEL_CLASS}>{record.label}</p>
                <p className="mt-1 flex items-baseline justify-between gap-3">
                  <span className="font-ui min-w-0 truncate text-[17px] font-semibold tracking-tight text-white">
                    {record.leader.name}
                    <span className="ml-2 text-[12px] font-normal text-white/50">
                      {record.leader.teamAbbr}
                    </span>
                  </span>
                  <span className="font-ui shrink-0 text-[20px] font-semibold text-white tabular-nums">
                    {fmt(record.pick(record.leader) ?? 0, record.digits)}{" "}
                    <span className="text-[13px] font-medium text-white/60">
                      {record.unit}
                    </span>
                  </span>
                </p>
                {record.bestTiger &&
                  record.leader.teamId !== STRAUBING_TEAM_ID && (
                    <p className="mt-1 text-[13px] text-white/60">
                      Bester Tiger: {record.bestTiger.name} ·{" "}
                      {fmt(record.pick(record.bestTiger) ?? 0, record.digits)}{" "}
                      {record.unit} (Platz {record.tigerRank})
                    </p>
                  )}
              </li>
            ) : null,
          )}
        </ul>
      </Card>

      {pimLeaders.length > 0 && (
        <Card
          title="Strafbank"
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
      )}

      <p className="px-2 text-center text-[12px] leading-relaxed text-white/50">
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
        <span className="font-ui block truncate text-[16px] font-medium tracking-tight text-white">
          {player.name}
        </span>
        <span className="text-[13px] text-white/60">
          {player.goals} Tore · {fmt(player.xg ?? 0, 1)} erwartet
        </span>
      </span>
      <span
        className={`shrink-0 rounded-full border px-2.5 py-1 text-[13px] font-bold tabular-nums ${
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
