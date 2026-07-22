"use client";

import { useEffect } from "react";

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

export default function InstagramEmbed({ url }: InstagramEmbedProps) {
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
    <blockquote
      className="instagram-media"
      data-instgrm-permalink={`${url}?utm_source=ig_embed&utm_campaign=loading`}
      data-instgrm-version="14"
      style={{ background: "#FFF", border: 0, borderRadius: "12px", margin: 0, width: "100%" }}
    />
  );
}
