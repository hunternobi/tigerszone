import { Inter } from "next/font/google";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

const inter = Inter({ weight: "500", subsets: ["latin"] });

interface GlassButtonExactProps {
  href: string;
  children: ReactNode;
  /** Font-size driving the whole button scale (padding is em-based), keeps the same visual size as before. */
  size?: string;
  wrapperClassName?: string;
  external?: boolean;
}

export default function GlassButtonExact({
  href,
  children,
  size = "1rem",
  wrapperClassName = "",
  external,
}: GlassButtonExactProps) {
  const isExternal = external ?? href.startsWith("http");
  const wrapStyle = { "--btn-exact-size": size } as CSSProperties;

  return (
    <div className={`btn-exact-wrap ${wrapperClassName}`} style={wrapStyle}>
      <div className="btn-exact-shadow" />
      {isExternal ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`btn-exact ${inter.className}`}
        >
          <span>{children}</span>
        </a>
      ) : (
        <Link href={href} className={`btn-exact ${inter.className}`}>
          <span>{children}</span>
        </Link>
      )}
    </div>
  );
}
