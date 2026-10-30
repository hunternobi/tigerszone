"use client";

import { useState, type ReactNode } from "react";
import CustomSelect from "@/components/CustomSelect";

export interface StatsPickerOption {
  value: string;
  label: string;
  content: ReactNode;
}

/** Drop-down that switches between statistic cards below it (the cards themselves are rendered on the server). */
export default function StatsPicker({
  options,
  initial,
}: {
  options: StatsPickerOption[];
  initial?: string;
}) {
  const [value, setValue] = useState(initial ?? options[0]?.value ?? "");
  const current =
    options.find((option) => option.value === value) ?? options[0];
  if (!current) return null;

  return (
    <div className="space-y-4">
      <CustomSelect
        variant="panel"
        aria-label="Statistik auswählen"
        options={options.map(({ value, label }) => ({ value, label }))}
        value={current.value}
        onChange={setValue}
      />
      {current.content}
    </div>
  );
}
