import type { SceneBackground } from "@/components/LiquidGlassScene";

// Plain module (not "use client"): server components read `opacity` and `blurPx` from here to draw the same
// photo with FadingBackground that the glass scene refracts.

/** The Spieltagsblog photo, dimmed for long texts and because the photo itself is very bright. */
export const FANS_SCENE: SceneBackground = {
  src: "/_next/image?url=%2Fimages%2FFans.jpg&w=1920&q=75",
  mobileSrc: "/_next/image?url=%2Fimages%2FFans.jpg&w=1080&q=75",
  opacity: 0.3,
  color: "#0a0f3d",
  blurPx: 1.5,
};
