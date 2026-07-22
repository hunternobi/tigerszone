export const SITE_NAME = "TigersZone";

export const SITE_CLAIM = "Das TigersZone-Tippspiel für die Straubing Tigers";

export const SITE_DESCRIPTION =
  "Die ultimative Fan-Plattform für Straubing Tigers. Tritt dem Tippspiel bei, verbinde dich mit anderen Fans und werde Teil der größten Eishockey-Community Bayerns.";

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/tippspiel", label: "Tippspiel" },
  { href: "/spieltagsblog", label: "Spieltagsblog" },
  { href: "/community", label: "Community" },
] as const;

export const SCORING = {
  WINNER: 3,
  EXACT_SCORE: 2,
  GOAL_DIFF_OR_OT: 1,
  DERBY_MULTIPLIER: 2,
} as const;
