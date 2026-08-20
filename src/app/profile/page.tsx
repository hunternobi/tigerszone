import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getMyGroupInvites } from "@/app/gruppen/actions";
import { getFavoritePlayerId, getMyAccountInfo } from "@/app/profile/actions";
import { getMyBonusPrediction } from "@/app/tippspiel/bonusActions";
import { getUserPredictionHistory } from "@/lib/predictions";
import { getUserPointsHistory } from "@/lib/leaderboard";
import GroupInvites from "@/components/GroupInvites";
import FavoritePlayerSelect from "@/components/FavoritePlayerSelect";
import MyBonusSummary from "@/components/MyBonusSummary";
import TipHistoryTabs from "@/components/TipHistoryTabs";
import PointsHistorySection from "@/components/PointsHistorySection";
import UsernameEditForm from "@/components/UsernameEditForm";
import DeleteAccountButton from "@/components/DeleteAccountButton";

export const metadata: Metadata = {
  title: "Profil",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [invites, favoritePlayerId, bonusHauptrunde, bonusPlayoffs, history, account, pointsHistory] =
    await Promise.all([
      getMyGroupInvites(session.user.id),
      getFavoritePlayerId(session.user.id),
      getMyBonusPrediction("hauptrunde"),
      getMyBonusPrediction("playoffs"),
      getUserPredictionHistory(session.user.id),
      getMyAccountInfo(session.user.id),
      getUserPointsHistory(session.user.id),
    ]);

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-white">Profil</h1>

      <div className="glass-panel mt-8 p-6">
        <p className="text-sm text-white">Benutzername</p>
        <UsernameEditForm
          name={account?.name ?? session.user.name ?? ""}
          nextNameChangeAt={account?.nextNameChangeAt ?? null}
        />

        <p className="mt-4 text-sm text-white">E-Mail</p>
        <p className="text-lg font-semibold text-white">{account?.email ?? session.user.email ?? ""}</p>

        {session.user.role === "admin" && (
          <span className="mt-4 inline-block rounded-full bg-tigers-accent px-3 py-1 text-xs font-semibold text-white">
            Admin
          </span>
        )}

        <div className="mt-6">
          <FavoritePlayerSelect initialPlayerId={favoritePlayerId ?? ""} />
        </div>
      </div>

      <GroupInvites invites={invites} />

      <MyBonusSummary bonusHauptrunde={bonusHauptrunde ?? {}} bonusPlayoffs={bonusPlayoffs ?? {}} />

      <PointsHistorySection
        playerName={account?.name ?? session.user.name ?? "Du"}
        history={pointsHistory}
      />

      <TipHistoryTabs entries={history?.entries ?? []} />

      <div className="mt-8 flex justify-end">
        <DeleteAccountButton />
      </div>
    </section>
  );
}
