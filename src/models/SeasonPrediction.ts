import { Schema, models, model, type Document, type Types } from "mongoose";

export interface SeasonPredictionDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  order: string[];
  updatedAt: Date;
}

const seasonPredictionSchema = new Schema<SeasonPredictionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    order: { type: [String], required: true },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export const SeasonPredictionModel =
  models.SeasonPrediction ||
  model<SeasonPredictionDocument>("SeasonPrediction", seasonPredictionSchema);
