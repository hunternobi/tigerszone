import { Schema, models, model, type Document, type Types } from "mongoose";
import type { BonusRound } from "@/models/BonusPrediction";

export interface BonusResultDocument extends Document {
  _id: Types.ObjectId;
  round: BonusRound;
  hauptrundensieger?: string;
  platzierungTigers?: number;
  topscorerTigers?: string;
  meisteToreTigers?: string;
}

const bonusResultSchema = new Schema<BonusResultDocument>({
  round: { type: String, enum: ["hauptrunde", "playoffs"], required: true, unique: true },
  hauptrundensieger: { type: String },
  platzierungTigers: { type: Number, min: 1, max: 14 },
  topscorerTigers: { type: String },
  meisteToreTigers: { type: String },
});

export const BonusResultModel =
  models.BonusResult || model<BonusResultDocument>("BonusResult", bonusResultSchema);
