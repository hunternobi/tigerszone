import { ThumbsUp, Trophy } from "lucide-react";
import type { MemeSubmission } from "@/types";

interface MemeOfTheWeekProps {
  memes: MemeSubmission[];
  onVote?: (memeId: string) => void;
}

export default function MemeOfTheWeek({ memes, onVote }: MemeOfTheWeekProps) {
  if (memes.length === 0) {
    return <p className="text-sm text-white/60">Diese Woche wurden noch keine Memes eingereicht.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {memes.map((meme) => (
        <div key={meme._id} className="glass-panel-sm glass-interactive overflow-hidden">
          <div className="flex aspect-square items-center justify-center text-white/30">
            Meme-Bild
          </div>
          <div className="flex items-center justify-between border-t border-white/10 p-3">
            {meme.isWinner ? (
              <span className="flex items-center gap-1 text-sm font-semibold text-yellow-400">
                <Trophy size={16} /> Gewinner
              </span>
            ) : (
              <span className="text-sm text-white/50">Woche vom {meme.weekOf}</span>
            )}
            <button
              type="button"
              onClick={() => onVote?.(meme._id)}
              className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-sm text-white transition hover:bg-tigers-secondary"
            >
              <ThumbsUp size={14} /> {meme.votes}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
