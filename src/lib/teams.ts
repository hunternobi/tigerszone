import type { Team } from "@/types";

export const TEAMS: Team[] = [
  { _id: "straubing-tigers", name: "Straubing Tigers", shortName: "Straubing", logoUrl: "" },
  { _id: "nuernberg-ice-tigers", name: "Nürnberg Ice Tigers", shortName: "Nürnberg", logoUrl: "" },
  { _id: "grizzlys-wolfsburg", name: "Grizzlys Wolfsburg", shortName: "Wolfsburg", logoUrl: "" },
  {
    _id: "steinbach-black-wings-linz",
    name: "Steinbach Black Wings Linz",
    shortName: "Linz",
    logoUrl: "",
  },
  {
    _id: "ceske-budejovice",
    name: "Banes Motor České Budějovice",
    shortName: "České Budějovice",
    logoUrl: "",
  },
  { _id: "mountfield-hk", name: "Mountfield HK", shortName: "Mountfield HK", logoUrl: "" },
  // Rest of the DEL clubs, needed once Hauptrunde fixtures are added (see also lib/delClubs.ts).
  { _id: "adler-mannheim", name: "Adler Mannheim", shortName: "Mannheim", logoUrl: "" },
  { _id: "augsburger-panther", name: "Augsburger Panther", shortName: "Augsburg", logoUrl: "" },
  { _id: "eisbaeren-berlin", name: "Eisbären Berlin", shortName: "Berlin", logoUrl: "" },
  { _id: "erc-ingolstadt", name: "ERC Ingolstadt", shortName: "Ingolstadt", logoUrl: "" },
  {
    _id: "fischtown-pinguins-bremerhaven",
    name: "Fischtown Pinguins Bremerhaven",
    shortName: "Bremerhaven",
    logoUrl: "",
  },
  { _id: "iserlohn-roosters", name: "Iserlohn Roosters", shortName: "Iserlohn", logoUrl: "" },
  { _id: "koelner-haie", name: "Kölner Haie", shortName: "Köln", logoUrl: "" },
  { _id: "krefeld-pinguine", name: "Krefeld Pinguine", shortName: "Krefeld", logoUrl: "" },
  { _id: "loewen-frankfurt", name: "Löwen Frankfurt", shortName: "Frankfurt", logoUrl: "" },
  {
    _id: "ehc-red-bull-muenchen",
    name: "EHC Red Bull München",
    shortName: "München",
    logoUrl: "",
  },
  {
    _id: "schwenninger-wild-wings",
    name: "Schwenninger Wild Wings",
    shortName: "Schwenningen",
    logoUrl: "",
  },
];

export function getTeamById(id: string): Team | undefined {
  return TEAMS.find((team) => team._id === id);
}

export function getTeamName(id: string): string {
  return getTeamById(id)?.name ?? id;
}
