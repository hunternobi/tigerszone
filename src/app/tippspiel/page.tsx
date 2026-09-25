import type { Metadata } from "next";
import { auth } from "@/auth";
import TippspielInteractive from "@/components/TippspielInteractive";
import { getAllGames } from "@/lib/games";
import { getActiveGroupId, getMyGroups } from "@/app/gruppen/actions";
import { getGlobalLeaderboard, getGroupLeaderboard, type GroupLeaderboardData } from "@/lib/leaderboard";
import { getUserPredictionHistory } from "@/lib/predictions";
import { getBonusDeadline, getMyBonusPrediction } from "@/app/tippspiel/bonusActions";

export const metadata: Metadata = {
  title: "Tippspiel",
  description:
    "Tippe alle Spiele der Straubing Tigers, sammle Punkte und miss dich mit anderen Fans in der Rangliste.",
  alternates: { canonical: "/tippspiel" },
};

export default async function TippspielPage() {
  const session = await auth();
  const isAuthenticated = Boolean(session?.user);

  const [activeGroupId, myGroups, allGames, history, bonusPrediction, bonusDeadline] =
    await Promise.all([
      getActiveGroupId(),
      getMyGroups(),
      getAllGames(),
      isAuthenticated ? getUserPredictionHistory(session!.user.id) : Promise.resolve(null),
      isAuthenticated ? getMyBonusPrediction("hauptrunde") : Promise.resolve({}),
      getBonusDeadline("hauptrunde"),
    ]);

  const bonusLocked = Boolean(bonusDeadline && new Date() >= bonusDeadline);
  const resolvedBonusPrediction = bonusPrediction ?? {};

  const [globalEntries, groupLeaderboards] = await Promise.all([
    getGlobalLeaderboard(3),
    Promise.all<GroupLeaderboardData>(
      myGroups.map(async (group) => ({
        groupId: group._id,
        groupName: group.name,
        entries: await getGroupLeaderboard(group._id, 5),
      }))
    ),
  ]);

  // Only the next three games still open for tips. Finished games stay in the database (and in
  // the Tipphistorie) so points are untouched - they just leave this list.
  const now = new Date();
  const hauptrundeGames = allGames
    .filter(
      (game) =>
        game.competition === "DEL" &&
        game.status === "scheduled" &&
        new Date(game.kickoff) > now
    )
    .slice(0, 3);
  const nextGame =
    allGames.find((game) => game.status === "scheduled" && new Date(game.kickoff) > new Date()) ??
    null;

  const predictions: Record<string, { predictedHome: number; predictedAway: number }> = {};

  if (history) {
    for (const entry of history.entries) {
      predictions[entry.gameId] = {
        predictedHome: entry.predictedHome,
        predictedAway: entry.predictedAway,
      };
    }
  }

  return (
    <TippspielInteractive
      nextGame={nextGame}
      hauptrundeGames={hauptrundeGames}
      predictions={predictions}
      isAuthenticated={isAuthenticated}
      globalEntries={globalEntries}
      groupLeaderboards={groupLeaderboards}
      activeGroupId={activeGroupId}
      bonusPrediction={resolvedBonusPrediction}
      bonusLocked={bonusLocked}
      bonusDeadline={bonusDeadline ? bonusDeadline.toISOString() : null}
    />
  );
}
