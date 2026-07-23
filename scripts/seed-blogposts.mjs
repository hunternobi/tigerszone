import mongoose from "mongoose";

const { Schema } = mongoose;

const blogPostSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    publishedAt: { type: Date, required: true },
    authorName: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const BlogPostModel = mongoose.models.BlogPost || mongoose.model("BlogPost", blogPostSchema);

const POSTS = [
  {
    title: "The 25/26 Season In Review – Pre Season",
    publishedAt: "2026-07-21T00:00:00",
    authorName: "TigersCorner",
    content: [
      "Über 2 Monate haben wir euch warten lassen mit dem Start der Review, aber jetzt, wo das Eis bereits zurück ist und die Mannschaft mehr und mehr sich füllt, wächst die Vorfreude gewaltig auf das, was uns bald erwartet. Und eben weil wir von August sprechen, starten wir unsere Rückschau mit der Pre Season.",
      "Nach einem Jahr ohne Eishockey am Volksfest durften wir dieses Jahr wieder direkt von der Mass ins Eisstadion pilgern, es gibt kaum was Schöneres. Zu Gast war der komplette bayerische Zoo, beide Panther und die Ice Tigers, weshalb alle Partien gut besucht wurden und sich dieses Turnier selten so gelohnt haben muss, wie in diesem Jahr. Einer zerfahrenen Niederlage im Shootout gegen den AEV, folgte am Sonntag ein verdientes 3-1 gegen den ERCI, Ansätze der neuen Mannschaft waren gut, Haukeland noch immer in roter Hose, das sollte sich bis Mannheim auch nicht ändern.",
      "Eine Woche später reiste man in den traumhaften Vinschgau, geladen beim alljährlichen Cup des ERCI traf man dort auf den späteren ICEHL Vizemeister Pustertal und den amtierenden CHL-Champ ZSC Lions. Die erste Partie am Samstagabend lief etwas zerfahren, was aber auch am schwachen Aufbauspiel der Südtiroler lag, man ließ sich zeitweise darauf ein, erst in P3 fokussierte man sich auf sich und holte den souveränen Sieg. Am Sonntag dann gegen ZSC eine bärenstarke Partie unseres Teams, drei großartige Treffer und sehr viel Spielfreude ließ die Herzen höherschlagen. Was kann dieses Team wohl leisten, wenn sie eingespielt sind. Zweiter Sieg u. damit Turniersieg im Vinschgau.",
      "Wiederum eine Woche später dann in Dresden eine Niederlage gegen WOB u. ein knappes 1-0 gegen FFM, viel Test, viel probiert und harte Trainingswochen im Körper zollten dem Turnier seinen Tribut, keins der Spiele war ein Leckerbissen des Eishockey-Sports.",
      "Finaler Test dann im tschechischen Budweis und wie heiß die Fans auf Eishockey waren zeigten die mitgereisten Fans, ca. 100 Straubinger folgten ihrem Team durch eine verregnete Nacht und wir wurden belohnt, denn am Ende hieß es 3-7 und eine wirklich gelungene Generalprobe, die uns alle auf die DEL-Saison hoffen.",
    ].join("\n\n"),
  },
  {
    title: "The 25/26 Season In Review – Introduction",
    publishedAt: "2026-05-04T00:00:00",
    authorName: "TigersCorner",
    content: [
      "Wir hatten unsere Einführung zur Rückschau der „alten\" Saison bereits in der vorigen Woche auf dem Plan, trotz eines Anschlusses in der Serie hatte man so gar nicht glauben wollen, dass die Eisbären sich das nehmen lassen. Es hat sich bestätigt, wir hätten veröffentlichen können. Gratulation an die Organisation in Berlin für diesen Titel. Jede Serie gesteigert, jeden möglichen Tiefschlag weggewischt und verdient den Three-Peat eingefahren.",
      "In drei Serien souverän von Platz 6 die Trophäe an die Spree geholt, speziell Köln und Mannheim waren „keine Gegner\" auf dem Weg zum Titel. Unsere Tigers erneut eine hohe Hürde, die aber mal wieder genommen wurde. Und da machen wir den Bogen auf UNSERE Rückschau und wir starten gleich mit einem Statement, dass dem Einen o. Anderen nicht schmecken mag – oft wurde uns wieder auf die Schulter geklopft, was für ein ekliger Gegner wir gewesen sind. Dem mag auch sein, ABER kaufen können wir uns alle davon nichts. Erneut. Weder die Spieler, weil im Viertelfinale Schluss war, noch wir Fans, weil wir uns weiter anhören müssen, dass man gegen die Eisbären kein einzige PO-Serie gewonnen hat.",
      "Wir könnten uns jetzt damit trösten, dass die Adler letztmals vor 24 Jahren eine Serie gegen Berlin gewinnen konnten, aber deren Trostpfand sind drei Meisterschaften im gleichen Zeitraum.",
      "Und so stehen wir also wieder da im Mai, wenn wir uns anschauen mussten, wie auf Berlin das Konfetti fällt, und denken uns – was machen wir aus dieser Saison, die uns Fans so viele Rekorde gegeben hat, so viel Freude und am Ende den gleichen Herzschmerz im Berliner Osten. 34 Siege aus 52 Partien, 101 Punkte. 14 Auswärtssiege, die meisten Siege in Serie. Dieses Team hat uns so viel Freude von August bis April geschenkt.",
      "Wir wollen nun nicht voraus greifen – in den kommenden Wochen arbeiten wir die Saison unserer Mannschaft auf, von Vorbereitung, über das erste Tief, bis zur Olympiapause und den Play-Offs. Wir freuen uns darauf, wenn ihr die Beiträge nutzt, mitzudiskutieren. Nicht jeder wird unserer Meinung sein. Über diesen Austausch freuen wir uns.",
      "Sommerpause. Traurig.\nNUR DER EHC!",
    ].join("\n\n"),
  },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI ist nicht gesetzt");

  await mongoose.connect(uri);

  for (const post of POSTS) {
    await BlogPostModel.updateOne(
      { title: post.title },
      { $setOnInsert: { ...post, publishedAt: new Date(post.publishedAt) } },
      { upsert: true }
    );
  }

  const count = await BlogPostModel.countDocuments();
  console.log(`Seed abgeschlossen. ${count} Blogposts in der Datenbank.`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seed fehlgeschlagen:", err);
  process.exit(1);
});
