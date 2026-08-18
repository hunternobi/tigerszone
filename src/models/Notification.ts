import { Schema, models, model, type Document, type Types } from "mongoose";

export type NotificationType = "welcome";

export interface NotificationDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  linkHref?: string;
  linkLabel?: string;
  createdAt: Date;
}

const notificationSchema = new Schema<NotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["welcome"], required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    linkHref: { type: String },
    linkLabel: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

notificationSchema.index({ userId: 1 });

export const NotificationModel =
  models.Notification || model<NotificationDocument>("Notification", notificationSchema);
