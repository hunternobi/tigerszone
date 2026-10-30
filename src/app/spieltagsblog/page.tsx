import type { Metadata } from "next";
import Image from "next/image";
import BlogArchiveList from "@/components/BlogArchiveList";
import FadingBackground from "@/components/FadingBackground";
import LiquidGlassScene from "@/components/LiquidGlassScene";
import { FANS_SCENE } from "@/lib/glassScenes";
import PillButton from "@/components/PillButton";
import { getAllBlogPosts } from "@/lib/blogPosts";
import { formatPostDate } from "@/utils/format";

export const metadata: Metadata = {
  title: "Spieltagsblog",
  description:
    "Berichte, Vorschauen und Rückblicke rund um die Spiele der Straubing Tigers – geschrieben von Fans für Fans.",
  alternates: { canonical: "/spieltagsblog" },
};

// The archive teaser on this page; everything older lives on /spieltagsblog/archiv.
const ARCHIVE_PREVIEW_COUNT = 3;

export default async function SpieltagsblogPage() {
  const posts = await getAllBlogPosts();
  const [latestPost, ...olderPosts] = posts;
  const recentPosts = olderPosts.slice(0, ARCHIVE_PREVIEW_COUNT);

  return (
    <>
      <FadingBackground
        src="/images/Fans.jpg"
        opacity={FANS_SCENE.opacity}
        blurPx={FANS_SCENE.blurPx}
      >
        <LiquidGlassScene background={FANS_SCENE}>
          <section className="mx-auto max-w-3xl px-7 py-10 sm:px-6 sm:py-16">
            <h1 className="font-ui text-[2.15rem] leading-[1.06] font-semibold tracking-tight text-white sm:text-5xl">
              Spieltagsblog
            </h1>

            {!latestPost ? (
              <p
                data-liquid-glass="card"
                className="glass-panel mt-8 p-5 text-center text-[1.0625rem] text-white/85 sm:p-8"
              >
                Noch keine Beiträge vorhanden.
              </p>
            ) : (
              <article
                data-liquid-glass="card"
                className="glass-panel mt-6 p-5 sm:mt-8 sm:p-8"
              >
                <p className="font-ui text-[0.6875rem] font-semibold tracking-[0.14em] text-white/60 uppercase sm:text-xs">
                  Neuester Beitrag · {formatPostDate(latestPost.publishedAt)}
                </p>
                <h2 className="font-ui mt-2 text-[1.5rem] leading-[1.15] font-semibold tracking-tight text-balance text-white sm:text-4xl">
                  {latestPost.title}
                </h2>

                <div className="mt-5 space-y-4 text-[1.0625rem] leading-[1.6] text-white/90">
                  {latestPost.content.split("\n\n").map((paragraph, index) => (
                    <p key={index} className="whitespace-pre-line">
                      {paragraph}
                    </p>
                  ))}
                </div>

                <p className="mt-6 text-right text-[0.8125rem] text-white/60">
                  von {latestPost.authorName}
                </p>
              </article>
            )}

            {olderPosts.length > 0 && (
              <div className="mt-12">
                <h2 className="font-ui text-[1.625rem] font-semibold tracking-tight text-white sm:text-4xl">
                  Spieltagsarchiv
                </h2>

                <div className="mt-4 sm:mt-5">
                  <BlogArchiveList posts={recentPosts} />
                </div>

                {olderPosts.length > ARCHIVE_PREVIEW_COUNT && (
                  <div className="mt-6 text-center">
                    <PillButton href="/spieltagsblog/archiv">
                      Zum gesamten Spieltagsarchiv
                    </PillButton>
                  </div>
                )}
              </div>
            )}
          </section>
        </LiquidGlassScene>
      </FadingBackground>

      <section className="relative overflow-hidden border-t border-white/10 bg-tigers-primary px-7 py-12 text-center sm:px-6 sm:py-16">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Image
            src="/images/tigers_corner_logo_transparent.png"
            alt=""
            width={550}
            height={309}
            className="scale-110 opacity-40 blur-[1.5px]"
          />
        </div>

        <div className="relative">
          <h2 className="font-ui text-[2rem] leading-tight font-semibold tracking-tight text-white sm:text-5xl">
            Über den Autor
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-snug text-white/75 sm:text-lg">
            Ein besonderer Dank geht an unsere Freunde von der TigersCorner, die
            sich hier mit einbringen – lasst gerne auch bei ihnen Support da.
          </p>
          <div className="mt-6">
            <PillButton href="http://tigers-corner.de/" external>
              Zur TigersCorner
            </PillButton>
          </div>
        </div>
      </section>
    </>
  );
}
