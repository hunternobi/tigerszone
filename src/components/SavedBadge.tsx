/**
 * "Tipp gespeichert" confirmation, iOS style: a small green capsule whose check mark draws itself, popping in
 * with a light spring and fading out again. The whole animation lasts as long as the callers keep it mounted
 * (SAVED_BADGE_MS), so it needs no exit state.
 */
export const SAVED_BADGE_MS = 1800;

export default function SavedBadge({
  label = "Tipp gespeichert",
}: {
  label?: string;
}) {
  return (
    <span
      role="status"
      className="pointer-events-none inline-flex animate-[savedFlash_1.8s_cubic-bezier(0.34,1.56,0.64,1)_both] items-center gap-1.5 rounded-full border border-emerald-300/30 bg-emerald-400/15 py-0.5 pr-2.5 pl-0.5 text-[12px] font-semibold whitespace-nowrap text-emerald-100 backdrop-blur-md"
    >
      <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" aria-hidden>
        <circle cx="10" cy="10" r="9" fill="#34d399" />
        <path
          d="M5.8 10.4l2.8 2.8 5.6-5.8"
          fill="none"
          stroke="#052e16"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          className="animate-[checkDraw_0.4s_0.12s_ease-out_both]"
        />
      </svg>
      {label}
    </span>
  );
}
