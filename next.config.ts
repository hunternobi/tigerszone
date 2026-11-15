import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF first (clearly smaller than WebP for the page photos), WebP for browsers without it.
    formats: ["image/avif", "image/webp"],
    // 60 is used for the dimmed page photos (FadingBackground), 75 is the default for everything else.
    qualities: [60, 75],
    // The pictures in /public only change with a deployment: keep the optimised versions for a month.
    minimumCacheTTL: 2678400,
  },
};

export default nextConfig;
