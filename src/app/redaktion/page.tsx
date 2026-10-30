import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAllBlogPosts } from "@/lib/blogPosts";
import CreateBlogPostForm from "@/components/CreateBlogPostForm";
import DeletePostButton from "@/components/DeletePostButton";

export const metadata: Metadata = {
  title: "Redaktion",
  robots: { index: false, follow: false },
};

export default async function RedaktionPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin" && session.user.role !== "redakteur") redirect("/");

  const posts = await getAllBlogPosts();

  return (
    <section className="mx-auto max-w-4xl px-7 py-10 sm:px-6 sm:py-16">
      <h1 className="font-ui text-[2.15rem] leading-[1.06] font-semibold tracking-tight text-white sm:text-5xl">Redaktion</h1>
      <p className="mt-3 text-white">
        Neue Spieltagsblog-Beiträge verfassen und veröffentlichen.
      </p>

      <div className="mt-8">
        <CreateBlogPostForm />
      </div>

      <h2 className="mt-16 text-xl font-bold text-white">Bisherige Beiträge</h2>
      <div className="mt-4 space-y-3">
        {posts.map((post) => (
          <div key={post._id} className="glass-panel-sm flex items-center justify-between gap-4 p-4">
            <div>
              <p className="font-semibold text-white">{post.title}</p>
              <p className="text-xs text-white">
                {new Date(post.publishedAt).toLocaleDateString("de-DE")} · {post.authorName}
              </p>
            </div>
            <DeletePostButton postId={post._id} />
          </div>
        ))}
      </div>
    </section>
  );
}
