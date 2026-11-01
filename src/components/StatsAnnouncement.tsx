import { BarChart3 } from "lucide-react";
import PillButton from "@/components/PillButton";
import Reveal from "@/components/Reveal";

const FEATURES = ["Head2Head", "Form", "Torhüter", "Tabelle", "Topscorer"];

/** Big "new" notice on the landing page, in the style of an App Store feature card. */
export default function StatsAnnouncement() {
  return (
    <Reveal>
      <div
        data-liquid-glass="card"
        className="glass-panel relative mx-auto mt-8 max-w-2xl overflow-hidden p-6 text-center sm:mt-14 sm:p-10"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-56 w-[120%] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(122,155,224,0.45),transparent)]"
        />
        <div className="relative">
          <span className="mx-auto flex size-14 items-center justify-center rounded-[1.1rem] bg-gradient-to-b from-[#7a9be0] to-[#3a54a5] shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_8px_20px_rgba(0,0,0,0.35)] sm:size-16 sm:rounded-[1.3rem]">
            <BarChart3 size={28} strokeWidth={2.2} className="text-white" />
          </span>
          <p className="font-ui mt-4 text-[0.75rem] font-semibold tracking-[0.16em] text-white/80 uppercase">
            Neu
          </p>
          <h2 className="font-ui mt-1 text-[1.75rem] leading-[1.1] font-semibold tracking-tight text-balance text-white sm:text-5xl">
            Statistiken rund um die Tigers
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[1rem] leading-snug text-balance text-white/85 sm:text-lg">
            Ab jetzt im Community-Bereich: Wie stark ist der nächste Gegner, wie
            in Form sind die Tigers – alles auf einen Blick.
          </p>

          <ul className="mt-5 flex flex-wrap justify-center gap-2">
            {FEATURES.map((feature) => (
              <li
                key={feature}
                className="font-ui rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[0.8125rem] font-semibold text-white"
              >
                {feature}
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <PillButton href="/community">Zu den Statistiken</PillButton>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
