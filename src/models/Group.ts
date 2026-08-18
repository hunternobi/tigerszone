import { Schema, models, model, type Document, type Types } from "mongoose";

export interface GroupDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  nameLower: string;
  inviteCode: string;
  ownerUserId: Types.ObjectId;
  isPublic: boolean;
  createdAt: Date;
}

const groupSchema = new Schema<GroupDocument>(
  {
    name: { type: String, required: true, trim: true },
    nameLower: { type: String, required: true, unique: true },
    inviteCode: { type: String, required: true, unique: true },
    ownerUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const GroupModel = models.Group || model<GroupDocument>("Group", groupSchema);
