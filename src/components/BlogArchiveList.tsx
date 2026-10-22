import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatExcerpt, formatPostDate } from "@/utils/format";

interface ArchivePost {
  _id: string;
  title: string;
  content: string;
  publishedAt: string;
  authorName: string;
}

/**
 * Blog posts as one grouped list inside a single glass card (like iOS settings), however many there are.
 * Must sit inside a LiquidGlassScene.
 */
export default function BlogArchiveList({ posts }: { posts: ArchivePost[] }) {
  return (
    <ul
      data-liquid-glass="card"
      className="glass-panel divide-y divide-white/10 p-1.5 sm:p-2"
    >
      {posts.map((post) => (
        <li key={post._id}>
          <Link
            href={`/spieltagsblog/${post._id}`}
            className="flex items-center gap-3 rounded-2xl px-3.5 py-4 transition hover:bg-white/10 active:bg-white/15 sm:px-4"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-medium text-white/60">
                {formatPostDate(post.publishedAt)} · von {post.authorName}
              </span>
              <span className="font-ui mt-1 block text-[18px] leading-snug font-semibold tracking-tight text-white">
                {post.title}
              </span>
              <span className="mt-1 line-clamp-2 block text-[15px] leading-snug text-white/70">
                {formatExcerpt(post.content)}
              </span>
            </span>
            <ChevronRight size={20} className="shrink-0 text-white/50" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
