import Image from "next/image";
import FadingBackground from "@/components/FadingBackground";
import { getAllBlogPosts } from "@/lib/blogPosts";

function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function SpieltagsblogPage() {
  const posts = await getAllBlogPosts();

  return (
    <>
      <FadingBackground src="/images/Fans.jpg" opacity={0.55} blurPx={1.5}>
        <section className="mx-auto max-w-5xl px-6 py-16">
          <h1 className="text-3xl font-bold text-white">Spieltagsblog</h1>
          <p className="mt-3 text-white/70">
            Berichte, Vorschauen und Rückblicke rund um die Spiele der Straubing Tigers.
          </p>

          {posts.length === 0 ? (
            <p className="glass-panel mt-8 p-8 text-center text-white/60">
              Noch keine Beiträge vorhanden.
            </p>
          ) : (
            posts.map((post) => (
              <article key={post._id} className="glass-panel mt-8 p-8">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="text-2xl font-bold text-white sm:text-3xl">{post.title}</h2>
                  <span className="shrink-0 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70">
                    {formatPostDate(post.publishedAt)}
                  </span>
                </div>

                <div className="mt-6 space-y-4 text-white/80">
                  {post.content.split("\n\n").map((paragraph, index) => (
                    <p key={index} className="whitespace-pre-line">
                      {paragraph}
                    </p>
                  ))}
                </div>

                <p className="mt-4 text-right text-xs text-white/40">von {post.authorName}</p>
              </article>
            ))
          )}
        </section>
      </FadingBackground>

      <section className="relative overflow-hidden border-t border-white/10 bg-tigers-primary px-6 py-16 text-center">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Image
            src="/images/tigers_corner_logo_transparent.png"
            alt=""
            width={550}
            height={309}
            className="scale-110 opacity-55 blur-[1.5px]"
          />
        </div>

        <div className="relative">
          <h2 className="text-3xl font-bold text-white">Über den Autor</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/70">
            Ein besonderer Dank geht an unsere Freunde von der TigersCorner, die sich hier mit
            einbringen – lasst gerne auch bei ihnen Support da.
          </p>
          <a
            href="http://tigers-corner.de/"
            target="_blank"
            rel="noopener noreferrer"
            className="glass-pill glass-pill-primary glass-interactive mt-6 inline-block px-6 py-3 font-semibold text-white"
          >
            Zur TigersCorner
          </a>
        </div>
      </section>
    </>
  );
}
