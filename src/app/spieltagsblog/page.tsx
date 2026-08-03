import type { Metadata } from "next";
import Image from "next/image";
import FadingBackground from "@/components/FadingBackground";
import GlassButtonExact from "@/components/GlassButtonExact";
import { getAllBlogPosts } from "@/lib/blogPosts";
import { formatExcerpt, formatPostDate } from "@/utils/format";

export const metadata: Metadata = {
  title: "Spieltagsblog",
  description:
    "Berichte, Vorschauen und Rückblicke rund um die Spiele der Straubing Tigers – geschrieben von Fans für Fans.",
  alternates: { canonical: "/spieltagsblog" },
};

export default async function SpieltagsblogPage() {
  const posts = await getAllBlogPosts();
  const [latestPost, ...olderPosts] = posts;

  return (
    <>
      <FadingBackground src="/images/Fans.jpg" opacity={0.55} blurPx={1.5}>
        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
          <h1 className="text-3xl font-bold text-white">Spieltagsblog</h1>
          <p className="mt-3 text-white">
            Berichte, Vorschauen und Rückblicke rund um die Spiele der Straubing Tigers.
          </p>

          {!latestPost ? (
            <p className="glass-panel mt-8 p-5 text-center text-white sm:p-8">
              Noch keine Beiträge vorhanden.
            </p>
          ) : (
            <article className="glass-panel mt-8 p-5 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="text-xl font-bold text-white sm:text-3xl">{latestPost.title}</h2>
                <span className="shrink-0 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white">
                  {formatPostDate(latestPost.publishedAt)}
                </span>
              </div>

              <div className="mt-6 space-y-4 text-white">
                {latestPost.content.split("\n\n").map((paragraph, index) => (
                  <p key={index} className="whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </div>

              <p className="mt-4 text-right text-xs text-white">von {latestPost.authorName}</p>
            </article>
          )}

          {olderPosts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">Spieltagsarchiv</h2>

              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {olderPosts.map((post) => (
                  <article
                    key={post._id}
                    className="glass-panel-sm glass-interactive flex flex-col p-5 sm:p-6"
                  >
                    <span className="w-fit shrink-0 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white">
                      {formatPostDate(post.publishedAt)}
                    </span>

                    <h3 className="mt-4 text-lg font-bold text-white">{post.title}</h3>
                    <p className="mt-2 flex-1 text-sm text-white">
                      {formatExcerpt(post.content)}
                    </p>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                      <span className="text-xs text-white">von {post.authorName}</span>
                      <GlassButtonExact href={`/spieltagsblog/${post._id}`} size="0.75rem">
                        Weiterlesen
                      </GlassButtonExact>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      </FadingBackground>

      <section className="relative overflow-hidden border-t border-white/10 bg-tigers-primary px-4 py-12 text-center sm:px-6 sm:py-16">
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
          <p className="mx-auto mt-3 max-w-xl text-white">
            Ein besonderer Dank geht an unsere Freunde von der TigersCorner, die sich hier mit
            einbringen – lasst gerne auch bei ihnen Support da.
          </p>
          <GlassButtonExact href="http://tigers-corner.de/" size="1rem" wrapperClassName="mt-6">
            Zur TigersCorner
          </GlassButtonExact>
        </div>
      </section>
    </>
  );
}
