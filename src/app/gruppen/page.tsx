import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getMyGroups, getPublicGroups } from "./actions";
import GruppenPageClient from "@/components/GruppenPageClient";
import FadingBackground from "@/components/FadingBackground";
import { getGroupLeaderboard, type GroupLeaderboardData } from "@/lib/leaderboard";
import type { LeaderboardEntry } from "@/components/Leaderboard";

export const metadata: Metadata = {
  title: "Tippgruppen",
  robots: { index: false, follow: false },
};

export default async function GruppenPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [groups, publicGroups] = await Promise.all([getMyGroups(), getPublicGroups()]);

  const leaderboardEntries = await Promise.all(
    groups.map(async (group): Promise<GroupLeaderboardData> => ({
      groupId: group._id,
      groupName: group.name,
      entries: await getGroupLeaderboard(group._id),
    }))
  );
  const leaderboards: Record<string, LeaderboardEntry[]> = Object.fromEntries(
    leaderboardEntries.map((entry) => [entry.groupId, entry.entries])
  );

  return (
    <FadingBackground src="/images/jubel.jpg" opacity={0.55} blurPx={1.5}>
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-3xl font-bold text-white">Tippgruppen</h1>
        <p className="mt-3 text-white">
          Erstelle eigene Gruppen oder tritt per Einladungslink bei. Im Tippspiel kannst du
          zwischen deinen Gruppen wechseln.
        </p>

        <div className="mt-8">
          <GruppenPageClient
            groups={groups}
            leaderboards={leaderboards}
            publicGroups={publicGroups}
          />
        </div>
      </section>
    </FadingBackground>
  );
}
