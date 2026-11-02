"use client";

import { useEffect, useRef } from "react";
import { SharedGlassGL, type GlassRect, MAX_CARDS } from "@/lib/sharedGlass";

const DESKTOP_QUERY = "(min-width: 640px)";
const DISABLED_KEY = "tz-glass-off";
// After a content change frames are drawn for this long (fades and animations of the cards).
const CHANGE_ACTIVE_MS = 1600;
// The canvas stays put on the page while scrolling (so card and glass move together, natively). It is drawn
// again when scrolling stops and whenever the screen has left the middle part of the canvas by this fraction.
const SETTLE_MS = 110;
const REANCHOR_FRACTION = 0.8;

function glassDisabled(): boolean {
  try {
    const param = new URLSearchParams(window.location.search).get("glass");
    if (param === "off") {
      sessionStorage.setItem(DISABLED_KEY, "1");
      return true;
    }
    if (param === "on") sessionStorage.removeItem(DISABLED_KEY);
    return sessionStorage.getItem(DISABLED_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Draws the glass of every `.glass-panel` card of a page with ONE shared canvas (see lib/sharedGlass). Lives
 * inside FadingBackground, directly behind the page content and above the fixed page photo, and switches the
 * cards' own CSS glass off (via data-webgl on the scope element) as soon as it runs. Without WebGL2, or on a
 * device that cannot keep up, the CSS glass simply stays.
 */
export default function SharedGlass({
  src,
  mobileSrc,
  opacity = 1,
  blurPx = 0,
  color = "#0a0f3d",
}: {
  src: string;
  mobileSrc?: string;
  opacity?: number;
  blurPx?: number;
  color?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const scope = canvas?.closest<HTMLElement>("[data-glass-scope]") ?? null;
    if (!canvas || !scope) return;
    if (glassDisabled()) return;

    const gl = SharedGlassGL.create(canvas);
    if (!gl) return;

    let cancelled = false;
    let frame = 0;
    let activeUntil = 0;
    let running = false;
    let anchorScroll = Number.NaN;
    let backdropReady = false;
    let paintedFor = { w: 0, h: 0, desktop: false };
    let image: HTMLImageElement | null = null;

    const photoLayer = () =>
      scope.querySelector<HTMLElement>("[data-page-background]");
    // The canvas is three screens tall, so its resolution is kept moderate.
    const dpr = () => Math.min(window.devicePixelRatio || 1, 1.5);

    function paintBackdrop(w: number, h: number) {
      if (!image) return;
      const ratio = Math.min(dpr(), 1.25);
      const bw = Math.max(1, Math.round(w * ratio));
      const bh = Math.max(1, Math.round(h * ratio));
      const bg = document.createElement("canvas");
      bg.width = bw;
      bg.height = bh;
      const ctx = bg.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, bw, bh);
      // object-fit: cover, centred - the same mapping the page photo uses
      const scale = Math.max(bw / image.naturalWidth, bh / image.naturalHeight);
      const dw = image.naturalWidth * scale;
      const dh = image.naturalHeight * scale;
      ctx.globalAlpha = opacity;
      if (blurPx && "filter" in ctx) ctx.filter = `blur(${blurPx * ratio}px)`;
      ctx.drawImage(image, (bw - dw) / 2, (bh - dh) / 2, dw, dh);
      // The library blurs its copy lightly (about 4 px); here a canvas filter does it once.
      const soft = document.createElement("canvas");
      soft.width = bw;
      soft.height = bh;
      const softCtx = soft.getContext("2d");
      if (softCtx) {
        if ("filter" in softCtx) softCtx.filter = `blur(${4 * ratio}px)`;
        softCtx.drawImage(bg, 0, 0);
      }
      gl!.setBackdrop(bg, soft);
      paintedFor = {
        w: w,
        h: h,
        desktop: window.matchMedia(DESKTOP_QUERY).matches,
      };
      backdropReady = true;
    }

    function effectiveOpacity(el: HTMLElement) {
      let value = 1;
      for (
        let node: HTMLElement | null = el;
        node && node !== scope;
        node = node.parentElement
      ) {
        const own = parseFloat(getComputedStyle(node).opacity);
        if (!Number.isNaN(own)) value *= own;
      }
      return value;
    }

    function collect(viewW: number, viewH: number): GlassRect[] {
      const rects: GlassRect[] = [];
      const margin = viewH;
      for (const el of scope!.querySelectorAll<HTMLElement>(".glass-panel")) {
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) continue;
        if (r.bottom < -margin || r.top > viewH * 2) continue;
        if (r.right < 0 || r.left > viewW) continue;
        rects.push({
          x: r.left,
          y: r.top,
          width: r.width,
          height: r.height,
          radius: parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0,
          opacity: effectiveOpacity(el),
        });
        if (rects.length >= MAX_CARDS) break;
      }
      return rects;
    }

    function render() {
      frame = 0;
      if (cancelled) return;
      const layer = photoLayer();
      const box = layer?.getBoundingClientRect();
      const viewW = box?.width ?? window.innerWidth;
      const viewH = box?.height ?? window.innerHeight;

      const desktop = window.matchMedia(DESKTOP_QUERY).matches;
      if (
        !backdropReady ||
        Math.abs(viewW - paintedFor.w) > 1 ||
        Math.abs(viewH - paintedFor.h) > 1 ||
        desktop !== paintedFor.desktop
      ) {
        paintBackdrop(viewW, viewH);
      }

      // The canvas reaches one screen above and below the screen, sits in the page flow (it scrolls with the
      // cards) and is anchored at the current scroll position.
      const scrollY = window.scrollY;
      const scopeTop = scope!.getBoundingClientRect().top + scrollY;
      const regionH = viewH * 3;
      canvas!.style.left = "0px";
      canvas!.style.top = `${scrollY - viewH - scopeTop}px`;
      canvas!.style.width = `${viewW}px`;
      canvas!.style.height = `${regionH}px`;
      gl!.resize(viewW, regionH, dpr());
      gl!.draw(viewW, viewH, viewW, regionH, -viewH, collect(viewW, viewH));
      anchorScroll = scrollY;

      if (!running) {
        running = true;
        scope!.dataset.webgl = "true";
      }
      if (performance.now() < activeUntil) schedule();
    }

    function schedule() {
      if (!frame && !cancelled) frame = requestAnimationFrame(render);
    }

    function wake(ms: number) {
      activeUntil = Math.max(activeUntil, performance.now() + ms);
      schedule();
    }

    function fallBack() {
      try {
        sessionStorage.setItem(DISABLED_KEY, "1");
      } catch {
        // storage unavailable: only this page falls back
      }
      teardown();
    }

    function teardown() {
      cancelled = true;
      if (frame) cancelAnimationFrame(frame);
      delete scope!.dataset.webgl;
      canvas!.style.display = "none";
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      gl!.destroy();
    }

    function onScroll() {
      // Far enough from where the canvas was drawn: draw it again right away (the cards are still the same
      // cards, so nothing jumps). Otherwise wait until scrolling stops.
      const viewH = window.innerHeight;
      if (
        Number.isNaN(anchorScroll) ||
        Math.abs(window.scrollY - anchorScroll) > viewH * REANCHOR_FRACTION
      ) {
        schedule();
      }
      clearTimeout(scrollEnd);
      scrollEnd = setTimeout(schedule, SETTLE_MS);
    }
    let scrollEnd: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => wake(CHANGE_ACTIVE_MS);
    const resizeObserver = new ResizeObserver(() => wake(CHANGE_ACTIVE_MS));
    // Tab switches and loaded lists add or remove cards (not just text), which is what we need to hear about.
    const mutationObserver = new MutationObserver(() => wake(CHANGE_ACTIVE_MS));

    gl.onLost = () => fallBack();

    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      image = img;
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize);
      resizeObserver.observe(scope);
      mutationObserver.observe(scope, { childList: true, subtree: true });
      wake(CHANGE_ACTIVE_MS);
    };
    img.onerror = () => teardown();
    // The optimised copy (not the multi-megabyte original): decoding a huge photo would stall a phone.
    const desktopNow = window.matchMedia(DESKTOP_QUERY).matches;
    const picked = desktopNow ? src : (mobileSrc ?? src);
    img.src = `/_next/image?url=${encodeURIComponent(picked)}&w=${desktopNow ? 1920 : 828}&q=75`;

    return () => {
      if (!cancelled) teardown();
      clearTimeout(scrollEnd);
    };
  }, [src, mobileSrc, opacity, blurPx, color]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute -z-10"
      style={{ left: 0, top: 0 }}
    />
  );
}
