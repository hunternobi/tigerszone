"use client";

import { useState, type ReactNode } from "react";

export interface SegmentedOption {
  value: string;
  label: string;
  /** Small line above the content, saying what the list shows. */
  caption?: string;
  content: ReactNode;
}

/** iOS-style segmented control (dark track, white thumb on the active segment) that switches between lists. */
export default function SegmentedSwitch({
  options,
  initial,
  ariaLabel,
}: {
  options: SegmentedOption[];
  initial?: string;
  ariaLabel: string;
}) {
  const [value, setValue] = useState(initial ?? options[0]?.value ?? "");
  const current = options.find((option) => option.value === value) ?? options[0];
  if (!current) return null;

  return (
    <div>
      <div
        className="flex rounded-full border border-white/15 bg-white/10 p-1"
        role="tablist"
        aria-label={ariaLabel}
      >
        {options.map((option) => {
          const active = option.value === current.value;
          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setValue(option.value)}
              className={`font-ui min-h-[44px] min-w-0 flex-1 truncate rounded-full px-2 py-1.5 text-[0.875rem] font-semibold transition sm:min-h-[36px] ${
                active
                  ? "bg-white text-tigers-primary shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                  : "text-white/80"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {current.caption && (
        <p className="mt-3 text-[0.875rem] leading-snug text-white/60">
          {current.caption}
        </p>
      )}
      <div className="mt-4">{current.content}</div>
    </div>
  );
}
