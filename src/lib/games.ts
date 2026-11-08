import { unstable_cache } from "next/cache";
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

/** Straight from the database; the admin page uses this so it never shows a stale fixture list. */
export async function getAllGamesFresh(): Promise<Game[]> {
  await dbConnect();
  const docs = await GameModel.find({}).sort({ kickoff: 1 }).lean<GameDocument[]>();
  return docs.map(serializeGame);
}

export const GAMES_TAG = "games";

// The fixture list only changes when an admin enters a result (which refreshes the tag at once) or fixtures
// are loaded by script, so a minute of caching is invisible to users.
const cachedAllGames = unstable_cache(getAllGamesFresh, ["all-games"], {
  revalidate: 60,
  tags: [GAMES_TAG],
});

export function getAllGames(): Promise<Game[]> {
  return cachedAllGames();
}

export async function getGameById(id: string): Promise<Game | null> {
  await dbConnect();
  const doc = await GameModel.findById(id).lean<GameDocument | null>();
  return doc ? serializeGame(doc) : null;
}
