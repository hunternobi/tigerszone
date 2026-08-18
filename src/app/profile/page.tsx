import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getMyGroupInvites } from "@/app/gruppen/actions";
import { getFavoritePlayerId } from "@/app/profile/actions";
import { getMyBonusPrediction } from "@/app/tippspiel/bonusActions";
import { getUserPredictionHistory } from "@/lib/predictions";
import GroupInvites from "@/components/GroupInvites";
import FavoritePlayerSelect from "@/components/FavoritePlayerSelect";
import ProfileHistory from "@/components/ProfileHistory";

export const metadata: Metadata = {
  title: "Profil",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [invites, favoritePlayerId, bonusHauptrunde, bonusPlayoffs, history] = await Promise.all([
    getMyGroupInvites(session.user.id),
    getFavoritePlayerId(session.user.id),
    getMyBonusPrediction("hauptrunde"),
    getMyBonusPrediction("playoffs"),
    getUserPredictionHistory(session.user.id),
  ]);

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-white">Profil</h1>

      <div className="glass-panel mt-8 p-6">
        <p className="text-sm text-white">Name</p>
        <p className="text-lg font-semibold text-white">{session.user.name}</p>

        <p className="mt-4 text-sm text-white">E-Mail</p>
        <p className="text-lg font-semibold text-white">{session.user.email}</p>

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

      <ProfileHistory
        entries={history?.entries ?? []}
        bonusHauptrunde={bonusHauptrunde ?? {}}
        bonusPlayoffs={bonusPlayoffs ?? {}}
      />
    </section>
  );
}
