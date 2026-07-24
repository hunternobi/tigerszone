import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getGroupPreview } from "@/app/gruppen/actions";
import JoinGroupButton from "@/components/JoinGroupButton";

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
    redirect(`/login?callbackUrl=${encodeURIComponent(`/gruppen/join/${code}`)}`);
  }

  return (
    <section className="mx-auto max-w-md px-6 py-16 text-center">
      <h1 className="text-2xl font-bold text-white">Gruppe beitreten</h1>
      <p className="mt-3 text-white/70">
        Du wurdest eingeladen, der Gruppe <strong className="text-white">{preview.name}</strong>{" "}
        beizutreten.
      </p>
      <div className="mt-6 flex justify-center">
        <JoinGroupButton inviteCode={code} />
      </div>
    </section>
  );
}
