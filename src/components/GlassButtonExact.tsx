import { Inter } from "next/font/google";
import Link from "next/link";
import type { CSSProperties, MouseEventHandler, ReactNode } from "react";

const inter = Inter({ weight: "500", subsets: ["latin"] });

interface GlassButtonExactProps {
  href?: string;
  children: ReactNode;
  /** Font-size driving the whole button scale (padding is em-based), keeps the same visual size as before. */
  size?: string;
  wrapperClassName?: string;
  /** Extra classes on the actual button/link element (e.g. "w-full block text-center"). */
  className?: string;
  external?: boolean;
  onClick?: MouseEventHandler;
  type?: "button" | "submit";
  disabled?: boolean;
}

export default function GlassButtonExact({
  href,
  children,
  size = "1rem",
  wrapperClassName = "",
  className = "",
  external,
  onClick,
  type = "button",
  disabled,
}: GlassButtonExactProps) {
  const wrapStyle = { "--btn-exact-size": size } as CSSProperties;
  const elementClassName = `btn-exact ${inter.className} ${className}`;

  return (
    <div className={`btn-exact-wrap ${wrapperClassName}`} style={wrapStyle}>
      <div className="btn-exact-shadow" />
      {href ? (
        (external ?? href.startsWith("http")) ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClick}
            className={elementClassName}
          >
            <span>{children}</span>
          </a>
        ) : (
          <Link href={href} onClick={onClick} className={elementClassName}>
            <span>{children}</span>
          </Link>
        )
      ) : (
        <button
          type={type}
          onClick={onClick}
          disabled={disabled}
          className={`${elementClassName} disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <span>{children}</span>
        </button>
      )}
    </div>
  );
}
