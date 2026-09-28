"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

export default function MobileNav() {
  const pathname = usePathname();
  const { status } = useSession();

  const items = [
    { href: "/tippspiel", label: "Tippspiel", Icon: Trophy },
    { href: "/spieltagsblog", label: "Blog", Icon: Newspaper },
    { href: "/gruppen", label: "Gruppen", Icon: Users },
    { href: "/community", label: "Community", Icon: MessagesSquare },
    status === "authenticated"
      ? { href: "/profile", label: "Profil", Icon: User }
      : { href: "/login", label: "Login", Icon: LogIn },
  ];

  const activeIndex = items.findIndex((item) => pathname?.startsWith(item.href));

  return (
    <nav
      aria-label="Hauptnavigation"
      className="glass-bar fixed inset-x-0 bottom-0 z-40 border-t border-b-0 border-white/15 pb-[env(safe-area-inset-bottom)] shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_-8px_32px_rgba(0,0,0,0.35)] md:hidden"
    >
      <ul className="relative mx-auto flex max-w-lg">
        <li
          aria-hidden
          className="pointer-events-none absolute inset-y-1 left-0 px-1 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.34,1.3,0.64,1)]"
          style={{
            width: `${100 / items.length}%`,
            transform: `translateX(${Math.max(activeIndex, 0) * 100}%)`,
            opacity: activeIndex < 0 ? 0 : 1,
          }}
        >
          <span className="block h-full rounded-2xl border border-white/25 bg-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_10px_rgba(0,0,0,0.25)]" />
        </li>
        {items.map(({ href, label, Icon }) => {
          const isActive = pathname?.startsWith(href);
          return (
            <li key={href} className="relative z-10 flex-1">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`flex h-12 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition ${
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
