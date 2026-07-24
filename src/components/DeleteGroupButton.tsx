"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteGroup } from "@/app/admin/actions";

export default function DeleteGroupButton({ groupId, groupName }: { groupId: string; groupName: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm(`Gruppe "${groupName}" wirklich löschen?`)) return;
    startTransition(async () => {
      await deleteGroup(groupId);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      aria-label="Gruppe löschen"
      className="rounded-full p-2 text-white/50 transition hover:bg-white/10 hover:text-red-400 disabled:opacity-50"
    >
      <Trash2 size={16} />
    </button>
  );
}
