export interface LeaderboardEntry {
  userId: string;
  name: string;
  points: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  title?: string;
}

export default function Leaderboard({ entries, title = "Rangliste" }: LeaderboardProps) {
  return (
    <div className="glass-panel p-6">
      <h3 className="mb-4 text-lg font-bold text-white">{title}</h3>
      {entries.length === 0 ? (
        <p className="text-sm text-white/60">Noch keine Einträge vorhanden.</p>
      ) : (
        <ol className="space-y-2">
          {entries.map((entry, index) => (
            <li
              key={entry.userId}
              className="flex items-center justify-between rounded-lg px-3 py-2 odd:bg-white/5"
            >
              <span className="flex items-center gap-3 text-white">
                <span className="text-tigers-secondary">{index + 1}.</span>
                {entry.name}
              </span>
              <span className="font-semibold text-white">{entry.points} Pkt.</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
