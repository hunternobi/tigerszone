import { getTeamName } from "@/lib/teams";
import { formatGameDate } from "@/utils/format";
import type { ResultEntry } from "@/components/TippspielTable";

interface MeineTippsTableProps {
  results: ResultEntry[];
}

export default function MeineTippsTable({ results }: MeineTippsTableProps) {
  if (results.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-bold text-white">Meine Tipps</h3>
      <div className="glass-panel-sm mt-3 p-2 sm:p-3">
        <div className="grid grid-cols-[minmax(0,1fr)_2.75rem_2.75rem_3.25rem] items-center gap-2 px-1 pb-2 text-[10px] font-semibold tracking-wide text-white/50 uppercase sm:grid-cols-[minmax(0,1fr)_3.5rem_3.5rem_4rem] sm:px-2 sm:text-[11px]">
          <span>Spiel</span>
          <span className="text-center">Tipp</span>
          <span className="text-center">Ergebnis</span>
          <span className="text-right">Punkte</span>
        </div>
        <div className="divide-y divide-white/5">
          {results.map((entry) => (
            <div
              key={entry.gameId}
              className="grid grid-cols-[minmax(0,1fr)_2.75rem_2.75rem_3.25rem] items-center gap-2 px-1 py-2.5 sm:grid-cols-[minmax(0,1fr)_3.5rem_3.5rem_4rem] sm:px-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">
                  {getTeamName(entry.homeTeamId)} vs. {getTeamName(entry.awayTeamId)}
                </p>
                <p className="text-[11px] text-white/60">{formatGameDate(entry.kickoff)}</p>
              </div>
              <span className="text-center text-sm font-semibold text-white">
                {entry.predictedHome}:{entry.predictedAway}
              </span>
              <span className="text-center text-sm font-semibold text-white">
                {entry.homeScore}:{entry.awayScore}
              </span>
              <span className="text-right text-sm font-semibold text-white">
                {entry.pointsAwarded ?? 0}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
