import PunkteverlaufChart from "@/components/PunkteverlaufChart";
import type { PointsHistoryEntry } from "@/lib/leaderboard";

interface PointsHistorySectionProps {
  playerName: string;
  history: PointsHistoryEntry[];
}

export default function PointsHistorySection({ playerName, history }: PointsHistorySectionProps) {
  return (
    <div className="glass-panel mt-8 p-4 sm:p-6">
      <h2 className="text-lg font-bold text-white">Punkteverlauf</h2>
      {history.length === 0 ? (
        <p className="mt-3 text-sm text-white/60">
          Noch keine ausgewerteten Spieltage – der Verlauf startet nach dem ersten Ergebnis.
        </p>
      ) : (
        <div className="mt-3">
          <PunkteverlaufChart
            spieltage={history.map((entry) => entry.label)}
            players={[{ name: playerName, points: history.map((entry) => entry.cumulative) }]}
          />
        </div>
      )}
    </div>
  );
}
