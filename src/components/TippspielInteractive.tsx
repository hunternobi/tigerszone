"use client";

import { useState } from "react";
import { Calendar, Clock } from "lucide-react";
import FadingBackground from "@/components/FadingBackground";
import LeaderboardWidget from "@/components/LeaderboardWidget";
import PredictionForm from "@/components/PredictionForm";
import { SCORING } from "@/lib/constants";
import { getTeamName } from "@/lib/teams";
import type { Game } from "@/types";
import { formatGameDate, formatGameTime } from "@/utils/format";

interface TippspielInteractiveProps {
  games: Game[];
}

export default function TippspielInteractive({ games }: TippspielInteractiveProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedGame = games.find((game) => game._id === selectedId) ?? null;

  return (
    <FadingBackground src="/images/tippabgabe-bg.jpg" opacity={0.55} blurPx={1.5}>
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
          <div>
            <h1 className="text-3xl font-bold text-white">Tippspiel</h1>
            <p className="mt-3 text-white/70">
              Die nächsten 3 anstehenden Spiele der Straubing Tigers. Klick bei einem Spiel auf
              „Jetzt Tippen”, um direkt zur Tippabgabe zu springen.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {games.map((game) => (
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
                    href="#tippabgabe"
                    onClick={() => setSelectedId(game._id)}
                    className="glass-pill glass-pill-primary glass-interactive px-4 py-2 text-center text-xs font-semibold text-white"
                  >
                    Jetzt Tippen
                  </a>
                </div>
              ))}
            </div>

            <div id="tippabgabe" className="glass-panel mt-12 scroll-mt-24 p-8">
              <h2 className="text-center text-2xl font-bold text-white">Tippabgabe</h2>

              {selectedGame ? (
                <div className="mt-8 glass-panel-sm p-6">
                  {selectedGame.competition === "Vorbereitung" ? (
                    <span className="inline-block rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/60">
                      Vorbereitungsspiel
                    </span>
                  ) : (
                    <span className="inline-block rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/60">
                      DEL{selectedGame.matchday ? ` · Spieltag ${selectedGame.matchday}` : ""}
                    </span>
                  )}
                  {selectedGame.isDerby && (
                    <span className="ml-2 inline-block rounded-full bg-tigers-accent px-3 py-1 text-xs font-semibold text-white">
                      Derby · Doppelte Punkte
                    </span>
                  )}

                  <div className="mt-4">
                    <PredictionForm game={selectedGame} />
                  </div>

                  <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-white/60">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} /> {formatGameDate(selectedGame.kickoff)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {formatGameTime(selectedGame.kickoff)} Uhr
                    </span>
                  </div>
                </div>
              ) : (
                <p className="mt-8 text-center text-sm text-white/50">
                  Wähle oben eines der drei Spiele aus, um deinen Tipp abzugeben.
                </p>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <LeaderboardWidget />

            <div className="glass-panel p-6">
              <h3 className="mb-4 text-lg font-bold text-white">Regeln</h3>
              <ul className="space-y-2 text-sm text-white/80">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-tigers-secondary" />
                  Tippabgabe endet mit Spielbeginn
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-tigers-secondary" />+
                  {SCORING.WINNER} für richtigen Sieger
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-tigers-secondary" />+
                  {SCORING.EXACT_SCORE} für richtigen Spielstand
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-tigers-secondary" />+
                  {SCORING.GOAL_DIFF_OR_OT} für richtige Tordifferenz
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </FadingBackground>
  );
}
