import { Schema, models, model, type Document, type Types } from "mongoose";

export type NotificationType = "welcome" | "tip_reminder";

export interface NotificationDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  linkHref?: string;
  linkLabel?: string;
  gameId?: Types.ObjectId;
  createdAt: Date;
}

const notificationSchema = new Schema<NotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["welcome", "tip_reminder"], required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    linkHref: { type: String },
    linkLabel: { type: String },
    gameId: { type: Schema.Types.ObjectId, ref: "Game" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

notificationSchema.index({ userId: 1 });
// Prevents duplicate reminders for the same game (and, for gameId-less types
// like "welcome", a user can only ever have one notification of that type).
notificationSchema.index({ userId: 1, type: 1, gameId: 1 }, { unique: true });

export const NotificationModel =
  models.Notification || model<NotificationDocument>("Notification", notificationSchema);
