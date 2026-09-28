"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogIn, MessagesSquare, Newspaper, Trophy, User, Users } from "lucide-react";
import { useSession } from "next-auth/react";

export const MOBILE_NAV_HREFS = [
  "/tippspiel",
  "/spieltagsblog",
  "/gruppen",
  "/community",
  "/profile",
  "/login",
];

const DRAG_THRESHOLD_PX = 8;

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useSession();
  const listRef = useRef<HTMLUListElement>(null);
  const gesture = useRef<{ startX: number; active: boolean } | null>(null);
  const swallowClick = useRef(false);
  // The bubble jumps on touch instead of waiting for the next page to finish loading.
  const [optimistic, setOptimistic] = useState<{ index: number; fromPath: string | null } | null>(
    null
  );
  const [drag, setDrag] = useState<{ x: number; index: number } | null>(null);

  const items = [
    { href: "/tippspiel", label: "Tippspiel", Icon: Trophy },
    { href: "/spieltagsblog", label: "Blog", Icon: Newspaper },
    { href: "/gruppen", label: "Gruppen", Icon: Users },
    { href: "/community", label: "Community", Icon: MessagesSquare },
    status === "authenticated"
      ? { href: "/profile", label: "Profil", Icon: User }
      : { href: "/login", label: "Login", Icon: LogIn },
  ];

  const routeIndex = items.findIndex((item) => pathname?.startsWith(item.href));
  const activeIndex =
    optimistic && optimistic.fromPath === pathname ? optimistic.index : routeIndex;

  function bubblePosition(clientX: number) {
    const rect = listRef.current!.getBoundingClientRect();
    const itemWidth = rect.width / items.length;
    const x = clientX - rect.left - itemWidth / 2;
    return { x: Math.min(Math.max(x, 0), rect.width - itemWidth), itemWidth };
  }

  function bubblePositionWithIndex(clientX: number) {
    const { x, itemWidth } = bubblePosition(clientX);
    const index = Math.min(Math.max(Math.round(x / itemWidth), 0), items.length - 1);
    return { x, index };
  }

  function handlePointerDown(e: ReactPointerEvent) {
    swallowClick.current = false;
    gesture.current = { startX: e.clientX, active: false };
  }

  function handlePointerMove(e: ReactPointerEvent) {
    const current = gesture.current;
    if (!current) return;
    if (!current.active) {
      if (Math.abs(e.clientX - current.startX) < DRAG_THRESHOLD_PX) return;
      current.active = true;
      swallowClick.current = true;
      listRef.current?.setPointerCapture(e.pointerId);
    }
    setDrag(bubblePositionWithIndex(e.clientX));
  }

  function handlePointerEnd(e: ReactPointerEvent) {
    const current = gesture.current;
    gesture.current = null;
    if (!current?.active) return;

    const { index } = bubblePositionWithIndex(e.clientX);
    setDrag(null);
    setOptimistic({ index, fromPath: pathname });
    if (index !== routeIndex) router.push(items[index].href);
  }

  const dragging = drag !== null;

  return (
    <nav
      aria-label="Hauptnavigation"
      className="glass-bar fixed inset-x-0 bottom-0 z-40 border-t border-b-0 border-white/15 pb-[env(safe-area-inset-bottom)] shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_-8px_32px_rgba(0,0,0,0.35)] md:hidden"
    >
      <ul
        ref={listRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onClickCapture={(e) => {
          if (swallowClick.current) {
            swallowClick.current = false;
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        className="relative mx-auto flex max-w-lg touch-none select-none"
      >
        <li
          aria-hidden
          className={`pointer-events-none absolute inset-y-1 left-0 px-1 ${
            dragging
              ? ""
              : "transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.34,1.3,0.64,1)]"
          }`}
          style={{
            width: `${100 / items.length}%`,
            transform: dragging
              ? `translateX(${drag?.x ?? 0}px)`
              : `translateX(${Math.max(activeIndex, 0) * 100}%)`,
            opacity: !dragging && activeIndex < 0 ? 0 : 1,
          }}
        >
          <span className="block h-full rounded-2xl border border-white/25 bg-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_10px_rgba(0,0,0,0.25)]" />
        </li>
        {items.map(({ href, label, Icon }, index) => {
          const isActive = index === (drag ? drag.index : activeIndex);
          return (
            <li key={href} className="relative z-10 flex-1">
              <Link
                href={href}
                draggable={false}
                aria-current={index === routeIndex ? "page" : undefined}
                onClick={() => setOptimistic({ index, fromPath: pathname })}
                className={`flex h-[48px] flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition ${
                  isActive ? "text-white" : "text-white/55 active:text-white"
                }`}
              >
                <Icon size={19} strokeWidth={isActive ? 2.4 : 1.8} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
