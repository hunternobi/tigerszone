import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAllGames } from "@/lib/games";
import GameResultForm from "@/components/GameResultForm";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin") redirect("/");

  const games = await getAllGames();

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
    </section>
  );
}
