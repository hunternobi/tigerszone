import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getGroupPreview } from "@/app/gruppen/actions";
import FadingBackground from "@/components/FadingBackground";
import JoinGroupButton from "@/components/JoinGroupButton";
import LiquidGlassScene from "@/components/LiquidGlassScene";
import { JUBEL_SCENE } from "@/lib/glassScenes";

export const metadata: Metadata = {
  title: "Gruppe beitreten",
  robots: { index: false, follow: false },
};

interface JoinGroupPageProps {
  params: Promise<{ code: string }>;
}

export default async function JoinGroupPage({ params }: JoinGroupPageProps) {
  const { code } = await params;
  const preview = await getGroupPreview(code);
  if (!preview) notFound();

  const session = await auth();
  if (!session?.user) {
    redirect(
      `/login?callbackUrl=${encodeURIComponent(`/gruppen/join/${code}`)}`,
    );
  }

  return (
    <FadingBackground
      src="/images/jubel.jpg"
      opacity={JUBEL_SCENE.opacity}
      blurPx={JUBEL_SCENE.blurPx}
    >
      <LiquidGlassScene background={JUBEL_SCENE}>
        <section className="mx-auto max-w-md px-7 py-16 text-center sm:px-6 sm:py-24">
          <div data-liquid-glass="card" className="glass-panel p-6 sm:p-8">
            <p className="font-ui text-[11px] font-semibold tracking-[0.14em] text-white/60 uppercase sm:text-xs">
              Einladung
            </p>
            <h1 className="font-ui mt-2 text-[28px] leading-[1.1] font-semibold tracking-tight text-balance text-white sm:text-4xl">
              {preview.name}
            </h1>
            <p className="mt-3 text-[16px] leading-snug text-white/80">
              <strong className="font-semibold text-white">
                {preview.ownerName}
              </strong>{" "}
              hat dich eingeladen, dieser Tippspiel-Gruppe beizutreten.
            </p>
            <div className="mt-6 flex justify-center">
              <JoinGroupButton inviteCode={code} />
            </div>
          </div>
        </section>
      </LiquidGlassScene>
    </FadingBackground>
  );
}
