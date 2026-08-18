import { Types } from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import { NotificationModel } from "@/models/Notification";
import { GameModel } from "@/models/Game";
import { UserModel } from "@/models/User";
import { PredictionModel } from "@/models/Prediction";
import { getTeamName } from "@/lib/teams";

export async function createWelcomeNotification(userId: string, name: string): Promise<void> {
  await dbConnect();
  await NotificationModel.updateOne(
    { userId, type: "welcome" },
    {
      $setOnInsert: {
        userId,
        type: "welcome",
        title: `Hallo ${name}, herzlich Willkommen in der TigersZone!`,
        body: "Auf dich warten spannende Duelle, Spieltagsblogs und viele weitere Features.",
        linkHref: "/community#faq",
        linkLabel: "Bei Fragen geht's hier zum FAQ-Bereich",
      },
    },
    { upsert: true }
  );
}

const REMINDER_WINDOW_START_MS = 23 * 60 * 60 * 1000;
const REMINDER_WINDOW_END_MS = 25 * 60 * 60 * 1000;

export interface TipReminderResult {
  gamesChecked: number;
  notificationsCreated: number;
}

/**
 * Finds games kicking off in ~24h that are still open for predictions and
 * creates a reminder notification for every user who hasn't tipped yet.
 * Safe to call repeatedly (e.g. hourly cron) - the unique index on
 * {userId, type, gameId} means a user only ever gets one reminder per game.
 */
export async function sendTipReminders(
  now: Date = new Date(),
  dryRun = false
): Promise<TipReminderResult> {
  await dbConnect();

  const windowStart = new Date(now.getTime() + REMINDER_WINDOW_START_MS);
  const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_END_MS);

  const games = await GameModel.find({
    status: "scheduled",
    kickoff: { $gte: windowStart, $lt: windowEnd },
  }).lean<
    { _id: Types.ObjectId; homeTeamId: string; awayTeamId: string; kickoff: Date }[]
  >();

  let notificationsCreated = 0;

  for (const game of games) {
    const [allUsers, predictedUserIds, alreadyNotifiedUserIds] = await Promise.all([
      UserModel.find({ emailVerified: true }).select("_id").lean<{ _id: Types.ObjectId }[]>(),
      PredictionModel.find({ gameId: game._id }).select("userId").lean<
        { userId: Types.ObjectId }[]
      >(),
      NotificationModel.find({ type: "tip_reminder", gameId: game._id })
        .select("userId")
        .lean<{ userId: Types.ObjectId }[]>(),
    ]);

    const excluded = new Set([
      ...predictedUserIds.map((p) => p.userId.toString()),
      ...alreadyNotifiedUserIds.map((n) => n.userId.toString()),
    ]);
    const dueUserIds = allUsers.map((u) => u._id.toString()).filter((id) => !excluded.has(id));

    if (dueUserIds.length === 0) continue;
    if (dryRun) {
      notificationsCreated += dueUserIds.length;
      continue;
    }

    const title = "Bald ist Tippschluss!";
    const body = `Noch rund 24 Stunden bis ${getTeamName(game.homeTeamId)} vs. ${getTeamName(
      game.awayTeamId
    )} – du hast für dieses Spiel noch nicht getippt.`;

    const result = await NotificationModel.insertMany(
      dueUserIds.map((userId) => ({
        userId,
        type: "tip_reminder",
        title,
        body,
        linkHref: "/tippspiel",
        linkLabel: "Jetzt tippen",
        gameId: game._id,
      })),
      { ordered: false }
    );
    notificationsCreated += result.length;
  }

  return { gamesChecked: games.length, notificationsCreated };
}
