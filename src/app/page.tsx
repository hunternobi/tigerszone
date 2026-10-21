import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { auth } from "@/auth";
import FadingBackground from "@/components/FadingBackground";
import GlassButtonExact from "@/components/GlassButtonExact";
import LiquidGlassCard from "@/components/LiquidGlassCard";
import InstagramEmbed from "@/components/InstagramEmbed";
import PartnerBar from "@/components/PartnerBar";
import Reveal from "@/components/Reveal";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";
import { getUpcomingGames } from "@/lib/games";
import { getTeamById, getTeamName } from "@/lib/teams";
import { formatGameDateCompact, formatGameTime } from "@/utils/format";
import NextGameHeroCountdown from "@/components/NextGameHeroCountdown";

const INSTAGRAM_POSTS = ["https://www.instagram.com/p/DVG8cgaDHBf/"];

// The page photo as FadingBackground draws it; the glass card refracts a matching copy of it.
const HERO_OPACITY = 0.55;
const HERO_BLUR_PX = 1.5;
const HERO_GLASS_BACKGROUND = {
  src: "/_next/image?url=%2Fimages%2Fhero-stadium-tinted.jpg&w=1920&q=75",
  mobileSrc: "/_next/image?url=%2Fimages%2Fhero-stadium-mobile.jpg&w=828&q=75",
  opacity: HERO_OPACITY,
  color: "#0a0f3d",
  blurPx: HERO_BLUR_PX,
};

const shortTeamName = (teamId: string) => getTeamById(teamId)?.shortName ?? getTeamName(teamId);

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
      <section className="relative overflow-hidden px-7 pt-4 pb-8 sm:min-h-screen sm:px-6 sm:py-24">
        <div className="relative mx-auto max-w-4xl text-left sm:text-center">
          <h1 className="text-3xl font-bold text-white sm:text-5xl">
            Willkommen in der
            <span className="script-heading mt-1 block text-3xl tracking-wide text-tigers-secondary sm:mt-2 sm:text-5xl">
              {SITE_NAME}
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-base text-white sm:mx-auto sm:mt-6 sm:text-lg">{SITE_DESCRIPTION}</p>

          {nextGame && (
            <Reveal>
              <LiquidGlassCard
                className="mx-auto mt-4 max-w-2xl text-left sm:mt-10"
                contentClassName="p-3.5 sm:p-7"
                background={HERO_GLASS_BACKGROUND}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
                  <div className="min-w-0">
                    {/* Sans-serif inline: the global heading rule would otherwise force the serif font. */}
                    <h2
                      style={{ fontFamily: "var(--font-sans), Arial, Helvetica, sans-serif" }}
                      className="text-[11px] font-semibold tracking-[0.14em] text-white/60 uppercase sm:text-xs"
                    >
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
                        <span className="font-medium text-white/50">vs.</span>{" "}
                        {shortTeamName(nextGame.awayTeamId)}
                      </span>
                      <span className="hidden sm:inline">
                        {getTeamName(nextGame.homeTeamId)}{" "}
                        <span className="font-medium text-white/50">vs.</span>{" "}
                        {getTeamName(nextGame.awayTeamId)}
                      </span>
                    </p>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[13px] text-white/70 sm:mt-3 sm:text-base">
                      <span>
                        <span className="sm:hidden">{formatGameDateCompact(nextGame.kickoff)}</span>
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
                    {/* after:-inset keeps the touch target at 44px while the button itself stays compact */}
                    <Link
                      href="/tippspiel"
                      className="relative inline-flex min-h-[38px] shrink-0 items-center justify-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold whitespace-nowrap text-tigers-primary shadow-[0_6px_18px_rgba(0,0,0,0.35)] transition duration-200 after:absolute after:-inset-[3px] after:content-[''] hover:bg-white/90 active:scale-[0.96] sm:min-h-[44px] sm:px-5 sm:text-[15px]"
                    >
                      Jetzt tippen
                      <ArrowRight size={15} strokeWidth={2.5} />
                    </Link>
                  </div>
                </div>
              </LiquidGlassCard>
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
              <h2 className="text-3xl font-bold text-white">Bereit für die neue Saison?</h2>
              <p className="mx-auto mt-3 max-w-xl text-white">
                Werde Teil der TigersZone-Community, erlebe Eishockey neu, nimm am Tippspiel teil
                und kämpfe um Ruhm und Ehre!
              </p>
              <GlassButtonExact
                href="/register"
                wrapperClassName="mt-6"
                size="1rem"
              >
                Jetzt Registrieren
              </GlassButtonExact>
            </Reveal>
          </div>
        </section>
      )}
      </FadingBackground>

      <section className="border-t border-white/10 bg-tigers-primary px-7 py-12 sm:px-6 sm:py-16">
        <Reveal>
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="text-3xl font-bold text-white">Folge uns auf Instagram</h2>
            <p className="mx-auto mt-2 max-w-xl text-white">
              Bleibe auf dem Laufenden mit den neuesten Memes, Designs und Fanbeiträgen rund um
              den besten Eishockeyverein der Welt
            </p>

            <div className="mt-10 flex flex-col items-stretch justify-center gap-6 sm:flex-row">
              {INSTAGRAM_POSTS.map((url) => (
                <div key={url} className="overflow-hidden rounded-2xl sm:w-80">
                  <InstagramEmbed url={url} />
                </div>
              ))}

              <div className="glass-panel flex flex-col justify-center p-5 text-left sm:w-80 sm:p-8">
                <h3 className="text-center text-xl font-bold text-white">
                  Werde Teil der Tigers-Zone
                </h3>
                <p className="mt-3 hidden text-center text-sm text-white sm:block">
                  Folg&apos; uns auf Instagram, um die volle Bandbreite der Tigers mitzuerleben
                  und immer auf dem Laufenden zu bleiben.
                </p>

                <ul className="mx-auto mt-4 w-fit space-y-2 text-sm text-white">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-tigers-secondary" />
                    Epische Designs
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-tigers-secondary" />
                    Fan-Momente
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-tigers-secondary" />
                    Memes
                  </li>
                </ul>

                <div className="mt-6 flex justify-center">
                  <GlassButtonExact href="/community" size="0.8rem">
                    Community Entdecken
                  </GlassButtonExact>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="border-t border-white/10 bg-tigers-primary px-7 py-8 text-center sm:px-6">
        <Link
          href="/community#faq"
          className="inline-flex items-center gap-2 text-sm font-medium text-tigers-secondary hover:underline"
        >
          Fragen? Schau in unserem FAQ-Bereich vorbei
          <ArrowRight size={16} />
        </Link>
      </section>
    </>
  );
}
