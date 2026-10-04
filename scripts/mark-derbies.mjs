// Markiert künftige Derbys (idempotent, setzt nur isDerby=true, ändert nie etwas Zurückliegendes).
//
//   Probelauf (schreibt nichts):  node --env-file=.env.local scripts/mark-derbies.mjs
//   Dev schreiben:                node --env-file=.env.local scripts/mark-derbies.mjs --apply
//   Produktion (nur nach Freigabe!): node --env-file=.env.local.prod-backup scripts/mark-derbies.mjs --apply
//
// Derby-Gegner der Straubing Tigers: München, Augsburg, Nürnberg, Ingolstadt.
// Angefasst werden nur Spiele mit status "scheduled" UND Anstoß in der Zukunft. Beendete oder bereits
// angepfiffene Spiele (und damit alle vergebenen Punkte) bleiben unverändert; bestehende Markierungen
// werden nie entfernt. Nach dem Schreiben vergleicht das Skript alle Spiele vorher/nachher.
import mongoose from "mongoose";
import { isDeepStrictEqual } from "node:util";

const TIGERS = "straubing-tigers";
const DERBY_OPPONENTS = ["ehc-red-bull-muenchen", "augsburger-panther", "nuernberg-ice-tigers", "erc-ingolstadt"];
const apply = process.argv.includes("--apply");

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI ist nicht gesetzt");

await mongoose.connect(uri);
console.log(`Ziel-Datenbank: ${new URL(uri).pathname.slice(1)}  (${apply ? "SCHREIBEN" : "Probelauf"})`);

const games = mongoose.connection.db.collection("games");
const now = new Date();
const before = await games.find({}).sort({ _id: 1 }).toArray();

const targets = before.filter((game) => {
  if (game.competition !== "DEL" || game.status !== "scheduled" || game.kickoff <= now || game.isDerby) return false;
  const opponent = game.homeTeamId === TIGERS ? game.awayTeamId : game.homeTeamId;
  return (game.homeTeamId === TIGERS || game.awayTeamId === TIGERS) && DERBY_OPPONENTS.includes(opponent);
});

console.log(`\nZu markieren: ${targets.length} künftige Spiele`);
for (const game of targets.sort((a, b) => a.kickoff - b.kickoff)) {
  console.log(`  Spieltag ${String(game.matchday).padStart(2)}  ${game.kickoff.toISOString().slice(0, 16)}Z  ${game.homeTeamId} vs ${game.awayTeamId}`);
}

if (!apply) {
  console.log("\nProbelauf – nichts geschrieben. Mit --apply ausführen, um die Markierung zu setzen.");
  await mongoose.disconnect();
  process.exit(0);
}

const ids = targets.map((game) => game._id);
const result = ids.length ? await games.updateMany({ _id: { $in: ids } }, { $set: { isDerby: true } }) : { modifiedCount: 0 };
console.log(`\n${result.modifiedCount} Spiele als Derby markiert.`);

const after = await games.find({}).sort({ _id: 1 }).toArray();
const targetSet = new Set(ids.map(String));
let problems = 0;
if (before.length !== after.length) {
  console.log(`FEHLER: Spielanzahl geändert (${before.length} -> ${after.length})`);
  problems++;
}
for (const old of before) {
  const now_ = after.find((game) => String(game._id) === String(old._id));
  const expected = targetSet.has(String(old._id)) ? { ...old, isDerby: true } : old;
  if (!now_ || !isDeepStrictEqual(now_, expected)) {
    console.log(`FEHLER: Spiel ${old._id} (Spieltag ${old.matchday}) weicht ab`);
    problems++;
  }
}
const finishedDerbys = after.filter((game) => game.status === "finished" && game.isDerby).length;
console.log(problems === 0 ? "Verifikation OK: außer isDerby bei den markierten Spielen ist nichts verändert." : `Verifikation FEHLGESCHLAGEN (${problems} Abweichungen)`);
console.log(`Bereits beendete Derbys (unverändert): ${finishedDerbys}`);

await mongoose.disconnect();
process.exit(problems === 0 ? 0 : 1);
