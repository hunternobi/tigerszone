"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { GlassGL, type GlassDrawParams } from "@/lib/glassRenderer";

const DESKTOP_QUERY = "(min-width: 640px)";

// Once a device proved too slow for the shader the choice is kept for the whole visit (all scenes, all pages).
const DISABLED_KEY = "tz-glass-off";
const ENABLED_KEY = "tz-glass-on";
// The glass canvas reaches this far around each surface (room for the soft shadow of tiles).
const PAD = 24;
// At most this many WebGL contexts per scene are kept alive; they are reused while scrolling instead of
// being created and destroyed (compiling the shader and uploading the backdrop would stall scrolling).
const SLOT_LIMIT = 8;
// Extra rows drawn above and below the visible part of a tall card, for the frame that is still to come.
const CLIP_MARGIN = 160;
// A resize of the backdrop (e.g. Safari's toolbar collapsing) is repainted only after it settled.
const REPAINT_DELAY_MS = 150;
// Contexts lost this often (memory pressure) switch the shader off.
const LOST_LIMIT = 6;
// The shader is only switched off for sustained stutter: this many slow frames IN A ROW while scrolling,
// and never during the first seconds after start-up (hydration and shader set-up are heavy anyway).
const SLOW_FRAME_MS = 60;
const SLOW_STREAK_LIMIT = 20;
const STARTUP_GRACE_MS = 4000;

const isTouchDevice = () => window.matchMedia("(pointer: coarse)").matches;

/** `?glass=debug` shows a small status badge, so a phone can tell us why the glass is (not) active. */
function report(status: string) {
  try {
    if (new URLSearchParams(window.location.search).get("glass") !== "debug")
      return;
    let badge = document.getElementById("tz-glass-debug");
    if (!badge) {
      badge = document.createElement("div");
      badge.id = "tz-glass-debug";
      badge.style.cssText =
        "position:fixed;left:8px;right:8px;top:calc(env(safe-area-inset-top) + 56px);z-index:99999;" +
        "background:rgba(0,0,0,.8);color:#fff;font:12px/1.4 monospace;padding:6px 8px;border-radius:8px;" +
        "pointer-events:none;white-space:pre-wrap";
      document.body.appendChild(badge);
    }
    badge.textContent = `glass: ${status}`;
  } catch {
    // diagnostics only
  }
}

