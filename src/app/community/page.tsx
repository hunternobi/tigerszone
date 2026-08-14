import type { Metadata } from "next";
import Faq from "@/components/Faq";
import FadingBackground from "@/components/FadingBackground";

export const metadata: Metadata = {
  title: "Community",
  description: "Häufige Fragen rund um TigersZone – freut euch auf coole Aktionen, Preise und Umfragen.",
  alternates: { canonical: "/community" },
};

export default function CommunityPage() {
  return (
    <FadingBackground src="/images/Community_.jpg" opacity={0.55} blurPx={1.5}>
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-3xl font-bold text-white">Community</h1>
        <p className="mt-3 text-white">
          Freut euch auf viele coole Aktionen, Preise und Umfragen während der Saison. Stay tuned!
        </p>

        <div className="mt-12">
          <Faq />
        </div>
      </section>
    </FadingBackground>
  );
}
