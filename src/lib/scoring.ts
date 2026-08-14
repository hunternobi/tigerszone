import { SCORING } from "@/lib/constants";
import { dbConnect } from "@/lib/mongodb";
import { GameModel } from "@/models/Game";
import { PredictionModel } from "@/models/Prediction";
import { BonusPredictionModel, type BonusRound } from "@/models/BonusPrediction";
import { BonusResultModel } from "@/models/BonusResult";
import type { Overtime } from "@/types";

const BONUS_POINTS_PER_CORRECT = 10;

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

export async function recomputeBonusPoints(round: BonusRound): Promise<void> {
  await dbConnect();
  const result = await BonusResultModel.findOne({ round });
  if (!result) return;

  const predictions = await BonusPredictionModel.find({ round });

  await Promise.all(
    predictions.map((prediction) => {
      let points = 0;
      if (
        result.hauptrundensieger != null &&
        prediction.hauptrundensieger === result.hauptrundensieger
      ) {
        points += BONUS_POINTS_PER_CORRECT;
      }
      if (
        result.platzierungTigers != null &&
        prediction.platzierungTigers === result.platzierungTigers
      ) {
        points += BONUS_POINTS_PER_CORRECT;
      }
      if (
        result.topscorerTigers != null &&
        prediction.topscorerTigers === result.topscorerTigers
      ) {
        points += BONUS_POINTS_PER_CORRECT;
      }
      if (
        result.meisteToreTigers != null &&
        prediction.meisteToreTigers === result.meisteToreTigers
      ) {
        points += BONUS_POINTS_PER_CORRECT;
      }
      prediction.pointsAwarded = points;
      return prediction.save();
    })
  );
}
