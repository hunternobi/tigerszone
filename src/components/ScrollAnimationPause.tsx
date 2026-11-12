"use client";

import { useEffect } from "react";

/**
 * Marks <html> with data-scrolling while the page scrolls (and for a moment afterwards). Continuous
 * animations that repaint text (the light on the top three places) pause meanwhile, so they cannot compete
 * with the scrolling for the phone's drawing time.
 */
export default function ScrollAnimationPause() {
  useEffect(() => {
    const root = document.documentElement;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      if (!root.hasAttribute("data-scrolling")) root.setAttribute("data-scrolling", "");
      clearTimeout(timer);
      timer = setTimeout(() => root.removeAttribute("data-scrolling"), 160);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
      root.removeAttribute("data-scrolling");
    };
  }, []);

  return null;
}
