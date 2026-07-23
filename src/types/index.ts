export type UserRole = "user" | "redakteur" | "admin";

export interface User {
  _id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
  role: UserRole;
}

export interface Group {
  _id: string;
  name: string;
  inviteCode: string;
  ownerUserId: string;
  createdAt: string;
}

export interface GroupMember {
  groupId: string;
  userId: string;
  joinedAt: string;
}

export interface Team {
  _id: string;
  name: string;
  shortName: string;
  logoUrl: string;
}

export type Overtime = "REG" | "OT" | "SO";
export type GameStatus = "scheduled" | "live" | "finished" | "postponed" | "cancelled";
export type Competition = "Vorbereitung" | "DEL";

export interface Game {
  _id: string;
  homeTeamId: string;
  awayTeamId: string;
  kickoff: string;
  competition: Competition;
  matchday?: number;
  isDerby: boolean;
  status: GameStatus;
  homeScore?: number;
  awayScore?: number;
  overtime?: Overtime;
}

export interface Prediction {
  _id: string;
  userId: string;
  gameId: string;
  predictedHome: number;
  predictedAway: number;
  predictedOvertime?: Overtime;
  pointsAwarded?: number;
}

export interface MemeSubmission {
  _id: string;
  userId: string;
  imageUrl: string;
  weekOf: string;
  votes: number;
  isWinner: boolean;
}

export interface Sponsor {
  _id: string;
  name: string;
  logoUrl: string;
  linkUrl: string;
  order: number;
}

export interface BlogPost {
  _id: string;
  title: string;
  content: string;
  publishedAt: string;
  authorName: string;
  createdAt: string;
}

export interface WatchParty {
  _id: string;
  gameId: string;
  location: string;
  address: string;
  time: string;
  hostName?: string;
}
