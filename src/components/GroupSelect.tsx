"use client";

import CustomSelect from "@/components/CustomSelect";

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
  return (
    <div className="mb-3">
      <CustomSelect
        value={value ?? ""}
        onChange={onChange}
        options={options.map((option) => ({ value: option.groupId, label: option.groupName }))}
        placeholder="Gruppe wählen"
        aria-label="Gruppe wählen"
      />
    </div>
  );
}
