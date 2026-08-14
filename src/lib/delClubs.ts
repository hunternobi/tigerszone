export interface DelClub {
  id: string;
  name: string;
}

export const DEL_CLUBS: DelClub[] = [
  { id: "adler-mannheim", name: "Adler Mannheim" },
  { id: "augsburger-panther", name: "Augsburger Panther" },
  { id: "eisbaeren-berlin", name: "Eisbären Berlin" },
  { id: "erc-ingolstadt", name: "ERC Ingolstadt" },
  { id: "fischtown-pinguins-bremerhaven", name: "Fischtown Pinguins Bremerhaven" },
  { id: "grizzlys-wolfsburg", name: "Grizzlys Wolfsburg" },
  { id: "iserlohn-roosters", name: "Iserlohn Roosters" },
  { id: "koelner-haie", name: "Kölner Haie" },
  { id: "krefeld-pinguine", name: "Krefeld Pinguine" },
  { id: "loewen-frankfurt", name: "Löwen Frankfurt" },
  { id: "ehc-red-bull-muenchen", name: "EHC Red Bull München" },
  { id: "nuernberg-ice-tigers", name: "Nürnberg Ice Tigers" },
  { id: "schwenninger-wild-wings", name: "Schwenninger Wild Wings" },
  { id: "straubing-tigers", name: "Straubing Tigers" },
];

export function getDelClubName(id: string): string {
  return DEL_CLUBS.find((club) => club.id === id)?.name ?? id;
}
