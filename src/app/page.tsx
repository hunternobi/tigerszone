import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { auth } from "@/auth";
import FadingBackground from "@/components/FadingBackground";
import InstagramEmbed from "@/components/InstagramEmbed";
import LiquidGlassScene, { NAVY_SCENE, type SceneBackground } from "@/components/LiquidGlassScene";
import NextGameHeroCountdown from "@/components/NextGameHeroCountdown";
import PartnerBar from "@/components/PartnerBar";
import PillButton from "@/components/PillButton";
import Reveal from "@/components/Reveal";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";
import { getUpcomingGames } from "@/lib/games";
import { getTeamById, getTeamName } from "@/lib/teams";
import { formatGameDateCompact, formatGameTime } from "@/utils/format";

const INSTAGRAM_POSTS = ["https://www.instagram.com/p/DVG8cgaDHBf/"];

// The page photo as FadingBackground draws it; the glass scene refracts a matching copy of it.
const HERO_OPACITY = 0.55;
const HERO_BLUR_PX = 1.5;
const HERO_SCENE: SceneBackground = {
  src: "/_next/image?url=%2Fimages%2Fhero-stadium-tinted.jpg&w=1920&q=75",
  mobileSrc: "/_next/image?url=%2Fimages%2Fhero-stadium-mobile.jpg&w=828&q=75",
  opacity: HERO_OPACITY,
  color: "#0a0f3d",
  blurPx: HERO_BLUR_PX,
};

const shortTeamName = (teamId: string) =>
  getTeamById(teamId)?.shortName ?? getTeamName(teamId);

