import {
  Activity,
  BarChart3,
  Hand,
  ListOrdered,
  Swords,
  Target,
  Timer,
} from "lucide-react";
import PillButton from "@/components/PillButton";
import Reveal from "@/components/Reveal";

const FEATURES = [
  { label: "Head2Head", Icon: Swords, tint: "from-[#7a9be0] to-[#3a54a5]" },
  { label: "Form", Icon: Activity, tint: "from-[#4ade80] to-[#15803d]" },
  { label: "Torhüter", Icon: Hand, tint: "from-[#fbbf24] to-[#b45309]" },
  { label: "Tabelle", Icon: ListOrdered, tint: "from-[#a78bfa] to-[#6d28d9]" },
  { label: "Topscorer", Icon: Target, tint: "from-[#fb7185] to-[#be123c]" },
  { label: "Strafminuten", Icon: Timer, tint: "from-[#94a3b8] to-[#475569]" },
];

/** Big "new" notice on the landing page, in the style of an App Store feature card. */
export default function StatsAnnouncement() {
  return (
    <Reveal>
      <div className="glass-panel relative mx-auto mt-8 max-w-2xl overflow-hidden p-6 text-center sm:mt-14 sm:p-10">
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
          <ul className="mx-auto mt-5 max-w-sm divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/15 bg-white/10 text-left">
            {FEATURES.map(({ label, Icon, tint }) => (
              <li
                key={label}
                className="flex min-h-[48px] items-center gap-3 px-3"
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-[0.55rem] bg-gradient-to-b ${tint} shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]`}
                >
                  <Icon size={17} strokeWidth={2.2} className="text-white" />
                </span>
                <span className="font-ui text-[1.0625rem] font-medium tracking-tight text-white">
                  {label}
                </span>
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
