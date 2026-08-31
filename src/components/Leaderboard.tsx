import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { FaUserTie } from "react-icons/fa";
import { MdOutlineEditNote } from "react-icons/md";

export interface LeaderboardEntry {
  userId: string;
  name: string;
  points: number;
  role?: "owner" | "assistant" | "member";
  trend?: "up" | "down";
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  title?: string;
  medals?: boolean;
  footer?: ReactNode;
}

const MEDALS = ["🥇", "🥈", "🥉"];

const ROLE_BADGES = {
  owner: { Icon: FaUserTie, label: "Head Coach" },
  assistant: { Icon: MdOutlineEditNote, label: "Assistant Coach" },
} as const;

export function RoleBadge({ role }: { role?: "owner" | "assistant" | "member" }) {
  if (role !== "owner" && role !== "assistant") return null;
  const { Icon, label } = ROLE_BADGES[role];
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white">
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

export function TrendIcon({ trend }: { trend?: "up" | "down" }) {
  if (trend === "up") {
    return (
      <span title="Im Vergleich zum letzten Spieltag aufgestiegen">
        <ArrowUp size={12} className="shrink-0 text-emerald-400" />
      </span>
    );
  }
  if (trend === "down") {
    return (
      <span title="Im Vergleich zum letzten Spieltag abgerutscht">
        <ArrowDown size={12} className="shrink-0 text-red-400" />
      </span>
    );
  }
  return null;
}

export default function Leaderboard({
  entries,
  title = "Rangliste",
  medals = false,
  footer,
}: LeaderboardProps) {
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
              className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 odd:bg-white/5"
            >
              <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 text-white">
                <span className="flex min-w-0 items-center gap-2">
                  <span className={medals ? "shrink-0 text-lg" : "shrink-0 text-tigers-secondary"}>
                    {medals ? MEDALS[index] : `${index + 1}.`}
                  </span>
                  <Link href={`/spieler/${entry.userId}`} className="break-words hover:underline">
                    {entry.name}
                  </Link>
                  <TrendIcon trend={entry.trend} />
                </span>
                <RoleBadge role={entry.role} />
              </span>
              <span className="shrink-0 font-semibold whitespace-nowrap text-white">
                {entry.points} Pkt.
              </span>
            </li>
          ))}
        </ol>
      )}
      {footer && <div className="mt-3">{footer}</div>}
    </div>
  );
}
