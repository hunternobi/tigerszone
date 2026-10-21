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

  useEffect(() => {
    const scriptId = "instagram-embed-script";

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
