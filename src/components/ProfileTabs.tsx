"use client";

import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export interface ProfileTab {
  id: string;
  label: string;
  content: ReactNode;
}

function subscribeToHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

const getHash = () => window.location.hash.slice(1);
const getServerHash = () => "";

export default function ProfileTabs({ tabs }: { tabs: ProfileTab[] }) {
  const hash = useSyncExternalStore(subscribeToHash, getHash, getServerHash);
  const [chosen, setChosen] = useState<string | null>(null);
  const hashTab = tabs.find((tab) => tab.id === hash)?.id;
  const active = chosen ?? hashTab ?? tabs[0].id;

  // A link to /profile#tipphistorie should win over an earlier manual choice.
  useEffect(() => {
    const reset = () => setChosen(null);
    window.addEventListener("hashchange", reset);
    return () => window.removeEventListener("hashchange", reset);
  }, []);

  // The browser's own jump to the anchor misses because the panel was still hidden at load.
  useEffect(() => {
    if (hashTab && hashTab === active)
      document.getElementById(hashTab)?.scrollIntoView();
  }, [hashTab, active]);

  function select(id: string) {
    setChosen(id);
    window.history.replaceState(null, "", `#${id}`);
  }

  return (
    <div>
      {/* Segmented control, iOS style: a dark track with a white thumb on the active tab. */}
      <div
        className="mt-6 flex rounded-full border border-white/15 bg-white/10 p-1"
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => select(tab.id)}
              className={`min-h-[36px] flex-1 rounded-full px-1 text-[14px] font-semibold transition sm:text-[15px] ${
                isActive
                  ? "bg-white text-tigers-primary shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                  : "text-white/75 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => (
        <div key={tab.id} role="tabpanel" hidden={tab.id !== active}>
          {tab.content}
        </div>
      ))}
    </div>
  );
}
