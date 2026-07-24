import type { AdminGroupRow } from "@/lib/adminGroups";
import DeleteGroupButton from "@/components/DeleteGroupButton";

export default function AdminGroupTable({ groups }: { groups: AdminGroupRow[] }) {
  if (groups.length === 0) {
    return <p className="glass-panel p-6 text-sm text-white/60">Noch keine Gruppen vorhanden.</p>;
  }

  return (
    <div className="glass-panel overflow-x-auto p-6">
      <table className="w-full min-w-[480px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-white/50">
            <th className="py-2 pr-4 font-medium">Name</th>
            <th className="py-2 pr-4 font-medium">Ersteller</th>
            <th className="py-2 pr-4 font-medium">Mitglieder</th>
            <th className="py-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <tr key={group._id} className="border-b border-white/5 last:border-0">
              <td className="py-3 pr-4 font-semibold text-white">{group.name}</td>
              <td className="py-3 pr-4 text-white/70">{group.ownerName}</td>
              <td className="py-3 pr-4 text-white/70">{group.memberCount}</td>
              <td className="py-3 text-right">
                <DeleteGroupButton groupId={group._id} groupName={group.name} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
