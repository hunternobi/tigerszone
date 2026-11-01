import type { ReactNode } from "react";

export interface SceneGlow {
  /** Centre, as a percentage of the scene box. */
  x: number;
  y: number;
  /** Radius in CSS px. */
  radius: number;
  rgb: [number, number, number];
  alpha: number;
}

/** Dark navy with soft blue glows, for the sections below the hero (landing page, footer, sign-in pages). */
export const NAVY_GLOWS: SceneGlow[] = [
  { x: 25, y: 30, radius: 320, rgb: [91, 127, 199], alpha: 0.16 },
  { x: 75, y: 65, radius: 380, rgb: [91, 127, 199], alpha: 0.28 },
];

const glowCss = (glows: SceneGlow[]) =>
  glows
    .map(
      (g) =>
        `radial-gradient(circle ${g.radius}px at ${g.x}% ${g.y}%, rgba(${g.rgb.join(",")},${g.alpha}), rgba(${g.rgb.join(",")},0))`,
    )
    .join(", ");

/** A page section that paints its own stacking context and, optionally, soft glows as its background. */
export default function Scene({
  children,
  className = "",
  glows,
}: {
  children: ReactNode;
  className?: string;
  glows?: SceneGlow[];
}) {
  return (
    <div
      className={`relative isolate ${className}`}
      style={glows?.length ? { backgroundImage: glowCss(glows) } : undefined}
    >
      {children}
    </div>
  );
}
