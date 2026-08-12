export const SITE_URL = "https://tigerszone.de";

export const SITE_NAME = "TigersZone";

export const SITE_CLAIM = "Das TigersZone-Tippspiel für die Straubing Tigers";

export const SITE_DESCRIPTION =
  "Tritt dem Tippspiel bei, lese dich durch die Spieltagsblogs und werde teil der TigersZone Community.";

export const NAV_LINKS = [
  { href: "/tippspiel", label: "Tippspiel" },
  { href: "/spieltagsblog", label: "Spieltagsblog" },
] as const;

export const COMMUNITY_LINK = { href: "/community", label: "Community" } as const;

export const SCORING = {
  WINNER: 2,
  GOAL_DIFF: 4,
  EXACT_SCORE: 5,
  DERBY_MULTIPLIER: 2,
} as const;
