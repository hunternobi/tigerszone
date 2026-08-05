export interface LeaderboardEntry {
  userId: string;
  name: string;
  points: number;
  role?: "owner" | "assistant" | "member";
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  title?: string;
  medals?: boolean;
}

const MEDALS = ["🥇", "🥈", "🥉"];

const ROLE_BADGES = {
  owner: { emoji: "👔", label: "Head Coach" },
  assistant: { emoji: "📝", label: "Assistant Coach" },
} as const;

export function RoleBadge({ role }: { role?: "owner" | "assistant" | "member" }) {
  if (role !== "owner" && role !== "assistant") return null;
  const badge = ROLE_BADGES[role];
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white">
      {badge.emoji} {badge.label}
    </span>
  );
}

export default function Leaderboard({ entries, title = "Rangliste", medals = false }: LeaderboardProps) {
  return (
    <div className="glass-panel p-4 sm:p-6">
      <h3 className="mb-4 text-lg font-bold text-white">{title}</h3>
      {entries.length === 0 ? (
        <p className="text-sm text-white">Noch keine Einträge vorhanden.</p>
      ) : (
        <ol className="space-y-2">
          {entries.map((entry, index) => (
            <li
              key={entry.userId}
              className="flex items-start justify-between gap-3 rounded-lg px-3 py-2 odd:bg-white/5"
            >
              <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-white">
                <span className={medals ? "text-lg" : "text-tigers-secondary"}>
                  {medals ? MEDALS[index] : `${index + 1}.`}
                </span>
                {entry.name}
                <RoleBadge role={entry.role} />
              </span>
              <span className="shrink-0 font-semibold whitespace-nowrap text-white">
                {entry.points} Pkt.
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
