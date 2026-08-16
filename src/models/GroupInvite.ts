import { Schema, models, model, type Document, type Types } from "mongoose";

export interface GroupInviteDocument extends Document {
  _id: Types.ObjectId;
  groupId: Types.ObjectId;
  invitedUserId: Types.ObjectId;
  invitedByUserId: Types.ObjectId;
  createdAt: Date;
}

const groupInviteSchema = new Schema<GroupInviteDocument>(
  {
    groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true },
    invitedUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    invitedByUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

groupInviteSchema.index({ groupId: 1, invitedUserId: 1 }, { unique: true });
groupInviteSchema.index({ invitedUserId: 1 });

export const GroupInviteModel =
  models.GroupInvite || model<GroupInviteDocument>("GroupInvite", groupInviteSchema);
