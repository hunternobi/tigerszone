"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { GlassConfig, LiquidGlassInstance } from "@/vendor/liquidglass";

// The library samples this many CSS px around the glass for refraction and shadow (its SHADOW_PAD).
const SAMPLE_PAD = 20;

export interface GlassBackground {
  /** Photo shown fixed behind the whole page (desktop). Must be same-origin. */
  src: string;
  /** Photo for phones (below Tailwind's sm breakpoint); falls back to `src`. */
  mobileSrc?: string;
  /** Opacity the page draws the photo with. */
  opacity: number;
  /** Colour visible through the photo (the page background). */
  color: string;
  /** Blur the page applies to the photo, in CSS px. */
  blurPx?: number;
}

interface LiquidGlassCardProps {
  children: ReactNode;
  /** Layout classes of the card box (margins, max width ...). */
  className?: string;
  /** Padding etc. of the content layer that sits on top of the glass. */
  contentClassName?: string;
  background: GlassBackground;
  cornerRadius?: number;
  config?: Partial<GlassConfig>;
}

const DESKTOP_QUERY = "(min-width: 640px)";

/**
 * A card with real refracting "liquid glass" (WebGL, ybouane/liquidglass).
 *
 * The page photo is fixed to the viewport, so the card refracts a viewport-sized copy of it that is
 * kept aligned while scrolling. The glass element itself stays empty and the content is a separate
 * layer above it: the library re-rasterises everything inside a glass element whenever it changes
 * (a ticking countdown would do that every second). Until WebGL is up, or if it is unavailable, the
 * card keeps the plain CSS glass look.
 *
 * Mark a link or button inside the content with `data-glass-button` to give it a glass pill of its
 * own (the library's button mode with hover/press). Style the element itself as a plain pill; the
 * CSS in globals.css makes that look transparent once the glass is running.
 */
