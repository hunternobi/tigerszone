import type { SegmentedOption } from "@/components/SegmentedSwitch";
import {
  BarRow,
  StatTile,
  fmt,
  placeOf,
  signed,
} from "@/components/StatsParts";
import {
  STRAUBING_TEAM_ID,
  type LeagueStats,
  type PlayerStat,
} from "@/lib/pennyDel";

/** Small samples say nothing: players need this many shots / faceoffs to be ranked. */
const MIN_SHOTS = 10;
const MIN_FACEOFFS = 30;

/** Place (1 = best) of a value among all values; equal values share the place. */
const place = (values: number[], mine: number, higherIsBetter = true) =>
  1 + values.filter((v) => (higherIsBetter ? v > mine : v < mine)).length;

const isSkater = (player: PlayerStat) => player.position !== "G";

interface Ranked {
  player: PlayerStat;
  value: number;
  /** Place in the whole league among the players with enough data. */
  leaguePlace: number;
}

/** Tigers players with their value and their place among all league players that qualify. */
function rankTigers(
  players: PlayerStat[],
  value: (player: PlayerStat) => number | null,
  qualifies: (player: PlayerStat) => boolean,
): Ranked[] {
  const pool = players
    .filter((player) => isSkater(player) && qualifies(player))
    .map((player) => ({ player, value: value(player) }))
    .filter(
      (entry): entry is { player: PlayerStat; value: number } =>
        entry.value !== null,
    );
  const values = pool.map((entry) => entry.value);
  return pool
    .filter((entry) => entry.player.teamId === STRAUBING_TEAM_ID)
    .sort((a, b) => b.value - a.value)
    .map((entry) => ({ ...entry, leaguePlace: place(values, entry.value) }));
}

function PlayerList({
  rows,
  format,
  detail,
}: {
  rows: Ranked[];
  format: (value: number) => string;
  detail: (row: Ranked) => string;
}) {
  const best = rows[0]?.value || 1;
  return (
    <ol>
      {rows.map((row, index) => (
        <BarRow
          key={row.player.id ?? row.player.name}
          rank={index + 1}
          name={row.player.name}
          detail={detail(row)}
          value={format(row.value)}
          fraction={row.value / best}
          highlight={index === 0}
        />
      ))}
    </ol>
  );
}

/** The three selections of the "Schüsse" statistic. */
export function buildShotOptions(stats: LeagueStats): SegmentedOption[] {
  const { players, standings } = stats;

  // Schusseffizienz: goals per shot
  const efficiency = rankTigers(
    players,
    (player) => (player.shots ? (player.goals / player.shots) * 100 : null),
    (player) => (player.shots ?? 0) >= MIN_SHOTS,
  );

  // Expected Goals
  const tigers = standings.find((team) => team.id === STRAUBING_TEAM_ID);
  const xgf = standings.map((team) => team.xgf);
  const xga = standings.map((team) => team.xga);
  const expected = rankTigers(
    players,
    (player) => player.xg,
    (player) => player.xg !== null,
  );

  // Schussstärke: hardest shot
  const hardest = rankTigers(
    players,
    (player) => player.topShot,
    (player) => player.topShot !== null,
  );

  return [
    {
      value: "effizienz",
      label: "Effizienz",
      caption: `Schusseffizienz: Tore pro Schuss, Spieler ab ${MIN_SHOTS} Schüssen.`,
      content: (
        <PlayerList
          rows={efficiency}
          format={(value) => `${fmt(value, 1)} %`}
          detail={(row) => `Platz ${row.leaguePlace}`}
        />
      ),
    },
    {
      value: "xg",
      label: "Exp. Goals",
      caption:
        "Expected Goals (xG): wie viele Tore die Schüsse nach Lage und Art im Schnitt ergeben.",
      content: (
        <div className="space-y-4">
          {tigers && (
            <div className="grid grid-cols-2 gap-3">
              <StatTile
                label="Erwartete Tore"
                value={fmt(tigers.xgf, 1)}
                sub={`${tigers.gf} erzielt · ${placeOf(place(xgf, tigers.xgf), xgf.length)}`}
              />
              <StatTile
                label="Erw. Gegentore"
                value={fmt(tigers.xga, 1)}
                sub={`${tigers.ga} kassiert · ${placeOf(place(xga, tigers.xga, false), xga.length)}`}
              />
            </div>
          )}
          <PlayerList
            rows={expected}
            format={(value) => `${fmt(value, 1)} xG`}
            detail={(row) =>
              `${row.player.goals} T · ${signed(row.player.xgDiff ?? row.player.goals - row.value, 1)}`
            }
          />
        </div>
      ),
    },
    {
      value: "staerke",
      label: "Schussstärke",
      caption:
        "Der härteste Schuss der Saison in km/h.",
      content: (
        <PlayerList
          rows={hardest}
          format={(value) => `${fmt(value, 0)} km/h`}
          detail={(row) => `Platz ${row.leaguePlace}`}
        />
      ),
    },
  ];
}

/** The faceoff list of the "Bullys" statistic; null while the page has no faceoff columns. */
export function buildFaceoffList(stats: LeagueStats) {
  const total = (player: PlayerStat) =>
    player.faceoffsWon !== null && player.faceoffPct
      ? player.faceoffsWon / (player.faceoffPct / 100)
      : 0;
  const rows = rankTigers(
    stats.players,
    (player) => player.faceoffPct,
    (player) => total(player) >= MIN_FACEOFFS,
  );
  if (rows.length === 0) return null;
  return (
    <PlayerList
      rows={rows}
      format={(value) => `${fmt(value, 1)} %`}
      detail={(row) =>
        `Platz ${row.leaguePlace} · ${row.player.faceoffsWon} gew.`
      }
    />
  );
}
