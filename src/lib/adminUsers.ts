import { Types } from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { GroupModel } from "@/models/Group";
import { GroupMemberModel } from "@/models/GroupMember";
import type { UserRole } from "@/types";

export interface AdminUserRow {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  groups: string[];
}

export async function getAllUsersWithGroups(): Promise<AdminUserRow[]> {
  await dbConnect();

  const users = await UserModel.find()
    .sort({ createdAt: -1 })
    .lean<{ _id: Types.ObjectId; name: string; email: string; role: UserRole; createdAt: Date }[]>();

  const memberships = await GroupMemberModel.find().lean<
    { userId: Types.ObjectId; groupId: Types.ObjectId }[]
  >();
  const groupIds = [...new Set(memberships.map((m) => m.groupId.toString()))].map(
    (id) => new Types.ObjectId(id)
  );
  const groups = await GroupModel.find({ _id: { $in: groupIds } }).lean<
    { _id: Types.ObjectId; name: string }[]
  >();
  const groupNameById = new Map(groups.map((group) => [group._id.toString(), group.name]));

  const groupsByUser = new Map<string, string[]>();
  for (const membership of memberships) {
    const groupName = groupNameById.get(membership.groupId.toString());
    if (!groupName) continue;
    const userId = membership.userId.toString();
    const existing = groupsByUser.get(userId) ?? [];
    existing.push(groupName);
    groupsByUser.set(userId, existing);
  }

  return users.map((user) => ({
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    groups: groupsByUser.get(user._id.toString()) ?? [],
  }));
}
