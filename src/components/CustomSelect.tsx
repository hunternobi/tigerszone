"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

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
  ...aria
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [panelPosition, setPanelPosition] = useState<PanelPosition | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  function openPanel() {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPanelPosition({ top: rect.bottom + 8, left: rect.left, width: rect.width });
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
        className="glass-select glass-interactive flex h-9 w-full items-center justify-between px-2 text-left text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={`truncate ${selected ? "" : "text-white/60"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
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
            className="glass-select z-50 max-h-64 space-y-1.5 overflow-y-auto p-2"
          >
            {options.map((option, index) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 px-3 py-2 text-left text-sm transition hover:brightness-125 ${
                  index % 2 === 0 ? "bg-tigers-secondary/60" : "bg-tigers-tertiary/75"
                } ${option.value === value ? "text-white" : "text-white/70"}`}
              >
                <span className="truncate">{option.label}</span>
                {option.value === value && <Check size={14} className="shrink-0" />}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
