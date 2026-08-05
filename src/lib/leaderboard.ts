import { Types } from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import { PredictionModel } from "@/models/Prediction";
import { UserModel } from "@/models/User";
import { GroupMemberModel } from "@/models/GroupMember";
import { GroupModel } from "@/models/Group";
import type { LeaderboardEntry } from "@/components/Leaderboard";

export interface GroupLeaderboardData {
  groupId: string;
  groupName: string;
  entries: LeaderboardEntry[];
}

async function sumPointsForUsers(userIds: Types.ObjectId[]): Promise<Map<string, number>> {
  if (userIds.length === 0) return new Map();

  const results = await PredictionModel.aggregate<{ _id: Types.ObjectId; points: number }>([
    { $match: { userId: { $in: userIds }, pointsAwarded: { $ne: null } } },
    { $group: { _id: "$userId", points: { $sum: "$pointsAwarded" } } },
  ]);

  return new Map(results.map((entry) => [entry._id.toString(), entry.points]));
}

export async function getGlobalLeaderboard(limit: number): Promise<LeaderboardEntry[]> {
  await dbConnect();

  const results = await PredictionModel.aggregate<{
    userId: Types.ObjectId;
    name: string;
    points: number;
  }>([
    { $match: { pointsAwarded: { $ne: null } } },
    { $group: { _id: "$userId", points: { $sum: "$pointsAwarded" } } },
    { $sort: { points: -1 } },
    { $limit: limit },
    { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
    { $unwind: "$user" },
    { $project: { userId: "$_id", name: "$user.name", points: 1, _id: 0 } },
  ]);

  return results.map((entry) => ({
    userId: entry.userId.toString(),
    name: entry.name,
    points: entry.points,
  }));
}

export async function getGroupLeaderboard(groupId: string): Promise<LeaderboardEntry[]> {
  await dbConnect();

  const group = await GroupModel.findById(groupId).select("ownerUserId").lean<{
    ownerUserId: Types.ObjectId;
  } | null>();
  if (!group) return [];

  const members = await GroupMemberModel.find({ groupId }).lean<
    { userId: Types.ObjectId; role: "member" | "assistant" }[]
  >();
  const memberIds = members.map((member) => member.userId);
  if (memberIds.length === 0) return [];

  const roleByUser = new Map(members.map((member) => [member.userId.toString(), member.role]));
  const ownerId = group.ownerUserId.toString();

  const users = await UserModel.find({ _id: { $in: memberIds } })
    .select("name")
    .lean<{ _id: Types.ObjectId; name: string }[]>();
  const pointsByUser = await sumPointsForUsers(memberIds);

  return users
    .map((user) => {
      const id = user._id.toString();
      return {
        userId: id,
        name: user.name,
        points: pointsByUser.get(id) ?? 0,
        role: id === ownerId ? "owner" : (roleByUser.get(id) ?? "member"),
      } satisfies LeaderboardEntry;
    })
    .sort((a, b) => b.points - a.points);
}
