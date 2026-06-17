import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import api, { formatApiError } from "@/lib/api";
import { User } from "@phosphor-icons/react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    api
      .get("/admin/users")
      .then((r) => setUsers(r.data.items || []))
      .catch((e) => setErr(formatApiError(e, "Could not load users")));
  }, []);

  return (
    <AppShell>
      <div className="flex flex-col gap-2 mb-8">
        <span className="pg-overline text-[var(--pg-brand)]">
          Administrator
        </span>
        <h1 className="font-display text-3xl lg:text-4xl tracking-tight">
          Users
        </h1>
      </div>

      {err && <p className="text-[var(--pg-danger)]">{err}</p>}

      <div className="pg-card overflow-x-auto" data-testid="admin-users-table">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-white/10">
              <th className="px-4 py-3 pg-overline"></th>
              <th className="px-4 py-3 pg-overline">Name</th>
              <th className="px-4 py-3 pg-overline">Email</th>
              <th className="px-4 py-3 pg-overline">Role</th>
              <th className="px-4 py-3 pg-overline">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-b border-white/5 hover:bg-white/[0.02]"
                data-testid={`admin-user-${u.id}`}
              >
                <td className="px-4 py-3">
                  <User size={18} weight="duotone" className="text-white/40" />
                </td>
                <td className="px-4 py-3">{u.display_name}</td>
                <td className="px-4 py-3 mono text-xs text-white/70">
                  {u.email}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`pg-badge ${
                      u.role === "admin" ? "pg-badge-safe" : "pg-badge-neutral"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 mono text-xs text-white/50">
                  {u.created_at
                    ? new Date(u.created_at).toLocaleDateString()
                    : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
