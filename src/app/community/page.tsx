import type { Metadata } from "next";
import Faq from "@/components/Faq";
import FadingBackground from "@/components/FadingBackground";
import LiquidGlassScene from "@/components/LiquidGlassScene";
import ProfileTabs from "@/components/ProfileTabs";
import StatsDashboard from "@/components/StatsDashboard";
import { getLeagueStats } from "@/lib/pennyDel";
import { COMMUNITY_SCENE } from "@/lib/glassScenes";

export const metadata: Metadata = {
  title: "Community",
  description:
    "Statistiken, Umfragen und häufige Fragen rund um TigersZone und die Straubing Tigers.",
  alternates: { canonical: "/community" },
};

// The statistics change on match days only; the page is rebuilt at most once an hour.
export const revalidate = 3600;

export default async function CommunityPage() {
  const stats = await getLeagueStats();

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
                    {stats ? (
                      <StatsDashboard stats={stats} />
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

          <div className="mt-10 sm:mt-14">
            <Faq />
          </div>
        </section>
      </LiquidGlassScene>
    </FadingBackground>
  );
}
