export const SITE_URL = "https://tigerszone.vercel.app";

export const SITE_NAME = "TigersZone";

export const SITE_CLAIM = "Das TigersZone-Tippspiel für die Straubing Tigers";

export const SITE_DESCRIPTION =
  "Die ultimative Fan-Plattform für Straubing Tigers. Tritt dem Tippspiel bei, verbinde dich mit anderen Fans und werde Teil der größten Eishockey-Community Bayerns.";

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/tippspiel", label: "Tippspiel" },
  { href: "/spieltagsblog", label: "Spieltagsblog" },
] as const;

export const COMMUNITY_LINK = { href: "/community", label: "Community" } as const;

export const SCORING = {
  WINNER: 2,
  EXACT_SCORE: 3,
  GOAL_DIFF_OR_OT: 2,
  DERBY_MULTIPLIER: 2,
} as const;
