import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAllGames } from "@/lib/games";
import { getAllUsersWithGroups } from "@/lib/adminUsers";
import GameResultForm from "@/components/GameResultForm";
import AdminUserTable from "@/components/AdminUserTable";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin") redirect("/");

  const [games, users] = await Promise.all([getAllGames(), getAllUsersWithGroups()]);

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-bold text-white">Admin-Bereich</h1>
      <p className="mt-3 text-white/70">
        Ergebnisse eintragen oder korrigieren. Die Punkteauswertung aller Tipps läuft danach
        automatisch.
      </p>

      <div className="mt-8 space-y-4">
        {games.map((game) => (
          <GameResultForm key={game._id} game={game} />
        ))}
      </div>

      <h2 className="mt-16 text-2xl font-bold text-white">Benutzerverwaltung</h2>
      <p className="mt-2 text-white/70">
        Alle registrierten Nutzer und ihre Gruppenmitgliedschaften.
      </p>
      <div className="mt-6">
        <AdminUserTable users={users} currentUserId={session.user.id} />
      </div>
    </section>
  );
}
