import { Types } from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import { PredictionModel } from "@/models/Prediction";
import { GameModel, type GameDocument } from "@/models/Game";
import { UserModel } from "@/models/User";
import type { Competition, GameStatus } from "@/types";

export interface PredictionHistoryEntry {
  gameId: string;
  homeTeamId: string;
  awayTeamId: string;
  kickoff: string;
  competition: Competition;
  status: GameStatus;
  homeScore?: number;
  awayScore?: number;
  predictedHome: number;
  predictedAway: number;
  pointsAwarded?: number;
}

export interface PlayerPredictionHistory {
  userId: string;
  playerName: string;
  entries: PredictionHistoryEntry[];
  totalPoints: number;
}

export async function getUserPredictionHistory(
  userId: string
): Promise<PlayerPredictionHistory | null> {
  await dbConnect();

  const user = await UserModel.findById(userId).select("name").lean<{
    _id: Types.ObjectId;
    name: string;
  } | null>();
  if (!user) return null;

  const predictions = await PredictionModel.find({ userId }).lean<
    {
      gameId: Types.ObjectId;
      predictedHome: number;
      predictedAway: number;
      pointsAwarded?: number;
    }[]
  >();

  if (predictions.length === 0) {
    return { userId, playerName: user.name, entries: [], totalPoints: 0 };
  }

  const gameIds = predictions.map((prediction) => prediction.gameId);
  const games = await GameModel.find({ _id: { $in: gameIds } }).lean<GameDocument[]>();
  const gameById = new Map(games.map((game) => [game._id.toString(), game]));

  const entries: PredictionHistoryEntry[] = predictions
    .map((prediction): PredictionHistoryEntry | null => {
      const game = gameById.get(prediction.gameId.toString());
      if (!game) return null;
      return {
        gameId: game._id.toString(),
        homeTeamId: game.homeTeamId,
        awayTeamId: game.awayTeamId,
        kickoff: game.kickoff.toISOString(),
        competition: game.competition,
        status: game.status,
        homeScore: game.homeScore,
        awayScore: game.awayScore,
        predictedHome: prediction.predictedHome,
        predictedAway: prediction.predictedAway,
        pointsAwarded: prediction.pointsAwarded,
      };
    })
    .filter((entry): entry is PredictionHistoryEntry => entry !== null)
    .sort((a, b) => new Date(b.kickoff).getTime() - new Date(a.kickoff).getTime());

  const totalPoints = entries.reduce((sum, entry) => sum + (entry.pointsAwarded ?? 0), 0);

  return { userId, playerName: user.name, entries, totalPoints };
}
