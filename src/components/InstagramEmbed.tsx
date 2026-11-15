"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

interface InstagramEmbedProps {
  url: string;
}

// Instagram's embed never gets narrower than this; in a narrower box its right edge would be cut off.
const MIN_EMBED_WIDTH = 326;

export default function InstagramEmbed({ url }: InstagramEmbedProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  // In a box narrower than the embed's minimum, lay it out at the minimum and shrink it to fit.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const update = () => setZoom(Math.min(1, box.clientWidth / MIN_EMBED_WIDTH));
    const observer = new ResizeObserver(update);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  // Instagram's script (and the frame it builds) is only loaded once the post comes near the screen: it sits
  // far down the page and is heavy for a phone that never scrolls there.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const scriptId = "instagram-embed-script";

    const load = () => {
      if (window.instgrm) {
        window.instgrm.Embeds.process();
        return;
      }
      if (document.getElementById(scriptId)) return;

      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      document.body.appendChild(script);
    };

    if (!("IntersectionObserver" in window)) {
      load();
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        load();
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(box);
    return () => observer.disconnect();
  }, [url]);

  return (
    <div ref={boxRef} className="w-full">
      <div style={zoom < 1 ? { width: MIN_EMBED_WIDTH, zoom } : undefined}>
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={`${url}?utm_source=ig_embed&utm_campaign=loading`}
          data-instgrm-version="14"
          style={{ background: "#FFF", border: 0, borderRadius: "12px", margin: 0, width: "100%" }}
        />
      </div>
    </div>
  );
}
