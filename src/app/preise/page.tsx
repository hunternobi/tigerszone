import type { Metadata } from "next";
import Link from "next/link";
import { Trophy } from "lucide-react";
import FadingBackground from "@/components/FadingBackground";
import PillButton from "@/components/PillButton";
import Scene from "@/components/Scene";
import { PLACE_STYLE, PRIZES } from "@/lib/prizes";

export const metadata: Metadata = {
  title: "Preise",
  description:
    "Das gibt es bei TigersZone zu gewinnen: die Preise für die besten Tipper der Hauptrunde.",
  alternates: { canonical: "/preise" },
};

export default function PreisePage() {
  return (
    <FadingBackground
      src="/images/hero-stadium-tinted.jpg"
      mobileSrc="/images/hero-stadium-mobile.jpg"
      opacity={0.45}
      blurPx={1.5}
    >
      <Scene>
        <section className="mx-auto max-w-2xl px-7 py-10 sm:px-6 sm:py-16">
          <span className="flex size-14 items-center justify-center rounded-[1.1rem] bg-gradient-to-b from-[#fde68a] to-[#b45309] shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_8px_20px_rgba(0,0,0,0.35)]">
            <Trophy size={28} strokeWidth={2.2} className="text-white" />
          </span>
          <h1 className="font-ui mt-4 text-[2.15rem] leading-[1.06] font-semibold tracking-tight text-white sm:text-5xl">
            Unsere Preise
          </h1>
          <p className="mt-3 text-base leading-snug text-white/80 sm:text-lg">
            Ein riesiges Dankeschön an unsere Unterstützer, die diese Preise
            möglich machen. Das können die besten Tipper der Hauptrunde
            gewinnen:
          </p>

          <ol className="mt-8 space-y-3">
            {PRIZES.map((prize) => {
              const style = PLACE_STYLE[prize.place];
              return (
                <li
                  key={prize.place}
                  className={`glass-panel flex items-center gap-4 border p-4 sm:p-5 ${style.glow}`}
                >
                  <span
                    className={`font-ui flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-b text-xl font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_4px_12px_rgba(0,0,0,0.35)] ${style.badge}`}
                  >
                    {prize.place}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[0.75rem] font-semibold tracking-[0.12em] text-white/65 uppercase">
                      {style.label}
                    </p>
                    <h2 className="font-ui text-xl leading-tight font-semibold tracking-tight text-white sm:text-2xl">
                      {prize.title}
                    </h2>
                    <p className="mt-1 text-[0.9375rem] leading-snug text-white/80">
                      {prize.detail}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-8">
            <PillButton href="/tippspiel">Zum Tippspiel</PillButton>
          </div>
          <p className="mt-4 text-[0.75rem] leading-snug text-white/75">
            Es gelten die{" "}
            <Link
              href="/teilnahmebedingungen"
              className="font-semibold underline underline-offset-2"
            >
              Teilnahmebedingungen
            </Link>
            .
          </p>
        </section>
      </Scene>
    </FadingBackground>
  );
}
