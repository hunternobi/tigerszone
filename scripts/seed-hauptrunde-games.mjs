// Legt Hauptrunde-Spiele an (idempotent: vorhandene Spiele werden nicht doppelt angelegt oder verändert).
//
//   Dev:        node --env-file=.env.local scripts/seed-hauptrunde-games.mjs
//   Produktion: node --env-file=.env.local.prod-backup scripts/seed-hauptrunde-games.mjs   (nur nach Freigabe!)
//
// Quelle: https://www.straubing-tigers.de/spielplan/ (Penny DEL 2026/27). Anstoßzeiten in UTC angegeben
// (Sommerzeit bis 25.10.: 19:30 Uhr = 17:30Z, 16:30 Uhr = 14:30Z, 14:00 Uhr = 12:00Z).
import mongoose from "mongoose";

const GAMES = [
  { matchday: 4, homeTeamId: "nuernberg-ice-tigers", awayTeamId: "straubing-tigers", kickoff: "2026-09-27T14:30:00Z" },
  { matchday: 5, homeTeamId: "straubing-tigers", awayTeamId: "fischtown-pinguins-bremerhaven", kickoff: "2026-10-02T17:30:00Z" },
  { matchday: 6, homeTeamId: "schwenninger-wild-wings", awayTeamId: "straubing-tigers", kickoff: "2026-10-04T12:00:00Z" },
];

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI ist nicht gesetzt");

await mongoose.connect(uri);
console.log(`Ziel-Datenbank: ${new URL(uri).pathname.slice(1)}`);

const games = mongoose.connection.db.collection("games");
for (const game of GAMES) {
  const result = await games.updateOne(
    { competition: "DEL", matchday: game.matchday, homeTeamId: game.homeTeamId, awayTeamId: game.awayTeamId },
    {
      $setOnInsert: {
        ...game,
        kickoff: new Date(game.kickoff),
        competition: "DEL",
        isDerby: false,
        status: "scheduled",
      },
    },
    { upsert: true }
  );
  console.log(`  Spieltag ${game.matchday}: ${result.upsertedCount ? "angelegt" : "war schon vorhanden"}`);
}

const all = await games.find({ competition: "DEL" }).sort({ kickoff: 1 }).toArray();
console.log("\nDEL-Spiele jetzt:");
for (const g of all) {
  console.log(`  #${g.matchday} ${g.homeTeamId} vs ${g.awayTeamId}  ${g.kickoff.toISOString()}  ${g.status}`);
}

await mongoose.disconnect();
