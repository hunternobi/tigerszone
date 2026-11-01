"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  LogOut,
  Menu,
  MessagesSquare,
  Newspaper,
  PenLine,
  ShieldCheck,
  Trophy,
  User,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { COMMUNITY_LINK, NAV_LINKS, SITE_NAME } from "@/lib/constants";
import NotificationBell from "@/components/NotificationBell";
import type { MyGroupInvite } from "@/app/gruppen/actions";
import type { MyNotification } from "@/app/notifications/actions";

interface HeaderProps {
  invites: MyGroupInvite[];
  notifications: MyNotification[];
}

interface MenuItem {
  href: string;
  label: string;
  Icon: LucideIcon;
  tint: string;
}

export default function Header({ invites, notifications }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isEditor =
    session?.user.role === "admin" || session?.user.role === "redakteur";

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The open menu covers the page: lock its scrolling and let Escape close it.
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  const navLinks = [
    ...NAV_LINKS,
    ...(session ? [{ href: "/gruppen", label: "Gruppen" }] : []),
    COMMUNITY_LINK,
    ...(isEditor ? [{ href: "/redaktion", label: "Redaktion" }] : []),
    ...(session ? [{ href: "/profile", label: "Profil" }] : []),
    ...(session?.user.role === "admin"
      ? [{ href: "/admin", label: "Admin" }]
      : []),
  ];

  const menuItems: MenuItem[] = [
    {
      href: "/tippspiel",
      label: "Tippspiel",
      Icon: Trophy,
      tint: "from-[#fbbf24] to-[#b45309]",
    },
    {
      href: "/spieltagsblog",
      label: "Spieltagsblog",
      Icon: Newspaper,
      tint: "from-[#7a9be0] to-[#3a54a5]",
    },
    {
      href: "/gruppen",
      label: "Gruppen",
      Icon: Users,
      tint: "from-[#4ade80] to-[#15803d]",
    },
    {
      href: "/community",
      label: "Community",
      Icon: MessagesSquare,
      tint: "from-[#a78bfa] to-[#6d28d9]",
    },
    ...(session
      ? [
          {
            href: "/profile",
            label: "Profil",
            Icon: User,
            tint: "from-[#94a3b8] to-[#475569]",
          },
        ]
      : []),
    ...(isEditor
      ? [
          {
            href: "/redaktion",
            label: "Redaktion",
            Icon: PenLine,
            tint: "from-[#fb7185] to-[#be123c]",
          },
        ]
      : []),
    ...(session?.user.role === "admin"
      ? [
          {
            href: "/admin",
            label: "Admin",
            Icon: ShieldCheck,
            tint: "from-[#94a3b8] to-[#334155]",
          },
        ]
      : []),
  ];

  const isHome = pathname === "/";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter] duration-300 ${
        scrolled || mobileOpen
          ? "glass-bar max-md:!border-b max-md:!border-white/10 max-md:!bg-[#0d1352] max-md:!shadow-none max-md:!backdrop-blur-none"
          : ""
      }`}
    >
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-7 sm:px-6">
        {/* Logo as a glass capsule; on every page but the start page it also says "Startseite", so it
            reads as the way back home and is easy to hit on a phone. */}
        <Link
          href="/"
          aria-label={`${SITE_NAME} – zur Startseite`}
          onClick={() => setMobileOpen(false)}
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
              <NotificationBell
                invites={invites}
                notifications={notifications}
              />
              <span className="text-sm text-white">
                Hallo, {session.user.name}
              </span>
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

        {/* Phone: bell (signed in) and the menu button, always in the same place at the top right. */}
        <div className="flex shrink-0 items-center gap-1 md:hidden">
          {status === "authenticated" && (
            <NotificationBell invites={invites} notifications={notifications} />
          )}
          <button
            type="button"
            className="glass-icon-button flex size-[44px] items-center justify-center rounded-full text-white"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Menü schließen" : "Menü öffnen"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X size={20} strokeWidth={2.4} />
            ) : (
              <Menu size={20} strokeWidth={2.4} />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <>
          {/* Dimmed page behind the sheet; tapping it closes the menu. */}
          <div
            className="fixed inset-x-0 top-[4.5rem] bottom-0 -z-10 bg-black/55 md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <nav
            aria-label="Hauptmenü"
            className="max-h-[calc(100dvh-4.5rem)] animate-[menuIn_0.18s_ease-out] overflow-y-auto border-b border-white/10 bg-[#0d1352] px-4 pt-1 pb-5 shadow-[0_24px_60px_rgba(0,0,0,0.55)] md:hidden"
          >
            <ul className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06]">
              {menuItems.map(({ href, label, Icon, tint }, index) => {
                const isActive = pathname?.startsWith(href);
                return (
                  <li
                    key={href}
                    className={index > 0 ? "border-t border-white/10" : ""}
                  >
                    <Link
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex min-h-[56px] items-center gap-3 px-3.5 transition active:bg-white/15 ${
                        isActive ? "bg-white/10" : ""
                      }`}
                    >
                      <span
                        className={`flex size-9 shrink-0 items-center justify-center rounded-[0.6rem] bg-gradient-to-b ${tint} shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]`}
                      >
                        <Icon
                          size={19}
                          strokeWidth={2.2}
                          className="text-white"
                        />
                      </span>
                      <span className="font-ui flex-1 text-[1.0625rem] font-medium tracking-tight text-white">
                        {label}
                      </span>
                      <ChevronRight
                        size={18}
                        className="shrink-0 text-white/50"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4">
              {status === "authenticated" ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="font-ui flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 text-[1.0625rem] font-semibold text-white transition active:bg-white/20"
                >
                  <LogOut size={18} />
                  Abmelden
                </button>
              ) : (
                <div className="space-y-2.5">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="font-ui flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-white text-[1.0625rem] font-semibold text-tigers-primary transition active:scale-[0.98]"
                  >
                    Einloggen
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="font-ui flex min-h-[52px] w-full items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-[1.0625rem] font-semibold text-white transition active:bg-white/20"
                  >
                    Konto erstellen
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
