"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteUser } from "@/app/admin/actions";

export default function DeleteUserButton({ userId, userName }: { userId: string; userName: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm(`Nutzer "${userName}" wirklich löschen?`)) return;
    startTransition(async () => {
      await deleteUser(userId);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      aria-label="Nutzer löschen"
      className="rounded-full p-2 text-white/50 transition hover:bg-white/10 hover:text-red-400 disabled:opacity-50"
    >
      <Trash2 size={16} />
    </button>
  );
}
