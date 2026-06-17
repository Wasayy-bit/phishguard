import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import api, { formatApiError } from "@/lib/api";
import { Check, X, Trash } from "@phosphor-icons/react";

export default function AdminReportsPage() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const params = filter === "all" ? {} : { status: filter };
      const { data } = await api.get("/reports", { params });
      setItems(data.items || []);
    } catch (e) {
      setErr(formatApiError(e, "Could not load reports"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const setStatus = async (id, status) => {
    try {
      await api.put(`/reports/${id}`, { status });
      load();
    } catch (e) {
      alert(formatApiError(e, "Update failed"));
    }
  };
  const remove = async (id) => {
    if (!confirm("Delete this report permanently?")) return;
    try {
      await api.delete(`/reports/${id}`);
      load();
    } catch (e) {
      alert(formatApiError(e, "Delete failed"));
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-2 mb-8">
        <span className="pg-overline text-[var(--pg-brand)]">
          Administrator
        </span>
        <h1 className="font-display text-3xl lg:text-4xl tracking-tight">
          Report Moderation
        </h1>
      </div>

      <div className="flex gap-2 mb-6">
        {["pending", "approved", "rejected", "all"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`pg-btn-secondary ${filter === s ? "!bg-white/10 !border-white/40 !text-white" : ""}`}
            data-testid={`admin-filter-${s}`}
          >
            {s}
          </button>
        ))}
      </div>

      {err && <p className="text-[var(--pg-danger)]">{err}</p>}

      {loading ? (
        <div className="pg-card p-10 text-center">
          <p className="pg-overline pg-pulse-dot text-white/60">Loading</p>
        </div>
      ) : items.length === 0 ? (
        <div
          className="pg-card p-12 text-center"
          data-testid="admin-reports-empty"
        >
          <p className="font-display text-xl mb-2">Empty queue</p>
          <p className="text-sm text-white/50">No reports in this category.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((r) => (
            <div
              key={r.id}
              className="pg-card p-6"
              data-testid={`admin-report-${r.id}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="pg-overline">{r.target_brand}</span>
                <span
                  className={`pg-badge ${
                    r.status === "approved"
                      ? "pg-badge-safe"
                      : r.status === "rejected"
                        ? "pg-badge-danger"
                        : "pg-badge-warn"
                  }`}
                >
                  {r.status}
                </span>
              </div>
              <p className="mono text-sm text-white break-all">{r.url}</p>
              <p className="text-sm text-white/60 mt-3 leading-relaxed">
                {r.description}
              </p>
              <div className="flex items-center justify-between mt-4 text-xs mono text-white/40">
                <span>by {r.submitted_by_name || "anon"}</span>
                <span>
                  {r.created_at ? new Date(r.created_at).toLocaleString() : ""}
                </span>
              </div>
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => setStatus(r.id, "approved")}
                  className="pg-btn-primary"
                  data-testid={`admin-approve-${r.id}`}
                >
                  <Check size={14} /> Approve
                </button>
                <button
                  onClick={() => setStatus(r.id, "rejected")}
                  className="pg-btn-secondary"
                  data-testid={`admin-reject-${r.id}`}
                >
                  <X size={14} /> Reject
                </button>
                <button
                  onClick={() => remove(r.id)}
                  className="pg-btn-secondary !text-[var(--pg-danger)] !border-red-500/30 hover:!bg-red-500/10"
                  data-testid={`admin-delete-${r.id}`}
                >
                  <Trash size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
