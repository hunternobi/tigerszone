import type { Metadata } from "next";
import {
  Antonio,
  Oswald,
  Barlow_Condensed,
  Big_Shoulders,
  Teko,
  Anton,
  Source_Serif_4,
  PT_Serif,
  Lora,
  Newsreader,
} from "next/font/google";

export const metadata: Metadata = {
  title: "Font-Vergleich (intern)",
  robots: { index: false, follow: false },
};

const antonio = Antonio({ weight: "600", subsets: ["latin"] });
const oswald = Oswald({ weight: "600", subsets: ["latin"] });
const barlowCondensed = Barlow_Condensed({ weight: "600", subsets: ["latin"] });
const bigShoulders = Big_Shoulders({ weight: "600", subsets: ["latin"] });
const teko = Teko({ weight: "600", subsets: ["latin"] });
const anton = Anton({ weight: "400", subsets: ["latin"] });
const sourceSerif = Source_Serif_4({ weight: "700", subsets: ["latin"] });
const ptSerif = PT_Serif({ weight: "700", subsets: ["latin"] });
const lora = Lora({ weight: "700", subsets: ["latin"] });
const newsreader = Newsreader({ weight: "700", subsets: ["latin"] });

interface FontOption {
  id: string;
  label: string;
  note: string;
  className: string;
}

const FONTS: FontOption[] = [
  { id: "geist", label: "Aktuell (Geist)", note: "Ist-Zustand, zum Vergleich", className: "" },
  { id: "antonio", label: "Antonio SemiBold", note: "direkter Treffer für „Antonio A3 Semi Bold“", className: antonio.className },
  { id: "oswald", label: "Oswald SemiBold", note: "wird schon beim Hero-Schriftzug „TigersZone“ verwendet", className: oswald.className },
  { id: "barlow", label: "Barlow Condensed SemiBold", note: "etwas schmaler, moderner", className: barlowCondensed.className },
  { id: "bigshoulders", label: "Big Shoulders SemiBold", note: "kantiger, sehr sportlich", className: bigShoulders.className },
  { id: "teko", label: "Teko SemiBold", note: "sehr schmal, viel Höhe", className: teko.className },
  { id: "anton", label: "Anton (nur 400, sehr fett)", note: "kein echtes SemiBold, aber als fette Alternative dabei", className: anton.className },
  { id: "sourceserif", label: "Source Serif 4 Bold", note: "Serif, ähnlich dem „AI drafts your slides“-Screenshot", className: sourceSerif.className },
  { id: "ptserif", label: "PT Serif Bold", note: "Serif, etwas klassischer/enger", className: ptSerif.className },
  { id: "lora", label: "Lora Bold", note: "Serif, weicher/runder", className: lora.className },
  { id: "newsreader", label: "Newsreader Bold", note: "Serif, editorial/Zeitungs-Look", className: newsreader.className },
];

function HeadingSamples({ className }: { className: string }) {
  return (
    <div className={className}>
      <h1 className="text-4xl font-bold text-white sm:text-5xl">
        Willkommen in der <span className="text-tigers-secondary">TigersZone</span>
      </h1>
      <h1 className="mt-6 text-3xl font-bold text-white">Tippspiel</h1>
      <h2 className="mt-4 text-2xl font-bold text-white">Benutzerverwaltung</h2>
      <h3 className="mt-4 text-xl font-bold text-white">Regeln</h3>
      <h3 className="mt-3 text-lg font-bold text-white">Häufige Fragen</h3>
    </div>
  );
}

export default function DevFontsPage() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold text-white">Font-Vergleich (nur intern, nicht verlinkt)</h1>
      <p className="mt-3 text-white">
        Größen sind exakt die echten Tailwind-Klassen von der Seite (text-5xl/4xl für Hero,
        text-3xl/2xl/xl/lg für Seiten- und Sektionstitel). Nur die Schriftart wechselt pro Block.
        Fließtext bleibt überall Geist, wie bisher.
      </p>
      <p className="mt-2 text-sm text-white/70">
        Offene Frage: Soll das Wort „TigersZone“ im Hero seinen eigenen Schriftzug (aktuell Oswald,
        farbig) behalten, oder auch auf die neue Schriftart wechseln? Unten probehalber überall
        mitgewechselt.
      </p>

      <div className="mt-12 space-y-14">
        {FONTS.map((font) => (
          <div key={font.id} className="glass-panel-sm p-6">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-semibold text-tigers-secondary">{font.label}</p>
              <p className="text-xs text-white/50">{font.note}</p>
            </div>
            <div className="mt-4">
              <HeadingSamples className={font.className} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
