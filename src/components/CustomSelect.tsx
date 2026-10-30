"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronsUpDown } from "lucide-react";

export interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: CustomSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** "panel" matches the glass cards (e.g. the Tipphistorie link); "select" is the blue control style. */
  variant?: "select" | "panel";
  "aria-label"?: string;
}

interface PanelPosition {
  top: number;
  left: number;
  width: number;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Bitte wählen",
  disabled = false,
  variant = "select",
  ...aria
}: CustomSelectProps) {
  const isPanel = variant === "panel";
  const [open, setOpen] = useState(false);
  const [panelPosition, setPanelPosition] = useState<PanelPosition | null>(
    null,
  );
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  function openPanel() {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPanelPosition({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    }
    function handleScroll(e: Event) {
      // Ignore scrolling inside the option list itself (e.g. scrolling through a long
      // list of clubs) - only dismiss when the page behind the panel scrolls, since that
      // would otherwise leave the panel's fixed position stale.
      if (panelRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    function handleResize() {
      setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    // capture:true so scrolling inside any nested scroll container is observed here too,
    // since scroll events don't bubble to window otherwise.
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openPanel())}
        aria-label={aria["aria-label"]}
        className={`flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/10 px-3.5 text-left text-[0.9375rem] text-white transition hover:bg-white/15 focus:border-white/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
          isPanel ? "font-semibold" : ""
        }`}
      >
        <span className={`truncate ${selected ? "" : "text-white/60"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronsUpDown
          size={isPanel ? 17 : 15}
          className="shrink-0 text-white/60"
        />
      </button>

      {/* Rendered via portal so it always paints above every other card, regardless of
          backdrop-blur stacking contexts created by .glass-panel/.glass-select elements
          elsewhere on the page. */}
      {open &&
        panelPosition &&
        createPortal(
          <div
            ref={panelRef}
            style={{
              position: "fixed",
              top: panelPosition.top,
              left: panelPosition.left,
              width: panelPosition.width,
            }}
            className="z-50 max-h-96 origin-top animate-[menuIn_0.16s_ease-out] overflow-y-auto rounded-2xl border border-white/20 bg-[#141a5c]/55 p-1 shadow-[0_18px_50px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-2xl backdrop-saturate-[1.8]"
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <div
                  key={option.value}
                  className="border-t border-white/10 py-0.5 first:border-t-0"
                >
                  <button
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className={`flex min-h-[44px] w-full items-center gap-2 rounded-xl px-3 text-left text-[1rem] transition hover:bg-white/10 active:bg-white/20 ${
                      isSelected ? "font-semibold text-white" : "text-white/85"
                    }`}
                  >
                    <span className="flex w-4 shrink-0 justify-center">
                      {isSelected && <Check size={16} strokeWidth={2.5} />}
                    </span>
                    <span className="truncate">{option.label}</span>
                  </button>
                </div>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
}
