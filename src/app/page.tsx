import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { Oswald } from "next/font/google";
import { auth } from "@/auth";
import FadingBackground from "@/components/FadingBackground";
import GlassButtonExact from "@/components/GlassButtonExact";
import InstagramEmbed from "@/components/InstagramEmbed";
import Reveal from "@/components/Reveal";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";
import { getUpcomingGames } from "@/lib/games";
import { getTeamName } from "@/lib/teams";
import { formatGameDate, formatGameTime } from "@/utils/format";

const scriptFont = Oswald({ weight: "600", subsets: ["latin"] });

const INSTAGRAM_POSTS = ["https://www.instagram.com/p/DVG8cgaDHBf/"];

export default async function Home() {
  const session = await auth();
  const nextGame = (await getUpcomingGames(1))[0];
  const daysUntilGame = nextGame
    ? Math.max(
        0,
        Math.ceil((new Date(nextGame.kickoff).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      )
    : 0;

  return (
    <>
      <FadingBackground src="/images/hero-stadium-tinted.jpg">
      <section className="relative min-h-screen overflow-hidden px-4 py-16 sm:px-6 sm:py-24">
        <div className="relative mx-auto max-w-4xl text-left sm:text-center">
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            Willkommen in der
            <span
              className={`${scriptFont.className} script-heading mt-2 block text-5xl tracking-wide text-tigers-secondary sm:text-6xl`}
            >
              {SITE_NAME}
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-white sm:mx-auto">{SITE_DESCRIPTION}</p>

          <div className="mt-6 flex justify-start sm:justify-center">
            <GlassButtonExact href="/spieltagsblog" size="0.9rem">
              Zum Spieltagsblog
            </GlassButtonExact>
          </div>

          {nextGame && (
            <Reveal>
              <div className="glass-panel mx-auto mt-8 max-w-2xl p-4 text-left sm:mt-10 sm:p-8">
                <h2 className="text-center text-xl font-bold text-white sm:text-2xl">
                  Nächstes Spiel
                </h2>
                <p className="mt-1.5 text-center text-xs text-white sm:mt-2 sm:text-sm">
                  Bereit für den nächsten Spieltag? Tippe und zeig deinen Mitstreitern, wer
                  wirklich Ahnung vom Eishockey hat!
                </p>

                <div className="mt-4 flex flex-col items-center gap-4 text-center sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:text-left">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-tigers-secondary">
                      {nextGame.competition === "Vorbereitung" ? "Vorbereitungsspiel" : "DEL"}
                    </p>
                    <p className="mt-1 text-lg font-bold text-white sm:text-xl">
                      {getTeamName(nextGame.homeTeamId)} vs. {getTeamName(nextGame.awayTeamId)}
                    </p>
                    <div className="mt-2 flex flex-wrap justify-center gap-4 text-xs text-white sm:justify-start sm:text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> {formatGameDate(nextGame.kickoff)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} /> {formatGameTime(nextGame.kickoff)} Uhr
                      </span>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-2xl font-bold text-tigers-secondary sm:text-3xl">
                      {daysUntilGame}
                    </p>
                    <p className="text-xs text-white">Tage bis zum Spiel</p>
                    <GlassButtonExact
                      href="/tippspiel"
                      wrapperClassName="mt-3"
                      size="0.875rem"
                    >
                      Jetzt Tippen
                    </GlassButtonExact>
                  </div>
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      <section className="relative overflow-hidden px-4 py-12 text-center sm:px-6 sm:py-16">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="select-none text-[3.5rem] font-black whitespace-nowrap text-white opacity-35 blur-[1.5px] sm:text-[10rem] lg:text-[13rem]">
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
              href={session?.user ? "/profile" : "/register"}
              wrapperClassName="mt-6"
              size="1rem"
            >
              {session?.user ? "Bereits Registriert" : "Jetzt Registrieren"}
            </GlassButtonExact>
          </Reveal>
        </div>
      </section>
      </FadingBackground>

      <section className="border-t border-white/10 bg-tigers-primary px-4 py-12 sm:px-6 sm:py-16">
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
                <p className="mt-3 text-center text-sm text-white">
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
                    Fan-Momente &amp; Memes
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

      <section className="border-t border-white/10 bg-tigers-primary px-4 py-8 text-center sm:px-6">
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
