"use client";

import { useEffect, useRef, useState, useTransition, type MouseEvent as ReactMouseEvent } from "react";
import { createPortal } from "react-dom";
import { Check, Link2, Search, Share2, UserPlus, X } from "lucide-react";
import {
  inviteUserToGroup,
  searchInvitableUsers,
  type InvitableUser,
  type MyGroup,
} from "@/app/gruppen/actions";

interface GroupShareMenuProps {
  group: MyGroup;
}

interface MenuPosition {
  x: number;
  y: number;
}

export default function GroupShareMenu({ group }: GroupShareMenuProps) {
  const [menu, setMenu] = useState<MenuPosition | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [copied, setCopied] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(null);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menu]);

  function toggleMenu(e: ReactMouseEvent) {
    e.stopPropagation();
    if (menu) {
      setMenu(null);
      return;
    }
    const rect = buttonRef.current!.getBoundingClientRect();
    const menuWidth = 200;
    const x = Math.max(8, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8));
    setMenu({ x, y: rect.bottom + 4 });
  }

  async function shareLink() {
    setMenu(null);
    const inviteLink = `${window.location.origin}/gruppen/join/${group.inviteCode}`;
    const text = `${group.ownerName} hat dich eingeladen, der Tippspiel-Gruppe ${group.name} beizutreten.`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "TigersZone Einladung", text, url: inviteLink });
      } catch {
        // Nutzer hat das Teilen-Menü abgebrochen.
      }
      return;
    }

    await navigator.clipboard.writeText(`${text} Link: ${inviteLink}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        aria-label="Gruppe teilen"
        className="glass-panel-sm glass-interactive flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap text-white"
      >
        {copied ? <Check size={12} className="text-emerald-400" /> : <Share2 size={12} />}
        Gruppe teilen
      </button>

      {menu &&
        createPortal(
          <div
            ref={menuRef}
            style={{ position: "fixed", top: menu.y, left: menu.x }}
            className="glass-panel-sm z-50 min-w-[200px] space-y-0.5 p-1"
          >
            <button
              type="button"
              onClick={shareLink}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-white transition hover:bg-white/10"
            >
              <Link2 size={16} className="shrink-0" />
              Einladungslink
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenu(null);
                setShowInvite(true);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-white transition hover:bg-white/10"
            >
              <UserPlus size={16} className="shrink-0" />
              Spieler suchen
            </button>
          </div>,
          document.body
        )}

      {showInvite && <InviteSearchModal group={group} onClose={() => setShowInvite(false)} />}
    </>
  );
}

function InviteSearchModal({ group, onClose }: { group: MyGroup; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<InvitableUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const found = await searchInvitableUsers(group._id, query);
        setResults(found);
        setLoading(false);
      });
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, group._id]);

  function invite(userId: string) {
    setError(null);
    startTransition(async () => {
      const result = await inviteUserToGroup(group._id, userId);
      if (!result.success) {
        setError(result.error ?? "Einladen fehlgeschlagen.");
        return;
      }
      setInvitedIds((prev) => new Set(prev).add(userId));
    });
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div className="glass-panel w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-bold text-white">Spieler einladen</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="rounded-full p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="glass-panel-sm mt-4 flex items-center gap-2 px-3 py-2">
          <Search size={16} className="shrink-0 text-white" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name suchen…"
            autoFocus
            className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
          />
        </div>

        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

        <div className="mt-3 max-h-64 space-y-1.5 overflow-y-auto">
          {loading && <p className="py-3 text-center text-xs text-white/60">Suche…</p>}
          {!loading && query.trim().length >= 2 && results.length === 0 && (
            <p className="py-3 text-center text-xs text-white/60">Keine Spieler gefunden.</p>
          )}
          {!loading &&
            results.map((user) => {
              const invited = invitedIds.has(user.userId);
              return (
                <div
                  key={user.userId}
                  className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 odd:bg-white/5"
                >
                  <span className="truncate text-sm text-white">{user.name}</span>
                  <button
                    type="button"
                    disabled={invited || isPending}
                    onClick={() => invite(user.userId)}
                    className="shrink-0 rounded-full bg-tigers-secondary px-3 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {invited ? "Eingeladen" : "Einladen"}
                  </button>
                </div>
              );
            })}
        </div>
      </div>
    </div>,
    document.body
  );
}
