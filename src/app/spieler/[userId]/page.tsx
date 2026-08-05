import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { getUserPredictionHistory } from "@/lib/predictions";
import { getTeamName } from "@/lib/teams";
import { formatGameDate, formatGameTime } from "@/utils/format";

interface SpielerPageProps {
  params: Promise<{ userId: string }>;
}

export async function generateMetadata({ params }: SpielerPageProps): Promise<Metadata> {
  const { userId } = await params;
  const history = await getUserPredictionHistory(userId);
  return {
    title: history ? `Tipphistorie: ${history.playerName}` : "Spieler nicht gefunden",
    robots: { index: false, follow: false },
  };
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Ausstehend",
  live: "Live",
  finished: "Beendet",
  postponed: "Verschoben",
  cancelled: "Abgesagt",
};

export default async function SpielerPage({ params }: SpielerPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { userId } = await params;
  const history = await getUserPredictionHistory(userId);
  if (!history) notFound();

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/gruppen"
        className="inline-flex items-center gap-2 text-sm text-white hover:underline"
      >
        <ArrowLeft size={16} />
        Zurück zu den Gruppen
      </Link>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-white">Tipphistorie: {history.playerName}</h1>
        <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm font-semibold text-white">
          {history.totalPoints} Pkt. gesamt
        </span>
      </div>

      {history.entries.length === 0 ? (
        <p className="glass-panel mt-8 p-6 text-sm text-white">Noch keine Tipps abgegeben.</p>
      ) : (
        <div className="mt-8 space-y-3">
          {history.entries.map((entry) => (
            <div key={entry.gameId} className="glass-panel-sm p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-white">
                  {formatGameDate(entry.kickoff)} · {formatGameTime(entry.kickoff)} Uhr
                </span>
                <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase">
                  {entry.competition === "Vorbereitung" ? "Vorbereitung" : "DEL"}
                </span>
              </div>

              <p className="mt-2 font-semibold text-white">
                {getTeamName(entry.homeTeamId)} vs. {getTeamName(entry.awayTeamId)}
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                <span className="text-white">
                  Tipp: <span className="font-semibold">{entry.predictedHome}:{entry.predictedAway}</span>
                  {entry.status === "finished" && (
                    <>
                      {" "}
                      · Ergebnis:{" "}
                      <span className="font-semibold">
                        {entry.homeScore}:{entry.awayScore}
                      </span>
                    </>
                  )}
                  {entry.status !== "finished" && (
                    <span className="text-white"> · {STATUS_LABELS[entry.status] ?? entry.status}</span>
                  )}
                </span>
                <span className="font-semibold text-white">
                  {entry.pointsAwarded != null ? `${entry.pointsAwarded} Pkt.` : "– Pkt."}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
