"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { COMMUNITY_LINK, NAV_LINKS, SITE_NAME } from "@/lib/constants";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isEditor = session?.user.role === "admin" || session?.user.role === "redakteur";

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
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

  const mobileVisible = navLinks.slice(0, 3);
  const mobileHidden = navLinks.slice(3);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-tigers-primary/40 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/TigersZone_Logo.png"
            alt={SITE_NAME}
            width={40}
            height={40}
            className="rounded-full"
            priority
          />
          <span className="sr-only">{SITE_NAME}</span>
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

        <div className="flex items-center gap-0.5 md:hidden">
          <nav className="flex items-center gap-0.5">
            {mobileVisible.map((link, index) => {
              const isActive = pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-2 py-1.5 text-xs font-medium transition sm:px-3 sm:text-sm ${
                    index === 2 ? "hidden sm:inline-block" : ""
                  } ${isActive ? "text-white" : "text-white/60 hover:text-white"}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <button
            type="button"
            className="ml-1 p-1 text-white"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Menü umschalten"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-white/10 bg-tigers-primary/80 px-6 py-4 backdrop-blur-xl md:hidden">
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
          {status === "authenticated" ? (
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
          ) : (
            <Link
              href="/login"
              className="mt-2 rounded-full border border-white/20 px-3 py-2 text-center text-sm font-medium text-white transition hover:bg-white/10"
              onClick={() => setMobileOpen(false)}
            >
              Login
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
