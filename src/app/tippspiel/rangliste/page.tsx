import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import FadingBackground from "@/components/FadingBackground";
import { auth } from "@/auth";
import GlobalRanking from "@/components/GlobalRanking";
import { getGlobalLeaderboard } from "@/lib/leaderboard";

export const metadata: Metadata = {
  title: "Gesamtrangliste",
  robots: { index: false, follow: false },
};

export default async function RanglistePage() {
  const [entries, session] = await Promise.all([
    getGlobalLeaderboard(),
    auth(),
  ]);

  return (
    <FadingBackground
      src="/images/tippabgabe-bg.jpg"
      mobileSrc="/images/tippabgabe-bg-mobile.jpg"
      opacity={0.55}
      blurPx={1.5}
    >
      <section className="mx-auto max-w-3xl px-7 py-10 sm:px-6 sm:py-16">
        <Link
          href="/tippspiel"
          className="inline-flex min-h-[44px] items-center gap-2 text-sm text-white hover:underline"
        >
          <ArrowLeft size={16} />
          Zurück zum Tippspiel
        </Link>

        <h1 className="font-ui mt-2 text-[2.15rem] leading-[1.06] font-semibold tracking-tight text-white sm:text-5xl">
          Gesamtrangliste
        </h1>
        <p className="mt-2 text-white/80">
          Alle Spieler und ihre Gesamtpunktzahl.
        </p>

        <div className="mt-8">
          <GlobalRanking entries={entries} meId={session?.user?.id} />
        </div>
      </section>
    </FadingBackground>
  );
}
