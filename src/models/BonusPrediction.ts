import { Schema, models, model, type Document, type Types } from "mongoose";

export type BonusRound = "hauptrunde" | "playoffs";

export interface BonusPredictionDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  round: BonusRound;
  hauptrundensieger?: string;
  platzierungTigers?: number;
  topscorerTigers?: string;
  meisteToreTigers?: string;
}

const bonusPredictionSchema = new Schema<BonusPredictionDocument>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  round: { type: String, enum: ["hauptrunde", "playoffs"], required: true },
  hauptrundensieger: { type: String },
  platzierungTigers: { type: Number, min: 1, max: 14 },
  topscorerTigers: { type: String },
  meisteToreTigers: { type: String },
});

bonusPredictionSchema.index({ userId: 1, round: 1 }, { unique: true });

export const BonusPredictionModel =
  models.BonusPrediction ||
  model<BonusPredictionDocument>("BonusPrediction", bonusPredictionSchema);
