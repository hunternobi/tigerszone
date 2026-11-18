import type { Game } from "@/types";

export type FormOutcome = "W" | "OTW" | "OTL" | "L";

/** One finished game from the point of view of a team. */
export interface TeamFormEntry {
  id: string;
  kickoff: string;
  matchday?: number;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  /** "n. V." / "n. P." for games decided in overtime or the shootout, otherwise empty. */
  extra: "" | "n. V." | "n. P.";
  outcome: FormOutcome;
}

/**
 * The last finished games of a team (newest first). Only games that are in our own database count, and
 * the database holds the Tigers' games: for another team these are at most its games against the Tigers.
 */
export function buildTeamForm(
  games: Game[],
  teamId: string,
  count = 5,
): TeamFormEntry[] {
  const entries: TeamFormEntry[] = [];
  for (const game of games) {
    if (game.competition === "Vorbereitung") continue;
    if (game.homeTeamId !== teamId && game.awayTeamId !== teamId) continue;
    if (game.homeScore === undefined || game.awayScore === undefined) continue;

    const home = game.homeTeamId === teamId;
    const own = home ? game.homeScore : game.awayScore;
    const other = home ? game.awayScore : game.homeScore;
    const overtime = game.overtime === "OT" || game.overtime === "SO";
    entries.push({
      id: game._id,
      kickoff: game.kickoff,
      matchday: game.matchday,
      homeTeamId: game.homeTeamId,
      awayTeamId: game.awayTeamId,
      homeScore: game.homeScore,
      awayScore: game.awayScore,
      extra:
        game.overtime === "OT" ? "n. V." : game.overtime === "SO" ? "n. P." : "",
      outcome: own > other ? (overtime ? "OTW" : "W") : overtime ? "OTL" : "L",
    });
  }
  return entries
    .sort((a, b) => b.kickoff.localeCompare(a.kickoff))
    .slice(0, count);
}
