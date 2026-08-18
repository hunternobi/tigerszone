"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { acceptGroupInvite, declineGroupInvite, type MyGroupInvite } from "@/app/gruppen/actions";
import { dismissNotification, type MyNotification } from "@/app/notifications/actions";

interface NotificationBellProps {
  invites: MyGroupInvite[];
  notifications: MyNotification[];
}

interface PanelPosition {
  top: number;
  right: number;
}

export default function NotificationBell({
  invites: initialInvites,
  notifications: initialNotifications,
}: NotificationBellProps) {
  const router = useRouter();
  const [invites, setInvites] = useState(initialInvites);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [open, setOpen] = useState(false);
  const [panelPos, setPanelPos] = useState<PanelPosition | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInvites(initialInvites);
  }, [initialInvites]);

  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function toggleOpen() {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPanelPos({ top: rect.bottom + 8, right: Math.max(8, window.innerWidth - rect.right) });
    }
    setOpen((o) => !o);
  }

  function respond(inviteId: string, action: "accept" | "decline") {
    setPendingId(inviteId);
    startTransition(async () => {
      const result =
        action === "accept" ? await acceptGroupInvite(inviteId) : await declineGroupInvite(inviteId);
      if (result.success) {
        setInvites((prev) => prev.filter((invite) => invite.inviteId !== inviteId));
      }
      setPendingId(null);
      router.refresh();
    });
  }

  function dismiss(notificationId: string) {
    setPendingId(notificationId);
    startTransition(async () => {
      const result = await dismissNotification(notificationId);
      if (result.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      }
      setPendingId(null);
      router.refresh();
    });
  }

  const totalCount = invites.length + notifications.length;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        aria-label="Benachrichtigungen"
        className="relative rounded-full p-2 text-white transition hover:bg-white/10"
      >
        <Bell size={20} />
        {totalCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {totalCount}
          </span>
        )}
      </button>

      {open &&
        panelPos &&
        createPortal(
          <div
            ref={panelRef}
            style={{ position: "fixed", top: panelPos.top, right: panelPos.right }}
            className="glass-panel-sm z-50 w-80 max-w-[calc(100vw-1.5rem)] p-3"
          >
            <p className="mb-2 text-sm font-bold text-white">Benachrichtigungen</p>
            {totalCount === 0 ? (
              <p className="py-4 text-center text-xs text-white/60">
                Keine neuen Benachrichtigungen.
              </p>
            ) : (
              <div className="max-h-80 space-y-2 overflow-y-auto">
                {notifications.map((notification) => (
                  <div key={notification.id} className="rounded-lg bg-white/5 p-2.5">
                    <p className="text-xs font-semibold text-white">{notification.title}</p>
                    <p className="mt-1 text-xs text-white/80">{notification.body}</p>
                    {notification.linkHref && (
                      <Link
                        href={notification.linkHref}
                        onClick={() => setOpen(false)}
                        className="mt-1.5 inline-block text-xs text-tigers-secondary hover:underline"
                      >
                        {notification.linkLabel ?? "Mehr erfahren"}
                      </Link>
                    )}
                    <div className="mt-2">
                      <button
                        type="button"
                        disabled={isPending && pendingId === notification.id}
                        onClick={() => dismiss(notification.id)}
                        className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Verstanden
                      </button>
                    </div>
                  </div>
                ))}
                {invites.map((invite) => (
                  <div key={invite.inviteId} className="rounded-lg bg-white/5 p-2.5">
                    <p className="text-xs text-white">
                      <span className="font-semibold">{invite.invitedByName}</span> hat dich zur
                      Gruppe <span className="font-semibold">{invite.groupName}</span> eingeladen.
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        disabled={isPending && pendingId === invite.inviteId}
                        onClick={() => respond(invite.inviteId, "accept")}
                        className="flex-1 rounded-full bg-tigers-secondary px-3 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Annehmen
                      </button>
                      <button
                        type="button"
                        disabled={isPending && pendingId === invite.inviteId}
                        onClick={() => respond(invite.inviteId, "decline")}
                        className="flex-1 rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Ablehnen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
