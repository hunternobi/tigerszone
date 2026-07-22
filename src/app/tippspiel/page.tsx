import { Calendar, Clock } from "lucide-react";
import LeaderboardWidget from "@/components/LeaderboardWidget";
import PredictionForm from "@/components/PredictionForm";
import { getUpcomingGames } from "@/lib/games";
import { getTeamName } from "@/lib/teams";
import { formatGameDate, formatGameTime } from "@/utils/format";

export default function TippspielPage() {
  const upcomingGames = getUpcomingGames(5);

  return (
    <>
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
          <div>
            <h1 className="text-3xl font-bold text-white">Tippspiel</h1>
            <p className="mt-3 text-white/70">
              Die nächsten 5 anstehenden Spiele der Straubing Tigers. Klick bei einem Spiel auf
              „Jetzt Tippen”, um direkt zur Tippabgabe zu springen.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {upcomingGames.map((game) => (
                <div
                  key={game._id}
                  className="glass-panel-sm glass-interactive flex flex-col justify-between gap-3 p-4"
                >
                  <div>
                    {game.competition === "Vorbereitung" ? (
                      <span className="inline-block rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/60">
                        Vorbereitung
                      </span>
                    ) : (
                      <span className="inline-block rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/60">
                        DEL{game.matchday ? ` · ${game.matchday}` : ""}
                      </span>
                    )}
                    {game.isDerby && (
                      <span className="mt-1 inline-block rounded-full bg-tigers-accent px-3 py-1 text-[10px] font-semibold text-white">
                        Derby
                      </span>
                    )}

                    <p className="mt-2 text-sm leading-tight font-bold text-white">
                      {getTeamName(game.homeTeamId)}
                    </p>
                    <p className="text-xs text-white/50">vs.</p>
                    <p className="text-sm leading-tight font-bold text-white">
                      {getTeamName(game.awayTeamId)}
                    </p>

                    <div className="mt-2 space-y-1 text-[11px] text-white/60">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {formatGameDate(game.kickoff)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {formatGameTime(game.kickoff)} Uhr
                      </span>
                    </div>
                  </div>

                  <a
                    href={`#tipp-${game._id}`}
                    className="glass-pill glass-pill-primary glass-interactive px-4 py-2 text-center text-xs font-semibold text-white"
                  >
                    Jetzt Tippen
                  </a>
                </div>
              ))}
            </div>
          </div>

          <aside>
            <LeaderboardWidget />
          </aside>
        </div>
      </section>

      <section
        id="tippabgabe"
        className="scroll-mt-24 border-t border-white/10 bg-tigers-primary px-6 py-16"
      >
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_300px]">
          <div className="glass-panel p-8">
            <h2 className="text-center text-2xl font-bold text-white">Tippabgabe</h2>

            <div className="mt-8 space-y-5">
              {upcomingGames.map((game) => (
                <div
                  key={game._id}
                  id={`tipp-${game._id}`}
                  className="glass-panel-sm scroll-mt-24 p-5"
                >
                  {game.competition === "Vorbereitung" ? (
                    <span className="mb-2 inline-block rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/60">
                      Vorbereitungsspiel
                    </span>
                  ) : (
                    <span className="mb-2 inline-block rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/60">
                      DEL{game.matchday ? ` · Spieltag ${game.matchday}` : ""}
                    </span>
                  )}
                  {game.isDerby && (
                    <span className="mb-2 ml-2 inline-block rounded-full bg-tigers-accent px-3 py-1 text-xs font-semibold text-white">
                      Derby · Doppelte Punkte
                    </span>
                  )}

                  <p className="font-semibold text-white">
                    {getTeamName(game.homeTeamId)} vs. {getTeamName(game.awayTeamId)}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-4 text-sm text-white/60">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} /> {formatGameDate(game.kickoff)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {formatGameTime(game.kickoff)} Uhr
                    </span>
                  </div>

                  <div className="mt-4">
                    <PredictionForm game={game} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside>
            <div className="glass-panel p-6">
              <h3 className="mb-4 text-lg font-bold text-white">Regeln</h3>
              <ul className="space-y-2 text-sm text-white/80">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-tigers-secondary" />
                  Trag dein Ergebnis im Format „3:2” ein
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-tigers-secondary" />
                  3 Punkte für den richtigen Sieger
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-tigers-secondary" />
                  +2 Punkte für den exakten Spielstand
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-tigers-secondary" />
                  +1 für die richtige Tordifferenz
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
