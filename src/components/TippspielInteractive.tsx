import Link from "next/link";
import { ChevronRight } from "lucide-react";
import BonusTipsCard from "@/components/BonusTipsCard";
import FadingBackground from "@/components/FadingBackground";
import LeaderboardWidget from "@/components/LeaderboardWidget";
import LiquidGlassScene, {
  type SceneBackground,
} from "@/components/LiquidGlassScene";
import NextGameCountdown from "@/components/NextGameCountdown";
import TippspielTable from "@/components/TippspielTable";
import { SCORING } from "@/lib/constants";
import type { Game } from "@/types";
import type { LeaderboardEntry } from "@/components/Leaderboard";
import type { GroupLeaderboardData } from "@/lib/leaderboard";
import type { MyBonusPrediction } from "@/app/tippspiel/bonusActions";

// Darker than the other pages (0.55): the tip fields on a phone have to stay easy to read.
const PAGE_OPACITY = 0.38;
const PAGE_BLUR_PX = 1.5;

// The page photo as FadingBackground draws it; the glass surfaces refract a matching copy of it.
const PAGE_SCENE: SceneBackground = {
  src: "/_next/image?url=%2Fimages%2Ftippabgabe-bg.jpg&w=1920&q=75",
  mobileSrc: "/_next/image?url=%2Fimages%2Ftippabgabe-bg-mobile.jpg&w=828&q=75",
  opacity: PAGE_OPACITY,
  color: "#0a0f3d",
  blurPx: PAGE_BLUR_PX,
};

const RULES = [
  "Tippabgabe endet mit Spielbeginn",
  `${SCORING.WINNER} Punkte für den richtigen Sieger`,
  `${SCORING.GOAL_DIFF} Punkte für die richtige Tordifferenz`,
  `${SCORING.EXACT_SCORE} Punkte für das richtige Ergebnis`,
  "Derbys zählen doppelt",
];

interface TippspielInteractiveProps {
  nextGame: Game | null;
  hauptrundeGames: Game[];
  predictions: Record<string, { predictedHome: number; predictedAway: number }>;
  isAuthenticated: boolean;
  globalEntries: LeaderboardEntry[];
  groupLeaderboards: GroupLeaderboardData[];
  activeGroupId: string | null;
  bonusPrediction: MyBonusPrediction;
  bonusLocked: boolean;
  bonusDeadline: string | null;
}

export default function TippspielInteractive({
  nextGame,
  hauptrundeGames,
  predictions,
  isAuthenticated,
  globalEntries,
  groupLeaderboards,
  activeGroupId,
  bonusPrediction,
  bonusLocked,
  bonusDeadline,
}: TippspielInteractiveProps) {
  return (
    <FadingBackground
      src="/images/tippabgabe-bg.jpg"
      mobileSrc="/images/tippabgabe-bg-mobile.jpg"
      opacity={PAGE_OPACITY}
      blurPx={PAGE_BLUR_PX}
    >
      <LiquidGlassScene background={PAGE_SCENE}>
        <section className="mx-auto max-w-6xl px-7 py-10 sm:px-6 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
            <div className="order-1 lg:order-none lg:col-start-1 lg:row-start-1">
              <h1 className="font-ui text-[2.15rem] leading-[1.06] font-semibold tracking-tight text-white sm:text-5xl">
                Tippspiel
              </h1>

              {nextGame && (
                <NextGameCountdown
                  homeTeamId={nextGame.homeTeamId}
                  awayTeamId={nextGame.awayTeamId}
                  kickoff={nextGame.kickoff}
                />
              )}

              <div className="mt-8 space-y-8">
                {!bonusLocked && (
                  <BonusTipsCard
                    initial={bonusPrediction}
                    isAuthenticated={isAuthenticated}
                    deadline={bonusDeadline}
                  />
                )}
                <TippspielTable
                  hauptrundeGames={hauptrundeGames}
                  predictions={predictions}
                  isAuthenticated={isAuthenticated}
                />
              </div>
            </div>

            <aside className="order-2 space-y-6 lg:order-none lg:col-start-2 lg:row-start-1 lg:row-span-2">
              <LeaderboardWidget
                globalEntries={globalEntries}
                groupLeaderboards={groupLeaderboards}
                activeGroupId={activeGroupId}
              />

              <div
                data-liquid-glass="card"
                className="glass-panel hidden p-5 lg:block"
              >
                <h3 className="font-ui text-xl font-semibold tracking-tight text-white">
                  Regeln
                </h3>
                <ul className="mt-3 space-y-2.5 text-[15px] leading-snug text-white/85">
                  {RULES.map((rule) => (
                    <li key={rule} className="flex items-start gap-2.5">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-tigers-secondary" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {isAuthenticated && (
              <div className="order-3 lg:order-none lg:col-start-1 lg:row-start-2">
                <Link
                  href="/profile#tipphistorie"
                  data-liquid-glass="tile"
                  className="glass-panel glass-interactive flex min-h-[56px] items-center justify-between gap-3 px-5 py-3 text-[15px] font-semibold text-white"
                >
                  Hier geht es zu deiner Tipphistorie
                  <ChevronRight size={18} className="shrink-0 text-white/70" />
                </Link>
              </div>
            )}
          </div>
        </section>
      </LiquidGlassScene>
    </FadingBackground>
  );
}
