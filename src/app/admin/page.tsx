import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAllGames } from "@/lib/games";
import { getAllUsersWithGroups } from "@/lib/adminUsers";
import { getAllGroups } from "@/lib/adminGroups";
import { getBonusResult } from "@/lib/adminBonus";
import { getSpieltagsMvp } from "@/lib/leaderboard";
import GameResultForm from "@/components/GameResultForm";
import AdminUserTable from "@/components/AdminUserTable";
import AdminGroupTable from "@/components/AdminGroupTable";
import BonusResultForm from "@/components/BonusResultForm";
import SpieltagsMvpAdmin from "@/components/SpieltagsMvpAdmin";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin") redirect("/");

  const [games, users, groups, bonusResult, spieltagsMvp] = await Promise.all([
    getAllGames(),
    getAllUsersWithGroups(),
    getAllGroups(),
    getBonusResult("hauptrunde"),
    getSpieltagsMvp(),
  ]);

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-bold text-white">Admin-Bereich</h1>
      <p className="mt-3 text-white">
        Ergebnisse eintragen oder korrigieren. Die Punkteauswertung aller Tipps läuft danach
        automatisch.
      </p>

      <div className="mt-8 space-y-4">
        {games.map((game) => (
          <GameResultForm key={game._id} game={game} />
        ))}
      </div>

      <h2 className="mt-16 text-2xl font-bold text-white">Spieltags-MVP</h2>
      <p className="mt-2 text-white">
        Wer beim letzten ausgewerteten Spieltag das Ergebnis exakt getroffen hat, fertig
        formatiert zum Kopieren für Instagram.
      </p>
      <div className="mt-6">
        <SpieltagsMvpAdmin mvp={spieltagsMvp} />
      </div>

      <h2 className="mt-16 text-2xl font-bold text-white">Bonustipps Hauptrunde</h2>
      <p className="mt-2 text-white">
        Auflösung für Hauptrundensieger, Platzierung, Topscorer und meiste Tore. Wird gespeichert
        und sofort für alle Nutzer ausgewertet.
      </p>
      <div className="mt-6">
        <BonusResultForm round="hauptrunde" initial={bonusResult} />
      </div>

      <div className="mt-16 flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-bold text-white">Benutzerverwaltung</h2>
        <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm font-semibold text-white">
          {users.length} {users.length === 1 ? "Nutzer" : "Nutzer registriert"}
        </span>
      </div>
      <p className="mt-2 text-white">
        Alle registrierten Nutzer und ihre Gruppenmitgliedschaften.
      </p>
      <div className="mt-6">
        <AdminUserTable users={users} currentUserId={session.user.id} />
      </div>

      <h2 className="mt-16 text-2xl font-bold text-white">Gruppen</h2>
      <p className="mt-2 text-white">Alle Tippgruppen mit Ersteller und Mitgliederzahl.</p>
      <div className="mt-6">
        <AdminGroupTable groups={groups} />
      </div>
    </section>
  );
}
