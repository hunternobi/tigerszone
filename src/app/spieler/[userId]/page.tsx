import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { auth } from "@/auth";
import { getGroupsForUser } from "@/app/gruppen/actions";
import { getFavoritePlayerId } from "@/app/profile/actions";
import { getUserPredictionHistory } from "@/lib/predictions";
import { getUserPointsHistory } from "@/lib/leaderboard";
import { getBonusDeadline } from "@/app/tippspiel/bonusActions";
import { getPlayerName } from "@/lib/tigersRoster";
import TipHistoryTabs, {
  type TipHistoryEntry,
} from "@/components/TipHistoryTabs";
import PointsHistorySection from "@/components/PointsHistorySection";
import FadingBackground from "@/components/FadingBackground";
import LiquidGlassScene from "@/components/LiquidGlassScene";
import { JUBEL_SCENE } from "@/lib/glassScenes";

const LABEL_CLASS =
  "font-ui text-[11px] font-semibold tracking-[0.14em] text-white/60 uppercase";

interface SpielerPageProps {
  params: Promise<{ userId: string }>;
}

export async function generateMetadata({
  params,
}: SpielerPageProps): Promise<Metadata> {
  const { userId } = await params;
  const history = await getUserPredictionHistory(userId);
  return {
    title: history ? `Profil: ${history.playerName}` : "Spieler nicht gefunden",
    robots: { index: false, follow: false },
  };
}

export default async function SpielerPage({ params }: SpielerPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { userId } = await params;
  const [history, favoritePlayerId, groups, pointsHistory, bonusDeadline] =
    await Promise.all([
      getUserPredictionHistory(userId),
      getFavoritePlayerId(userId),
      getGroupsForUser(userId),
      getUserPointsHistory(userId),
      getBonusDeadline("hauptrunde"),
    ]);
  if (!history) notFound();
  const hauptrundeStarted = Boolean(
    bonusDeadline && new Date() >= bonusDeadline,
  );

  const isOwnProfile = session.user.id === userId;
  const now = Date.now();

  const entries: TipHistoryEntry[] = history.entries.map((entry) => {
    const locked =
      entry.status !== "scheduled" || new Date(entry.kickoff).getTime() <= now;
    return { ...entry, hidden: !isOwnProfile && !locked };
  });

  return (
    <FadingBackground
      src="/images/jubel.jpg"
      opacity={JUBEL_SCENE.opacity}
      blurPx={JUBEL_SCENE.blurPx}
    >
      <LiquidGlassScene background={JUBEL_SCENE}>
        <section className="mx-auto max-w-3xl px-7 py-10 sm:px-6 sm:py-16">
          <Link
            href="/gruppen"
            className="-ml-1 inline-flex min-h-[44px] items-center gap-0.5 text-[15px] font-medium text-white/85 transition hover:text-white"
          >
            <ChevronLeft size={20} />
            Tippgruppen
          </Link>

          <div
            data-liquid-glass="card"
            className="glass-panel mt-2 divide-y divide-white/10"
          >
            <div className="p-5 sm:p-6">
              <p className={LABEL_CLASS}>Spieler</p>
              <h1 className="font-ui mt-1 text-[30px] leading-[1.1] font-semibold tracking-tight break-words text-white sm:text-4xl">
                {history.playerName}
              </h1>
            </div>

            <div className="grid grid-cols-2 divide-x divide-white/10">
              <div className="p-5 sm:px-6">
                <p className={LABEL_CLASS}>Gesamt</p>
                <p className="font-ui mt-1 text-[24px] font-semibold tracking-tight text-white tabular-nums">
                  {history.totalPoints} Pkt.
                </p>
              </div>
              <div className="p-5 sm:px-6">
                <p className={LABEL_CLASS}>Lieblingsspieler</p>
                <p className="font-ui mt-1 text-[17px] leading-snug font-semibold tracking-tight text-white">
                  {favoritePlayerId ? getPlayerName(favoritePlayerId) : "–"}
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <p className={LABEL_CLASS}>Gruppen</p>
              {groups.length === 0 ? (
                <p className="mt-1.5 text-[16px] text-white/70">
                  Keine Gruppen
                </p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-2">
                  {groups.map((group) => (
                    <span
                      key={group._id}
                      className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[14px] font-medium text-white"
                    >
                      {group.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <PointsHistorySection
            playerName={history.playerName}
            history={pointsHistory}
          />

          <TipHistoryTabs
            entries={entries}
            defaultTab={hauptrundeStarted ? "DEL" : "Vorbereitung"}
          />
        </section>
      </LiquidGlassScene>
    </FadingBackground>
  );
}
