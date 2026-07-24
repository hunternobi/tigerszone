import { Calendar, Clock } from "lucide-react";
import { Sacramento } from "next/font/google";
import FadingBackground from "@/components/FadingBackground";
import GlassButtonExact from "@/components/GlassButtonExact";
import InstagramEmbed from "@/components/InstagramEmbed";
import Reveal from "@/components/Reveal";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";
import { getUpcomingGames } from "@/lib/games";
import { getTeamName } from "@/lib/teams";
import { formatGameDate, formatGameTime } from "@/utils/format";

const scriptFont = Sacramento({ weight: "400", subsets: ["latin"] });

const INSTAGRAM_POSTS = ["https://www.instagram.com/p/DVG8cgaDHBf/"];

export default async function Home() {
  const nextGame = (await getUpcomingGames(1))[0];
  const daysUntilGame = nextGame
    ? Math.max(
        0,
        Math.ceil((new Date(nextGame.kickoff).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      )
    : 0;

  return (
    <>
      <FadingBackground src="/images/hero-stadium.jpg">
      <section className="relative min-h-screen overflow-hidden px-4 py-16 sm:min-h-[130vh] sm:px-6 sm:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-tigers-primary/70 via-tigers-primary/60 to-tigers-primary" />

        <div className="relative mx-auto flex min-h-[calc(100vh-12rem)] max-w-4xl flex-col justify-center text-center">
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            Willkommen in der
            <span
              className={`${scriptFont.className} script-heading mt-2 block text-6xl text-tigers-secondary sm:text-7xl`}
            >
              {SITE_NAME}
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">{SITE_DESCRIPTION}</p>

          <div className="mt-8 flex justify-center">
            <GlassButtonExact href="/community" size="0.9rem">
              Community Entdecken
            </GlassButtonExact>
          </div>

          {nextGame && (
            <Reveal>
              <div className="glass-panel mx-auto mt-10 max-w-2xl p-5 text-left sm:mt-16 sm:p-8">
                <h2 className="text-center text-2xl font-bold text-white">Nächstes Spiel</h2>
                <p className="mt-2 text-center text-sm text-white/60">
                  Bereit für die nächste Herausforderung? Stelle deine Prognose und sammle Punkte!
                </p>

                <div className="mt-6 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-tigers-secondary">
                      {nextGame.competition === "Vorbereitung" ? "Vorbereitungsspiel" : "DEL"}
                    </p>
                    <p className="mt-1 text-xl font-bold text-white">
                      {getTeamName(nextGame.homeTeamId)} vs. {getTeamName(nextGame.awayTeamId)}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-white/60">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> {formatGameDate(nextGame.kickoff)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} /> {formatGameTime(nextGame.kickoff)} Uhr
                      </span>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-3xl font-bold text-tigers-secondary">{daysUntilGame}</p>
                    <p className="text-xs text-white/60">Tage bis zum Spiel</p>
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
      </FadingBackground>

      <section className="relative overflow-hidden border-t border-white/10 bg-tigers-primary px-4 py-12 text-center sm:px-6 sm:py-16">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="select-none text-[3.5rem] font-black whitespace-nowrap text-white opacity-35 blur-[1.5px] sm:text-[10rem] lg:text-[13rem]">
            2026/27
          </span>
        </div>

        <div className="relative">
          <Reveal>
            <h2 className="text-3xl font-bold text-white">Bereit für die neue Saison?</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/70">
              Werde Teil der TigersZone-Community, erlebe Eishockey neu, nimm am Tippspiel teil
              und kämpfe um Ruhm und Ehre!
            </p>
            <GlassButtonExact href="/register" wrapperClassName="mt-6" size="1rem">
              Jetzt Registrieren
            </GlassButtonExact>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-white/10 bg-tigers-primary px-4 py-12 sm:px-6 sm:py-16">
        <Reveal>
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="text-3xl font-bold text-white">Folge uns auf Instagram</h2>
            <p className="mx-auto mt-2 max-w-xl text-white/70">
              Bleibe auf dem Laufenden mit den neuesten Updates, Memes und Fan-Content
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
                <p className="mt-3 text-center text-sm text-white/70">
                  Folg&apos; uns auf Instagram für Memes, coole Fan-Momente und die neuesten
                  Updates rund um unsere Jungs.
                </p>

                <ul className="mx-auto mt-4 w-fit space-y-2 text-sm text-white/80">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-tigers-secondary" />
                    Exklusive Spieler-Interviews
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-tigers-secondary" />
                    Fan-Momente &amp; Memes
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-tigers-secondary" />
                    Live-Updates zu Spielen
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
    </>
  );
}
