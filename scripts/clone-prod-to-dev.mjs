// Kopiert die Produktiv-Datenbank in die lokale Dev-Datenbank (gleicher Atlas-Cluster).
//
//   npm run db:clone-dev
//
// - Quelle (PROD_DB_NAME, Standard "tigerszone") wird NUR GELESEN.
// - Ziel ist die DB aus MONGODB_URI und MUSS auf "-dev" enden, sonst bricht das Skript ab.
// - Das Ziel wird komplett überschrieben (Collections werden vorher gelöscht).
// - Datenschutz: Bei allen Nicht-Admins wird die E-Mail durch eine Dummy-Adresse ersetzt und das
//   Passwort auf "dev123456" gesetzt, Token werden gelöscht. Admin-Konten bleiben unverändert,
//   damit du dich lokal wie gewohnt einloggen kannst.
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const DEV_USER_PASSWORD = "dev123456";
const MAX_SOURCE_MB = 200;

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI ist nicht gesetzt (.env.local)");

const prodDb = process.env.PROD_DB_NAME ?? "tigerszone";
const targetUrl = new URL(uri);
const devDb = targetUrl.pathname.replace(/^\//, "");

if (!devDb.endsWith("-dev") || devDb === prodDb) {
  throw new Error(
    `Abbruch: Ziel-DB "${devDb}" muss auf "-dev" enden und darf nicht "${prodDb}" sein. ` +
      `Prüfe MONGODB_URI in .env.local.`
  );
}

const sourceUrl = new URL(uri);
sourceUrl.pathname = `/${prodDb}`;

const src = await mongoose.createConnection(sourceUrl.toString()).asPromise();
const dst = await mongoose.createConnection(targetUrl.toString()).asPromise();

try {
  const stats = await src.db.command({ dbStats: 1, scale: 1024 * 1024 });
  console.log(`Quelle "${prodDb}": ${stats.dataSize.toFixed(1)} MB Daten, ${stats.collections} Collections`);
  if (stats.dataSize > MAX_SOURCE_MB) {
    throw new Error(`Quelle ist größer als ${MAX_SOURCE_MB} MB - Atlas-Free-Tier (512 MB) würde eng. Abbruch.`);
  }
  console.log(`Ziel   "${devDb}" wird überschrieben ...\n`);

  const collections = await src.db.listCollections({}, { nameOnly: true }).toArray();

  for (const { name } of collections) {
    if (name.startsWith("system.")) continue;

    const from = src.db.collection(name);
    const to = dst.db.collection(name);

    await to.drop().catch(() => {});
    await dst.db.createCollection(name);

    let batch = [];
    let count = 0;
    for await (const doc of from.find({})) {
      batch.push(doc);
      if (batch.length === 1000) {
        await to.insertMany(batch, { ordered: false });
        count += batch.length;
        batch = [];
      }
    }
    if (batch.length > 0) {
      await to.insertMany(batch, { ordered: false });
      count += batch.length;
    }

    const indexes = await from.indexes();
    for (const index of indexes) {
      if (index.name === "_id_") continue;
      const { key, v, ns, ...options } = index;
      await to.createIndex(key, options);
    }

    console.log(`  ${name.padEnd(24)} ${String(count).padStart(6)} Dokumente, ${indexes.length} Indizes`);
  }

  const users = dst.db.collection("users");
  const devPasswordHash = await bcrypt.hash(DEV_USER_PASSWORD, 10);
  const anonymized = await users.updateMany({ role: { $ne: "admin" } }, [
    {
      $set: {
        email: { $concat: ["user-", { $toString: "$_id" }, "@dev.tigerszone.test"] },
        passwordHash: devPasswordHash,
      },
    },
  ]);
  await users.updateMany(
    {},
    { $unset: { verificationToken: "", verificationTokenExpiresAt: "", resetToken: "", resetTokenExpiresAt: "" } }
  );
  console.log(`\nDatenschutz: ${anonymized.modifiedCount} Nicht-Admin-Konten anonymisiert (Passwort lokal: ${DEV_USER_PASSWORD})`);
  console.log("Fertig.");
} finally {
  await src.close();
  await dst.close();
}
