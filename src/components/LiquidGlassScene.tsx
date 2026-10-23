"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { LiquidGlassInstance } from "@/vendor/liquidglass";

const DESKTOP_QUERY = "(min-width: 640px)";

// Once a device proved too slow for the shader the choice is kept for the whole visit (all scenes, all pages).
const DISABLED_KEY = "tz-glass-off";
// Touch devices: re-render the glass at most this often while scrolling, and at a lower pixel ratio.
const TOUCH_SCROLL_INTERVAL_MS = 90;
// Frames slower than this while scrolling count as "slow"; this many of them switch the shader off.
const SLOW_FRAME_MS = 50;
const SLOW_FRAME_LIMIT = 12;

const isTouchDevice = () => window.matchMedia("(pointer: coarse)").matches;

function glassDisabled(): boolean {
  try {
    const param = new URLSearchParams(window.location.search).get("glass");
    if (param === "off") {
      // Stays off for the rest of the visit (?glass=on switches it back on).
      sessionStorage.setItem(DISABLED_KEY, "1");
      return true;
    }
    if (param === "on") {
      sessionStorage.removeItem(DISABLED_KEY);
      return false;
    }
    return sessionStorage.getItem(DISABLED_KEY) === "1";
  } catch {
    return false;
  }
}

export interface SceneGlow {
  /** Centre, as a percentage of the scene box. */
  x: number;
  y: number;
  /** Radius in CSS px. */
  radius: number;
  rgb: [number, number, number];
  alpha: number;
}

export interface SceneBackground {
  /** Colour behind everything (the page background). */
  color: string;
  /** Fixed full-page photo (same-origin): the scene refracts a viewport-sized copy that follows the scroll. */
  src?: string;
  mobileSrc?: string;
  opacity?: number;
  blurPx?: number;
  /**
   * Static scene without a photo: soft glows painted on `color`. The same list is also applied as the
   * scene's CSS background, so what the glass refracts matches what is visible.
   */
  glows?: SceneGlow[];
}

/** Dark navy with soft blue glows, for the sections below the hero (landing page, footer). */
export const NAVY_SCENE: SceneBackground = {
  color: "#0a0f3d",
  glows: [
    { x: 25, y: 30, radius: 320, rgb: [91, 127, 199], alpha: 0.16 },
    { x: 75, y: 65, radius: 380, rgb: [91, 127, 199], alpha: 0.28 },
  ],
};

const PRESETS = {
  card: { refraction: 0.85, blurAmount: 0.4, chromAberration: 0.05 },
  tile: { refraction: 0.7, blurAmount: 0.35, chromAberration: 0.05 },
} as const;
type SurfaceKind = keyof typeof PRESETS;

interface Surface {
  target: HTMLElement;
  glass: HTMLElement;
  kind: SurfaceKind;
  isButton: boolean;
  last: string;
  /** Unrounded opacity of the last pass: while it still moves, an animation (Reveal) is running. */
  rawOpacity: number;
  cleanup: () => void;
}

const glowCss = (glows: SceneGlow[]) =>
  glows
    .map(
      (g) =>
        `radial-gradient(circle ${g.radius}px at ${g.x}% ${g.y}%, rgba(${g.rgb.join(",")},${g.alpha}), rgba(${g.rgb.join(",")},0))`,
    )
    .join(", ");

/**
 * A group of real refracting "liquid glass" surfaces (WebGL, ybouane/liquidglass) sharing ONE WebGL
 * context and one copy of the backdrop.
 *
 * Mark any element inside with `data-liquid-glass="card" | "tile"` and give it the normal CSS glass look
 * (e.g. `glass-panel`). Once the shader runs, that CSS look is switched off (see globals.css) and the
 * glass is drawn behind the element, matching its box and corner radius. The element keeps its content,
 * links and focus as usual - the glass never contains content (the library would re-rasterise it).
 * Links also get the library's hover/press effect. Without WebGL the CSS look simply stays.
 *
 * The page photo is `position: fixed`, so in photo mode the scene refracts a viewport-sized copy of it
 * that is kept aligned while scrolling; surfaces off-screen are not re-rendered.
 */
