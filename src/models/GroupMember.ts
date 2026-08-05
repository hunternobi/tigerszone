import { Schema, models, model, type Document, type Types } from "mongoose";

export type GroupMemberRole = "member" | "assistant";

export interface GroupMemberDocument extends Document {
  _id: Types.ObjectId;
  groupId: Types.ObjectId;
  userId: Types.ObjectId;
  role: GroupMemberRole;
  joinedAt: Date;
}

const groupMemberSchema = new Schema<GroupMemberDocument>(
  {
    groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["member", "assistant"], default: "member" },
  },
  { timestamps: { createdAt: "joinedAt", updatedAt: false } }
);

groupMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true });

export const GroupMemberModel =
  models.GroupMember || model<GroupMemberDocument>("GroupMember", groupMemberSchema);
