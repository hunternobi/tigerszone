"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";
import PillButton from "@/components/PillButton";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-7 py-16 text-center sm:px-6 sm:py-24">
      <span className="flex size-[64px] items-center justify-center rounded-[1.3rem] bg-gradient-to-b from-[#fb7185] to-[#be123c] shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_8px_20px_rgba(0,0,0,0.35)]">
        <TriangleAlert size={30} strokeWidth={2.2} className="text-white" />
      </span>
      <h1 className="font-ui mt-5 text-[2.15rem] leading-[1.06] font-semibold tracking-tight text-white sm:text-5xl">
        Da ist etwas schiefgelaufen
      </h1>
      <p className="mt-3 text-base leading-snug text-white/80 sm:text-lg">
        Die Seite konnte gerade nicht geladen werden. Versuch es bitte noch
        einmal. Deine Tipps sind davon nicht betroffen.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full bg-white px-5 text-[0.9375rem] font-semibold text-tigers-primary shadow-[0_6px_18px_rgba(0,0,0,0.35)] transition duration-200 hover:bg-white/90 active:scale-[0.96]"
        >
          <RotateCcw size={15} strokeWidth={2.5} />
          Erneut versuchen
        </button>
        <PillButton href="/">Zur Startseite</PillButton>
      </div>
    </section>
  );
}
