import { PLACE_STYLE, type Prize } from "@/lib/prizes";

/** The place of a prize as a big number in gold, silver or bronze: no circle, the colour fades out towards the bottom. */
export default function PlaceNumber({
  place,
  className = "",
}: {
  place: Prize["place"];
  /** Font size and box, e.g. "text-[56px] w-14". */
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`font-ui inline-block text-center leading-none font-black tracking-tight text-transparent drop-shadow-[0_3px_8px_rgba(0,0,0,0.35)] ${className}`}
      style={{
        backgroundImage: PLACE_STYLE[place].numberGradient,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        // The page-wide text halo would shine through the transparent letters.
        textShadow: "none",
      }}
    >
      {place}
    </span>
  );
}
