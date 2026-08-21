export interface RosterPlayer {
  id: string;
  number: number;
  name: string;
}

// Straubing Tigers Spieler 2026/2027 – Verteidiger & Stürmer (ohne Torhüter), nach Rückennummer sortiert
export const TIGERS_SKATERS: RosterPlayer[] = [
  { id: "6-alex-green", number: 6, name: "Alex Green" },
  { id: "7-nicolas-beaudin", number: 7, name: "Nicolas Beaudin" },
  { id: "9-stephan-daschner", number: 9, name: "Stephan Daschner" },
  { id: "10-taro-jentzsch", number: 10, name: "Taro Jentzsch" },
  { id: "12-joseph-duszak", number: 12, name: "Joseph Duszak" },
  { id: "13-mario-zimmermann", number: 13, name: "Mario Zimmermann" },
  { id: "17-adrian-klein", number: 17, name: "Adrian Klein" },
  { id: "18-tyler-madden", number: 18, name: "Tyler Madden" },
  { id: "19-tim-brunnhuber", number: 19, name: "Tim Brunnhuber" },
  { id: "23-jc-beaudin", number: 23, name: "JC Beaudin" },
  { id: "26-moritz-kukuk", number: 26, name: "Moritz Kukuk" },
  { id: "38-stefan-loibl", number: 38, name: "Stefan Loibl" },
  { id: "39-simon-seidl", number: 39, name: "Simon Seidl" },
  { id: "44-max-bleicher", number: 44, name: "Max Bleicher" },
  { id: "53-danjo-leonhardt", number: 53, name: "Danjo Leonhardt" },
  { id: "71-nick-halloran", number: 71, name: "Nick Halloran" },
  { id: "73-linus-brandl", number: 73, name: "Linus Brandl" },
  { id: "86-skyler-mckenzie", number: 86, name: "Skyler McKenzie" },
  { id: "90-filip-varejcka", number: 90, name: "Filip Varejcka" },
  { id: "91-hudson-elynuik", number: 91, name: "Hudson Elynuik" },
  { id: "92-marcel-brandt", number: 92, name: "Marcel Brandt" },
  { id: "93-spencer-kersten", number: 93, name: "Spencer Kersten" },
  { id: "94-jamieson-rees", number: 94, name: "Jamieson Rees" },
];

export function getSkaterName(id: string): string {
  const player = TIGERS_SKATERS.find((p) => p.id === id);
  return player ? `#${player.number} ${player.name}` : id;
}

// Straubing Tigers Torhüter 2026/2027, nach Rückennummer sortiert
export const TIGERS_GOALIES: RosterPlayer[] = [
  { id: "1-florian-bugl", number: 1, name: "Florian Bugl" },
  { id: "21-sebastian-wieber", number: 21, name: "Sebastian Wieber" },
  { id: "31-jakub-skarek", number: 31, name: "Jakub Škarek" },
];

// Gesamtkader (Feldspieler + Torhüter), nach Rückennummer sortiert
export const TIGERS_ROSTER: RosterPlayer[] = [...TIGERS_SKATERS, ...TIGERS_GOALIES].sort(
  (a, b) => a.number - b.number
);

export function getPlayerName(id: string): string {
  const player = TIGERS_ROSTER.find((p) => p.id === id);
  return player ? `#${player.number} ${player.name}` : id;
}
