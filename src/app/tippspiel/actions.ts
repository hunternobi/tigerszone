"use server";

import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import { GameModel } from "@/models/Game";
import { PredictionModel } from "@/models/Prediction";

export interface SubmitPredictionResult {
  success: boolean;
  error?: string;
}

export async function submitPrediction(
  gameId: string,
  predictedHome: number,
  predictedAway: number
): Promise<SubmitPredictionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Bitte melde dich an, um zu tippen." };
  }

  if (
    !Number.isInteger(predictedHome) ||
    !Number.isInteger(predictedAway) ||
    predictedHome < 0 ||
    predictedAway < 0
  ) {
    return { success: false, error: "Ungültiger Tipp." };
  }

  await dbConnect();
  const game = await GameModel.findById(gameId);
  if (!game) {
    return { success: false, error: "Spiel nicht gefunden." };
  }
  if (game.status !== "scheduled" || new Date() >= game.kickoff) {
    return { success: false, error: "Die Tippabgabe für dieses Spiel ist bereits geschlossen." };
  }

  await PredictionModel.updateOne(
    { userId: session.user.id, gameId },
    { $set: { predictedHome, predictedAway } },
    { upsert: true }
  );

  return { success: true };
}

export interface MyPrediction {
  predictedHome: number;
  predictedAway: number;
}

export async function getMyPrediction(gameId: string): Promise<MyPrediction | null> {
  const session = await auth();
  if (!session?.user) return null;

  await dbConnect();
  const prediction = await PredictionModel.findOne({ userId: session.user.id, gameId }).lean<{
    predictedHome: number;
    predictedAway: number;
  }>();

  if (!prediction) return null;
  return { predictedHome: prediction.predictedHome, predictedAway: prediction.predictedAway };
}
