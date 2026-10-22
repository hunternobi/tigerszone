"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useSession } from "next-auth/react";
import { ChevronDown, LogOut, MoreVertical } from "lucide-react";
import { MdOutlineEditNote } from "react-icons/md";
import {
  demoteAssistant,
  kickGroupMember,
  leaveGroup,
  promoteToAssistant,
  type ActionResult,
} from "@/app/gruppen/actions";
import {
  RoleBadge,
  TrendIcon,
  type LeaderboardEntry,
} from "@/components/Leaderboard";

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
  const [showAll, setShowAll] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const VISIBLE_COUNT = 3;
  const visibleEntries = showAll ? entries : entries.slice(0, VISIBLE_COUNT);

  const canManage = viewerRole === "owner" || viewerRole === "assistant";

  useEffect(() => {
    if (!menu) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenu(null);
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
    if (!canManage || entry.userId === currentUserId || entry.role === "owner")
      return;
    e.preventDefault();
    setMenu({
      userId: entry.userId,
      role: entry.role ?? "member",
      x: e.clientX,
      y: e.clientY,
    });
  }

  function handleMenuButton(
    e: ReactMouseEvent<HTMLButtonElement>,
    entry: LeaderboardEntry,
  ) {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 220;
    const x = Math.max(
      8,
      Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8),
    );
    setMenu({
      userId: entry.userId,
      role: entry.role ?? "member",
      x,
      y: rect.bottom + 4,
    });
  }

  function runAction(action: () => Promise<ActionResult>) {
    setMenu(null);
    startTransition(async () => {
      await action();
      router.refresh();
    });
  }

  function handleLeave() {
    const message =
      viewerRole === "owner"
        ? "Du bist Head Coach dieser Gruppe. Wenn du sie verlässt, übernimmt automatisch der Assistant Coach (oder das älteste Mitglied) die Leitung. Gruppe wirklich verlassen?"
        : "Diese Gruppe wirklich verlassen?";
    if (!window.confirm(message)) return;
    startTransition(async () => {
      await leaveGroup(groupId);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-ui text-[17px] font-semibold tracking-tight text-white">
          {title}
        </h3>
        <button
          type="button"
          onClick={handleLeave}
          disabled={isPending}
          className="inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-full px-3 text-[14px] font-semibold text-red-300 transition hover:bg-white/10 active:bg-white/15 disabled:opacity-50"
        >
          <LogOut size={14} />
          Verlassen
        </button>
      </div>
      {canManage && (
        <p className="mt-1 mb-2 text-[13px] text-white/60">
          Über das Menü-Symbol neben einem Mitglied öffnest du die Optionen.
        </p>
      )}
      {entries.length === 0 ? (
        <p className="mt-3 text-[15px] text-white/70">
          Noch keine Einträge vorhanden.
        </p>
      ) : (
        <ol className="mt-2 divide-y divide-white/10 text-[16px]">
          {visibleEntries.map((entry, index) => {
            const manageable =
              canManage &&
              entry.userId !== currentUserId &&
              entry.role !== "owner";
            return (
              <li
                key={entry.userId}
                onContextMenu={(e) => handleContextMenu(e, entry)}
                className={`flex items-center justify-between gap-3 py-2.5 ${
                  manageable ? "cursor-context-menu" : ""
                }`}
              >
                <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 text-white">
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className={
                        index === 0 ? "shrink-0 text-base" : "shrink-0"
                      }
                    >
                      {index === 0 ? "🥇" : `${index + 1}.`}
                    </span>
                    <Link
                      href={`/spieler/${entry.userId}`}
                      className="break-words hover:underline"
                    >
                      {entry.name}
                    </Link>
                    <TrendIcon trend={entry.trend} />
                  </span>
                  <RoleBadge role={entry.role} />
                </span>
                <span className="flex shrink-0 items-center gap-1">
                  <span className="w-16 text-right font-semibold tabular-nums whitespace-nowrap text-white">
                    {entry.points} Pkt.
                  </span>
                  <span className="flex w-6 shrink-0 justify-center">
                    {manageable && (
                      <button
                        type="button"
                        onClick={(e) => handleMenuButton(e, entry)}
                        aria-label="Mitglied-Optionen"
                        className="rounded-full p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
                      >
                        <MoreVertical size={16} />
                      </button>
                    )}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {entries.length > VISIBLE_COUNT && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-2 flex min-h-[40px] w-full items-center justify-center gap-1 rounded-xl text-[15px] font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          {showAll ? "Weniger anzeigen" : `Alle ${entries.length} anzeigen`}
          <ChevronDown
            size={14}
            className={`transition-transform ${showAll ? "rotate-180" : ""}`}
          />
        </button>
      )}

      {menu &&
        createPortal(
          <div
            ref={menuRef}
            style={{ position: "fixed", top: menu.y, left: menu.x }}
            className="glass-popover z-50 min-w-[220px] rounded-2xl p-1"
          >
            {viewerRole === "owner" && menu.role !== "assistant" && (
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  runAction(() => promoteToAssistant(groupId, menu.userId))
                }
                className="flex min-h-[44px] w-full items-center gap-2 rounded-xl px-3 text-left text-[15px] text-white transition hover:bg-white/10 disabled:opacity-50"
              >
                <MdOutlineEditNote className="h-4 w-4 shrink-0" />
                Zum Assistant Coach befördern
              </button>
            )}
            {viewerRole === "owner" && menu.role === "assistant" && (
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  runAction(() => demoteAssistant(groupId, menu.userId))
                }
                className="flex min-h-[44px] w-full items-center rounded-xl px-3 text-left text-[15px] text-white transition hover:bg-white/10 disabled:opacity-50"
              >
                Assistant Coach Status entfernen
              </button>
            )}
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                runAction(() => kickGroupMember(groupId, menu.userId))
              }
              className="flex min-h-[44px] w-full items-center rounded-xl px-3 text-left text-[15px] text-red-300 transition hover:bg-white/10 disabled:opacity-50"
            >
              Aus der Gruppe entfernen
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}
