import { Schema, models, model, type Document, type Types } from "mongoose";

export interface GroupMemberDocument extends Document {
  _id: Types.ObjectId;
  groupId: Types.ObjectId;
  userId: Types.ObjectId;
  joinedAt: Date;
}

const groupMemberSchema = new Schema<GroupMemberDocument>(
  {
    groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: "joinedAt", updatedAt: false } }
);

groupMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true });

export const GroupMemberModel =
  models.GroupMember || model<GroupMemberDocument>("GroupMember", groupMemberSchema);
