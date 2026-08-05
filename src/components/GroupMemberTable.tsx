"use client";

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useSession } from "next-auth/react";
import {
  demoteAssistant,
  kickGroupMember,
  promoteToAssistant,
  type ActionResult,
} from "@/app/gruppen/actions";
import { RoleBadge, type LeaderboardEntry } from "@/components/Leaderboard";

interface GroupMemberTableProps {
  groupId: string;
  entries: LeaderboardEntry[];
  title: string;
  viewerRole: "owner" | "assistant" | "member";
}

interface MenuState {
  userId: string;
  role: "owner" | "assistant" | "member";
  x: number;
  y: number;
}

export default function GroupMemberTable({
  groupId,
  entries,
  title,
  viewerRole,
}: GroupMemberTableProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const currentUserId = session?.user.id;
  const [isPending, startTransition] = useTransition();
  const [menu, setMenu] = useState<MenuState | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const canManage = viewerRole === "owner" || viewerRole === "assistant";

  useEffect(() => {
    if (!menu) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(null);
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setMenu(null);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menu]);

  function handleContextMenu(e: ReactMouseEvent, entry: LeaderboardEntry) {
    if (!canManage || entry.userId === currentUserId || entry.role === "owner") return;
    e.preventDefault();
    setMenu({ userId: entry.userId, role: entry.role ?? "member", x: e.clientX, y: e.clientY });
  }

  function runAction(action: () => Promise<ActionResult>) {
    setMenu(null);
    startTransition(async () => {
      await action();
      router.refresh();
    });
  }

  return (
    <div className="glass-panel p-4 sm:p-6">
      <h3 className="text-lg font-bold text-white">{title}</h3>
      {canManage && (
        <p className="mt-1 mb-3 text-xs text-white">
          Rechtsklick auf ein Mitglied öffnet die Optionen.
        </p>
      )}
      {entries.length === 0 ? (
        <p className="mt-3 text-sm text-white">Noch keine Einträge vorhanden.</p>
      ) : (
        <ol className="mt-3 space-y-2">
          {entries.map((entry, index) => {
            const manageable = canManage && entry.userId !== currentUserId && entry.role !== "owner";
            return (
              <li
                key={entry.userId}
                onContextMenu={(e) => handleContextMenu(e, entry)}
                className={`flex items-center justify-between rounded-lg px-3 py-2 odd:bg-white/5 ${
                  manageable ? "cursor-context-menu" : ""
                }`}
              >
                <span className="flex flex-wrap items-center gap-2 text-white">
                  <span className="text-tigers-secondary">{index + 1}.</span>
                  {entry.name}
                  <RoleBadge role={entry.role} />
                </span>
                <span className="font-semibold text-white">{entry.points} Pkt.</span>
              </li>
            );
          })}
        </ol>
      )}

      {menu && (
        <div
          ref={menuRef}
          style={{ position: "fixed", top: menu.y, left: menu.x }}
          className="glass-panel-sm z-50 min-w-[220px] space-y-0.5 p-1"
        >
          {viewerRole === "owner" && menu.role !== "assistant" && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => runAction(() => promoteToAssistant(groupId, menu.userId))}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-white transition hover:bg-white/10 disabled:opacity-50"
            >
              📝 Zum Assistant-Coach befördern
            </button>
          )}
          {viewerRole === "owner" && menu.role === "assistant" && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => runAction(() => demoteAssistant(groupId, menu.userId))}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-white transition hover:bg-white/10 disabled:opacity-50"
            >
              Assistant-Coach-Status entfernen
            </button>
          )}
          <button
            type="button"
            disabled={isPending}
            onClick={() => runAction(() => kickGroupMember(groupId, menu.userId))}
            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-400 transition hover:bg-white/10 disabled:opacity-50"
          >
            Aus der Gruppe entfernen
          </button>
        </div>
      )}
    </div>
  );
}
