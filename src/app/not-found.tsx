import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import PillButton from "@/components/PillButton";

export const metadata: Metadata = {
  title: "Seite nicht gefunden",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-7 py-16 text-center sm:px-6 sm:py-24">
      <span className="flex size-[64px] items-center justify-center rounded-[1.3rem] bg-gradient-to-b from-[#7a9be0] to-[#3a54a5] shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_8px_20px_rgba(0,0,0,0.35)]">
        <SearchX size={30} strokeWidth={2.2} className="text-white" />
      </span>
      <p className="font-ui mt-5 text-[0.75rem] font-semibold tracking-[0.16em] text-white/70 uppercase">
        Fehler 404
      </p>
      <h1 className="font-ui mt-1 text-[2.15rem] leading-[1.06] font-semibold tracking-tight text-white sm:text-5xl">
        Seite nicht gefunden
      </h1>
      <p className="mt-3 text-base leading-snug text-white/80 sm:text-lg">
        Diese Seite gibt es nicht oder nicht mehr. Vielleicht ist der Link
        veraltet oder es hat sich ein Tippfehler eingeschlichen.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <PillButton href="/">Zur Startseite</PillButton>
        <PillButton href="/tippspiel">Zum Tippspiel</PillButton>
      </div>
    </section>
  );
}
