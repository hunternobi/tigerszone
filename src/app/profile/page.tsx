import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getMyGroupInvites } from "@/app/gruppen/actions";
import { getFavoritePlayerId, getMyAccountInfo } from "@/app/profile/actions";
import {
  getBonusDeadline,
  getMyBonusPrediction,
} from "@/app/tippspiel/bonusActions";
import { getUserPredictionHistory } from "@/lib/predictions";
import GroupInvites from "@/components/GroupInvites";
import FavoritePlayerSelect from "@/components/FavoritePlayerSelect";
import LiquidGlassScene, { NAVY_SCENE } from "@/components/LiquidGlassScene";
import MyBonusSummary from "@/components/MyBonusSummary";
import TipHistoryTabs from "@/components/TipHistoryTabs";
import UsernameEditForm from "@/components/UsernameEditForm";
import DeleteAccountButton from "@/components/DeleteAccountButton";
import ProfileTabs from "@/components/ProfileTabs";

export const metadata: Metadata = {
  title: "Profil",
  robots: { index: false, follow: false },
};

const LABEL_CLASS =
  "font-ui text-[11px] font-semibold tracking-[0.14em] text-white/60 uppercase";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [
    invites,
    favoritePlayerId,
    bonusHauptrunde,
    bonusPlayoffs,
    history,
    account,
    bonusDeadline,
  ] = await Promise.all([
    getMyGroupInvites(session.user.id),
    getFavoritePlayerId(session.user.id),
    getMyBonusPrediction("hauptrunde"),
    getMyBonusPrediction("playoffs"),
    getUserPredictionHistory(session.user.id),
    getMyAccountInfo(session.user.id),
    getBonusDeadline("hauptrunde"),
  ]);
  const hauptrundeStarted = Boolean(
    bonusDeadline && new Date() >= bonusDeadline,
  );

  return (
    // Extends under the transparent header so the glow does not end in a visible edge at its bottom.
    <LiquidGlassScene
      background={NAVY_SCENE}
      className="-mt-[4.5rem] pt-[4.5rem]"
    >
      <section className="mx-auto max-w-3xl px-7 py-10 sm:px-6 sm:py-16">
        <h1 className="font-ui text-[2.15rem] leading-[1.06] font-semibold tracking-tight text-white sm:text-5xl">
          Profil
        </h1>

        <ProfileTabs
          tabs={[
            {
              id: "konto",
              label: "Konto",
              content: (
                <>
                  {/* Grouped list in one glass card, like iOS settings. */}
                  <div
                    data-liquid-glass="card"
                    className="glass-panel mt-6 divide-y divide-white/10"
                  >
                    <div className="p-5">
                      <p className={LABEL_CLASS}>Benutzername</p>
                      <UsernameEditForm
                        name={account?.name ?? session.user.name ?? ""}
                        nextNameChangeAt={account?.nextNameChangeAt ?? null}
                      />
                    </div>

                    <div className="p-5">
                      <p className={LABEL_CLASS}>E-Mail</p>
                      <p className="font-ui mt-1 text-[18px] font-semibold tracking-tight break-all text-white">
                        {account?.email ?? session.user.email ?? ""}
                      </p>
                      {session.user.role === "admin" && (
                        <span className="mt-3 inline-block rounded-full bg-tigers-accent px-3 py-1 text-xs font-semibold text-white">
                          Admin
                        </span>
                      )}
                    </div>

                    <div className="p-5">
                      <FavoritePlayerSelect
                        initialPlayerId={favoritePlayerId ?? ""}
                      />
                    </div>
                  </div>

                  <GroupInvites invites={invites} />

                  <div className="mt-8 flex justify-center">
                    <DeleteAccountButton />
                  </div>
                </>
              ),
            },
            {
              id: "bonustipps",
              label: "Bonustipps",
              content: (
                <MyBonusSummary
                  bonusHauptrunde={bonusHauptrunde ?? {}}
                  bonusPlayoffs={bonusPlayoffs ?? {}}
                />
              ),
            },
            {
              id: "tipphistorie",
              label: "Tipphistorie",
              content: (
                <div id="tipphistorie" className="scroll-mt-24">
                  <TipHistoryTabs
                    entries={history?.entries ?? []}
                    defaultTab={hauptrundeStarted ? "DEL" : "Vorbereitung"}
                  />
                </div>
              ),
            },
          ]}
        />
      </section>
    </LiquidGlassScene>
  );
}
