import FadingBackground from "@/components/FadingBackground";
import LeaderboardWidget from "@/components/LeaderboardWidget";
import TippspielTable, { type ResultEntry } from "@/components/TippspielTable";
import { SCORING } from "@/lib/constants";
import type { Game } from "@/types";
import type { LeaderboardEntry } from "@/components/Leaderboard";
import type { GroupLeaderboardData } from "@/lib/leaderboard";

interface TippspielInteractiveProps {
  vorbereitungGames: Game[];
  hauptrundeGames: Game[];
  predictions: Record<string, { predictedHome: number; predictedAway: number }>;
  results: ResultEntry[];
  isAuthenticated: boolean;
  globalEntries: LeaderboardEntry[];
  groupLeaderboards: GroupLeaderboardData[];
  activeGroupId: string | null;
}

export default function TippspielInteractive({
  vorbereitungGames,
  hauptrundeGames,
  predictions,
  results,
  isAuthenticated,
  globalEntries,
  groupLeaderboards,
  activeGroupId,
}: TippspielInteractiveProps) {
  return (
    <FadingBackground src="/images/tippabgabe-bg.jpg" opacity={0.55} blurPx={1.5}>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
          <div>
            <h1 className="text-3xl font-bold text-white">Tippspiel</h1>
            <p className="mt-3 text-white">
              Trag deinen Tipp direkt in der Tabelle ein – Vorbereitung und Hauptrunde,
              chronologisch sortiert.
            </p>

            <div className="mt-8">
              <TippspielTable
                vorbereitungGames={vorbereitungGames}
                hauptrundeGames={hauptrundeGames}
                predictions={predictions}
                results={results}
                isAuthenticated={isAuthenticated}
              />
            </div>
          </div>

          <aside className="space-y-6">
            <LeaderboardWidget
              globalEntries={globalEntries}
              groupLeaderboards={groupLeaderboards}
              activeGroupId={activeGroupId}
            />

            <div className="glass-panel p-4 sm:p-6">
              <h3 className="mb-4 text-lg font-bold text-white">Regeln</h3>
              <ul className="space-y-2 text-sm text-white">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-tigers-secondary" />
                  Tippabgabe endet mit Spielbeginn
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-tigers-secondary" />
                  {SCORING.WINNER} Punkte für den richtigen Sieger
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-tigers-secondary" />
                  {SCORING.GOAL_DIFF} Punkte für die richtige Tordifferenz
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-tigers-secondary" />
                  {SCORING.EXACT_SCORE} Punkte für das richtige Ergebnis
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </FadingBackground>
  );
}
