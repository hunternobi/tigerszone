import type { Metadata } from "next";
import { auth } from "@/auth";
import Faq from "@/components/Faq";
import FadingBackground from "@/components/FadingBackground";
import LiquidGlassScene from "@/components/LiquidGlassScene";
import ProfileTabs from "@/components/ProfileTabs";
import PillButton from "@/components/PillButton";
import PartnerShowcase from "@/components/PartnerShowcase";
import StatsDashboard from "@/components/StatsDashboard";
import { getDelClubName } from "@/lib/delClubs";
import { getAllGames } from "@/lib/games";
import { getLeagueStats } from "@/lib/pennyDel";
import { COMMUNITY_SCENE } from "@/lib/glassScenes";

export const metadata: Metadata = {
  title: "Community",
  description:
    "Häufige Fragen rund um TigersZone – freut euch auf coole Aktionen, Preise und Umfragen.",
  alternates: { canonical: "/community" },
};

export default async function CommunityPage() {
  const session = await auth();
  // The statistics tab is visible to everybody, the numbers themselves only to signed-in users (the league
  // numbers are only requested for them).
  const signedIn = Boolean(session?.user);
  const loadStats = signedIn;
  const stats = loadStats ? await getLeagueStats() : null;
  const allGames = loadStats ? await getAllGames() : [];
  const recentGames = allGames.filter(
    (game) =>
      game.status === "finished" &&
      game.competition !== "Vorbereitung" &&
      game.homeScore !== undefined,
  );
  // Head2Head shows the opponent of the next match day, and a match day only counts as over at midnight
  // (German time) - the same moment the statistics are refreshed.
  const berlinDay = (date: Date) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(
      date,
    );
  const today = berlinDay(new Date());
  const nextGame = allGames.find(
    (game) =>
      game.competition !== "Vorbereitung" &&
      berlinDay(new Date(game.kickoff)) >= today,
  );
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

          <ProfileTabs
            tabs={[
              {
                id: "statistiken",
                label: "Statistiken",
                content: (
                  <div className="mt-6">
                    {!signedIn ? (
                      <div
                        data-liquid-glass="card"
                        className="glass-panel flex flex-wrap items-center justify-between gap-x-4 gap-y-3 p-5 sm:p-6"
                      >
                        <div className="min-w-0">
                          <h3 className="font-ui text-xl font-semibold tracking-tight text-white">
                            Statistiken nur mit Anmeldung
                          </h3>
                          <p className="mt-1 text-[0.9375rem] leading-snug text-white/80">
                            Melde dich an, um Head2Head, Form, Tabelle und mehr
                            zu sehen.
                          </p>
                        </div>
                        <PillButton href="/login?callbackUrl=/community">
                          Einloggen
                        </PillButton>
                      </div>
                    ) : stats ? (
                      <StatsDashboard
                        stats={stats}
                        recentGames={recentGames}
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
                        <p className="mt-2 text-[0.9375rem] leading-snug text-white/70">
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
                    <p className="mt-2 text-[0.9375rem] leading-snug text-white/70">
                      Hier entstehen bald Umfragen rund um die Tigers. Schau
                      regelmäßig vorbei.
                    </p>
                  </div>
                ),
              },
            ]}
          />

          <PartnerShowcase />

          <div className="mt-10 sm:mt-14">
            <Faq />
          </div>
        </section>
      </LiquidGlassScene>
    </FadingBackground>
  );
}
