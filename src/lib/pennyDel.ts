import { unstable_cache } from "next/cache";

/**
 * Season statistics of the DEL (penny-del.org), read from the public, server-rendered stats pages.
 *
 * penny-del.org has no API, so the HTML tables are parsed (same approach as the tigerszone-ios backend
 * scraper). Only a handful of pages are requested, and the result is cached for an hour: the numbers only
 * change on match days anyway. Names and plain statistics only - no logos, crests or photos.
 */

const BASE = "https://www.penny-del.org";
const STRAUBING_TEAM_ID = 6;
const USER_AGENT =
  "TigersZone/1.0 (non-commercial fan project; tigerszoneofficial@gmail.com)";
const CACHE_SECONDS = 3600;

export interface TeamStanding {
  rank: number;
  id: number;
  name: string;
  abbr: string;
  gp: number;
  wins: number;
  losses: number;
  points: number;
  pointsPerGame: number;
  gf: number;
  ga: number;
  gd: number;
  xgf: number;
  xga: number;
}

export interface PlayerStat {
  id: number | null;
  name: string;
  teamId: number;
  teamAbbr: string;
  position: "F" | "D" | "G" | null;
  gp: number;
  goals: number;
  assists: number;
  points: number;
  plusMinus: number;
  pim: number;
  xg: number | null;
  xgDiff: number | null;
  topSpeed: number | null;
  distanceKm: number | null;
  topShot: number | null;
  shots: number | null;
}

/** Power play / penalty kill and shooting numbers of one team. */
export interface TeamSpecialStat {
  teamId: number;
  /** Power play: goals, chances, success rate in percent. */
  ppGoals: number;
  ppChances: number;
  ppPct: number;
  /** Penalty kill: goals conceded, times shorthanded, success rate in percent. */
  pkGoalsAgainst: number;
  pkChances: number;
  pkPct: number;
  /** Shooting efficiency: share of shots on goal that went in, in percent. */
  shootingPct: number;
}

export interface GoalieStat {
  id: number | null;
  name: string;
  teamId: number;
  gp: number;
  /** Minutes played, e.g. 599.3. */
  minutes: number;
  /** Save percentage in percent, goals against per 60 minutes. */
  svPct: number;
  gaa: number;
  goalsAgainst: number;
  shutouts: number;
}

export interface LeagueStats {
  seasonLabel: string;
  fetchedAt: string;
  standings: TeamStanding[];
  players: PlayerStat[];
  teamStats: TeamSpecialStat[];
  goalies: GoalieStat[];
}

// ── helpers ────────────────────────────────────────────────────────────────

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCharCode(Number(code)),
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCharCode(parseInt(code, 16)),
    );
}

function clean(html: string): string {
  return decodeEntities(
    html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " "),
  ).trim();
}

interface TableRow {
  cells: string[];
  teamId: number | null;
  playerId: number | null;
}

