"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ChangeEvent } from "react";
import { setUserRole } from "@/app/admin/actions";
import type { UserRole } from "@/types";

export default function RoleToggle({ userId, role }: { userId: string; role: UserRole }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value as UserRole;
    setError(null);
    startTransition(async () => {
      const result = await setUserRole(userId, newRole);
      if (!result.success) {
        setError(result.error ?? "Rolle konnte nicht geändert werden.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div>
      <select
        value={role}
        onChange={handleChange}
        disabled={isPending}
        className="glass-panel-sm rounded-lg bg-transparent px-2 py-1 text-xs text-white disabled:opacity-50"
      >
        <option className="text-black" value="user">
          Nutzer
        </option>
        <option className="text-black" value="redakteur">
          Redakteur
        </option>
        <option className="text-black" value="admin">
          Admin
        </option>
      </select>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
