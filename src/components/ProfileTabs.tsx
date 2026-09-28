"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import GlassButtonExact from "@/components/GlassButtonExact";

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
    if (hashTab && hashTab === active) document.getElementById(hashTab)?.scrollIntoView();
  }, [hashTab, active]);

  function select(id: string) {
    setChosen(id);
    window.history.replaceState(null, "", `#${id}`);
  }

  return (
    <div>
      <div className="mt-6 flex gap-2" role="tablist">
        {tabs.map((tab) => (
          <GlassButtonExact
            key={tab.id}
            type="button"
            size="0.875rem"
            wrapperClassName="flex-1"
            className={`block w-full text-center ${tab.id === active ? "" : "opacity-60"}`}
            onClick={() => select(tab.id)}
          >
            {tab.label}
          </GlassButtonExact>
        ))}
      </div>

      {tabs.map((tab) => (
        <div key={tab.id} role="tabpanel" hidden={tab.id !== active} className="-mt-2">
          {tab.content}
        </div>
      ))}
    </div>
  );
}
