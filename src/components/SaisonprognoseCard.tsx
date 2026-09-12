"use client";

import { useEffect, useRef, useState } from "react";
import { Reorder } from "framer-motion";
import { Check, GripVertical, HelpCircle, Trophy } from "lucide-react";
import { DEL_CLUBS, getDelClubName } from "@/lib/delClubs";
import { saveSeasonPrediction } from "@/app/community/seasonPredictionActions";
import SaisonprognoseStoryExport from "@/components/SaisonprognoseStoryExport";

const ALPHABETICAL_ORDER = [...DEL_CLUBS]
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((club) => club.id);

interface SaisonprognoseCardProps {
  initialOrder: string[] | null;
  isAuthenticated: boolean;
  locked: boolean;
  playerName: string;
}

export default function SaisonprognoseCard({
  initialOrder,
  isAuthenticated,
  locked,
  playerName,
}: SaisonprognoseCardProps) {
  const [order, setOrder] = useState<string[]>(initialOrder ?? ALPHABETICAL_ORDER);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const isFirstRender = useRef(true);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const disabled = !isAuthenticated || locked;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (disabled) return;

    setStatus("saving");
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      saveSeasonPrediction(order).then((result) => {
        if (!result.success) {
          setStatus("error");
          return;
        }
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 1800);
      });
    }, 500);

    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  return (
    <div className="glass-panel mt-8 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Trophy size={20} className="shrink-0 text-amber-300" />
          <h2 className="text-lg font-bold text-white">
            Meine Saisonprognose – markiere uns auf Instagram!
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <SaisonprognoseStoryExport
            order={order}
            playerName={playerName}
            disabled={!isAuthenticated}
          />
          <a
            href="#story-export"
            aria-label="Hilfe zum Story-Export"
            title="Hilfe zum Story-Export"
            className="glass-pill glass-interactive flex h-8 w-8 shrink-0 items-center justify-center text-white"
          >
            <HelpCircle size={16} />
          </a>
        </div>
      </div>
      <p className="mt-2 text-sm text-white">
        Zieh die Vereine in die Reihenfolge, in der du sie am Ende der Hauptrunde erwartest.
      </p>

      {!isAuthenticated && (
        <p className="mt-3 text-xs font-semibold text-amber-200">
          Bitte einloggen, um deine Prognose abzugeben.
        </p>
      )}
      {isAuthenticated && locked && (
        <p className="mt-3 text-xs font-semibold text-amber-200">
          Die Abgabe ist geschlossen – die Saison hat begonnen.
        </p>
      )}

      <Reorder.Group axis="y" values={order} onReorder={setOrder} className="mt-4 space-y-2">
        {order.map((clubId, index) => (
          <Reorder.Item
            key={clubId}
            value={clubId}
            drag={disabled ? false : "y"}
            className={`flex items-center gap-3 ${disabled ? "" : "cursor-grab active:cursor-grabbing"}`}
          >
            <span className="w-6 shrink-0 text-center text-sm font-bold text-white">
              {index + 1}
            </span>
            <div className="glass-panel-sm flex h-12 w-full items-center gap-2 px-4 text-sm font-semibold text-white">
              {!disabled && <GripVertical size={16} className="shrink-0 text-white/50" />}
              {getDelClubName(clubId)}
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {status === "error" && (
        <p className="mt-2 text-xs text-red-400">Konnte nicht gespeichert werden.</p>
      )}
      {status === "saved" && (
        <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-400">
          <Check size={12} />
          Prognose gespeichert
        </p>
      )}
    </div>
  );
}
