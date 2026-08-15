"use client";

import { useState } from "react";
import { Plus, Search, X } from "lucide-react";
import CreateGroupForm from "@/components/CreateGroupForm";
import GroupList from "@/components/GroupList";
import PublicGroupsList from "@/components/PublicGroupsList";
import type { MyGroup, PublicGroup } from "@/app/gruppen/actions";
import type { LeaderboardEntry } from "@/components/Leaderboard";

interface GruppenPageClientProps {
  groups: MyGroup[];
  leaderboards: Record<string, LeaderboardEntry[]>;
  publicGroups: PublicGroup[];
}

export default function GruppenPageClient({
  groups,
  leaderboards,
  publicGroups,
}: GruppenPageClientProps) {
  const [query, setQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredGroups = normalizedQuery
    ? groups.filter((group) => group.name.toLowerCase().includes(normalizedQuery))
    : groups;
  const filteredPublicGroups = normalizedQuery
    ? publicGroups.filter((group) => group.name.toLowerCase().includes(normalizedQuery))
    : publicGroups;

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="glass-panel-sm flex flex-1 items-center gap-2 px-4 py-2.5">
          <Search size={18} className="shrink-0 text-white" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Gruppen suchen…"
            className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowCreateForm((open) => !open)}
          aria-label={showCreateForm ? "Formular schließen" : "Neue Gruppe erstellen"}
          className="glass-panel-sm glass-interactive flex h-11 shrink-0 items-center gap-1.5 px-4 text-sm font-semibold text-white"
        >
          {showCreateForm ? (
            <>
              Schließen
              <X size={18} />
            </>
          ) : (
            <>
              Gruppe erstellen
              <Plus size={18} />
            </>
          )}
        </button>
      </div>

      {showCreateForm && (
        <div className="mt-4">
          <CreateGroupForm />
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-bold text-white">Meine Gruppen</h2>
        <div className="mt-4">
          {filteredGroups.length === 0 ? (
            <p className="glass-panel p-6 text-sm text-white">
              {groups.length === 0
                ? "Du bist noch in keiner Gruppe. Erstelle oben deine erste Gruppe oder nutze einen Einladungslink von einem Freund."
                : "Keine Gruppen gefunden."}
            </p>
          ) : (
            <GroupList groups={filteredGroups} leaderboards={leaderboards} />
          )}
        </div>
      </div>

      <PublicGroupsList
        groups={filteredPublicGroups}
        hasResultsBeforeFilter={publicGroups.length > 0}
      />
    </div>
  );
}
