"use server";

import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import { SeasonPredictionModel } from "@/models/SeasonPrediction";
import { GameModel } from "@/models/Game";
import { DEL_CLUBS } from "@/lib/delClubs";

const CLUB_IDS = DEL_CLUBS.map((club) => club.id);

export async function getSeasonPredictionDeadline(): Promise<Date | null> {
  await dbConnect();
  const firstGame = await GameModel.findOne({ competition: "DEL" })
    .sort({ kickoff: 1 })
    .select("kickoff")
    .lean<{ kickoff: Date } | null>();
  return firstGame?.kickoff ?? null;
}

export async function getMySeasonPrediction(): Promise<string[] | null> {
  const session = await auth();
  if (!session?.user) return null;

  await dbConnect();
  const doc = await SeasonPredictionModel.findOne({ userId: session.user.id }).lean<{
    order: string[];
  } | null>();
  if (!doc) return null;

  // Guard against drift if the club list ever changes: keep known ids in their saved
  // order and append any missing ones at the end, so the UI always gets exactly 14.
  const known = doc.order.filter((id) => CLUB_IDS.includes(id));
  const missing = CLUB_IDS.filter((id) => !known.includes(id));
  const repaired = [...known, ...missing];
  return repaired.length === CLUB_IDS.length ? repaired : null;
}

export interface SaveSeasonPredictionResult {
  success: boolean;
  error?: string;
}

export async function saveSeasonPrediction(order: string[]): Promise<SaveSeasonPredictionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Bitte melde dich an." };

  const deadline = await getSeasonPredictionDeadline();
  if (deadline && new Date() >= deadline) {
    return { success: false, error: "Die Abgabe für die Saisonprognose ist bereits geschlossen." };
  }

  const isValid =
    order.length === CLUB_IDS.length &&
    new Set(order).size === CLUB_IDS.length &&
    order.every((id) => CLUB_IDS.includes(id));
  if (!isValid) {
    return { success: false, error: "Ungültige Reihenfolge." };
  }

  await dbConnect();
  await SeasonPredictionModel.updateOne(
    { userId: session.user.id },
    { $set: { order } },
    { upsert: true }
  );

  return { success: true };
}
