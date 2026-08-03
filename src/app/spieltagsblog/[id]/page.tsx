import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getBlogPostById } from "@/lib/blogPosts";
import { formatPostDate } from "@/utils/format";

interface BlogPostPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
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
    <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <Link
        href="/spieltagsblog"
        className="inline-flex items-center gap-2 text-sm text-white hover:underline"
      >
        <ArrowLeft size={16} />
        Zurück zum Spieltagsblog
      </Link>

      <article className="glass-panel mt-6 p-5 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">{post.title}</h1>
          <span className="shrink-0 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white">
            {formatPostDate(post.publishedAt)}
          </span>
        </div>

        <div className="mt-6 space-y-4 text-white">
          {post.content.split("\n\n").map((paragraph, index) => (
            <p key={index} className="whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </div>

        <p className="mt-4 text-right text-xs text-white">von {post.authorName}</p>
      </article>
    </section>
  );
}
