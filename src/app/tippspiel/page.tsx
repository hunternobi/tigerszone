import type { Metadata } from "next";
import TippspielInteractive from "@/components/TippspielInteractive";
import { getUpcomingGames } from "@/lib/games";
import { getActiveGroupId } from "@/app/gruppen/actions";
import { getGlobalLeaderboard, getGroupLeaderboard } from "@/lib/leaderboard";

export const metadata: Metadata = {
  title: "Tippspiel",
  description:
    "Tippe die nächsten Spiele der Straubing Tigers, sammle Punkte und miss dich mit anderen Fans in der Rangliste.",
  alternates: { canonical: "/tippspiel" },
};

export default async function TippspielPage() {
  const activeGroupId = await getActiveGroupId();

  const [upcomingGames, globalEntries, groupEntries] = await Promise.all([
    getUpcomingGames(3),
    getGlobalLeaderboard(3),
    activeGroupId ? getGroupLeaderboard(activeGroupId) : Promise.resolve([]),
  ]);

  return (
    <TippspielInteractive
      games={upcomingGames}
      globalEntries={globalEntries}
      groupEntries={groupEntries}
      hasActiveGroup={Boolean(activeGroupId)}
    />
  );
}
