import type { InputHTMLAttributes, ReactNode } from "react";
import LiquidGlassScene, { NAVY_SCENE } from "@/components/LiquidGlassScene";

/**
 * Frame of all sign-in pages: centred title, one persistent glass card (the shader sets its surfaces up
 * once, so the card must not be swapped out - only its content changes) and a line of links below.
 */
export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    // Extends under the transparent header so the glow does not end in a visible edge there.
    <LiquidGlassScene
      background={NAVY_SCENE}
      className="-mt-[4.5rem] pt-[4.5rem]"
    >
      <section className="mx-auto max-w-md px-7 py-10 text-center sm:px-6 sm:py-20">
        <h1 className="font-ui text-[2.15rem] leading-[1.06] font-semibold tracking-tight text-balance text-white sm:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-[1.0625rem] leading-snug text-white/70">
            {subtitle}
          </p>
        )}

        <div
          data-liquid-glass="card"
          className="glass-panel mt-8 p-5 text-left sm:p-6"
        >
          {children}
        </div>

        {footer && (
          <div className="mt-5 text-[0.9375rem] text-white/70">{footer}</div>
        )}
      </section>
    </LiquidGlassScene>
  );
}

/** Labelled iOS-style input. */
export function AuthField({
  id,
  label,
  ...inputProps
}: { id: string; label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[0.8125rem] font-medium text-white/70"
      >
        {label}
      </label>
      <input
        id={id}
        {...inputProps}
        className="h-12 w-full rounded-xl border border-white/20 bg-white/15 px-4 text-[1.0625rem] text-white placeholder:text-white/40 focus:border-white/60 focus:outline-none"
      />
    </div>
  );
}

/** Text link used in and below the cards. */
export const AUTH_LINK_CLASS =
  "font-semibold text-white underline underline-offset-2 transition hover:text-white/80";

/** Classes that stretch the white pill to a full-width, 50px high primary button. */
export const AUTH_BUTTON_CLASS =
  "w-full !min-h-[50px] sm:!min-h-[50px] !text-[1rem]";
