"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { Check, Link2, Search, Share, UserPlus, X } from "lucide-react";
import { PillActionButton } from "@/components/PillButton";
import SavedBadge from "@/components/SavedBadge";
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
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenu(null);
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
    const x = Math.max(
      8,
      Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8),
    );
    setMenu({ x, y: rect.bottom + 4 });
  }

  async function shareLink() {
    setMenu(null);
    const inviteLink = `${window.location.origin}/gruppen/join/${group.inviteCode}`;
    const text = `${group.ownerName} hat dich eingeladen, der Tippspiel-Gruppe ${group.name} beizutreten.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "TigersZone Einladung",
          text,
          url: inviteLink,
        });
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
        className="relative h-10 w-10 shrink-0 appearance-none rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/15 active:scale-[0.94] sm:flex sm:h-10 sm:w-auto sm:items-center sm:justify-center sm:gap-1.5 sm:px-4"
      >
        {/* Phone: no flexbox on the button, the icon is absolutely centred (flex centring in a fixed-size <button> was off-centre in iOS Safari). */}
        {copied ? (
          <Check
            size={16}
            className="absolute inset-0 m-auto text-emerald-300 sm:static sm:m-0"
          />
        ) : (
          <Share
            size={16}
            className="absolute inset-0 m-auto sm:static sm:m-0"
          />
        )}
        <span className="sr-only text-[14px] font-semibold whitespace-nowrap sm:not-sr-only">
          Gruppe teilen
        </span>
      </button>

      {menu &&
        createPortal(
          <div
            ref={menuRef}
            style={{ position: "fixed", top: menu.y, left: menu.x }}
            className="glass-popover z-50 min-w-[220px] rounded-2xl p-1"
          >
            <p className="font-ui mb-1 border-b border-white/10 px-3 pt-2.5 pb-2.5 text-[15px] font-semibold text-white">
              Gruppe teilen
            </p>
            <button
              type="button"
              onClick={shareLink}
              className="flex min-h-[44px] w-full items-center gap-2.5 rounded-xl px-3 text-left text-[15px] text-white transition hover:bg-white/10"
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
              className="flex min-h-[44px] w-full items-center gap-2.5 rounded-xl px-3 text-left text-[15px] text-white transition hover:bg-white/10"
            >
              <UserPlus size={16} className="shrink-0" />
              Spieler suchen
            </button>
          </div>,
          document.body,
        )}

      {showInvite && (
        <InviteSearchModal group={group} onClose={() => setShowInvite(false)} />
      )}
    </>
  );
}

function InviteSearchModal({
  group,
  onClose,
}: {
  group: MyGroup;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<InvitableUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const [justInvitedId, setJustInvitedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const justInvitedTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    return () => {
      if (justInvitedTimeout.current) clearTimeout(justInvitedTimeout.current);
    };
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setLoading(true);
    debounceRef.current = setTimeout(
      () => {
        startTransition(async () => {
          const found = await searchInvitableUsers(group._id, query);
          setResults(found);
          setLoading(false);
        });
      },
      query.trim().length === 0 ? 0 : 300,
    );
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
      setJustInvitedId(userId);
      if (justInvitedTimeout.current) clearTimeout(justInvitedTimeout.current);
      justInvitedTimeout.current = setTimeout(
        () => setJustInvitedId(null),
        1800,
      );
    });
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-popover w-full max-w-sm rounded-3xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-ui text-xl font-semibold tracking-tight text-white">
            Spieler einladen
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="rounded-full bg-white/15 p-1.5 text-white/80 transition hover:bg-white/25 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 flex h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 focus-within:border-white/50">
          <Search size={17} className="shrink-0 text-white/60" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name suchen…"
            autoFocus
            className="w-full bg-transparent text-[16px] text-white placeholder:text-white/50 focus:outline-none"
          />
        </div>

        {error && <p className="mt-2 text-xs text-red-300">{error}</p>}

        <div className="mt-3 max-h-72 divide-y divide-white/10 overflow-y-auto">
          {loading && (
            <p className="py-4 text-center text-[13px] text-white/60">Lädt…</p>
          )}
          {!loading && results.length === 0 && (
            <p className="py-4 text-center text-[13px] text-white/60">
              Keine Spieler gefunden.
            </p>
          )}
          {!loading &&
            results.map((user) => {
              const invited = invitedIds.has(user.userId);
              return (
                <div
                  key={user.userId}
                  className="flex items-center gap-3 py-2.5"
                >
                  <span
                    className={`min-w-0 flex-1 truncate text-[16px] ${invited ? "text-white/50" : "text-white"}`}
                  >
                    {user.name}
                  </span>
                  {justInvitedId === user.userId ? (
                    <SavedBadge label="Einladung gesendet" />
                  ) : invited ? (
                    <span className="flex items-center gap-1 text-[13px] font-semibold text-emerald-300">
                      <Check size={14} />
                      Eingeladen
                    </span>
                  ) : (
                    <PillActionButton
                      compact
                      disabled={isPending}
                      onClick={() => invite(user.userId)}
                    >
                      Einladen
                    </PillActionButton>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>,
    document.body,
  );
}
