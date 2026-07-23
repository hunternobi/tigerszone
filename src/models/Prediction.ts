import { Schema, models, model, type Document, type Types } from "mongoose";
import type { Overtime } from "@/types";

export interface PredictionDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  gameId: Types.ObjectId;
  predictedHome: number;
  predictedAway: number;
  predictedOvertime?: Overtime;
  pointsAwarded?: number;
}

const predictionSchema = new Schema<PredictionDocument>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  gameId: { type: Schema.Types.ObjectId, ref: "Game", required: true },
  predictedHome: { type: Number, required: true },
  predictedAway: { type: Number, required: true },
  predictedOvertime: { type: String, enum: ["REG", "OT", "SO"] },
  pointsAwarded: { type: Number },
});

predictionSchema.index({ userId: 1, gameId: 1 }, { unique: true });

export const PredictionModel =
  models.Prediction || model<PredictionDocument>("Prediction", predictionSchema);
