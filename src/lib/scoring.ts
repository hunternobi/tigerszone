import { SCORING } from "@/lib/constants";
import { dbConnect } from "@/lib/mongodb";
import { GameModel } from "@/models/Game";
import { PredictionModel } from "@/models/Prediction";
import type { Overtime } from "@/types";

interface ScoringInput {
  predictedHome: number;
  predictedAway: number;
  predictedOvertime?: Overtime;
  actualHome: number;
  actualAway: number;
  actualOvertime?: Overtime;
  isDerby: boolean;
}

export function calculatePoints(input: ScoringInput): number {
  const { predictedHome, predictedAway, actualHome, actualAway, isDerby } = input;

  const predictedWinner = Math.sign(predictedHome - predictedAway);
  const actualWinner = Math.sign(actualHome - actualAway);
  const winnerCorrect = predictedWinner === actualWinner;

  const exactScore = predictedHome === actualHome && predictedAway === actualAway;
  const correctGoalDiff = predictedHome - predictedAway === actualHome - actualAway;

  let points = 0;
  if (exactScore) {
    points = SCORING.EXACT_SCORE;
  } else if (winnerCorrect && correctGoalDiff) {
    points = SCORING.GOAL_DIFF;
  } else if (winnerCorrect) {
    points = SCORING.WINNER;
  }

  if (isDerby) {
    points *= SCORING.DERBY_MULTIPLIER;
  }

  return points;
}

export async function recomputeGamePoints(gameId: string): Promise<void> {
  await dbConnect();
  const game = await GameModel.findById(gameId);
  if (!game || game.homeScore == null || game.awayScore == null) return;

  const predictions = await PredictionModel.find({ gameId });
  await Promise.all(
    predictions.map((prediction) => {
      prediction.pointsAwarded = calculatePoints({
        predictedHome: prediction.predictedHome,
        predictedAway: prediction.predictedAway,
        predictedOvertime: prediction.predictedOvertime,
        actualHome: game.homeScore!,
        actualAway: game.awayScore!,
        actualOvertime: game.overtime,
        isDerby: game.isDerby,
      });
      return prediction.save();
    })
  );
}
