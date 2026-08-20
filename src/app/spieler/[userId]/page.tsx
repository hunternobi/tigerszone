import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { getGroupsForUser } from "@/app/gruppen/actions";
import { getFavoritePlayerId } from "@/app/profile/actions";
import { getUserPredictionHistory } from "@/lib/predictions";
import { getUserPointsHistory } from "@/lib/leaderboard";
import { getPlayerName } from "@/lib/tigersRoster";
import TipHistoryTabs, { type TipHistoryEntry } from "@/components/TipHistoryTabs";
import PointsHistorySection from "@/components/PointsHistorySection";

interface SpielerPageProps {
  params: Promise<{ userId: string }>;
}

export async function generateMetadata({ params }: SpielerPageProps): Promise<Metadata> {
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
  const [history, favoritePlayerId, groups, pointsHistory] = await Promise.all([
    getUserPredictionHistory(userId),
    getFavoritePlayerId(userId),
    getGroupsForUser(userId),
    getUserPointsHistory(userId),
  ]);
  if (!history) notFound();

  const isOwnProfile = session.user.id === userId;
  const now = Date.now();

  const entries: TipHistoryEntry[] = history.entries.map((entry) => {
    const locked = entry.status !== "scheduled" || new Date(entry.kickoff).getTime() <= now;
    return { ...entry, hidden: !isOwnProfile && !locked };
  });

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/gruppen"
        className="inline-flex items-center gap-2 text-sm text-white hover:underline"
      >
        <ArrowLeft size={16} />
        Zurück zu den Gruppen
      </Link>

      <div className="glass-panel mx-auto mt-6 p-4 text-left sm:p-8">
        <h1 className="text-center text-xl font-bold text-white sm:text-2xl">
          {history.playerName}
        </h1>

        <div className="mt-4 flex flex-col items-center gap-4 text-center sm:mt-6 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:text-left">
          <div>
            <p className="text-xs font-semibold tracking-wide text-white uppercase">
              Lieblingsspieler
            </p>
            <p className="mt-1 text-lg font-bold text-white">
              {favoritePlayerId ? getPlayerName(favoritePlayerId) : "–"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wide text-white uppercase">Gruppen</p>
            {groups.length === 0 ? (
              <p className="mt-1 text-sm text-white">Keine Gruppen</p>
            ) : (
              <div className="mt-1 flex flex-wrap justify-center gap-2 sm:justify-start">
                {groups.map((group) => (
                  <span
                    key={group._id}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm text-white"
                  >
                    {group.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wide text-white uppercase">Gesamt</p>
            <p className="mt-1 text-lg font-bold text-white">{history.totalPoints} Pkt.</p>
          </div>
        </div>
      </div>

      <PointsHistorySection playerName={history.playerName} history={pointsHistory} />

      <TipHistoryTabs entries={entries} />
    </section>
  );
}