export default async function Home() {
  const session = await auth();
  const [nextGame] = await getUpcomingGames(1);

  return (
    <>
      <FadingBackground
        src="/images/hero-stadium-tinted.jpg"
        mobileSrc="/images/hero-stadium-mobile.jpg"
        opacity={HERO_OPACITY}
        blurPx={HERO_BLUR_PX}
      >
        <LiquidGlassScene background={HERO_SCENE}>
          <section className="relative overflow-hidden px-7 pt-4 pb-8 sm:min-h-screen sm:px-6 sm:py-24">
            <div className="relative mx-auto max-w-4xl text-left sm:text-center">
              <h1 className="font-ui text-[2.15rem] leading-[1.06] font-semibold tracking-tight text-white sm:text-6xl">
                Willkommen in der
                <span className="script-heading block text-tigers-secondary">
                  {SITE_NAME}
                </span>
              </h1>

              <p className="mt-3 max-w-xl text-base leading-snug text-white/80 sm:mx-auto sm:mt-5 sm:text-xl">
                {SITE_DESCRIPTION}
              </p>

              {nextGame && (
                <Reveal>
                  <div
                    data-liquid-glass="card"
                    className="glass-panel mx-auto mt-4 max-w-2xl p-3.5 text-left sm:mt-10 sm:p-7"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
                      <div className="min-w-0">
                        <h2 className="font-ui text-[11px] font-semibold tracking-[0.14em] text-white/60 uppercase sm:text-xs">
                          Nächstes Spiel
                          {nextGame.competition === "Vorbereitung"
                            ? " · Vorbereitung"
                            : nextGame.matchday
                              ? ` · ${nextGame.matchday}. Spieltag`
                              : ""}
                        </h2>

                        <p className="mt-1.5 text-[22px] leading-[1.15] font-semibold tracking-tight text-balance text-white sm:mt-2.5 sm:text-4xl">
                          <span className="sm:hidden">
                            {shortTeamName(nextGame.homeTeamId)}{" "}
                            <span className="font-medium text-white/50">
                              vs.
                            </span>{" "}
                            {shortTeamName(nextGame.awayTeamId)}
                          </span>
                          <span className="hidden sm:inline">
                            {getTeamName(nextGame.homeTeamId)}{" "}
                            <span className="font-medium text-white/50">
                              vs.
                            </span>{" "}
                            {getTeamName(nextGame.awayTeamId)}
                          </span>
                        </p>

                        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[13px] text-white/70 sm:mt-3 sm:text-base">
                          <span>
                            <span className="sm:hidden">
                              {formatGameDateCompact(nextGame.kickoff)}
                            </span>
                            <span className="hidden sm:inline">
                              {formatGameDateCompact(nextGame.kickoff, true)}
                            </span>
                            <span aria-hidden> · </span>
                            {formatGameTime(nextGame.kickoff)} Uhr
                          </span>
                          {nextGame.isDerby && (
                            <span className="rounded-full border border-amber-300/30 bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-100 sm:text-xs">
                              Doppelte Punkte
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:gap-4">
                        <NextGameHeroCountdown kickoff={nextGame.kickoff} />
                        <PillButton href="/tippspiel">Jetzt tippen</PillButton>
                      </div>
                    </div>
                  </div>
                </Reveal>
              )}

              <PartnerBar />
            </div>
          </section>

          {!session?.user && (
            <section className="relative overflow-hidden px-7 py-12 text-center sm:px-6 sm:py-16">
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="select-none text-[56px] font-black whitespace-nowrap text-white opacity-35 blur-[1.5px] sm:text-[10rem] lg:text-[13rem]">
                  2026/27
                </span>
              </div>

              <div className="relative">
                <Reveal>
                  <h2 className="font-ui text-[2rem] leading-tight font-semibold tracking-tight text-white sm:text-5xl">
                    Bereit für die neue Saison?
                  </h2>
                  <p className="mx-auto mt-3 max-w-xl text-base leading-snug text-white/75 sm:text-lg">
                    Werde Teil der TigersZone-Community, erlebe Eishockey neu,
                    nimm am Tippspiel teil und kämpfe um Ruhm und Ehre!
                  </p>
                  <div className="mt-6">
                    <PillButton href="/register">Jetzt registrieren</PillButton>
                  </div>
                </Reveal>
              </div>
            </section>
          )}
        </LiquidGlassScene>
      </FadingBackground>

      <LiquidGlassScene
        background={NAVY_SCENE}
        className="border-t border-white/10 bg-tigers-primary"
      >
        <section className="px-7 py-12 sm:px-6 sm:py-16">
          <Reveal>
            <div className="mx-auto max-w-6xl text-center">
              <h2 className="font-ui text-[2rem] leading-tight font-semibold tracking-tight text-white sm:text-5xl">
                Folge uns auf Instagram
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base leading-snug text-white/70 sm:text-lg">
                Bleibe auf dem Laufenden mit den neuesten Memes, Designs und
                Fanbeiträgen rund um den besten Eishockeyverein der Welt
              </p>

              <div className="mt-8 flex flex-col items-stretch justify-center gap-6 sm:mt-10 sm:flex-row">
                {INSTAGRAM_POSTS.map((url) => (
                  <div
                    key={url}
                    className="overflow-hidden rounded-2xl sm:w-80"
                  >
                    <InstagramEmbed url={url} />
                  </div>
                ))}

                <div
                  data-liquid-glass="card"
                  className="glass-panel flex flex-col justify-center p-5 text-left sm:w-80 sm:p-7"
                >
                  <h3 className="font-ui text-xl font-semibold tracking-tight text-white">
                    Werde Teil der Tigers-Zone
                  </h3>
                  <p className="mt-2 hidden text-[15px] leading-snug text-white/70 sm:block">
                    Folg&apos; uns auf Instagram, um die volle Bandbreite der
                    Tigers mitzuerleben und immer auf dem Laufenden zu bleiben.
                  </p>

                  <ul className="mt-4 space-y-2.5 text-[15px] text-white/90">
                    {["Epische Designs", "Fan-Momente", "Memes"].map((item) => (
                      <li key={item} className="flex items-center gap-2.5">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-tigers-secondary" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5">
                    <PillButton href="/community">
                      Community entdecken
                    </PillButton>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <section className="border-t border-white/10 px-7 py-8 text-center sm:px-6">
          <Link
            href="/community#faq"
            className="inline-flex items-center gap-1 text-[15px] font-medium text-white/85 transition-colors hover:text-white"
          >
            Fragen? Schau in unserem FAQ-Bereich vorbei
            <ChevronRight size={17} strokeWidth={2.25} />
          </Link>
        </section>
      </LiquidGlassScene>
    </>
  );
}
