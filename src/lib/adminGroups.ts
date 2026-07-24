import { Types } from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import { GroupModel } from "@/models/Group";
import { GroupMemberModel } from "@/models/GroupMember";
import { UserModel } from "@/models/User";

export interface AdminGroupRow {
  _id: string;
  name: string;
  ownerName: string;
  memberCount: number;
}

export async function getAllGroups(): Promise<AdminGroupRow[]> {
  await dbConnect();

  const groups = await GroupModel.find().sort({ createdAt: -1 }).lean<
    { _id: Types.ObjectId; name: string; ownerUserId: Types.ObjectId }[]
  >();
  if (groups.length === 0) return [];

  const ownerIds = groups.map((group) => group.ownerUserId);
  const owners = await UserModel.find({ _id: { $in: ownerIds } })
    .select("name")
    .lean<{ _id: Types.ObjectId; name: string }[]>();
  const ownerNameById = new Map(owners.map((owner) => [owner._id.toString(), owner.name]));

  const groupIds = groups.map((group) => group._id);
  const counts = await GroupMemberModel.aggregate<{ _id: Types.ObjectId; count: number }>([
    { $match: { groupId: { $in: groupIds } } },
    { $group: { _id: "$groupId", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((entry) => [entry._id.toString(), entry.count]));

  return groups.map((group) => ({
    _id: group._id.toString(),
    name: group.name,
    ownerName: ownerNameById.get(group.ownerUserId.toString()) ?? "Unbekannt",
    memberCount: countMap.get(group._id.toString()) ?? 0,
  }));
}
