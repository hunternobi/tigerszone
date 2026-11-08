export interface Prize {
  place: 1 | 2 | 3;
  /** Short name, as shown on the cards. */
  title: string;
  /** Longer explanation for the prizes page. */
  detail: string;
}

// The prizes of the season, shown in the news stories and on the landing page.
export const PRIZES: Prize[] = [
  {
    place: 1,
    title: "Signed Marcel Brandt Fantrikot",
    detail:
      "Ein unterschriebenes Fantrikot von Marcel Brandt. Ob Heim, Auswärts oder Alternatives Jersey, du entscheidest!",
  },
  {
    place: 2,
    title: "Squad Drops Ausstattung",
    detail: "Ausstattung von The Squad Drops im Wert von 150 €.",
  },
  {
    place: 3,
    title: "2 Kasten Erl",
    detail:
      "2 Kasten Erl nach eigener Wahl im Brauereiverkauf in Geiselhöring.",
  },
];

/** Change this when the news stories should be shown again to everybody. */
export const NEWS_STORIES_KEY = "tz-news-stories-v2";

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
