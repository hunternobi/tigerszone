import { Trophy } from "lucide-react";
import Reveal from "@/components/Reveal";
import { PLACE_STYLE, PRIZES } from "@/lib/prizes";

/** The prizes on the landing page: a podium of three glass cards, gold in the middle on larger screens. */
export default function PrizesShowcase() {
  // Podium order on wide screens: 2nd, 1st, 3rd.
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

        <ol className="mt-5 grid gap-2.5 sm:mt-8 sm:grid-cols-3 sm:items-end sm:gap-4">
          {podium.map((prize) => {
            const style = PLACE_STYLE[prize.place];
            const first = prize.place === 1;
            return (
              <li
                key={prize.place}
                className={`glass-panel flex items-center gap-4 border text-left sm:flex-col sm:justify-center sm:gap-3 sm:text-center ${style.glow} ${
                  first
                    ? "order-first p-4 sm:order-none sm:px-4 sm:py-9"
                    : "p-3.5 sm:px-4 sm:py-6"
                }`}
              >
                {/* Same width for every badge on phones, so the texts line up. */}
                <span className="flex w-14 shrink-0 items-center justify-center sm:w-auto">
                  <span
                    className={`font-ui flex items-center justify-center rounded-full bg-gradient-to-b font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_4px_12px_rgba(0,0,0,0.35)] ${style.badge} ${
                      first ? "size-14 text-2xl" : "size-11 text-lg"
                    }`}
                  >
                    {prize.place}
                  </span>
                </span>
                <div className="min-w-0">
                  <p className="text-[0.75rem] font-semibold tracking-[0.12em] text-white/65 uppercase">
                    {style.label}
                  </p>
                  <p
                    className={`font-ui mt-0.5 leading-tight font-semibold tracking-tight text-balance text-white ${
                      first ? "text-xl sm:text-2xl" : "text-lg"
                    }`}
                  >
                    {prize.title}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </Reveal>
  );
}
