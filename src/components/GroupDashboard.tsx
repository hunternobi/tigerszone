"use client";

import { useState } from "react";
import { Plus, Users } from "lucide-react";
import type { Group } from "@/types";

interface GroupDashboardProps {
  groups: Group[];
  activeGroupId?: string;
  onSelectGroup?: (groupId: string) => void;
  onCreateGroup?: (name: string) => void;
}

export default function GroupDashboard({
  groups,
  activeGroupId,
  onSelectGroup,
  onCreateGroup,
}: GroupDashboardProps) {
  const [newGroupName, setNewGroupName] = useState("");

  return (
    <div className="glass-panel p-6">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
        <Users size={20} /> Meine Tippgruppen
      </h3>

      <ul className="mb-4 grid gap-3 sm:grid-cols-2">
        {groups.map((group) => (
          <li key={group._id}>
            <button
              type="button"
              onClick={() => onSelectGroup?.(group._id)}
              className={`glass-panel-sm glass-interactive w-full px-4 py-3 text-left text-sm font-medium transition ${
                group._id === activeGroupId
                  ? "text-white ring-2 ring-tigers-secondary"
                  : "text-white/80"
              }`}
            >
              {group.name}
            </button>
          </li>
        ))}
      </ul>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (newGroupName.trim()) {
            onCreateGroup?.(newGroupName.trim());
            setNewGroupName("");
          }
        }}
      >
        <input
          type="text"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          placeholder="Neue Gruppe..."
          className="flex-1 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-tigers-secondary focus:outline-none"
        />
        <button
          type="submit"
          className="flex items-center gap-1 rounded-lg bg-tigers-secondary px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
        >
          <Plus size={16} /> Erstellen
        </button>
      </form>
    </div>
  );
}
