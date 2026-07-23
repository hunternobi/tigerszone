import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAllBlogPosts } from "@/lib/blogPosts";
import CreateBlogPostForm from "@/components/CreateBlogPostForm";

export default async function RedaktionPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin" && session.user.role !== "redakteur") redirect("/");

  const posts = await getAllBlogPosts();

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold text-white">Redaktion</h1>
      <p className="mt-3 text-white/70">
        Neue Spieltagsblog-Beiträge verfassen und veröffentlichen.
      </p>

      <div className="mt-8">
        <CreateBlogPostForm />
      </div>

      <h2 className="mt-16 text-xl font-bold text-white">Bisherige Beiträge</h2>
      <div className="mt-4 space-y-3">
        {posts.map((post) => (
          <div key={post._id} className="glass-panel-sm p-4">
            <p className="font-semibold text-white">{post.title}</p>
            <p className="text-xs text-white/50">
              {new Date(post.publishedAt).toLocaleDateString("de-DE")} · {post.authorName}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
