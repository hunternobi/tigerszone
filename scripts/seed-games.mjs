import mongoose from "mongoose";

const { Schema } = mongoose;

const gameSchema = new Schema({
  homeTeamId: { type: String, required: true },
  awayTeamId: { type: String, required: true },
  kickoff: { type: Date, required: true },
  competition: { type: String, enum: ["Vorbereitung", "DEL"], required: true },
  matchday: { type: Number },
  isDerby: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["scheduled", "live", "finished", "postponed", "cancelled"],
    default: "scheduled",
  },
  homeScore: { type: Number },
  awayScore: { type: Number },
  overtime: { type: String, enum: ["REG", "OT", "SO"] },
});

const GameModel = mongoose.models.Game || mongoose.model("Game", gameSchema);

const GAMES = [
  { homeTeamId: "straubing-tigers", awayTeamId: "nuernberg-ice-tigers", kickoff: "2026-08-21T19:00:00", competition: "Vorbereitung", isDerby: false },
  { homeTeamId: "straubing-tigers", awayTeamId: "frankfurt-wolfsburg", kickoff: "2026-08-23T18:00:00", competition: "Vorbereitung", isDerby: false },
  { homeTeamId: "steinbach-black-wings-linz", awayTeamId: "straubing-tigers", kickoff: "2026-08-28T18:30:00", competition: "Vorbereitung", isDerby: false },
  { homeTeamId: "straubing-tigers", awayTeamId: "steinbach-black-wings-linz", kickoff: "2026-08-30T16:30:00", competition: "Vorbereitung", isDerby: false },
  { homeTeamId: "ceske-budejovice", awayTeamId: "straubing-tigers", kickoff: "2026-09-04T17:30:00", competition: "Vorbereitung", isDerby: false },
  { homeTeamId: "straubing-tigers", awayTeamId: "ceske-budejovice", kickoff: "2026-09-06T16:30:00", competition: "Vorbereitung", isDerby: false },
  { homeTeamId: "mountfield-hk", awayTeamId: "straubing-tigers", kickoff: "2026-09-11T17:00:00", competition: "Vorbereitung", isDerby: false },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI ist nicht gesetzt");

  await mongoose.connect(uri);

  for (const game of GAMES) {
    await GameModel.updateOne(
      { homeTeamId: game.homeTeamId, awayTeamId: game.awayTeamId, kickoff: new Date(game.kickoff) },
      { $setOnInsert: { ...game, kickoff: new Date(game.kickoff), status: "scheduled" } },
      { upsert: true }
    );
  }

  const count = await GameModel.countDocuments();
  console.log(`Seed abgeschlossen. ${count} Spiele in der Datenbank.`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seed fehlgeschlagen:", err);
  process.exit(1);
});
