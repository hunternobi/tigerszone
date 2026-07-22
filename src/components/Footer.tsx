import Link from "next/link";
import { Feather } from "lucide-react";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/tippspiel", label: "Tippspiel" },
  { href: "/community", label: "Community" },
  { href: "/profile", label: "Profil" },
];

const LEGAL_LINKS = [
  { href: "/cookies", label: "Cookies" },
  { href: "/agb", label: "AGB" },
  { href: "/datenschutz", label: "Datenschutz" },
  { href: "/impressum", label: "Impressum" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-tigers-primary">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <h3 className="mb-3 text-lg font-bold text-tigers-secondary">{SITE_NAME}</h3>
          <p className="text-sm text-white/70">{SITE_DESCRIPTION}</p>
          <p className="mt-4 flex items-center gap-2 text-sm text-white/50">
            <Feather size={16} />
            Made with passion for Tigers fans
          </p>
        </div>

        <div>
          <h4 className="mb-3 font-semibold text-white">Schnellzugriff</h4>
          <ul className="space-y-2">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-white/70 hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold text-white">Rechtliches</h4>
          <ul className="space-y-2">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-white/70 hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-6 text-center text-xs text-white/50">
        <p>
          {SITE_NAME} ist eine unabhängige Fan-Plattform und nicht offiziell mit dem Straubing
          Tigers Eishockey Club verbunden. Alle Marken und Logos sind Eigentum ihrer jeweiligen
          Besitzer.
        </p>
        <p className="mt-2">© {new Date().getFullYear()} {SITE_NAME}. Alle Rechte vorbehalten.</p>
      </div>
    </footer>
  );
}
