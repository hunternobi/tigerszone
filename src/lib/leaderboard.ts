import { Types } from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import { PredictionModel } from "@/models/Prediction";
import { BonusPredictionModel } from "@/models/BonusPrediction";
import { GameModel } from "@/models/Game";
import { UserModel } from "@/models/User";
import { GroupMemberModel } from "@/models/GroupMember";
import { GroupModel } from "@/models/Group";
import type { LeaderboardEntry } from "@/components/Leaderboard";

export interface GroupLeaderboardData {
  groupId: string;
  groupName: string;
  entries: LeaderboardEntry[];
}

async function sumPointsForUsers(
  userIds: Types.ObjectId[],
  excludeGameIds: Types.ObjectId[] = []
): Promise<Map<string, number>> {
  if (userIds.length === 0) return new Map();

  const predictionMatch: Record<string, unknown> = {
    userId: { $in: userIds },
    pointsAwarded: { $ne: null },
  };
  if (excludeGameIds.length > 0) predictionMatch.gameId = { $nin: excludeGameIds };

  const [predictionResults, bonusResults] = await Promise.all([
    PredictionModel.aggregate<{ _id: Types.ObjectId; points: number }>([
      { $match: predictionMatch },
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

/**
 * Games counted as "the last Spieltag" for rank-trend purposes: every finished
 * game that kicked off on the same calendar day as the most recently finished game.
 */
async function getLatestBatchGameIds(): Promise<Types.ObjectId[]> {
  const latest = await GameModel.findOne({ status: "finished" })
    .sort({ kickoff: -1 })
    .select("kickoff")
    .lean<{ kickoff: Date } | null>();
  if (!latest) return [];

  const dayStart = new Date(latest.kickoff);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const games = await GameModel.find({
    status: "finished",
    kickoff: { $gte: dayStart, $lt: dayEnd },
  })
    .select("_id")
    .lean<{ _id: Types.ObjectId }[]>();

  return games.map((game) => game._id);
}

function computeTrends(
  userIds: string[],
  currentPoints: Map<string, number>,
  previousPoints: Map<string, number>
): Map<string, "up" | "down"> {
  const byCurrent = [...userIds].sort(
    (a, b) => (currentPoints.get(b) ?? 0) - (currentPoints.get(a) ?? 0)
  );
  const byPrevious = [...userIds].sort(
    (a, b) => (previousPoints.get(b) ?? 0) - (previousPoints.get(a) ?? 0)
  );
  const currentRank = new Map(byCurrent.map((id, i) => [id, i]));
  const previousRank = new Map(byPrevious.map((id, i) => [id, i]));

  const trends = new Map<string, "up" | "down">();
  for (const id of userIds) {
    const cur = currentRank.get(id) ?? 0;
    const prev = previousRank.get(id) ?? 0;
    if (cur < prev) trends.set(id, "up");
    else if (cur > prev) trends.set(id, "down");
  }
  return trends;
}

export async function getGlobalLeaderboard(limit: number): Promise<LeaderboardEntry[]> {
  await dbConnect();

  const latestBatchGameIds = await getLatestBatchGameIds();

  const [predictionResults, bonusResults, previousPredictionResults] = await Promise.all([
    PredictionModel.aggregate<{ _id: Types.ObjectId; points: number }>([
      { $match: { pointsAwarded: { $ne: null } } },
      { $group: { _id: "$userId", points: { $sum: "$pointsAwarded" } } },
    ]),
    BonusPredictionModel.aggregate<{ _id: Types.ObjectId; points: number }>([
      { $match: { pointsAwarded: { $ne: null } } },
      { $group: { _id: "$userId", points: { $sum: "$pointsAwarded" } } },
    ]),
    latestBatchGameIds.length > 0
      ? PredictionModel.aggregate<{ _id: Types.ObjectId; points: number }>([
          { $match: { pointsAwarded: { $ne: null }, gameId: { $nin: latestBatchGameIds } } },
          { $group: { _id: "$userId", points: { $sum: "$pointsAwarded" } } },
        ])
      : Promise.resolve([]),
  ]);

  const pointsByUser = new Map<string, number>();
  for (const entry of predictionResults) pointsByUser.set(entry._id.toString(), entry.points);
  for (const entry of bonusResults) {
    const key = entry._id.toString();
    pointsByUser.set(key, (pointsByUser.get(key) ?? 0) + entry.points);
  }

  const previousPointsByUser = new Map<string, number>();
  for (const entry of previousPredictionResults) {
    previousPointsByUser.set(entry._id.toString(), entry.points);
  }
  for (const entry of bonusResults) {
    const key = entry._id.toString();
    previousPointsByUser.set(key, (previousPointsByUser.get(key) ?? 0) + entry.points);
  }

  const allUserIds = new Set([...pointsByUser.keys(), ...previousPointsByUser.keys()]);
  const trends = computeTrends(Array.from(allUserIds), pointsByUser, previousPointsByUser);

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
    trend: trends.get(userId),
  }));
}

export async function getGroupLeaderboard(
  groupId: string,
  limit?: number
): Promise<LeaderboardEntry[]> {
  await dbConnect();

  const [group, members, latestBatchGameIds] = await Promise.all([
    GroupModel.findById(groupId).select("ownerUserId").lean<{
      ownerUserId: Types.ObjectId;
    } | null>(),
    GroupMemberModel.find({ groupId }).lean<
      { userId: Types.ObjectId; role: "member" | "assistant" }[]
    >(),
    getLatestBatchGameIds(),
  ]);
  if (!group) return [];

  const memberIds = members.map((member) => member.userId);
  if (memberIds.length === 0) return [];

  const roleByUser = new Map(members.map((member) => [member.userId.toString(), member.role]));
  const ownerId = group.ownerUserId.toString();

  const [users, pointsByUser, previousPointsByUser] = await Promise.all([
    UserModel.find({ _id: { $in: memberIds } })
      .select("name")
      .lean<{ _id: Types.ObjectId; name: string }[]>(),
    sumPointsForUsers(memberIds),
    sumPointsForUsers(memberIds, latestBatchGameIds),
  ]);

  const memberIdStrings = memberIds.map((id) => id.toString());
  const trends = computeTrends(memberIdStrings, pointsByUser, previousPointsByUser);

  const sorted = users
    .map((user) => {
      const id = user._id.toString();
      return {
        userId: id,
        name: user.name,
        points: pointsByUser.get(id) ?? 0,
        role: id === ownerId ? "owner" : (roleByUser.get(id) ?? "member"),
        trend: trends.get(id),
      } satisfies LeaderboardEntry;
    })
    .sort((a, b) => b.points - a.points);

  return limit ? sorted.slice(0, limit) : sorted;
}
