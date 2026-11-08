"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Trophy, X } from "lucide-react";
import { PLACE_STYLE, PRIZES, PRIZES_POPUP_KEY } from "@/lib/prizes";

// Pages where a pop-up would be in the way.
const QUIET_PREFIXES = ["/admin", "/login", "/register", "/verify-email"];

function alreadySeen(): boolean {
  try {
    return window.localStorage.getItem(PRIZES_POPUP_KEY) !== null;
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    window.localStorage.setItem(PRIZES_POPUP_KEY, "1");
  } catch {
    // Private mode: the pop-up may come back on the next visit, which is acceptable.
  }
}

/** One-time announcement of the prizes. Closed with the X, the backdrop, Escape or the ranking button. */
export default function PrizesPopup() {
  const pathname = usePathname();
  const quiet = QUIET_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (quiet || alreadySeen()) return;
    const timer = setTimeout(() => setOpen(true), 900);
    return () => clearTimeout(timer);
  }, [quiet]);

  function close() {
    markSeen();
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || quiet) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="prizes-popup-title"
        onClick={(event) => event.stopPropagation()}
        className="glass-panel relative my-auto w-full max-w-md p-6 text-center sm:p-8"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Schließen"
          className="absolute top-3 right-3 flex size-10 items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white"
        >
          <X size={22} />
        </button>

        <span className="mx-auto flex size-14 items-center justify-center rounded-[1.1rem] bg-gradient-to-b from-[#fde68a] to-[#b45309] shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_8px_20px_rgba(0,0,0,0.35)]">
          <Trophy size={28} strokeWidth={2.2} className="text-white" />
        </span>
        <h2
          id="prizes-popup-title"
          className="font-ui mt-4 text-[1.75rem] leading-[1.1] font-semibold tracking-tight text-white"
        >
          Die Preise sind da!
        </h2>
        <p className="mt-3 text-[0.9375rem] leading-snug text-white/80">
          Ein riesiges Dankeschön an alle Unterstützer und Partner, die diese
          Preise möglich machen. Das können die besten Tipper der Saison
          gewinnen:
        </p>

        <ol className="mt-5 space-y-2.5 text-left">
          {PRIZES.map((prize) => {
            const style = PLACE_STYLE[prize.place];
            return (
              <li
                key={prize.place}
                className={`flex items-center gap-3 rounded-2xl border bg-white/10 p-3 ${style.glow}`}
              >
                <span
                  className={`font-ui flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-b text-lg font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] ${style.badge}`}
                >
                  {prize.place}
                </span>
                <div className="min-w-0">
                  <p className="text-[0.6875rem] font-semibold tracking-[0.12em] text-white/60 uppercase">
                    {style.label}
                  </p>
                  <p className="font-ui text-[1.0625rem] leading-tight font-semibold text-white">
                    {prize.title}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        <Link
          href="/tippspiel/rangliste"
          onClick={close}
          className="mt-6 inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full bg-white px-5 text-[0.9375rem] font-semibold text-tigers-primary shadow-[0_6px_18px_rgba(0,0,0,0.35)] transition duration-200 hover:bg-white/90 active:scale-[0.96]"
        >
          Jetzt Tabelle anzeigen
          <ArrowRight size={15} strokeWidth={2.5} />
        </Link>
      </div>
    </div>
  );
}
