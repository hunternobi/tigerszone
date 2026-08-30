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

      {/* Mobile: team names get the full row so long names stay readable. */}
      <div className="glass-panel-sm mt-3 divide-y divide-white/5 p-2 sm:hidden">
        {results.map((entry) => (
          <div key={entry.gameId} className="px-1 py-2.5">
            <p className="text-sm font-semibold text-white">
              {getTeamName(entry.homeTeamId)} vs. {getTeamName(entry.awayTeamId)}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <span className="text-[11px] text-white/60">{formatGameDate(entry.kickoff)}</span>
              <span className="flex items-center gap-2.5 text-xs text-white">
                <span>
                  Tipp{" "}
                  <span className="font-semibold">
                    {entry.predictedHome}:{entry.predictedAway}
                  </span>
                </span>
                <span>
                  Erg.{" "}
                  <span className="font-semibold">
                    {entry.homeScore}:{entry.awayScore}
                  </span>
                </span>
                <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 font-semibold whitespace-nowrap">
                  {entry.pointsAwarded ?? 0} Pkt.
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Tablet/Desktop: compact table with a single header row. */}
      <div className="glass-panel-sm mt-3 hidden p-2 sm:block sm:p-3">
        <div className="grid grid-cols-[minmax(0,1fr)_3.5rem_3.5rem_4rem] items-center gap-2 px-2 pb-2 text-[11px] font-semibold tracking-wide text-white/50 uppercase">
          <span>Spiel</span>
          <span className="text-center">Tipp</span>
          <span className="text-center">Ergebnis</span>
          <span className="text-right">Punkte</span>
        </div>
        <div className="divide-y divide-white/5">
          {results.map((entry) => (
            <div
              key={entry.gameId}
              className="grid grid-cols-[minmax(0,1fr)_3.5rem_3.5rem_4rem] items-center gap-2 px-2 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
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
                {entry.pointsAwarded ?? 0} Pkt.
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
