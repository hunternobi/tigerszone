import type { Metadata } from "next";
import { auth } from "@/auth";
import Faq from "@/components/Faq";
import FadingBackground from "@/components/FadingBackground";
import LiquidGlassScene from "@/components/LiquidGlassScene";
import ProfileTabs from "@/components/ProfileTabs";
import StatsDashboard from "@/components/StatsDashboard";
import { getDelClubName } from "@/lib/delClubs";
import { getUpcomingGames } from "@/lib/games";
import { getLeagueStats } from "@/lib/pennyDel";
import { COMMUNITY_SCENE } from "@/lib/glassScenes";

export const metadata: Metadata = {
  title: "Community",
  description:
    "Häufige Fragen rund um TigersZone – freut euch auf coole Aktionen, Preise und Umfragen.",
  alternates: { canonical: "/community" },
};

export default async function CommunityPage() {
  // Statistiken/Umfragen are still being tried out. The league numbers are only requested when they are shown.
  const session = await auth();
  // On the live site (production) only admins; in previews and local development everybody, so the page can
  // be tried out.
  const showStats =
    session?.user?.role === "admin" || process.env.VERCEL_ENV !== "production";
  const stats = showStats ? await getLeagueStats() : null;
  const [nextGame] = showStats ? await getUpcomingGames(1) : [];
  const opponentId = nextGame
    ? nextGame.homeTeamId === "straubing-tigers"
      ? nextGame.awayTeamId
      : nextGame.homeTeamId
    : null;

  return (
    <FadingBackground
      src="/images/Community_.jpg"
      opacity={COMMUNITY_SCENE.opacity}
      blurPx={COMMUNITY_SCENE.blurPx}
    >
      <LiquidGlassScene background={COMMUNITY_SCENE}>
        <section className="mx-auto max-w-3xl px-7 py-10 sm:px-6 sm:py-16">
          <h1 className="font-ui text-[2.15rem] leading-[1.06] font-semibold tracking-tight text-white sm:text-5xl">
            Community
          </h1>

          {showStats && (
            <ProfileTabs
              tabs={[
                {
                  id: "statistiken",
                  label: "Statistiken",
                  content: (
                    <div className="mt-6">
                      {stats ? (
                        <StatsDashboard
                          stats={stats}
                          opponentName={
                            opponentId ? getDelClubName(opponentId) : null
                          }
                        />
                      ) : (
                        <div
                          data-liquid-glass="card"
                          className="glass-panel p-5 sm:p-6"
                        >
                          <h3 className="font-ui text-xl font-semibold tracking-tight text-white">
                            Statistiken gerade nicht verfügbar
                          </h3>
                          <p className="mt-2 text-[15px] leading-snug text-white/70">
                            Die Zahlen der Liga konnten gerade nicht geladen
                            werden. Schau bitte später noch einmal vorbei.
                          </p>
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  id: "umfragen",
                  label: "Umfragen",
                  content: (
                    <div
                      data-liquid-glass="card"
                      className="glass-panel mt-6 p-5 sm:p-6"
                    >
                      <h3 className="font-ui text-xl font-semibold tracking-tight text-white">
                        Umfragen
                      </h3>
                      <p className="mt-2 text-[15px] leading-snug text-white/70">
                        Hier entstehen bald Umfragen rund um die Tigers. Schau
                        regelmäßig vorbei.
                      </p>
                    </div>
                  ),
                },
              ]}
            />
          )}

          <div className={showStats ? "mt-10 sm:mt-14" : "mt-8 sm:mt-12"}>
            <Faq />
          </div>
        </section>
      </LiquidGlassScene>
    </FadingBackground>
  );
}
