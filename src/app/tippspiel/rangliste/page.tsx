import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import FadingBackground from "@/components/FadingBackground";
import Leaderboard from "@/components/Leaderboard";
import { getGlobalLeaderboard } from "@/lib/leaderboard";

export const metadata: Metadata = {
  title: "Gesamtrangliste",
  robots: { index: false, follow: false },
};

export default async function RanglistePage() {
  const entries = await getGlobalLeaderboard();

  return (
    <FadingBackground
      src="/images/tippabgabe-bg.jpg"
      mobileSrc="/images/tippabgabe-bg-mobile.jpg"
      opacity={0.55}
      blurPx={1.5}
    >
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        <Link
          href="/tippspiel"
          className="inline-flex items-center gap-2 text-sm text-white hover:underline"
        >
          <ArrowLeft size={16} />
          Zurück zum Tippspiel
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-white">Gesamtrangliste</h1>
        <p className="mt-2 text-white">Alle Spieler und ihre Gesamtpunktzahl.</p>

        <div className="mt-8">
          <Leaderboard entries={entries} title={`${entries.length} Spieler`} />
        </div>
      </section>
    </FadingBackground>
  );
}
