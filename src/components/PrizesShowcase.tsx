import Link from "next/link";
import { Trophy } from "lucide-react";
import PillButton from "@/components/PillButton";
import PlaceNumber from "@/components/PlaceNumber";
import Reveal from "@/components/Reveal";
import { PLACE_STYLE, PRIZES } from "@/lib/prizes";

/** The prizes on the landing page: a podium of three glass cards, gold in the middle (phones included). */
export default function PrizesShowcase() {
  // Podium order: 2nd, 1st, 3rd.
  const podium = [PRIZES[1], PRIZES[0], PRIZES[2]];

  return (
    <Reveal>
      <div className="mx-auto mt-6 max-w-2xl sm:mt-12">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-12 items-center justify-center rounded-[1rem] bg-gradient-to-b from-[#fde68a] to-[#b45309] shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_8px_20px_rgba(0,0,0,0.35)]">
            <Trophy size={24} strokeWidth={2.2} className="text-white" />
          </span>
          <p className="font-ui mt-3 text-[0.75rem] font-semibold tracking-[0.16em] text-amber-200 uppercase">
            Das gibt es zu gewinnen
          </p>
          <h2 className="font-ui mt-1 text-[1.75rem] leading-[1.1] font-semibold tracking-tight text-white sm:text-4xl">
            Unsere Preise
          </h2>
        </div>

        <ol className="mt-5 grid grid-cols-3 items-end gap-2 sm:mt-8 sm:gap-4">
          {podium.map((prize) => {
            const style = PLACE_STYLE[prize.place];
            const first = prize.place === 1;
            return (
              <li
                key={prize.place}
                className={`glass-panel flex flex-col items-center justify-center gap-2 border px-1.5 text-center sm:gap-3 sm:px-4 ${style.glow} ${
                  first ? "py-7 sm:py-9" : "py-4 sm:py-6"
                }`}
              >
                <PlaceNumber
                  place={prize.place}
                  className={first ? "text-[64px] sm:text-[80px]" : "text-[46px] sm:text-[58px]"}
                />
                <div className="min-w-0">
                  <p
                    className={`font-ui leading-tight font-semibold tracking-tight text-balance text-white ${
                      first
                        ? "text-[0.9375rem] sm:text-2xl"
                        : "text-[0.8125rem] sm:text-lg"
                    }`}
                  >
                    <span className="sr-only">{style.label}: </span>
                    {prize.title}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-5 flex justify-center">
          <PillButton href="/preise">Preise ansehen</PillButton>
        </div>
        <p className="mt-3 text-center text-[0.75rem] leading-snug text-white/75">
          Es gelten die{" "}
          <Link
            href="/teilnahmebedingungen"
            className="font-semibold underline underline-offset-2"
          >
            Teilnahmebedingungen
          </Link>
          .
        </p>
      </div>
    </Reveal>
  );
}
