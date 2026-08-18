import { Schema, models, model, type Document } from "mongoose";

export interface RateLimitHitDocument extends Document {
  key: string;
  createdAt: Date;
}

const rateLimitHitSchema = new Schema<RateLimitHitDocument>(
  {
    key: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

rateLimitHitSchema.index({ key: 1, createdAt: 1 });
// Safety-net cleanup so the collection never grows unbounded; the actual
// rate-limit window is enforced by the createdAt query in checkRateLimit.
rateLimitHitSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

export const RateLimitHitModel =
  models.RateLimitHit || model<RateLimitHitDocument>("RateLimitHit", rateLimitHitSchema);
