import type { Metadata } from "next";
import TippspielInteractive from "@/components/TippspielInteractive";
import { getUpcomingGames } from "@/lib/games";
import { getActiveGroupId, getMyGroups } from "@/app/gruppen/actions";
import { getGlobalLeaderboard, getGroupLeaderboard, type GroupLeaderboardData } from "@/lib/leaderboard";

export const metadata: Metadata = {
  title: "Tippspiel",
  description:
    "Tippe die nächsten Spiele der Straubing Tigers, sammle Punkte und miss dich mit anderen Fans in der Rangliste.",
  alternates: { canonical: "/tippspiel" },
};

export default async function TippspielPage() {
  const [activeGroupId, myGroups] = await Promise.all([getActiveGroupId(), getMyGroups()]);

  const [upcomingGames, globalEntries, groupLeaderboards] = await Promise.all([
    getUpcomingGames(3),
    getGlobalLeaderboard(3),
    Promise.all<GroupLeaderboardData>(
      myGroups.map(async (group) => ({
        groupId: group._id,
        groupName: group.name,
        entries: await getGroupLeaderboard(group._id),
      }))
    ),
  ]);

  return (
    <TippspielInteractive
      games={upcomingGames}
      globalEntries={globalEntries}
      groupLeaderboards={groupLeaderboards}
      activeGroupId={activeGroupId}
    />
  );
}
