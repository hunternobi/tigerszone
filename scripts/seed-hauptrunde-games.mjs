// Legt die Hauptrunde-Spiele an (idempotent: vorhandene Spiele werden nicht doppelt angelegt oder verändert).
//
//   Dev:        node --env-file=.env.local scripts/seed-hauptrunde-games.mjs
//   Produktion: node --env-file=.env.local.prod-backup scripts/seed-hauptrunde-games.mjs   (nur nach Freigabe!)
//
// Quelle: https://www.straubing-tigers.de/spielplan/ (Penny DEL 2026/27). Zeiten sind deutsche Ortszeit
// (Europe/Berlin) und werden unten korrekt in UTC umgerechnet (Sommer-/Winterzeit).
import mongoose from "mongoose";

const TIGERS = "straubing-tigers";

// [Spieltag, Datum, Uhrzeit, "h" = Heim / "a" = Auswärts, Gegner]
const SCHEDULE = [
  [4, "2026-09-27", "16:30", "a", "nuernberg-ice-tigers"],
  [5, "2026-10-02", "19:30", "h", "fischtown-pinguins-bremerhaven"],
  [6, "2026-10-04", "14:00", "a", "schwenninger-wild-wings"],
  [7, "2026-10-09", "19:30", "h", "iserlohn-roosters"],
  [8, "2026-10-11", "19:00", "a", "adler-mannheim"],
  [9, "2026-10-16", "19:30", "a", "loewen-frankfurt"],
  [10, "2026-10-18", "14:00", "h", "grizzlys-wolfsburg"],
  [11, "2026-10-23", "19:30", "h", "koelner-haie"],
  [12, "2026-10-25", "16:30", "a", "augsburger-panther"],
  [13, "2026-10-30", "19:30", "h", "ehc-red-bull-muenchen"],
  [14, "2026-11-01", "14:00", "a", "fischtown-pinguins-bremerhaven"],
  [15, "2026-11-13", "19:30", "a", "erc-ingolstadt"],
  [16, "2026-11-15", "16:30", "h", "loewen-frankfurt"],
  [17, "2026-11-19", "19:30", "a", "krefeld-pinguine"],
  [18, "2026-11-22", "14:00", "h", "eisbaeren-berlin"],
  [19, "2026-11-24", "19:30", "h", "adler-mannheim"],
  [20, "2026-11-27", "19:30", "a", "koelner-haie"],
  [21, "2026-11-29", "16:30", "a", "ehc-red-bull-muenchen"],
  [22, "2026-12-03", "19:30", "h", "augsburger-panther"],
  [23, "2026-12-06", "19:00", "a", "iserlohn-roosters"],
  [24, "2026-12-08", "19:30", "h", "nuernberg-ice-tigers"],
  [25, "2026-12-11", "19:30", "a", "grizzlys-wolfsburg"],
  [26, "2026-12-13", "16:30", "h", "schwenninger-wild-wings"],
  [27, "2026-12-18", "19:30", "h", "fischtown-pinguins-bremerhaven"],
  [28, "2026-12-20", "16:30", "a", "nuernberg-ice-tigers"],
  [29, "2026-12-23", "19:30", "a", "adler-mannheim"],
  [30, "2026-12-27", "16:30", "h", "krefeld-pinguine"],
  [31, "2026-12-29", "19:30", "h", "grizzlys-wolfsburg"],
  [32, "2027-01-03", "14:00", "a", "ehc-red-bull-muenchen"],
  [33, "2027-01-05", "19:30", "a", "koelner-haie"],
  [34, "2027-01-08", "19:30", "h", "iserlohn-roosters"],
  [35, "2027-01-10", "16:30", "a", "augsburger-panther"],
  [36, "2027-01-15", "19:30", "h", "loewen-frankfurt"],
  [37, "2027-01-17", "16:30", "a", "erc-ingolstadt"],
  [38, "2027-01-22", "19:30", "a", "eisbaeren-berlin"],
  [39, "2027-01-24", "16:30", "h", "schwenninger-wild-wings"],
  [40, "2027-01-28", "19:30", "a", "fischtown-pinguins-bremerhaven"],
  [41, "2027-01-31", "16:30", "h", "adler-mannheim"],
  [42, "2027-02-03", "19:30", "h", "koelner-haie"],
  [43, "2027-02-05", "19:30", "a", "grizzlys-wolfsburg"],
  [44, "2027-02-07", "19:00", "h", "ehc-red-bull-muenchen"],
  [45, "2027-02-17", "19:30", "h", "eisbaeren-berlin"],
  [46, "2027-02-19", "19:30", "a", "loewen-frankfurt"],
  [47, "2027-02-21", "14:00", "a", "iserlohn-roosters"],
  [48, "2027-02-26", "19:30", "h", "erc-ingolstadt"],
  [49, "2027-02-28", "16:30", "h", "nuernberg-ice-tigers"],
  [50, "2027-03-03", "19:30", "a", "krefeld-pinguine"],
  [51, "2027-03-05", "19:30", "a", "schwenninger-wild-wings"],
  [52, "2027-03-07", "14:00", "h", "augsburger-panther"],
];

// Deutsche Ortszeit -> UTC (berücksichtigt Sommer-/Winterzeit).
function berlinToUtc(date, time) {
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const asIfUtc = Date.UTC(y, mo - 1, d, h, mi);
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Berlin",
    hourCycle: "h23",
    year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric",
  });
  const offsetAt = (utcMs) => {
    const p = Object.fromEntries(fmt.formatToParts(new Date(utcMs)).map((x) => [x.type, x.value]));
    return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute) - utcMs;
  };
  let utc = asIfUtc - offsetAt(asIfUtc);
  utc = asIfUtc - offsetAt(utc);
  return new Date(utc);
}

const GAMES = SCHEDULE.map(([matchday, date, time, side, opponent]) => ({
  matchday,
  homeTeamId: side === "h" ? TIGERS : opponent,
  awayTeamId: side === "h" ? opponent : TIGERS,
  kickoff: berlinToUtc(date, time),
}));

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI ist nicht gesetzt");

await mongoose.connect(uri);
console.log(`Ziel-Datenbank: ${new URL(uri).pathname.slice(1)}`);

const games = mongoose.connection.db.collection("games");
let created = 0;
for (const game of GAMES) {
  const result = await games.updateOne(
    { competition: "DEL", matchday: game.matchday, homeTeamId: game.homeTeamId, awayTeamId: game.awayTeamId },
    {
      $setOnInsert: {
        ...game,
        competition: "DEL",
        isDerby: false,
        status: "scheduled",
      },
    },
    { upsert: true }
  );
  if (result.upsertedCount) created++;
}
console.log(`${created} neue Spiele angelegt, ${GAMES.length - created} waren schon vorhanden.`);

const total = await games.countDocuments({ competition: "DEL" });
console.log(`DEL-Spiele in der Datenbank jetzt: ${total}`);

await mongoose.disconnect();
