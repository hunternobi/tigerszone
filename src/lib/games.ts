import { dbConnect } from "@/lib/mongodb";
import { GameModel, type GameDocument } from "@/models/Game";
import type { Game } from "@/types";

function serializeGame(doc: GameDocument): Game {
  return {
    _id: doc._id.toString(),
    homeTeamId: doc.homeTeamId,
    awayTeamId: doc.awayTeamId,
    kickoff: doc.kickoff.toISOString(),
    competition: doc.competition,
    matchday: doc.matchday,
    isDerby: doc.isDerby,
    status: doc.status,
    homeScore: doc.homeScore,
    awayScore: doc.awayScore,
    overtime: doc.overtime,
  };
}

export async function getUpcomingGames(limit: number): Promise<Game[]> {
  await dbConnect();
  const docs = await GameModel.find({ status: "scheduled" })
    .sort({ kickoff: 1 })
    .limit(limit)
    .lean<GameDocument[]>();
  return docs.map(serializeGame);
}

export async function getAllGames(): Promise<Game[]> {
  await dbConnect();
  const docs = await GameModel.find({}).sort({ kickoff: 1 }).lean<GameDocument[]>();
  return docs.map(serializeGame);
}

export async function getGameById(id: string): Promise<Game | null> {
  await dbConnect();
  const doc = await GameModel.findById(id).lean<GameDocument | null>();
  return doc ? serializeGame(doc) : null;
}
