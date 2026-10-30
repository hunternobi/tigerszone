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
    ? groups.filter((group) =>
        group.name.toLowerCase().includes(normalizedQuery),
      )
    : groups;
  const filteredPublicGroups = normalizedQuery
    ? publicGroups.filter((group) =>
        group.name.toLowerCase().includes(normalizedQuery),
      )
    : publicGroups;

  return (
    <div>
      {/* iOS search field */}
      <div className="flex h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 focus-within:border-white/50">
        <Search size={18} className="shrink-0 text-white/60" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Gruppen suchen"
          aria-label="Gruppen suchen"
          className="w-full bg-transparent text-[1rem] text-white placeholder:text-white/50 focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Suche löschen"
            className="shrink-0 rounded-full bg-white/25 p-0.5 text-white/90"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <h2 className="font-ui text-[1.375rem] font-semibold tracking-tight text-white sm:text-3xl">
          Meine Gruppen
        </h2>
        <button
          type="button"
          onClick={() => setShowCreateForm((open) => !open)}
          aria-expanded={showCreateForm}
          className="inline-flex min-h-[36px] items-center gap-1 rounded-full border border-white/20 bg-white/10 pr-3.5 pl-3 text-[0.875rem] font-semibold text-white transition hover:bg-white/15 active:scale-[0.96]"
        >
          {showCreateForm ? <X size={16} /> : <Plus size={16} />}
          {showCreateForm ? "Schließen" : "Neue Gruppe"}
        </button>
      </div>

      {/* Every glass surface stays mounted (the shader sets them up once): the create form and the
          "nothing found" note are hidden instead of removed, as are filtered-out groups. */}
      <div
        data-liquid-glass="card"
        className={`glass-panel mt-3 ${showCreateForm ? "" : "hidden"}`}
      >
        <CreateGroupForm />
      </div>

      <div
        data-liquid-glass="card"
        className={`glass-panel mt-4 p-5 text-[0.9375rem] leading-snug text-white/75 ${
          filteredGroups.length === 0 ? "" : "hidden"
        }`}
      >
        {groups.length === 0
          ? "Du bist noch in keiner Gruppe. Erstelle deine erste Gruppe oder nutze einen Einladungslink von einem Freund."
          : "Keine Gruppen gefunden."}
      </div>

      <div className="mt-4">
        <GroupList
          groups={groups}
          leaderboards={leaderboards}
          visibleIds={new Set(filteredGroups.map((group) => group._id))}
        />
      </div>

      <PublicGroupsList
        groups={filteredPublicGroups}
        hasResultsBeforeFilter={publicGroups.length > 0}
      />
    </div>
  );
}