function parseTable(pageHtml: string): { heads: string[]; rows: TableRow[] } {
  const table = pageHtml.match(/<table[\s\S]*?<\/table>/i)?.[0] ?? "";
  const thead = table.match(/<thead[\s\S]*?<\/thead>/i)?.[0] ?? table;
  const heads = [...thead.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)].map((m) =>
    clean(m[1]),
  );

  const rows: TableRow[] = [];
  for (const rowMatch of table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const rowHtml = rowMatch[1];
    if (!/<td/i.test(rowHtml)) continue;
    const cells = [...rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(
      (m) => clean(m[1]),
    );
    const teamId = rowHtml.match(/team_(\d+)[._]/)?.[1];
    const playerId = rowHtml.match(
      /spielerdetails\/[^/"]+\/[a-z0-9_]+-(\d+)\//i,
    )?.[1];
    rows.push({
      cells,
      teamId: teamId ? Number(teamId) : null,
      playerId: playerId ? Number(playerId) : null,
    });
  }
  return { heads, rows };
}

/** "1,50" / "1.50" / "20.00 %" / "114,66" -> number (comma and dot both decimal). */
function decimal(value: string | undefined): number | null {
  if (!value) return null;
  const match = value.replace(",", ".").match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

/** "47.720" -> 47720 (German thousands dot). */
function thousands(value: string | undefined): number | null {
  if (!value) return null;
  const digits = value.replace(/\./g, "").replace(",", ".");
  const match = digits.match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function integer(value: string | undefined): number {
  const match = (value ?? "").replace("+", "").match(/-?\d+/);
  return match ? Number(match[0]) : 0;
}

function seasonSlug(now = new Date()): { slug: string; label: string } {
  // The DEL season starts in September: from August on it is the new one.
  const startYear =
    now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  const endShort = String((startYear + 1) % 100).padStart(2, "0");
  return {
    slug: `${startYear}-${endShort}`,
    label: `${startYear}/${endShort}`,
  };
}

async function fetchPage(path: string): Promise<string> {
  const response = await fetch(`${BASE}${path}`, {
    headers: { "User-Agent": USER_AGENT, "Accept-Language": "de" },
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok)
    throw new Error(`penny-del.org ${path}: HTTP ${response.status}`);
  return response.text();
}

// ── parsing of the pages ───────────────────────────────────────────────────

function parseStandings(pageHtml: string): TeamStanding[] {
  const names = new Map<number, string>();
  for (const m of pageHtml.matchAll(/<img alt="([^"]+)"[^>]*team_(\d+)[._]/g)) {
    names.set(Number(m[2]), decodeEntities(m[1]).trim());
  }

  const { heads, rows } = parseTable(pageHtml);
  const col = (cells: string[], name: string) => cells[heads.indexOf(name)];

  return rows
    .filter((row) => row.teamId !== null)
    .map((row) => {
      const id = row.teamId as number;
      const wins =
        integer(col(row.cells, "W")) +
        integer(col(row.cells, "OTW")) +
        integer(col(row.cells, "SOW"));
      const gp = integer(col(row.cells, "GP"));
      return {
        rank: integer(col(row.cells, "#")),
        id,
        name: names.get(id) ?? col(row.cells, "Team"),
        abbr: col(row.cells, "Team"),
        gp,
        wins,
        losses: gp - wins,
        points: integer(col(row.cells, "P")),
        pointsPerGame: decimal(col(row.cells, "P/GP")) ?? 0,
        gf: integer(col(row.cells, "GF")),
        ga: integer(col(row.cells, "GA")),
        gd: integer(col(row.cells, "GDIFF")),
        xgf: decimal(col(row.cells, "xGF")) ?? 0,
        xga: decimal(col(row.cells, "xGA")) ?? 0,
      };
    });
}

/** teamstats/special-teams: cells are #, team, GP, -, PPG, PP chances, PP%, SHGA, time, rel, -, PKGA, PK chances, PK%, ... */
function parseSpecialTeams(pageHtml: string) {
  const result = new Map<
    number,
    Pick<
      TeamSpecialStat,
      | "ppGoals"
      | "ppChances"
      | "ppPct"
      | "pkGoalsAgainst"
      | "pkChances"
      | "pkPct"
    >
  >();
  for (const row of parseTable(pageHtml).rows) {
    if (row.teamId === null || row.cells.length < 14) continue;
    const c = row.cells;
    result.set(row.teamId, {
      ppGoals: integer(c[4]),
      ppChances: integer(c[5]),
      ppPct: decimal(c[6]) ?? 0,
      pkGoalsAgainst: integer(c[11]),
      pkChances: integer(c[12]),
      pkPct: decimal(c[13]) ?? 0,
    });
  }
  return result;
}

/** teamstats/schuesse: cells are #, team, S+, SOG+, SOG% (goals per shot on goal), ... */
function parseShooting(pageHtml: string) {
  const result = new Map<number, number>();
  for (const row of parseTable(pageHtml).rows) {
    if (row.teamId === null || row.cells.length < 5) continue;
    result.set(row.teamId, decimal(row.cells[4]) ?? 0);
  }
  return result;
}

/** goaliestats/basis: cells are #, logo, jersey, name, nat, pos, GP, minutes, W, L, SO, GA, GAA, saves, SV% */
function parseGoalies(pageHtml: string): GoalieStat[] {
  return parseTable(pageHtml)
    .rows.filter((row) => row.teamId !== null && row.cells.length >= 15)
    .map((row) => {
      const c = row.cells;
      const [min, sec] = (c[7] ?? "0:0").split(":");
      return {
        id: row.playerId,
        name: fullName(c[3] ?? ""),
        teamId: row.teamId as number,
        gp: integer(c[6]),
        minutes: Number(min) + Number(sec ?? 0) / 60,
        svPct: decimal(c[14]) ?? 0,
        gaa: decimal(c[12]) ?? 0,
        goalsAgainst: integer(c[11]),
        shutouts: integer(c[10]),
      };
    });
}

type PlayerTab = Map<number, Record<string, string>>;

/** Player tables share the columns: rank, team logo, jersey, name, nationality, position, ...stats. */
function parsePlayerTab(pageHtml: string): PlayerTab {
  const { heads, rows } = parseTable(pageHtml);
  const tab: PlayerTab = new Map();
  for (const row of rows) {
    if (row.playerId === null) continue;
    const record: Record<string, string> = {
      name: row.cells[3] ?? "",
      pos: row.cells[5] ?? "",
      team: String(row.teamId ?? ""),
    };
    heads.slice(6).forEach((head, index) => {
      record[head] = row.cells[6 + index] ?? "";
    });
    tab.set(row.playerId, record);
  }
  return tab;
}

function fullName(lastFirst: string): string {
  const [last, first] = lastFirst.split(",").map((part) => part.trim());
  return first ? `${first} ${last}` : last;
}

// ── loading ────────────────────────────────────────────────────────────────

async function loadLeagueStats(): Promise<LeagueStats> {
  const { slug, label } = seasonSlug();
  const base = `/statistik/saison-${slug}/hauptrunde`;

  const [
    standingsHtml,
    basisHtml,
    xgHtml,
    skatingHtml,
    shotsHtml,
    specialHtml,
    teamShotsHtml,
    goaliesHtml,
  ] = await Promise.all([
    fetchPage(`${base}/tabelle`),
    fetchPage(`${base}/playerstats/basis`),
    fetchPage(`${base}/playerstats/xg`),
    fetchPage(`${base}/playerstats/skating`),
    fetchPage(`${base}/playerstats/schuesse`),
    fetchPage(`${base}/teamstats/special-teams`),
    fetchPage(`${base}/teamstats/schuesse`),
    fetchPage(`${base}/goaliestats/basis`),
  ]);

  const standings = parseStandings(standingsHtml);
  if (standings.length === 0)
    throw new Error("penny-del.org: empty standings table");
  const abbrById = new Map(standings.map((team) => [team.id, team.abbr]));

  const basis = parsePlayerTab(basisHtml);
  const xg = parsePlayerTab(xgHtml);
  const skating = parsePlayerTab(skatingHtml);
  const shots = parsePlayerTab(shotsHtml);

  const positions: Record<string, PlayerStat["position"]> = {
    S: "F",
    V: "D",
    T: "G",
  };

  const players: PlayerStat[] = [...basis.entries()].map(([id, record]) => {
    const teamId = Number(record.team);
    const xgRecord = xg.get(id);
    const skatingRecord = skating.get(id);
    const shotsRecord = shots.get(id);
    const distance = thousands(skatingRecord?.["DIST (m)"]);
    return {
      id,
      name: fullName(record.name),
      teamId,
      teamAbbr: abbrById.get(teamId) ?? "",
      position: positions[record.pos] ?? null,
      gp: integer(record.GP),
      goals: integer(record.G),
      assists: integer(record.A),
      points: integer(record.P),
      plusMinus: integer(record["+/-"]),
      pim: integer(record.PIM),
      xg: decimal(xgRecord?.xGsum),
      xgDiff: decimal(xgRecord?.xGDiff),
      topSpeed: decimal(skatingRecord?.["SPD TOP (km/h)"]),
      distanceKm: distance === null ? null : distance / 1000,
      topShot: decimal(shotsRecord?.["Top Shot (km/h)"]),
      shots: shotsRecord ? integer(shotsRecord.Shots) : null,
    };
  });

  const special = parseSpecialTeams(specialHtml);
  const shooting = parseShooting(teamShotsHtml);
  const teamStats: TeamSpecialStat[] = standings.flatMap((team) => {
    const entry = special.get(team.id);
    const shootingPct = shooting.get(team.id);
    if (!entry || shootingPct === undefined) return [];
    return [{ teamId: team.id, ...entry, shootingPct }];
  });

  return {
    seasonLabel: label,
    fetchedAt: new Date().toISOString(),
    standings,
    players,
    teamStats,
    goalies: parseGoalies(goaliesHtml),
  };
}

const cachedLeagueStats = unstable_cache(
  loadLeagueStats,
  ["penny-del-league-stats-v3"],
  {
    revalidate: CACHE_SECONDS,
    tags: ["del-stats"],
  },
);

/** League stats of the running season, or null if penny-del.org cannot be read right now. */
export async function getLeagueStats(): Promise<LeagueStats | null> {
  try {
    return await cachedLeagueStats();
  } catch (error) {
    console.error("getLeagueStats failed:", error);
    return null;
  }
}

export { STRAUBING_TEAM_ID };
