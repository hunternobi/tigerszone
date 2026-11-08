export interface Prize {
  place: 1 | 2 | 3;
  /** What the winner gets. */
  title: string;
}

// The prizes of the season, shown in the announcement pop-up and on the landing page.
export const PRIZES: Prize[] = [
  { place: 1, title: "Unterschriebenes Marcel Brandt Fantrikot" },
  { place: 2, title: "The Squad Drops Ausstattung im Wert von 150 €" },
  { place: 3, title: "2 Kasten Erl nach eigener Wahl" },
];

/** Change this when the pop-up should be shown again to everybody (e.g. after the prizes changed). */
export const PRIZES_POPUP_KEY = "tz-prizes-popup-v1";

/** Look of each place: medal colours for the badge and the glow behind the card. */
export const PLACE_STYLE: Record<
  Prize["place"],
  { badge: string; glow: string; label: string }
> = {
  1: {
    badge: "from-[#fde68a] via-[#fbbf24] to-[#b45309]",
    glow: "shadow-[0_0_40px_rgba(251,191,36,0.35)] border-amber-300/50",
    label: "1. Preis",
  },
  2: {
    badge: "from-[#f1f5f9] via-[#cbd5e1] to-[#64748b]",
    glow: "border-slate-200/35",
    label: "2. Preis",
  },
  3: {
    badge: "from-[#fdba74] via-[#d97706] to-[#7c2d12]",
    glow: "border-orange-300/35",
    label: "3. Preis",
  },
};
