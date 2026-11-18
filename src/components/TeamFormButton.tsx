"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Activity, X } from "lucide-react";
import { getTeamName } from "@/lib/teams";
import type { FormOutcome, TeamFormEntry } from "@/lib/teamForm";

const TIGERS_ID = "straubing-tigers";

const OUTCOME_STYLE: Record<FormOutcome, { letter: string; className: string }> = {
  W: { letter: "S", className: "border-emerald-300/40 bg-emerald-400/25 text-emerald-200" },
  OTW: { letter: "S", className: "border-emerald-300/30 bg-emerald-400/15 text-emerald-200" },
  OTL: { letter: "N", className: "border-amber-300/30 bg-amber-400/15 text-amber-200" },
  L: { letter: "N", className: "border-red-300/40 bg-red-400/25 text-red-200" },
};

const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "short",
    timeZone: "Europe/Berlin",
  });

/**
 * A small icon behind a team name in the tip list; tapping it opens a pop-up with the team's last results
 * (newest first, with the S/N form dots on top).
 */
export default function TeamFormButton({
  teamId,
  entries,
}: {
  teamId: string;
  entries: TeamFormEntry[];
}) {
  const [open, setOpen] = useState(false);
  const teamName = getTeamName(teamId);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Form von ${teamName} anzeigen`}
        className="relative inline-flex size-[26px] shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/80 transition after:absolute after:-inset-[9px] after:content-[''] hover:bg-white/20 hover:text-white active:scale-90"
      >
        <Activity size={14} strokeWidth={2.4} />
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Form von ${teamName}`}
              onClick={(event) => event.stopPropagation()}
              className="glass-panel relative my-auto w-full max-w-md p-5 sm:p-6"
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Schließen"
                className="absolute top-2 right-2 flex size-[44px] items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white"
              >
                <X size={22} />
              </button>

              <h3 className="font-ui pr-10 text-xl font-semibold tracking-tight text-white">
                Form: {teamName}
              </h3>

              {entries.length === 0 ? (
                <p className="mt-3 text-[0.9375rem] leading-snug text-white/80">
                  Noch keine Ergebnisse vorhanden.
                </p>
              ) : (
                <>
                  <p className="mt-1 text-[0.8125rem] leading-snug text-white/60">
                    {entries.length === 1
                      ? "Das letzte Spiel"
                      : `Die letzten ${entries.length} Spiele`}
                    {teamId !== TIGERS_ID && " gegen die Tigers"}
                  </p>

                  <div className="mt-4 flex gap-2">
                    {[...entries].reverse().map((entry) => {
                      const style = OUTCOME_STYLE[entry.outcome];
                      return (
                        <span
                          key={entry.id}
                          className={`font-ui flex size-9 items-center justify-center rounded-full border text-[0.875rem] font-bold ${style.className}`}
                        >
                          {style.letter}
                        </span>
                      );
                    })}
                  </div>

                  <ul className="mt-4 divide-y divide-white/10">
                    {entries.map((entry) => (
                      <li key={entry.id} className="py-3 first:pt-0 last:pb-0">
                        <p className="text-[0.75rem] text-white/60">
                          {formatDay(entry.kickoff)}
                          {entry.matchday ? ` · ${entry.matchday}. Spieltag` : ""}
                          {entry.extra && ` · ${entry.extra}`}
                        </p>
                        <div className="mt-1.5 space-y-1.5">
                          {[
                            { id: entry.homeTeamId, score: entry.homeScore },
                            { id: entry.awayTeamId, score: entry.awayScore },
                          ].map((side) => (
                            <div
                              key={side.id}
                              className="flex items-center justify-between gap-3"
                            >
                              <span
                                className={`font-ui min-w-0 truncate text-[1rem] tracking-tight ${
                                  side.id === teamId
                                    ? "font-semibold text-white"
                                    : "font-medium text-white/85"
                                }`}
                              >
                                {getTeamName(side.id)}
                              </span>
                              <span className="font-ui flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-[1.0625rem] font-semibold text-white tabular-nums">
                                {side.score}
                              </span>
                            </div>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
