import type { AdminUserRow } from "@/lib/adminUsers";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function AdminUserTable({ users }: { users: AdminUserRow[] }) {
  if (users.length === 0) {
    return <p className="glass-panel p-6 text-sm text-white/60">Noch keine Nutzer registriert.</p>;
  }

  return (
    <div className="glass-panel overflow-x-auto p-6">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-white/50">
            <th className="py-2 pr-4 font-medium">Name</th>
            <th className="py-2 pr-4 font-medium">E-Mail</th>
            <th className="py-2 pr-4 font-medium">Rolle</th>
            <th className="py-2 pr-4 font-medium">Registriert am</th>
            <th className="py-2 font-medium">Gruppen</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="border-b border-white/5 last:border-0">
              <td className="py-3 pr-4 font-semibold text-white">{user.name}</td>
              <td className="py-3 pr-4 text-white/70">{user.email}</td>
              <td className="py-3 pr-4">
                {user.role === "admin" ? (
                  <span className="rounded-full bg-tigers-accent px-3 py-1 text-xs font-semibold text-white">
                    Admin
                  </span>
                ) : (
                  <span className="text-white/60">Nutzer</span>
                )}
              </td>
              <td className="py-3 pr-4 text-white/70">{formatDate(user.createdAt)}</td>
              <td className="py-3 text-white/70">
                {user.groups.length > 0 ? user.groups.join(", ") : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
