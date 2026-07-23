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
  const {
    predictedHome,
    predictedAway,
    predictedOvertime,
    actualHome,
    actualAway,
    actualOvertime,
    isDerby,
  } = input;

  const predictedWinner = Math.sign(predictedHome - predictedAway);
  const actualWinner = Math.sign(actualHome - actualAway);
  const winnerCorrect = predictedWinner === actualWinner;

  let points = 0;

  if (winnerCorrect) {
    points += SCORING.WINNER;
  }

  const exactScore = predictedHome === actualHome && predictedAway === actualAway;
  if (exactScore) {
    points += SCORING.EXACT_SCORE;
  }

  const correctGoalDiff = predictedHome - predictedAway === actualHome - actualAway;
  const correctOvertimeCall =
    predictedOvertime !== undefined &&
    actualOvertime !== undefined &&
    predictedOvertime === actualOvertime;

  if (winnerCorrect && (correctGoalDiff || correctOvertimeCall)) {
    points += SCORING.GOAL_DIFF_OR_OT;
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
