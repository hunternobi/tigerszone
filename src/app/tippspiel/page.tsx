import type { Metadata } from "next";
import { auth } from "@/auth";
import TippspielInteractive from "@/components/TippspielInteractive";
import type { ResultEntry } from "@/components/TippspielTable";
import { getAllGames } from "@/lib/games";
import { getActiveGroupId, getMyGroups } from "@/app/gruppen/actions";
import { getGlobalLeaderboard, getGroupLeaderboard, type GroupLeaderboardData } from "@/lib/leaderboard";
import { getUserPredictionHistory } from "@/lib/predictions";

export const metadata: Metadata = {
  title: "Tippspiel",
  description:
    "Tippe alle Spiele der Straubing Tigers, sammle Punkte und miss dich mit anderen Fans in der Rangliste.",
  alternates: { canonical: "/tippspiel" },
};

export default async function TippspielPage() {
  const session = await auth();
  const isAuthenticated = Boolean(session?.user);

  const [activeGroupId, myGroups, allGames, history] = await Promise.all([
    getActiveGroupId(),
    getMyGroups(),
    getAllGames(),
    isAuthenticated ? getUserPredictionHistory(session!.user.id) : Promise.resolve(null),
  ]);

  const [globalEntries, groupLeaderboards] = await Promise.all([
    getGlobalLeaderboard(3),
    Promise.all<GroupLeaderboardData>(
      myGroups.map(async (group) => ({
        groupId: group._id,
        groupName: group.name,
        entries: await getGroupLeaderboard(group._id),
      }))
    ),
  ]);

  const vorbereitungGames = allGames.filter((game) => game.competition === "Vorbereitung");
  const hauptrundeGames = allGames.filter((game) => game.competition === "DEL");
  const nextGame =
    allGames.find((game) => game.status === "scheduled" && new Date(game.kickoff) > new Date()) ??
    null;

  const predictions: Record<string, { predictedHome: number; predictedAway: number }> = {};
  const results: ResultEntry[] = [];

  if (history) {
    for (const entry of history.entries) {
      predictions[entry.gameId] = {
        predictedHome: entry.predictedHome,
        predictedAway: entry.predictedAway,
      };
      if (entry.status === "finished") {
        results.push({
          gameId: entry.gameId,
          homeTeamId: entry.homeTeamId,
          awayTeamId: entry.awayTeamId,
          kickoff: entry.kickoff,
          predictedHome: entry.predictedHome,
          predictedAway: entry.predictedAway,
          homeScore: entry.homeScore,
          awayScore: entry.awayScore,
          pointsAwarded: entry.pointsAwarded,
        });
      }
    }
  }

  return (
    <TippspielInteractive
      nextGame={nextGame}
      vorbereitungGames={vorbereitungGames}
      hauptrundeGames={hauptrundeGames}
      predictions={predictions}
      results={results}
      isAuthenticated={isAuthenticated}
      globalEntries={globalEntries}
      groupLeaderboards={groupLeaderboards}
      activeGroupId={activeGroupId}
    />
  );
}
