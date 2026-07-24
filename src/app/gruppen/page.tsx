import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getActiveGroupId, getMyGroups } from "./actions";
import CreateGroupForm from "@/components/CreateGroupForm";
import GroupList from "@/components/GroupList";

export const metadata: Metadata = {
  title: "Tippgruppen",
  robots: { index: false, follow: false },
};

export default async function GruppenPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const groups = await getMyGroups();
  const activeGroupId = await getActiveGroupId();

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-bold text-white">Tippgruppen</h1>
      <p className="mt-3 text-white/70">
        Erstelle eigene Gruppen oder tritt per Einladungslink bei. Die aktive Gruppe bestimmt
        deine Gruppen-Rangliste im Tippspiel.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <GroupList groups={groups} activeGroupId={activeGroupId} />
        <CreateGroupForm />
      </div>
    </section>
  );
}
