import type { Metadata } from "next";
import Faq from "@/components/Faq";
import FadingBackground from "@/components/FadingBackground";
import LiquidGlassScene from "@/components/LiquidGlassScene";
import { COMMUNITY_SCENE } from "@/lib/glassScenes";

export const metadata: Metadata = {
  title: "Community",
  description:
    "Häufige Fragen rund um TigersZone – freut euch auf coole Aktionen, Preise und Umfragen.",
  alternates: { canonical: "/community" },
};

export default function CommunityPage() {
  return (
    <FadingBackground
      src="/images/Community_.jpg"
      opacity={COMMUNITY_SCENE.opacity}
      blurPx={COMMUNITY_SCENE.blurPx}
    >
      <LiquidGlassScene background={COMMUNITY_SCENE}>
        <section className="mx-auto max-w-3xl px-7 py-10 sm:px-6 sm:py-16">
          <h1 className="font-ui text-[2.15rem] leading-[1.06] font-semibold tracking-tight text-white sm:text-5xl">
            Community
          </h1>

          <div className="mt-8 sm:mt-12">
            <Faq />
          </div>
        </section>
      </LiquidGlassScene>
    </FadingBackground>
  );
}
