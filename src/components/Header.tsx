"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS, SITE_NAME } from "@/lib/constants";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-tigers-primary/90 backdrop-blur">
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
          {NAV_LINKS.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block">
          <Link
            href="/login"
            className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Login
          </Link>
        </div>

        <button
          type="button"
          className="text-white md:hidden"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label="Menü umschalten"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-white/10 px-6 py-4 md:hidden">
          {NAV_LINKS.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive ? "bg-white/15 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/login"
            className="mt-2 rounded-full border border-white/20 px-3 py-2 text-center text-sm font-medium text-white transition hover:bg-white/10"
            onClick={() => setMobileOpen(false)}
          >
            Login
          </Link>
        </nav>
      )}
    </header>
  );
}
