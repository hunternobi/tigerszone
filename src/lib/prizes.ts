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

/** Look of each place: gold / silver / bronze gradient of the number (a bit see-through at the bottom) and the glow behind the card. */
export const PLACE_STYLE: Record<
  Prize["place"],
  { numberGradient: string; glow: string; label: string }
> = {
  1: {
    numberGradient:
      "linear-gradient(180deg, #fff3c4 0%, #fbbf24 48%, rgba(245, 158, 11, 0.65) 100%)",
    glow: "shadow-[0_0_40px_rgba(251,191,36,0.35)] border-amber-300/50",
    label: "1. Preis",
  },
  2: {
    numberGradient:
      "linear-gradient(180deg, #ffffff 0%, #cbd5e1 48%, rgba(148, 163, 184, 0.65) 100%)",
    glow: "border-slate-200/35",
    label: "2. Preis",
  },
  3: {
    numberGradient:
      "linear-gradient(180deg, #ffdcb4 0%, #e8913a 48%, rgba(217, 119, 6, 0.65) 100%)",
    glow: "border-orange-300/35",
    label: "3. Preis",
  },
};
