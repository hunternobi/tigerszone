import TippspielInteractive from "@/components/TippspielInteractive";
import { getUpcomingGames } from "@/lib/games";

export default function TippspielPage() {
  const upcomingGames = getUpcomingGames(3);

  return <TippspielInteractive games={upcomingGames} />;
}
