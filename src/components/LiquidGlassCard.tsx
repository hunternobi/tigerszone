"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { LiquidGlassRenderer } from "@/lib/liquidGlass";

/** How long frames keep being drawn after a resize or layout change. */
const ACTIVE_MS = 250;
/** The page counts as standing still this long after the last scroll event (covers momentum scrolling). */
const REST_MS = 140;
/** The card fades and rises in when the page appears (Reveal); frames are drawn until that has settled. */
const INTRO_MS = 1600;

const parseColor = (css: string): [number, number, number] => {
  const parts = css.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [10, 15, 61];
  return [parts[0] / 255, parts[1] / 255, parts[2] / 255];
};

/** The visible photo of the page background (FadingBackground renders one per breakpoint). */
function findPagePhoto(): { layer: HTMLElement; image: HTMLImageElement } | null {
  const layer = document.querySelector<HTMLElement>("[data-page-background]");
  if (!layer) return null;
  const image = [...layer.querySelectorAll("img")].find(
    (img) => img.getClientRects().length > 0,
  );
  return image ? { layer, image } : null;
}

/**
 * A glass panel with real refraction of the fixed page photo (see lib/liquidGlass), shown while the page
 * stands still (data-liquid="on" fades the canvas in over the normal CSS glass panel).
 *
 * While the page scrolls the canvas is hidden and nothing is drawn: the photo is fixed and the card moves, so
 * the refraction would have to be redrawn for every frame, and on a phone scrolling runs ahead of scripts,
 * which made the picture in the glass trail behind. Standing still, one frame is drawn and faded back in.
 * Without WebGL2, after a lost context, or with "reduce transparency" set, it simply stays the CSS panel.
 */
export default function LiquidGlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const canvas = canvasRef.current;
    if (!card || !canvas) return;
    if (window.matchMedia("(prefers-reduced-transparency: reduce)").matches) return;
    const found = findPagePhoto();
    if (!found) return;
    const { layer } = found;
    let image = found.image;

    let destroyed = false;
    let frameId = 0;
    let activeUntil = 0;
    let onScreen = true;
    let photoReady = false;
    let lastKey = "";
    let scrolling = false;
    let restTimer: ReturnType<typeof setTimeout> | undefined;

    const fallBack = () => {
      if (!destroyed) delete card.dataset.liquid;
    };

    let renderer: LiquidGlassRenderer;
    try {
      renderer = new LiquidGlassRenderer(canvas, fallBack);
    } catch {
      return;
    }

    const base = parseColor(getComputedStyle(document.body).backgroundColor);

    const start = () => {
      if (destroyed || renderer.lost) return;
      renderer.setPhoto(image);
      photoReady = true;
      lastKey = "";
      wake(INTRO_MS);
    };

    function loadPhoto() {
      photoReady = false;
      if (image.complete && image.naturalWidth > 0) start();
      else image.addEventListener("load", start, { once: true });
    }

    function draw() {
      // The page shows a different photo on wide screens; follow it when the breakpoint is crossed.
      if (image.getClientRects().length === 0) {
        const next = findPagePhoto()?.image;
        if (!next) return;
        image.removeEventListener("load", start);
        image = next;
        loadPhoto();
        if (!photoReady) return;
      }

      const pane = card!.getBoundingClientRect();
      const box = layer.getBoundingClientRect();
      if (pane.width < 1 || box.width < 1) return;

      // object-cover, centred: the same placement the browser gives the <img>.
      const cover = Math.max(box.width / image.naturalWidth, box.height / image.naturalHeight);
      const photoWidth = image.naturalWidth * cover;
      const photoHeight = image.naturalHeight * cover;
      const photoLeft = box.left + (box.width - photoWidth) / 2;
      const photoTop = box.top + (box.height - photoHeight) / 2;

      // Up to two device pixels per CSS pixel are plenty for frosted glass.
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const bufferWidth = Math.round(card!.offsetWidth * ratio);
      const bufferHeight = Math.round(card!.offsetHeight * ratio);

      const key = [pane.left, pane.top, pane.width, pane.height, box.width, box.height, bufferWidth, bufferHeight]
        .map((value) => value.toFixed(1))
        .join(",");
      if (key === lastKey) return;
      lastKey = key;

      const style = getComputedStyle(card!);
      renderer.resize(bufferWidth, bufferHeight);
      renderer.draw({
        left: pane.left,
        top: pane.top,
        width: pane.width,
        height: pane.height,
        // The radius follows the card while Reveal scales it.
        radius: (parseFloat(style.borderTopLeftRadius) || 0) * (pane.width / card!.offsetWidth),
        photoLeft,
        photoTop,
        photoWidth,
        photoHeight,
        photoOpacity: parseFloat(getComputedStyle(layer).opacity) || 1,
        base,
      });
      if (!renderer.lost) card!.dataset.liquid = "on";
    }

    function frame(now: number) {
      frameId = 0;
      if (destroyed || renderer.lost) return;
      if (!scrolling && onScreen && (photoReady || image.getClientRects().length === 0)) draw();
      if (now < activeUntil) frameId = requestAnimationFrame(frame);
    }

    function wake(duration = ACTIVE_MS) {
      activeUntil = Math.max(activeUntil, performance.now() + duration);
      if (!frameId) frameId = requestAnimationFrame(frame);
    }

    const onScroll = () => {
      if (!scrolling) {
        scrolling = true;
        delete card.dataset.liquid;
      }
      clearTimeout(restTimer);
      restTimer = setTimeout(() => {
        scrolling = false;
        lastKey = "";
        wake();
      }, REST_MS);
    };
    const onResize = () => wake();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("resize", onResize);

    const sizeObserver = new ResizeObserver(() => wake());
    sizeObserver.observe(card);
    const viewObserver = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) wake();
    });
    viewObserver.observe(card);

    loadPhoto();

    return () => {
      destroyed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(restTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
      image.removeEventListener("load", start);
      sizeObserver.disconnect();
      viewObserver.disconnect();
      renderer.destroy();
      delete card.dataset.liquid;
    };
  }, []);

  return (
    <div ref={cardRef} className={`glass-panel liquid-glass ${className}`}>
      <canvas ref={canvasRef} aria-hidden className="liquid-glass-canvas" />
      <div className="relative">{children}</div>
    </div>
  );
}