export default function LiquidGlassCard({
  children,
  className = "",
  contentClassName = "",
  background,
  cornerRadius = 28,
  config,
}: LiquidGlassCardProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const glassRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const [webglActive, setWebglActive] = useState(false);

  const glassConfig = JSON.stringify({
    floating: false,
    cornerRadius,
    blurAmount: 0.4,
    refraction: 0.85,
    chromAberration: 0.05,
    ...config,
  });

  const { src, mobileSrc, opacity, color, blurPx } = background;

  useEffect(() => {
    const root = rootRef.current;
    const glass = glassRef.current;
    const canvas = bgCanvasRef.current;
    const content = contentRef.current;
    if (!root || !glass || !canvas || !content) return;

    let cancelled = false;
    let instance: LiquidGlassInstance | null = null;
    let image: HTMLImageElement | null = null;
    let painted = { w: 0, h: 0, desktop: false };
    let frame = 0;
    let settleUntil = 0;
    let visible = true;

    // Every [data-glass-button] link in the content gets its own glass pill behind it. The link stays
    // the real, focusable element (transparent once the glass runs); the pill is created here because
    // the library only takes glass elements that exist when it starts.
    interface Pill {
      link: HTMLElement;
      glass: HTMLElement;
      cleanup: () => void;
    }
    const pills: Pill[] = [];

    function pillConfig(height: number) {
      return JSON.stringify({
        button: true,
        floating: false,
        cornerRadius: Math.round(height / 2),
        zRadius: Math.round(height / 2),
        blurAmount: 0.25,
        refraction: 0.7,
        chromAberration: 0.05,
        edgeHighlight: 0.12,
        specular: 0.15,
        shadowOpacity: 0.25,
        shadowSpread: 8,
      });
    }

    function placePills() {
      if (!root) return;
      const rootRect = root.getBoundingClientRect();
      for (const pill of pills) {
        const r = pill.link.getBoundingClientRect();
        // offsetWidth/Height ignore the link's own hover transform
        const w = pill.link.offsetWidth;
        const h = pill.link.offsetHeight;
        pill.glass.style.left = `${r.left + (r.width - w) / 2 - rootRect.left}px`;
        pill.glass.style.top = `${r.top + (r.height - h) / 2 - rootRect.top}px`;
        pill.glass.style.width = `${w}px`;
        pill.glass.style.height = `${h}px`;
        const config = pillConfig(h);
        if (pill.glass.dataset.config !== config) pill.glass.dataset.config = config;
      }
    }

    function createPills() {
      if (!root || !content) return;
      for (const link of content.querySelectorAll<HTMLElement>("[data-glass-button]")) {
        const pillGlass = document.createElement("div");
        pillGlass.style.position = "absolute";
        root.appendChild(pillGlass);

        // The glass sits below the link, so forward hover/press to drive the library's button effect.
        const forward = (type: string) => () =>
          pillGlass.dispatchEvent(new PointerEvent(type, { bubbles: false }));
        const handlers: Array<[string, () => void]> = [
          ["pointerenter", forward("pointerover")],
          ["pointerleave", forward("pointerout")],
          ["pointerdown", forward("pointerdown")],
          ["pointerup", forward("pointerup")],
          ["pointercancel", forward("pointerup")],
        ];
        for (const [type, handler] of handlers) link.addEventListener(type, handler);

        const resizeObserver = new ResizeObserver(() => schedule());
        resizeObserver.observe(link);

        pills.push({
          link,
          glass: pillGlass,
          cleanup: () => {
            for (const [type, handler] of handlers) link.removeEventListener(type, handler);
            resizeObserver.disconnect();
            pillGlass.remove();
          },
        });
      }
      placePills();
    }

    const pageBackground = () => document.querySelector<HTMLElement>("[data-page-background]");
    const viewportBox = () =>
      pageBackground()?.getBoundingClientRect() ??
      new DOMRect(0, 0, window.innerWidth, window.innerHeight);

    function paintBackground() {
      if (!image || !canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const box = viewportBox();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(box.width * dpr));
      const h = Math.max(1, Math.round(box.height * dpr));
      canvas.width = w;
      canvas.height = h;

      ctx.fillStyle = color;
      ctx.fillRect(0, 0, w, h);

      // object-fit: cover, centred - the same mapping the page background uses
      const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight);
      const dw = image.naturalWidth * scale;
      const dh = image.naturalHeight * scale;
      ctx.globalAlpha = opacity;
      if (blurPx && "filter" in ctx) ctx.filter = `blur(${blurPx * dpr}px)`;
      ctx.drawImage(image, (w - dw) / 2, (h - dh) / 2, dw, dh);
      ctx.filter = "none";
      ctx.globalAlpha = 1;

      painted = { w, h, desktop: window.matchMedia(DESKTOP_QUERY).matches };
    }

    function sync() {
      // Off-screen the glass cannot be seen, so skip the measuring and the shader re-render.
      if (!image || !canvas || !root || !visible) return;
      const box = viewportBox();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const needsRepaint =
        Math.round(box.width * dpr) !== painted.w ||
        Math.round(box.height * dpr) !== painted.h ||
        window.matchMedia(DESKTOP_QUERY).matches !== painted.desktop;
      if (needsRepaint) paintBackground();

      placePills();
      const rootRect = root.getBoundingClientRect();
      canvas.style.left = `${box.left - rootRect.left}px`;
      canvas.style.top = `${box.top - rootRect.top}px`;
      canvas.style.width = `${box.width}px`;
      canvas.style.height = `${box.height}px`;
      instance?.markChanged();
    }

    function schedule() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        sync();
        if (performance.now() < settleUntil) schedule();
      });
    }

    // Keep syncing for a moment: the card may still be animating in (Reveal) when it first renders.
    function settle(ms = 1600) {
      settleUntil = performance.now() + ms;
      schedule();
    }

    async function setup() {
      try {
        const [{ LiquidGlass }, loaded] = await Promise.all([
          import("@/vendor/liquidglass"),
          new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = window.matchMedia(DESKTOP_QUERY).matches ? src : (mobileSrc ?? src);
          }),
        ]);
        if (cancelled || !root || !glass) return;
        image = loaded;
        createPills();
        paintBackground();
        sync();

        instance = await LiquidGlass.init({
          root,
          glassElements: [glass, ...pills.map((pill) => pill.glass)],
        });
        if (cancelled) {
          instance.destroy();
          instance = null;
          return;
        }
        setWebglActive(true);
        settle();
      } catch (error) {
        console.warn("LiquidGlassCard: falling back to CSS glass.", error);
      }
    }

    // The mobile/desktop photo may differ, reload it when the breakpoint flips.
    const mq = window.matchMedia(DESKTOP_QUERY);
    const onBreakpoint = () => {
      const img = new Image();
      img.onload = () => {
        if (cancelled) return;
        image = img;
        paintBackground();
        sync();
      };
      img.src = mq.matches ? src : (mobileSrc ?? src);
    };
    mq.addEventListener("change", onBreakpoint);

    // Margin so the glass is already up to date when it scrolls into view.
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) schedule();
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(root);

    setup();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const visualViewport = window.visualViewport;
    visualViewport?.addEventListener("resize", schedule);

    return () => {
      cancelled = true;
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      mq.removeEventListener("change", onBreakpoint);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      visualViewport?.removeEventListener("resize", schedule);
      instance?.destroy();
      instance = null;
      for (const pill of pills) pill.cleanup();
    };
  }, [src, mobileSrc, opacity, color, blurPx]);

  return (
    <div
      className={`lg-card relative isolate glass-panel ${className}`}
      data-webgl={webglActive ? "true" : undefined}
    >
      {/* Glass root: the card box plus the ring the library samples. It never contains the content. */}
      <div
        ref={rootRef}
        aria-hidden
        className="pointer-events-none absolute"
        style={{ inset: -SAMPLE_PAD }}
      >
        {/* Hidden copy of the page photo - the library draws it directly into the glass scene. */}
        <canvas
          ref={bgCanvasRef}
          className="pointer-events-none invisible absolute"
          style={{ left: 0, top: 0 }}
        />
        <div
          ref={glassRef}
          data-config={glassConfig}
          className="absolute"
          style={{ inset: SAMPLE_PAD }}
        />
      </div>

      <div ref={contentRef} className={`relative z-10 ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
}
