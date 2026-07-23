import { Schema, models, model, type Document, type Types } from "mongoose";
import type { Competition, GameStatus, Overtime } from "@/types";

export interface GameDocument extends Document {
  _id: Types.ObjectId;
  homeTeamId: string;
  awayTeamId: string;
  kickoff: Date;
  competition: Competition;
  matchday?: number;
  isDerby: boolean;
  status: GameStatus;
  homeScore?: number;
  awayScore?: number;
  overtime?: Overtime;
}

const gameSchema = new Schema<GameDocument>({
  homeTeamId: { type: String, required: true },
  awayTeamId: { type: String, required: true },
  kickoff: { type: Date, required: true },
  competition: { type: String, enum: ["Vorbereitung", "DEL"], required: true },
  matchday: { type: Number },
  isDerby: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["scheduled", "live", "finished", "postponed", "cancelled"],
    default: "scheduled",
  },
  homeScore: { type: Number },
  awayScore: { type: Number },
  overtime: { type: String, enum: ["REG", "OT", "SO"] },
});

export const GameModel = models.Game || model<GameDocument>("Game", gameSchema);