export default function LiquidGlassScene({
  children,
  className = "",
  background,
}: {
  children: ReactNode;
  className?: string;
  background: SceneBackground;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webglActive, setWebglActive] = useState(false);

  const { color, src, mobileSrc, opacity = 1, blurPx, glows } = background;
  const glowKey = JSON.stringify(glows ?? null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !root || !canvas) return;

    // CSS glass only (the surfaces keep their normal look): forced, or a slow device remembered earlier.
    if (glassDisabled()) return;

    const photoMode = Boolean(src);
    const touch = isTouchDevice();
    const sceneGlows: SceneGlow[] = JSON.parse(glowKey) ?? [];

    let cancelled = false;
    let instance: LiquidGlassInstance | null = null;
    let image: HTMLImageElement | null = null;
    let ready = false;
    let painted = { w: 0, h: 0, desktop: false };
    let frame = 0;
    let settleUntil = 0;
    let off = false;
    let lastSync = 0;
    let lastScroll = 0;
    let trailing: ReturnType<typeof setTimeout> | undefined;
    let monitorFrame = 0;
    let slowFrames = 0;
    const surfaces: Surface[] = [];

    const dpr = () => Math.min(window.devicePixelRatio || 1, touch ? 1.5 : 2);
    const pageBackground = () =>
      document.querySelector<HTMLElement>("[data-page-background]");
    const viewportBox = () =>
      pageBackground()?.getBoundingClientRect() ??
      new DOMRect(0, 0, window.innerWidth, window.innerHeight);

    function paintBackground() {
      const ctx = canvas!.getContext("2d");
      if (!ctx) return;
      const ratio = dpr();
      const box = photoMode ? viewportBox() : root!.getBoundingClientRect();
      const w = Math.max(1, Math.round(box.width * ratio));
      const h = Math.max(1, Math.round(box.height * ratio));
      canvas!.width = w;
      canvas!.height = h;

      ctx.fillStyle = color;
      ctx.fillRect(0, 0, w, h);

      if (photoMode && image) {
        // object-fit: cover, centred - the same mapping the page background uses
        const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight);
        const dw = image.naturalWidth * scale;
        const dh = image.naturalHeight * scale;
        ctx.globalAlpha = opacity;
        if (blurPx && "filter" in ctx) ctx.filter = `blur(${blurPx * ratio}px)`;
        ctx.drawImage(image, (w - dw) / 2, (h - dh) / 2, dw, dh);
        ctx.filter = "none";
        ctx.globalAlpha = 1;
      } else {
        for (const g of sceneGlows) {
          const cx = (g.x / 100) * w;
          const cy = (g.y / 100) * h;
          const radius = g.radius * ratio;
          const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
          gradient.addColorStop(0, `rgba(${g.rgb.join(",")},${g.alpha})`);
          gradient.addColorStop(1, `rgba(${g.rgb.join(",")},0)`);
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, w, h);
        }
      }
      painted = { w, h, desktop: window.matchMedia(DESKTOP_QUERY).matches };
    }

    function effectiveOpacity(target: HTMLElement) {
      let value = 1;
      for (
        let el: HTMLElement | null = target;
        el && el !== wrapper;
        el = el.parentElement
      ) {
        const own = parseFloat(getComputedStyle(el).opacity);
        if (!Number.isNaN(own)) value *= own;
      }
      return value;
    }

    /** Moves one glass element onto its surface. Returns true when anything changed. */
    function place(surface: Surface, rootRect: DOMRect) {
      const { target, glass } = surface;
      const r = target.getBoundingClientRect();
      // offsetWidth/Height ignore transforms (hover lift, the Reveal scale-in)
      const w = target.offsetWidth;
      const h = target.offsetHeight;
      const left =
        Math.round((r.left + (r.width - w) / 2 - rootRect.left) * 10) / 10;
      const top =
        Math.round((r.top + (r.height - h) / 2 - rootRect.top) * 10) / 10;
      const radius = Math.round(
        Math.max(
          0,
          Math.min(
            parseFloat(getComputedStyle(target).borderTopLeftRadius) || 0,
            h / 2,
            w / 2,
          ),
        ),
      );
      const rawOpacity = effectiveOpacity(target);
      const animating = Math.abs(rawOpacity - surface.rawOpacity) > 0.0002;
      surface.rawOpacity = rawOpacity;
      const cfg = JSON.stringify({
        floating: false,
        button: surface.isButton,
        cornerRadius: radius,
        ...PRESETS[surface.kind],
        opacity: Math.round(rawOpacity * 100) / 100,
      });
      const signature = `${left}|${top}|${w}|${h}|${cfg}`;
      if (signature === surface.last) return animating;
      surface.last = signature;
      glass.style.left = `${left}px`;
      glass.style.top = `${top}px`;
      glass.style.width = `${w}px`;
      glass.style.height = `${h}px`;
      glass.dataset.config = cfg;
      return true;
    }

    function sync(): boolean {
      if (!ready || off) return false;
      lastSync = performance.now();
      const rootRect = root!.getBoundingClientRect();
      let changed = false;

      if (photoMode) {
        const box = viewportBox();
        const ratio = dpr();
        if (
          Math.round(box.width * ratio) !== painted.w ||
          Math.round(box.height * ratio) !== painted.h ||
          window.matchMedia(DESKTOP_QUERY).matches !== painted.desktop
        ) {
          paintBackground();
        }
        // Fixed, like the page photo it copies: an absolute canvas that follows the viewport down the
        // page would keep stretching the document's scroll height.
        canvas!.style.position = "fixed";
        canvas!.style.left = `${box.left}px`;
        canvas!.style.top = `${box.top}px`;
        canvas!.style.width = `${box.width}px`;
        canvas!.style.height = `${box.height}px`;
      } else {
        const ratio = dpr();
        if (
          Math.round(rootRect.width * ratio) !== painted.w ||
          Math.round(rootRect.height * ratio) !== painted.h
        ) {
          paintBackground();
          changed = true;
        }
        // Always applied (not only after a repaint): the first paint happens before the first sync.
        canvas!.style.width = `${rootRect.width}px`;
        canvas!.style.height = `${rootRect.height}px`;
      }

      // Cheap (a few layout reads); every surface is kept current so none is stale when it scrolls in.
      for (const surface of surfaces) {
        if (place(surface, rootRect)) changed = true;
      }
      // The expensive part is the shader: marking the backdrop copy only re-renders the glasses that
      // overlap it, which in photo mode means the ones inside the viewport.
      if (photoMode || changed)
        instance?.markChanged(photoMode ? canvas! : undefined);
      return changed;
    }

    function schedule() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const changed = sync();
        // Keep going while something still moves (the Reveal scale-in) and briefly after start-up.
        if (changed || performance.now() < settleUntil) schedule();
      });
    }

    /** Throttled on touch devices: the shader redraws every visible card, which is the expensive part. */
    function onScroll() {
      lastScroll = performance.now();
      startMonitor();
      if (!touch || !photoMode) {
        schedule();
        return;
      }
      const wait = TOUCH_SCROLL_INTERVAL_MS - (lastScroll - lastSync);
      if (wait <= 0) {
        schedule();
      } else if (trailing === undefined) {
        // Also guarantees one final update right after the scrolling stops.
        trailing = setTimeout(() => {
          trailing = undefined;
          schedule();
        }, wait);
      }
    }

    /** While scrolling, watch the real frame rate; a device that cannot keep up gets plain CSS glass. */
    function startMonitor() {
      if (monitorFrame || off || !instance) return;
      let previous = performance.now();
      const tick = (now: number) => {
        monitorFrame = 0;
        const delta = now - previous;
        previous = now;
        if (delta > SLOW_FRAME_MS && delta < 1000) slowFrames += 1;
        if (slowFrames >= SLOW_FRAME_LIMIT) {
          fallBackToCss();
          return;
        }
        if (now - lastScroll < 250) monitorFrame = requestAnimationFrame(tick);
      };
      monitorFrame = requestAnimationFrame(tick);
    }

    function fallBackToCss() {
      if (off) return;
      off = true;
      try {
        sessionStorage.setItem(DISABLED_KEY, "1");
      } catch {
        // storage unavailable: only this scene falls back
      }
      if (trailing !== undefined) clearTimeout(trailing);
      instance?.destroy();
      instance = null;
      setWebglActive(false);
    }

    function createSurfaces() {
      for (const target of wrapper!.querySelectorAll<HTMLElement>(
        "[data-liquid-glass]",
      )) {
        const kind =
          (target.dataset.liquidGlass as SurfaceKind) in PRESETS
            ? (target.dataset.liquidGlass as SurfaceKind)
            : "card";
        const isButton = target.tagName === "A";
        const glass = document.createElement("div");
        glass.style.position = "absolute";
        root!.appendChild(glass);

        // The glass sits below the link: forward hover/press to drive the library's button effect.
        const handlers: Array<[string, () => void]> = isButton
          ? [
              [
                "pointerenter",
                () => glass.dispatchEvent(new PointerEvent("pointerover")),
              ],
              [
                "pointerleave",
                () => glass.dispatchEvent(new PointerEvent("pointerout")),
              ],
              [
                "pointerdown",
                () => glass.dispatchEvent(new PointerEvent("pointerdown")),
              ],
              [
                "pointerup",
                () => glass.dispatchEvent(new PointerEvent("pointerup")),
              ],
              [
                "pointercancel",
                () => glass.dispatchEvent(new PointerEvent("pointerup")),
              ],
            ]
          : [];
        for (const [type, handler] of handlers)
          target.addEventListener(type, handler);

        const resizeObserver = new ResizeObserver(() => schedule());
        resizeObserver.observe(target);

        const surface: Surface = {
          target,
          glass,
          kind,
          isButton,
          last: "",
          rawOpacity: -1,
          cleanup: () => {
            for (const [type, handler] of handlers)
              target.removeEventListener(type, handler);
            resizeObserver.disconnect();
            glass.remove();
          },
        };
        surfaces.push(surface);
      }
    }

    async function loadImage() {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = window.matchMedia(DESKTOP_QUERY).matches
          ? src!
          : (mobileSrc ?? src!);
      });
    }

    async function setup() {
      try {
        const [{ LiquidGlass }, loaded] = await Promise.all([
          import("@/vendor/liquidglass"),
          photoMode ? loadImage() : Promise.resolve(null),
        ]);
        if (cancelled) return;
        image = loaded;
        createSurfaces();
        if (surfaces.length === 0) return;
        ready = true;
        paintBackground();
        sync();

        instance = await LiquidGlass.init({
          root: root!,
          glassElements: surfaces.map((s) => s.glass),
        });
        if (cancelled) {
          instance.destroy();
          instance = null;
          return;
        }
        setWebglActive(true);
        settleUntil = performance.now() + 1600;
        schedule();
      } catch (error) {
        console.warn("LiquidGlassScene: falling back to CSS glass.", error);
      }
    }

    // The phone and desktop photo can differ: reload it when the breakpoint flips.
    const mq = window.matchMedia(DESKTOP_QUERY);
    const onBreakpoint = () => {
      if (!photoMode) return;
      loadImage().then((img) => {
        if (cancelled) return;
        image = img;
        paintBackground();
        schedule();
      });
    };
    mq.addEventListener("change", onBreakpoint);

    const rootObserver = new ResizeObserver(() => schedule());
    rootObserver.observe(root);

    setup();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", schedule);
    const visualViewport = window.visualViewport;
    visualViewport?.addEventListener("resize", schedule);

    return () => {
      cancelled = true;
      if (frame) cancelAnimationFrame(frame);
      mq.removeEventListener("change", onBreakpoint);
      rootObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (trailing !== undefined) clearTimeout(trailing);
      if (monitorFrame) cancelAnimationFrame(monitorFrame);
      window.removeEventListener("resize", schedule);
      visualViewport?.removeEventListener("resize", schedule);
      instance?.destroy();
      instance = null;
      for (const surface of surfaces) surface.cleanup();
    };
  }, [src, mobileSrc, opacity, color, blurPx, glowKey]);

  return (
    <div
      ref={wrapperRef}
      className={`lg-scene relative isolate ${className}`}
      data-webgl={webglActive ? "true" : undefined}
      style={glows?.length ? { backgroundImage: glowCss(glows) } : undefined}
    >
      {/* Glass root: sits behind the content (z -10 inside this stacking context) and never holds any. */}
      <div
        ref={rootRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        {/* Invisible copy of what is behind the glass - the library draws it into the glass scene. */}
        <canvas
          ref={canvasRef}
          className="pointer-events-none invisible absolute left-0 top-0"
        />
      </div>
      {children}
    </div>
  );
}
