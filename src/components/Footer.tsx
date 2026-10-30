import Link from "next/link";
import { Feather } from "lucide-react";
import LiquidGlassScene, { NAVY_SCENE } from "@/components/LiquidGlassScene";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/tippspiel", label: "Tippspiel" },
  { href: "/community", label: "Community" },
  { href: "/profile", label: "Profil" },
  { href: "/community#faq", label: "FAQ" },
];

const LEGAL_LINKS = [
  { href: "/agb", label: "AGB" },
  { href: "/datenschutz", label: "Datenschutz" },
  { href: "/impressum", label: "Impressum" },
];

const LINK_CLASS =
  "flex min-h-[40px] items-center text-[0.9375rem] text-white/65 transition-colors hover:text-white sm:min-h-0 sm:py-1 sm:text-sm";

function LinkColumn({
  title,
  links,
}: {
  title: string;
  links: typeof QUICK_LINKS;
}) {
  return (
    <div>
      <h4 className="font-ui text-[0.8125rem] font-semibold tracking-wide text-white">
        {title}
      </h4>
      <ul className="mt-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={LINK_CLASS}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <LiquidGlassScene
      background={NAVY_SCENE}
      className="border-t border-white/10 bg-tigers-primary"
    >
      <footer className="px-7 pt-10 pb-8 sm:px-6 sm:pt-14">
        <div
          data-liquid-glass="card"
          className="glass-panel mx-auto grid max-w-5xl gap-7 p-5 sm:gap-10 sm:p-8 md:grid-cols-[1.4fr_1fr_1fr]"
        >
          <div className="md:pr-6">
            <h3 className="font-ui text-xl font-semibold tracking-tight text-tigers-secondary">
              {SITE_NAME}
            </h3>
            <p className="mt-2 text-[0.9375rem] leading-snug text-white/70 sm:text-sm">
              {SITE_DESCRIPTION}
            </p>
            <p className="mt-3 flex items-center gap-2 text-[0.8125rem] text-white/70">
              <Feather size={14} />
              Made with passion for Tigers fans
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 md:contents">
            <LinkColumn title="Schnellzugriff" links={QUICK_LINKS} />
            <LinkColumn title="Rechtliches" links={LEGAL_LINKS} />
          </div>
        </div>

        <div className="mx-auto mt-6 max-w-5xl px-1 text-center text-[0.6875rem] leading-relaxed text-white/70">
          <p>
            {SITE_NAME} ist eine unabhängige Fan-Plattform und nicht offiziell
            mit dem Straubing Tigers Eishockey Club verbunden. Alle Marken und
            Logos sind Eigentum ihrer jeweiligen Besitzer.
          </p>
          <p className="mt-1.5">
            © {new Date().getFullYear()} {SITE_NAME}. Alle Rechte vorbehalten.
          </p>
        </div>
      </footer>
    </LiquidGlassScene>
  );
}
