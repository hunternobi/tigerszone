import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getMyGroups, getPublicGroups } from "./actions";
import GruppenPageClient from "@/components/GruppenPageClient";
import FadingBackground from "@/components/FadingBackground";
import LiquidGlassScene from "@/components/LiquidGlassScene";
import {
  getGroupLeaderboard,
  type GroupLeaderboardData,
} from "@/lib/leaderboard";
import { JUBEL_SCENE } from "@/lib/glassScenes";
import type { LeaderboardEntry } from "@/components/Leaderboard";

export const metadata: Metadata = {
  title: "Tippgruppen",
  robots: { index: false, follow: false },
};

export default async function GruppenPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [groups, publicGroups] = await Promise.all([
    getMyGroups(),
    getPublicGroups(),
  ]);

  const leaderboardEntries = await Promise.all(
    groups.map(async (group): Promise<GroupLeaderboardData> => ({
      groupId: group._id,
      groupName: group.name,
      entries: await getGroupLeaderboard(group._id),
    })),
  );
  const leaderboards: Record<string, LeaderboardEntry[]> = Object.fromEntries(
    leaderboardEntries.map((entry) => [entry.groupId, entry.entries]),
  );

  return (
    <FadingBackground
      src="/images/jubel.jpg"
      opacity={JUBEL_SCENE.opacity}
      blurPx={JUBEL_SCENE.blurPx}
    >
      <LiquidGlassScene background={JUBEL_SCENE}>
        <section className="mx-auto max-w-3xl px-7 py-10 sm:px-6 sm:py-16">
          <h1 className="font-ui text-[2.15rem] leading-[1.06] font-semibold tracking-tight text-white sm:text-5xl">
            Tippgruppen
          </h1>

          <div className="mt-6 sm:mt-8">
            <GruppenPageClient
              groups={groups}
              leaderboards={leaderboards}
              publicGroups={publicGroups}
            />
          </div>
        </section>
      </LiquidGlassScene>
    </FadingBackground>
  );
}
