"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { COMMUNITY_LINK, NAV_LINKS, SITE_NAME } from "@/lib/constants";
import NotificationBell from "@/components/NotificationBell";
import { MOBILE_NAV_HREFS } from "@/components/MobileNav";
import type { MyGroupInvite } from "@/app/gruppen/actions";
import type { MyNotification } from "@/app/notifications/actions";

const MOBILE_HREFS = new Set(MOBILE_NAV_HREFS);

interface HeaderProps {
  invites: MyGroupInvite[];
  notifications: MyNotification[];
}

export default function Header({ invites, notifications }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isEditor = session?.user.role === "admin" || session?.user.role === "redakteur";

  useEffect(() => {
    function onScroll() {
      // The phone has a bottom bar, so the top bar simply scrolls away there.
      setScrolled(window.matchMedia("(min-width: 768px)").matches && window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    ...NAV_LINKS,
    ...(session ? [{ href: "/gruppen", label: "Gruppen" }] : []),
    COMMUNITY_LINK,
    ...(isEditor ? [{ href: "/redaktion", label: "Redaktion" }] : []),
    ...(session ? [{ href: "/profile", label: "Profil" }] : []),
    ...(session?.user.role === "admin" ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  const mobileHidden = navLinks.filter((link) => !MOBILE_HREFS.has(link.href));
  const isHome = pathname === "/";

  return (
    <header
      className={`absolute inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter] duration-300 md:fixed ${scrolled || mobileOpen ? "glass-bar" : ""}`}
    >
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-7 sm:px-6">
        {/* Logo as a glass capsule; on every page but the start page it also says "Startseite", so it
            reads as the way back home and is easy to hit on a phone. */}
        <Link
          href="/"
          aria-label={`${SITE_NAME} – zur Startseite`}
          className={`glass-capsule flex min-h-[40px] items-center gap-2 rounded-full py-1 pl-1 ${isHome ? "pr-1" : "pr-4"} active:scale-[0.96]`}
        >
          <Image
            src="/images/TigersZone_Logo_transparent.png"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 drop-shadow-[0_1px_3px_rgba(5,0,70,0.75)]"
            priority
          />
          {!isHome && (
            <span className="font-ui text-[0.9375rem] font-semibold tracking-tight text-white">
              Startseite
            </span>
          )}
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                  isActive ? "text-white" : "text-white/60 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {status === "authenticated" ? (
            <>
              <NotificationBell invites={invites} notifications={notifications} />
              <span className="text-sm text-white">Hallo, {session.user.name}</span>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Abmelden
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Login
            </Link>
          )}
        </div>

        {status === "authenticated" && (
          <div className="flex shrink-0 items-center gap-1 md:hidden">
            <NotificationBell invites={invites} notifications={notifications} />
            <button
              type="button"
              className="p-2 text-white"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label="Menü umschalten"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        )}
      </div>

      {mobileOpen && (
        <nav className="mx-auto flex max-w-7xl flex-col gap-1 border-t border-white/10 bg-tigers-primary px-4 py-4 sm:px-6 md:hidden">
          {mobileHidden.map((link) => {
            const isActive = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              signOut({ callbackUrl: "/" });
            }}
            className="mt-2 rounded-full border border-white/20 px-3 py-2 text-center text-sm font-medium text-white transition hover:bg-white/10"
          >
            Abmelden
          </button>
        </nav>
      )}
    </header>
  );
}
