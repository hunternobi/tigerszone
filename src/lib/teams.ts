import type { Team } from "@/types";

export const TEAMS: Team[] = [
  { _id: "straubing-tigers", name: "Straubing Tigers", shortName: "Straubing", logoUrl: "" },
  { _id: "nuernberg-ice-tigers", name: "Nürnberg Ice Tigers", shortName: "Nürnberg", logoUrl: "" },
  {
    _id: "frankfurt-wolfsburg",
    name: "Frankfurt/Wolfsburg",
    shortName: "Frankfurt/Wolfsburg",
    logoUrl: "",
  },
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
];

export function getTeamById(id: string): Team | undefined {
  return TEAMS.find((team) => team._id === id);
}

export function getTeamName(id: string): string {
  return getTeamById(id)?.name ?? id;
}
