import { MapPin, Clock } from "lucide-react";
import type { WatchParty } from "@/types";
import { formatGameTime } from "@/utils/format";

interface WatchPartyFinderProps {
  watchParties: WatchParty[];
}

export default function WatchPartyFinder({ watchParties }: WatchPartyFinderProps) {
  if (watchParties.length === 0) {
    return (
      <p className="text-sm text-white/60">
        Für dieses Spiel wurde noch keine Watch Party eingetragen.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {watchParties.map((party) => (
        <li key={party._id} className="glass-panel-sm glass-interactive p-4">
          <p className="font-semibold text-white">{party.location}</p>
          <p className="flex items-center gap-1 text-sm text-white/60">
            <MapPin size={14} /> {party.address}
          </p>
          <p className="flex items-center gap-1 text-sm text-white/60">
            <Clock size={14} /> {formatGameTime(party.time)} Uhr
          </p>
          {party.hostName && (
            <p className="mt-1 text-xs text-white/40">Veranstalter: {party.hostName}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