function glassDisabled(): boolean {
  try {
    const param = new URLSearchParams(window.location.search).get("glass");
    if (param === "off") {
      // Stays off for the rest of the visit (?glass=on switches it back on).
      sessionStorage.setItem(DISABLED_KEY, "1");
      sessionStorage.removeItem(ENABLED_KEY);
      return true;
    }
    if (param === "on" || param === "debug") {
      sessionStorage.removeItem(DISABLED_KEY);
      sessionStorage.setItem(ENABLED_KEY, "1");
      return false;
    }
    // The WebGL glass is parked for now: CSS glass over the fixed page background unless ?glass=on.
    return sessionStorage.getItem(ENABLED_KEY) !== "1";
  } catch {
    return true;
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
  /** Fixed full-page photo (same-origin): the glass refracts a viewport-sized copy of it. */
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
  card: { refraction: 0.85, blurLod: 0.5, soft: 6, chroma: 0.05, shadow: 0 },
  tile: { refraction: 0.7, blurLod: 0.5, soft: 5, chroma: 0.05, shadow: 0.3 },
} as const;
type SurfaceKind = keyof typeof PRESETS;

interface Surface {
  target: HTMLElement;
  kind: SurfaceKind;
  /** The pooled canvas + WebGL context currently showing this surface (only while it is near the viewport). */
  slot: Slot | null;
  visible: boolean;
  w: number;
  h: number;
  radius: number;
  left: number;
  top: number;
  opacity: number;
  /** Fades (Reveal) are tracked until then; afterwards the opacity is not read again while scrolling. */
  opacityUntil: number;
  key: string;
  backdropVersion: number;
  cleanup: () => void;
}

/** A canvas with its WebGL context. Slots are created once and handed from surface to surface. */
interface Slot {
  canvas: HTMLCanvasElement;
  gl: GlassGL;
  surface: Surface | null;
  backdropVersion: number;
  /** Size the canvas was last set up for (CSS px). */
  w: number;
  h: number;
}

const glowCss = (glows: SceneGlow[]) =>
  glows
    .map(
      (g) =>
        `radial-gradient(circle ${g.radius}px at ${g.x}% ${g.y}%, rgba(${g.rgb.join(",")},${g.alpha}), rgba(${g.rgb.join(",")},0))`,
    )
    .join(", ");

/**
 * A group of refracting "liquid glass" surfaces (own WebGL2 shader, see lib/glassRenderer).
 *
 * Mark any element inside with `data-liquid-glass="card" | "tile"` and give it the normal CSS glass look
 * (e.g. `glass-panel`). Once the shader runs, that CSS look is switched off (see globals.css) and a glass
 * canvas is drawn behind the element, matching its box and corner radius. The canvas scrolls with the
 * element, so its edges always stay in place; only the refracted picture is redrawn (cheaply) when the
 * fixed page photo moves relative to it. The element keeps its content, links and focus as usual.
 * Without WebGL2 the CSS look simply stays.
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
  const [webglActive, setWebglActive] = useState(false);

  const { color, src, mobileSrc, opacity = 1, blurPx, glows } = background;
  const glowKey = JSON.stringify(glows ?? null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const root = rootRef.current;
    if (!wrapper || !root) return;

    // CSS glass only (the surfaces keep their normal look): forced, or a slow device remembered earlier.
    if (glassDisabled()) {
      report(
        "off - switched off earlier on this device (open with ?glass=on to switch it back on)",
      );
      return;
    }

    const photoMode = Boolean(src);
    const touch = isTouchDevice();
    const sceneGlows: SceneGlow[] = JSON.parse(glowKey) ?? [];

    // Offscreen copy of what is behind the glass. Photo mode: the viewport-sized page photo (it is fixed);
    // otherwise the scene box with its soft glows (it scrolls with the glass).
    const backdrop = document.createElement("canvas");
    let backdropVersion = 0;
    let backdropBox = { w: 0, h: 0 };
    let image: HTMLImageElement | null = null;

    let cancelled = false;
    let ready = false;
    let off = false;
    let frame = 0;
    let settleUntil = 0;
    let lastScroll = 0;
    let monitorFrame = 0;
    let slowStreak = 0;
    let startedAt = 0;
    let lostCount = 0;
    let repaintTimer: ReturnType<typeof setTimeout> | undefined;
    let announced = false;
    const surfaces: Surface[] = [];

    const dpr = () => Math.min(window.devicePixelRatio || 1, 2);
    // The backdrop is blurred anyway: soft glows need very few pixels, the photo about one per CSS px.
    const backdropRatio = () => (photoMode ? 1 : 0.5);
    const pageBackground = () =>
      document.querySelector<HTMLElement>("[data-page-background]");
    const viewportBox = () =>
      pageBackground()?.getBoundingClientRect() ??
      new DOMRect(0, 0, window.innerWidth, window.innerHeight);

    function paintBackdrop(box: { width: number; height: number }) {
      const ctx = backdrop.getContext("2d");
      if (!ctx) return;
      const ratio = backdropRatio();
      const w = Math.max(1, Math.round(box.width * ratio));
      const h = Math.max(1, Math.round(box.height * ratio));
      backdrop.width = w;
      backdrop.height = h;

      ctx.fillStyle = color;
      ctx.fillRect(0, 0, w, h);

      if (photoMode && image) {
        // object-fit: cover, centred - the same mapping the page background uses
        const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight);
        const dw = image.naturalWidth * scale;
        const dh = image.naturalHeight * scale;
        ctx.globalAlpha = opacity;
        // A multi-megapixel photo drawn tiny aliases into blocks unless smoothing is on high.
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
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
      backdropBox = { w: box.width, h: box.height };
      backdropVersion += 1;
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

    const slots: Slot[] = [];

    /** Hands a surface's slot back (it left the viewport): the canvas is hidden, the context stays alive. */
    function releaseSlot(surface: Surface) {
      const slot = surface.slot;
      if (!slot) return;
      slot.surface = null;
      slot.canvas.style.visibility = "hidden";
      surface.slot = null;
      surface.key = "";
    }

    function destroySlot(slot: Slot) {
      if (slot.surface) {
        slot.surface.slot = null;
        slot.surface.key = "";
      }
      slot.gl.destroy();
      slot.canvas.remove();
      const index = slots.indexOf(slot);
      if (index >= 0) slots.splice(index, 1);
    }

    function createSlot(): Slot | null {
      const canvas = document.createElement("canvas");
      canvas.style.cssText =
        "position:absolute;pointer-events:none;visibility:hidden;";
      root!.appendChild(canvas);
      const gl = GlassGL.create(canvas);
      if (!gl) {
        canvas.remove();
        fallBackToCss("WebGL2 is not available");
        return null;
      }
      const slot: Slot = {
        canvas,
        gl,
        surface: null,
        backdropVersion,
        w: 0,
        h: 0,
      };
      gl.onLost = () => {
        lostCount += 1;
        if (lostCount > LOST_LIMIT) {
          fallBackToCss("WebGL context lost too often");
        } else {
          destroySlot(slot);
          schedule();
        }
      };
      gl.setBackdrop(backdrop);
      slots.push(slot);
      return slot;
    }

    /** A slot (canvas + WebGL context) for a surface near the viewport; slots are reused, not recreated. */
    function acquireSlot(surface: Surface): Slot | null {
      if (surface.slot && !surface.slot.gl.isLost) return surface.slot;
      if (surface.slot) destroySlot(surface.slot);
      let slot: Slot | null =
        slots.find((s) => !s.surface && !s.gl.isLost) ?? null;
      if (!slot && slots.length < SLOT_LIMIT) slot = createSlot();
      if (!slot) {
        // All slots busy: take one from a surface that has meanwhile left the viewport.
        const stale = slots.find((s) => s.surface && !s.surface.visible);
        if (stale?.surface) {
          releaseSlot(stale.surface);
          slot = stale;
        }
      }
      if (!slot) return null;
      slot.surface = surface;
      slot.canvas.style.visibility = "visible";
      surface.slot = slot;
      surface.key = "";
      surface.w = 0;
      surface.left = NaN;
      surface.top = NaN;
      return slot;
    }

    /** Positions and redraws every surface near the viewport. Returns true while something still moves. */
    function sync(now: number): boolean {
      if (!ready || off) return false;
      const rootRect = root!.getBoundingClientRect();
      const box = photoMode ? viewportBox() : rootRect;

      // Repaint the backdrop when its size changed - but not in the middle of a scroll (Safari's toolbar
      // collapsing resizes the viewport), only once it settled.
      const resized =
        Math.abs(box.width - backdropBox.w) > 0.5 ||
        Math.abs(box.height - backdropBox.h) > 0.5;
      if (backdropVersion === 0) {
        paintBackdrop(box);
      } else if (resized && repaintTimer === undefined) {
        repaintTimer = setTimeout(() => {
          repaintTimer = undefined;
          if (cancelled || off) return;
          paintBackdrop(
            photoMode ? viewportBox() : root!.getBoundingClientRect(),
          );
          schedule();
        }, REPAINT_DELAY_MS);
      }

      const viewportH = window.innerHeight;
      let animating = false;
      for (const surface of surfaces) {
        if (!surface.visible) continue;
        const { target } = surface;
        const r = target.getBoundingClientRect();
        // offsetWidth/Height ignore transforms (hover lift, the Reveal scale-in)
        const w = target.offsetWidth;
        const h = target.offsetHeight;
        if (w === 0 || h === 0) continue;

        const canvasW = w + PAD * 2;
        const canvasH = h + PAD * 2;
        const originX = r.left + (r.width - w) / 2 - PAD; // canvas top-left, viewport coords
        const originY = r.top + (r.height - h) / 2 - PAD;

        // Only the rows around the viewport are drawn (a tall card is mostly off-screen).
        const clipTop = Math.max(0, Math.floor(-originY - CLIP_MARGIN));
        const clipBottom = Math.min(
          canvasH,
          Math.ceil(viewportH - originY + CLIP_MARGIN),
        );
        if (clipBottom <= clipTop) continue;

        const slot = acquireSlot(surface);
        if (!slot) continue;

        const left = Math.round((originX - rootRect.left) * 10) / 10;
        const top = Math.round((originY - rootRect.top) * 10) / 10;

        if (w !== surface.w || h !== surface.h) {
          surface.w = w;
          surface.h = h;
          const radius =
            parseFloat(getComputedStyle(target).borderTopLeftRadius) || 0;
          surface.radius = Math.max(0, Math.min(radius, h / 2, w / 2));
          surface.key = "";
        }
        if (slot.w !== canvasW || slot.h !== canvasH) {
          slot.w = canvasW;
          slot.h = canvasH;
          slot.canvas.style.width = `${canvasW}px`;
          slot.canvas.style.height = `${canvasH}px`;
          slot.gl.resize(canvasW, canvasH, dpr());
          surface.key = "";
        }
        if (left !== surface.left || top !== surface.top) {
          surface.left = left;
          surface.top = top;
          slot.canvas.style.left = `${left}px`;
          slot.canvas.style.top = `${top}px`;
        }
        if (slot.backdropVersion !== backdropVersion) {
          slot.gl.setBackdrop(backdrop);
          slot.backdropVersion = backdropVersion;
          surface.key = "";
        }
        if (now < surface.opacityUntil) {
          const next = Math.round(effectiveOpacity(target) * 100) / 100;
          if (next !== surface.opacity) {
            surface.opacity = next;
            surface.key = "";
          }
          animating = true;
        }

        const backdropX = originX - box.left;
        const backdropY = originY - box.top;
        const key = `${Math.round(backdropX * 2)}|${Math.round(backdropY * 2)}|${box.width}|${box.height}|${surface.opacity}`;
        if (key === surface.key) continue;
        surface.key = key;

        const preset = PRESETS[surface.kind];
        const params: GlassDrawParams = {
          canvasW,
          canvasH,
          width: w,
          height: h,
          pad: PAD,
          radius: surface.radius,
          backdropX,
          backdropY,
          backdropW: box.width,
          backdropH: box.height,
          refraction: preset.refraction,
          blurLod: preset.blurLod,
          soft: preset.soft,
          chroma: preset.chroma,
          opacity: surface.opacity,
          shadow: preset.shadow,
          clip: { x: 0, y: clipTop, w: canvasW, h: clipBottom - clipTop },
        };
        slot.gl.draw(params);

        if (!announced) {
          announced = true;
          startedAt = now;
          setWebglActive(true);
          report(
            `active (${touch ? "touch" : "desktop"}, dpr ${window.devicePixelRatio}, own shader)`,
          );
        }
      }
      return animating;
    }

    function schedule() {
      if (frame) return;
      frame = requestAnimationFrame((now) => {
        frame = 0;
        const animating = sync(now);
        // Keep going while a fade runs and briefly after start-up.
        if (animating || performance.now() < settleUntil) schedule();
      });
    }

    function onScroll() {
      lastScroll = performance.now();
      startMonitor();
      schedule();
    }

    /** While scrolling, watch the real frame rate; a device that cannot keep up gets plain CSS glass. */
    function startMonitor() {
      if (monitorFrame || off || !announced) return;
      let previous = performance.now();
      const tick = (now: number) => {
        monitorFrame = 0;
        const delta = now - previous;
        previous = now;
        const settled = now - startedAt > STARTUP_GRACE_MS;
        if (delta > SLOW_FRAME_MS && delta < 1000 && settled) slowStreak += 1;
        else slowStreak = 0;
        if (slowStreak >= SLOW_STREAK_LIMIT) {
          fallBackToCss(
            `too slow (${slowStreak} frames over ${SLOW_FRAME_MS} ms in a row)`,
          );
          return;
        }
        if (now - lastScroll < 250) monitorFrame = requestAnimationFrame(tick);
      };
      monitorFrame = requestAnimationFrame(tick);
    }

    function fallBackToCss(reason: string) {
      if (off) return;
      off = true;
      report(`off - ${reason}`);
      try {
        sessionStorage.setItem(DISABLED_KEY, "1");
      } catch {
        // storage unavailable: only this scene falls back
      }
      for (const slot of [...slots]) destroySlot(slot);
      setWebglActive(false);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const now = performance.now();
        for (const entry of entries) {
          const surface = surfaces.find((s) => s.target === entry.target);
          if (!surface) continue;
          surface.visible = entry.isIntersecting;
          if (surface.visible) surface.opacityUntil = now + 1500;
          else releaseSlot(surface);
        }
        schedule();
      },
      // A little room so the glass is already drawn when a card scrolls into view.
      { rootMargin: "300px 0px" },
    );

    function createSurfaces() {
      for (const target of wrapper!.querySelectorAll<HTMLElement>(
        "[data-liquid-glass]",
      )) {
        const kind =
          (target.dataset.liquidGlass as SurfaceKind) in PRESETS
            ? (target.dataset.liquidGlass as SurfaceKind)
            : "card";
        const resizeObserver = new ResizeObserver(() => schedule());
        resizeObserver.observe(target);
        observer.observe(target);

        surfaces.push({
          target,
          kind,
          slot: null,
          visible: false,
          w: 0,
          h: 0,
          radius: 0,
          left: NaN,
          top: NaN,
          opacity: 1,
          opacityUntil: performance.now() + 2500,
          key: "",
          backdropVersion: -1,
          cleanup: () => {
            resizeObserver.disconnect();
            observer.unobserve(target);
          },
        });
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
        image = photoMode ? await loadImage() : null;
        if (cancelled) return;
        createSurfaces();
        if (surfaces.length === 0) return;
        ready = true;
        settleUntil = performance.now() + 1600;
        schedule();
      } catch (error) {
        console.warn("LiquidGlassScene: falling back to CSS glass.", error);
        report(
          `off - init failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    // The phone and desktop photo can differ: reload it when the breakpoint flips.
    const mq = window.matchMedia(DESKTOP_QUERY);
    const onBreakpoint = () => {
      if (!photoMode) return;
      loadImage().then((img) => {
        if (cancelled) return;
        image = img;
        paintBackdrop(viewportBox());
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
      if (monitorFrame) cancelAnimationFrame(monitorFrame);
      if (repaintTimer !== undefined) clearTimeout(repaintTimer);
      mq.removeEventListener("change", onBreakpoint);
      rootObserver.disconnect();
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", schedule);
      visualViewport?.removeEventListener("resize", schedule);
      for (const slot of [...slots]) destroySlot(slot);
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
      />
      {children}
    </div>
  );
}
