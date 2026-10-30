"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useSession } from "next-auth/react";
import { FaUserTie } from "react-icons/fa";
import { MdOutlineEditNote } from "react-icons/md";

export interface LeaderboardEntry {
  userId: string;
  name: string;
  points: number;
  role?: "owner" | "assistant" | "member";
  trend?: "up" | "down";
  /** Overrides the place shown (the list may be filtered). */
  rank?: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  title?: string;
  footer?: ReactNode;
  /** Renders only the content: the caller provides the surrounding glass panel. */
  bare?: boolean;
  /** Marks this player's row (and lets "jump to me" find it). */
  highlightUserId?: string;
}

// Gold, silver and bronze for the names of the first three places (used by every ranking list).
const PODIUM_COLORS = ["text-[#f6c445]", "text-[#aeb8cc]", "text-[#d58a4a]"];

/** Text colour of a rank (0-based): podium colour for the first three, white otherwise. */
export function rankColor(index: number): string {
  return PODIUM_COLORS[index] ?? "text-white";
}

/** The signed-in player's own row in any ranking: a frosted, slightly raised capsule (iOS selected-row look). */
export const MY_ROW_CLASS =
  "-mx-2 rounded-xl bg-white/15 px-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22),inset_0_1px_0_rgba(255,255,255,0.3)]";

/** Small white "Du" pill behind the player's own name. */
export function MeBadge() {
  return (
    <span className="font-ui shrink-0 rounded-full bg-white px-1.5 py-px text-[0.625rem] font-bold text-tigers-primary">
      Du
    </span>
  );
}

const ROLE_BADGES = {
  owner: { Icon: FaUserTie, label: "Head Coach" },
  assistant: { Icon: MdOutlineEditNote, label: "Assistant Coach" },
} as const;

export function RoleBadge({
  role,
}: {
  role?: "owner" | "assistant" | "member";
}) {
  if (role !== "owner" && role !== "assistant") return null;
  const { Icon, label } = ROLE_BADGES[role];
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[0.625rem] font-semibold text-white">
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
  footer,
  bare = false,
  highlightUserId,
}: LeaderboardProps) {
  const { data: session } = useSession();
  const meId = highlightUserId ?? session?.user?.id;
  return (
    <div className={bare ? "" : "glass-panel p-5 sm:p-6"}>
      <h3 className="font-ui mb-3 text-xl font-semibold tracking-tight text-white">
        {title}
      </h3>
      {entries.length === 0 ? (
        <p className="text-[0.9375rem] text-white/70">
          Noch keine Einträge vorhanden.
        </p>
      ) : (
        <ol className="divide-y divide-white/10">
          {entries.map((entry, listIndex) => {
            const index = (entry.rank ?? listIndex + 1) - 1;
            const isMe = meId === entry.userId;
            return (
              <li
                key={entry.userId}
                data-me={isMe ? "" : undefined}
                className={`flex items-center justify-between gap-3 py-2.5 ${isMe ? MY_ROW_CLASS : ""}`}
              >
                <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 text-white">
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className={`shrink-0 ${index < 3 ? `${rankColor(index)} font-semibold` : "text-white/60"}`}
                    >
                      {index + 1}.
                    </span>
                    <Link
                      href={`/spieler/${entry.userId}`}
                      className={`-my-2 inline-block py-2 break-words hover:underline ${rankColor(index)} ${index < 3 ? "font-semibold" : ""}`}
                    >
                      {entry.name}
                    </Link>
                    {isMe && <MeBadge />}
                    <TrendIcon trend={entry.trend} />
                  </span>
                  <RoleBadge role={entry.role} />
                </span>
                <span className="shrink-0 font-semibold tabular-nums whitespace-nowrap text-white">
                  {entry.points} Pkt.
                </span>
              </li>
            );
          })}
        </ol>
      )}
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
}
