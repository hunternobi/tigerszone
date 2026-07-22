import type { Game } from "@/types";

// Vorbereitungsspiele Saison 2026/27 (Freundschaftsspiele, keine DEL-Spieltage)
export const GAMES: Game[] = [
  {
    _id: "vb-2026-08-21",
    homeTeamId: "straubing-tigers",
    awayTeamId: "nuernberg-ice-tigers",
    kickoff: "2026-08-21T19:00:00",
    competition: "Vorbereitung",
    isDerby: false,
    status: "scheduled",
  },
  {
    _id: "vb-2026-08-23",
    homeTeamId: "straubing-tigers",
    awayTeamId: "frankfurt-wolfsburg",
    kickoff: "2026-08-23T18:00:00",
    competition: "Vorbereitung",
    isDerby: false,
    status: "scheduled",
  },
  {
    _id: "vb-2026-08-28",
    homeTeamId: "steinbach-black-wings-linz",
    awayTeamId: "straubing-tigers",
    kickoff: "2026-08-28T18:30:00",
    competition: "Vorbereitung",
    isDerby: false,
    status: "scheduled",
  },
  {
    _id: "vb-2026-08-30",
    homeTeamId: "straubing-tigers",
    awayTeamId: "steinbach-black-wings-linz",
    kickoff: "2026-08-30T16:30:00",
    competition: "Vorbereitung",
    isDerby: false,
    status: "scheduled",
  },
  {
    _id: "vb-2026-09-04",
    homeTeamId: "ceske-budejovice",
    awayTeamId: "straubing-tigers",
    kickoff: "2026-09-04T17:30:00",
    competition: "Vorbereitung",
    isDerby: false,
    status: "scheduled",
  },
  {
    _id: "vb-2026-09-06",
    homeTeamId: "straubing-tigers",
    awayTeamId: "ceske-budejovice",
    kickoff: "2026-09-06T16:30:00",
    competition: "Vorbereitung",
    isDerby: false,
    status: "scheduled",
  },
  {
    _id: "vb-2026-09-11",
    homeTeamId: "mountfield-hk",
    awayTeamId: "straubing-tigers",
    kickoff: "2026-09-11T17:00:00",
    competition: "Vorbereitung",
    isDerby: false,
    status: "scheduled",
  },
];

export function getUpcomingGames(limit: number): Game[] {
  return [...GAMES]
    .filter((game) => game.status === "scheduled")
    .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime())
    .slice(0, limit);
}
