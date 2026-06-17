import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import VerdictBadge from "@/components/VerdictBadge";
import api, { formatApiError } from "@/lib/api";
import { Trash, MagnifyingGlass, ArrowsClockwise } from "@phosphor-icons/react";

export default function HistoryPage() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/scan/history?limit=200");
      setItems(data.items || []);
    } catch (e) {
      setErr(formatApiError(e, "Could not load history"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!confirm("Delete this scan from your history?")) return;
    try {
      await api.delete(`/scan/${id}`);
      setItems((arr) => arr.filter((i) => i.id !== id));
    } catch (e) {
      alert(formatApiError(e, "Could not delete"));
    }
  };

  const filtered = items.filter((it) => {
    if (filter !== "All" && it.verdict !== filter) return false;
    if (q && !it.url.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <AppShell>
      <div className="flex flex-col gap-2 mb-8">
        <span className="pg-overline">All your scans</span>
        <h1 className="font-display text-3xl lg:text-4xl tracking-tight">
          Scan History
        </h1>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex items-center gap-2 pg-input flex-1">
          <MagnifyingGlass size={18} className="text-white/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter by URL…"
            className="bg-transparent outline-none flex-1 mono text-sm"
            data-testid="history-filter-input"
          />
        </div>
        <div className="flex gap-2">
          {["All", "Safe", "Suspicious", "Malicious"].map((v) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              className={`pg-btn-secondary ${
                filter === v ? "!bg-white/10 !border-white/40 !text-white" : ""
              }`}
              data-testid={`history-filter-${v.toLowerCase()}`}
            >
              {v}
            </button>
          ))}
          <button
            onClick={load}
            className="pg-btn-secondary"
            title="Refresh"
            data-testid="history-refresh-btn"
          >
            <ArrowsClockwise size={16} />
          </button>
        </div>
      </div>

      {err && <p className="text-[var(--pg-danger)]">{err}</p>}

      {loading ? (
        <div className="pg-card p-10 text-center">
          <p className="pg-overline pg-pulse-dot text-white/60">Loading</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="pg-card p-12 text-center" data-testid="history-empty">
          <p className="font-display text-xl mb-2">Nothing here yet</p>
          <p className="text-sm text-white/50">
            Go to the Scan page and analyse a few URLs.
          </p>
        </div>
      ) : (
        <div className="pg-card overflow-x-auto" data-testid="history-table">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-white/10">
                <th className="px-4 py-3 pg-overline">URL</th>
                <th className="px-4 py-3 pg-overline">Host</th>
                <th className="px-4 py-3 pg-overline">Score</th>
                <th className="px-4 py-3 pg-overline">Verdict</th>
                <th className="px-4 py-3 pg-overline">Scanned</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((it) => (
                <tr
                  key={it.id}
                  className="border-b border-white/5 hover:bg-white/[0.02]"
                  data-testid={`history-row-${it.id}`}
                >
                  <td className="px-4 py-3 mono text-xs text-white/80 max-w-xs truncate">
                    {it.url}
                  </td>
                  <td className="px-4 py-3 mono text-xs text-white/60">
                    {it.host}
                  </td>
                  <td className="px-4 py-3 mono">{it.risk_score}</td>
                  <td className="px-4 py-3">
                    <VerdictBadge verdict={it.verdict} />
                  </td>
                  <td className="px-4 py-3 mono text-xs text-white/50">
                    {it.created_at
                      ? new Date(it.created_at).toLocaleString()
                      : ""}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => remove(it.id)}
                      className="text-white/50 hover:text-[var(--pg-danger)]"
                      title="Delete"
                      data-testid={`history-delete-${it.id}`}
                    >
                      <Trash size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
