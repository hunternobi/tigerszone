import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import BlogArchiveList from "@/components/BlogArchiveList";
import FadingBackground from "@/components/FadingBackground";
import LiquidGlassScene from "@/components/LiquidGlassScene";
import { getAllBlogPosts } from "@/lib/blogPosts";
import { FANS_SCENE } from "@/lib/glassScenes";

export const metadata: Metadata = {
  title: "Spieltagsarchiv",
  description:
    "Alle Beiträge des Spieltagsblogs rund um die Straubing Tigers auf einen Blick.",
  alternates: { canonical: "/spieltagsblog/archiv" },
};

export default async function SpieltagsarchivPage() {
  const posts = await getAllBlogPosts();

  return (
    <FadingBackground
      src="/images/Fans.jpg"
      opacity={FANS_SCENE.opacity}
      blurPx={FANS_SCENE.blurPx}
    >
      <LiquidGlassScene background={FANS_SCENE}>
        <section className="mx-auto max-w-3xl px-7 py-10 sm:px-6 sm:py-16">
          <Link
            href="/spieltagsblog"
            className="-ml-1 inline-flex min-h-[44px] items-center gap-0.5 text-[15px] font-medium text-white/85 transition hover:text-white"
          >
            <ChevronLeft size={20} />
            Spieltagsblog
          </Link>

          <h1 className="font-ui mt-1 text-[2.15rem] leading-[1.06] font-semibold tracking-tight text-white sm:text-5xl">
            Spieltagsarchiv
          </h1>

          <div className="mt-6 sm:mt-8">
            {posts.length === 0 ? (
              <p
                data-liquid-glass="card"
                className="glass-panel p-5 text-center text-[17px] text-white/85 sm:p-8"
              >
                Noch keine Beiträge vorhanden.
              </p>
            ) : (
              <BlogArchiveList posts={posts} />
            )}
          </div>
        </section>
      </LiquidGlassScene>
    </FadingBackground>
  );
}
