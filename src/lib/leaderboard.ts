import { Types } from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import { PredictionModel } from "@/models/Prediction";
import { BonusPredictionModel } from "@/models/BonusPrediction";
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

  const [predictionResults, bonusResults] = await Promise.all([
    PredictionModel.aggregate<{ _id: Types.ObjectId; points: number }>([
      { $match: { userId: { $in: userIds }, pointsAwarded: { $ne: null } } },
      { $group: { _id: "$userId", points: { $sum: "$pointsAwarded" } } },
    ]),
    BonusPredictionModel.aggregate<{ _id: Types.ObjectId; points: number }>([
      { $match: { userId: { $in: userIds }, pointsAwarded: { $ne: null } } },
      { $group: { _id: "$userId", points: { $sum: "$pointsAwarded" } } },
    ]),
  ]);

  const pointsByUser = new Map<string, number>();
  for (const entry of predictionResults) pointsByUser.set(entry._id.toString(), entry.points);
  for (const entry of bonusResults) {
    const key = entry._id.toString();
    pointsByUser.set(key, (pointsByUser.get(key) ?? 0) + entry.points);
  }

  return pointsByUser;
}

export async function getGlobalLeaderboard(limit: number): Promise<LeaderboardEntry[]> {
  await dbConnect();

  const [predictionResults, bonusResults] = await Promise.all([
    PredictionModel.aggregate<{ _id: Types.ObjectId; points: number }>([
      { $match: { pointsAwarded: { $ne: null } } },
      { $group: { _id: "$userId", points: { $sum: "$pointsAwarded" } } },
    ]),
    BonusPredictionModel.aggregate<{ _id: Types.ObjectId; points: number }>([
      { $match: { pointsAwarded: { $ne: null } } },
      { $group: { _id: "$userId", points: { $sum: "$pointsAwarded" } } },
    ]),
  ]);

  const pointsByUser = new Map<string, number>();
  for (const entry of predictionResults) pointsByUser.set(entry._id.toString(), entry.points);
  for (const entry of bonusResults) {
    const key = entry._id.toString();
    pointsByUser.set(key, (pointsByUser.get(key) ?? 0) + entry.points);
  }

  const top = Array.from(pointsByUser.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  const userIds = top.map(([id]) => id);
  const users = await UserModel.find({ _id: { $in: userIds } })
    .select("name")
    .lean<{ _id: Types.ObjectId; name: string }[]>();
  const nameById = new Map(users.map((user) => [user._id.toString(), user.name]));

  return top.map(([userId, points]) => ({
    userId,
    name: nameById.get(userId) ?? "Unbekannt",
    points,
  }));
}

export async function getGroupLeaderboard(
  groupId: string,
  limit?: number
): Promise<LeaderboardEntry[]> {
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

  const sorted = users
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

  return limit ? sorted.slice(0, limit) : sorted;
}
