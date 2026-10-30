import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import FadingBackground from "@/components/FadingBackground";
import LiquidGlassScene from "@/components/LiquidGlassScene";
import { FANS_SCENE } from "@/lib/glassScenes";
import { getBlogPostById } from "@/lib/blogPosts";
import { formatPostDate } from "@/utils/format";

interface BlogPostPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getBlogPostById(id);
  if (!post) return { title: "Beitrag nicht gefunden" };

  return {
    title: post.title,
    description: post.content.replace(/\s+/g, " ").trim().slice(0, 160),
    alternates: { canonical: `/spieltagsblog/${post._id}` },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { id } = await params;
  const post = await getBlogPostById(id);
  if (!post) notFound();

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
            className="-ml-1 inline-flex min-h-[44px] items-center gap-0.5 text-[0.9375rem] font-medium text-white/85 transition hover:text-white"
          >
            <ChevronLeft size={20} />
            Spieltagsblog
          </Link>

          <article
            data-liquid-glass="card"
            className="glass-panel mt-2 p-5 sm:p-8"
          >
            <p className="font-ui text-[0.6875rem] font-semibold tracking-[0.14em] text-white/60 uppercase sm:text-xs">
              {formatPostDate(post.publishedAt)}
            </p>
            <h1 className="font-ui mt-2 text-[1.625rem] leading-[1.12] font-semibold tracking-tight text-balance text-white sm:text-4xl">
              {post.title}
            </h1>

            <div className="mt-5 space-y-4 text-[1.0625rem] leading-[1.6] text-white/90">
              {post.content.split("\n\n").map((paragraph, index) => (
                <p key={index} className="whitespace-pre-line">
                  {paragraph}
                </p>
              ))}
            </div>

            <p className="mt-6 text-right text-[0.8125rem] text-white/60">
              von {post.authorName}
            </p>
          </article>
        </section>
      </LiquidGlassScene>
    </FadingBackground>
  );
}
