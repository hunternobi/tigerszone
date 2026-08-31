"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

interface GroupSelectOption {
  groupId: string;
  groupName: string;
}

interface GroupSelectProps {
  options: GroupSelectOption[];
  value: string | null;
  onChange: (groupId: string) => void;
}

export default function GroupSelect({ options, value, onChange }: GroupSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.groupId === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative mb-3">
      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="glass-select glass-interactive flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-white"
      >
        <span>{selected?.groupName ?? "Gruppe wählen"}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="glass-select absolute z-20 mt-2 w-full space-y-0.5 p-1">
          {options.map((option) => (
            <button
              key={option.groupId}
              type="button"
              onClick={() => {
                onChange(option.groupId);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-white/10 ${
                option.groupId === value ? "text-white" : "text-white/60"
              }`}
            >
              {option.groupName}
              {option.groupId === value && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
