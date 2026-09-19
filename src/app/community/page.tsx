import type { Metadata } from "next";
import Faq from "@/components/Faq";
import FadingBackground from "@/components/FadingBackground";
import SaisonprognoseCard from "@/components/SaisonprognoseCard";
import ShootoutCard from "@/components/ShootoutCard";
import { auth } from "@/auth";
import { getMySeasonPrediction, getSeasonPredictionDeadline } from "@/app/community/seasonPredictionActions";

export const metadata: Metadata = {
  title: "Community",
  description: "Häufige Fragen rund um TigersZone – freut euch auf coole Aktionen, Preise und Umfragen.",
  alternates: { canonical: "/community" },
};

export default async function CommunityPage() {
  const session = await auth();
  const [initialOrder, deadline] = await Promise.all([
    getMySeasonPrediction(),
    getSeasonPredictionDeadline(),
  ]);
  const locked = deadline != null && new Date() >= deadline;

  return (
    <FadingBackground src="/images/Community_.jpg" opacity={0.55} blurPx={1.5}>
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-3xl font-bold text-white">Community</h1>

        <SaisonprognoseCard
          initialOrder={initialOrder}
          isAuthenticated={!!session?.user}
          locked={locked}
          playerName={session?.user?.name ?? ""}
        />

        <ShootoutCard />

        <div className="mt-12">
          <Faq />
        </div>
      </section>
    </FadingBackground>
  );
}
