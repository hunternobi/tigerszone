"use server";

import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import { BonusPredictionModel, type BonusRound } from "@/models/BonusPrediction";
import { GameModel } from "@/models/Game";
import { DEL_CLUBS } from "@/lib/delClubs";
import { TIGERS_SKATERS } from "@/lib/tigersRoster";

export interface BonusTipResult {
  success: boolean;
  error?: string;
}

export type BonusField =
  | "hauptrundensieger"
  | "platzierungTigers"
  | "topscorerTigers"
  | "meisteToreTigers";

export async function getBonusDeadline(round: BonusRound): Promise<Date | null> {
  await dbConnect();
  if (round === "hauptrunde") {
    const firstGame = await GameModel.findOne({ competition: "DEL" })
      .sort({ kickoff: 1 })
      .select("kickoff")
      .lean<{ kickoff: Date } | null>();
    return firstGame?.kickoff ?? null;
  }
  // Playoffs bonus round: deadline wiring follows once playoff games exist.
  return null;
}

export interface MyBonusPrediction {
  hauptrundensieger?: string;
  platzierungTigers?: number;
  topscorerTigers?: string;
  meisteToreTigers?: string;
}

export async function getMyBonusPrediction(round: BonusRound): Promise<MyBonusPrediction | null> {
  const session = await auth();
  if (!session?.user) return null;

  await dbConnect();
  const doc = await BonusPredictionModel.findOne({ userId: session.user.id, round }).lean<{
    hauptrundensieger?: string;
    platzierungTigers?: number;
    topscorerTigers?: string;
    meisteToreTigers?: string;
  } | null>();

  if (!doc) return {};
  return {
    hauptrundensieger: doc.hauptrundensieger,
    platzierungTigers: doc.platzierungTigers,
    topscorerTigers: doc.topscorerTigers,
    meisteToreTigers: doc.meisteToreTigers,
  };
}

export async function submitBonusTip(
  round: BonusRound,
  field: BonusField,
  value: string
): Promise<BonusTipResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Bitte melde dich an, um zu tippen." };

  const deadline = await getBonusDeadline(round);
  if (deadline && new Date() >= deadline) {
    return { success: false, error: "Die Abgabe für Bonustipps ist bereits geschlossen." };
  }

  let update: Record<string, string | number>;
  if (field === "platzierungTigers") {
    const num = Number(value);
    if (!Number.isInteger(num) || num < 1 || num > 14) {
      return { success: false, error: "Ungültige Platzierung." };
    }
    update = { platzierungTigers: num };
  } else if (field === "hauptrundensieger") {
    if (!DEL_CLUBS.some((club) => club.id === value)) {
      return { success: false, error: "Ungültiger Verein." };
    }
    update = { hauptrundensieger: value };
  } else {
    if (!TIGERS_SKATERS.some((player) => player.id === value)) {
      return { success: false, error: "Ungültiger Spieler." };
    }
    update = { [field]: value };
  }

  await dbConnect();
  await BonusPredictionModel.updateOne(
    { userId: session.user.id, round },
    { $set: update },
    { upsert: true }
  );

  return { success: true };
}
