import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

/**
 * The site's primary call-to-action: a solid white pill with dark text and an arrow (iOS style).
 * 38px tall on phones with the touch target extended to 44px (after:-inset), 44px from sm up.
 */
export default function PillButton({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`relative inline-flex min-h-[38px] shrink-0 items-center justify-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold whitespace-nowrap text-tigers-primary shadow-[0_6px_18px_rgba(0,0,0,0.35)] transition duration-200 after:absolute after:-inset-[3px] after:content-[''] hover:bg-white/90 active:scale-[0.96] sm:min-h-[44px] sm:px-5 sm:text-[15px] ${className}`}
    >
      {children}
      <ArrowRight size={15} strokeWidth={2.5} />
    </Link>
  );
}
