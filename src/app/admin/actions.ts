"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import { GameModel } from "@/models/Game";
import { recomputeGamePoints } from "@/lib/scoring";
import type { Overtime } from "@/types";

export interface ActionResult {
  success: boolean;
  error?: string;
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Nicht autorisiert.");
  }
}

export async function saveGameResult(
  gameId: string,
  homeScore: number,
  awayScore: number,
  overtime: Overtime,
  isDerby: boolean
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Nicht autorisiert." };
  }

  if (
    !Number.isInteger(homeScore) ||
    !Number.isInteger(awayScore) ||
    homeScore < 0 ||
    awayScore < 0
  ) {
    return { success: false, error: "Ungültiges Ergebnis." };
  }

  await dbConnect();
  const game = await GameModel.findById(gameId);
  if (!game) return { success: false, error: "Spiel nicht gefunden." };

  game.homeScore = homeScore;
  game.awayScore = awayScore;
  game.overtime = overtime;
  game.isDerby = isDerby;
  game.status = "finished";
  await game.save();

  await recomputeGamePoints(gameId);

  revalidatePath("/admin");
  revalidatePath("/tippspiel");

  return { success: true };
}
