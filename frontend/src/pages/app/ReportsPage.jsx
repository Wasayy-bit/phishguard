import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import api, { formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Warning, Plus, MagnifyingGlass } from "@phosphor-icons/react";

export default function ReportsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("browse");
  const [reports, setReports] = useState([]);
  const [mine, setMine] = useState([]);
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // form
  const [form, setForm] = useState({
    url: "",
    target_brand: "",
    description: "",
    evidence: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState("");
  const [submitOk, setSubmitOk] = useState("");

  const loadAll = async () => {
    setLoading(true);
    try {
      const [pub, mineRes] = await Promise.all([
        api.get("/reports", { params: { q: q || undefined } }),
        api.get("/reports", { params: { mine: true } }),
      ]);
      setReports(pub.data.items || []);
      setMine(mineRes.data.items || []);
    } catch (e) {
      setErr(formatApiError(e, "Could not load reports"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitErr("");
    setSubmitOk("");
    try {
      const payload = {
        url: form.url.trim(),
        target_brand: form.target_brand.trim(),
        description: form.description.trim(),
        evidence: form.evidence
          ? form.evidence
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
      };
      await api.post("/reports", payload);
      setSubmitOk(
        "Report submitted! It is pending moderator approval before public listing.",
      );
      setForm({ url: "", target_brand: "", description: "", evidence: "" });
      loadAll();
    } catch (e) {
      setSubmitErr(formatApiError(e, "Could not submit report"));
    } finally {
      setSubmitting(false);
    }
  };

  const list = tab === "browse" ? reports : mine;

  return (
    <AppShell>
      <div className="flex flex-col gap-2 mb-8">
        <span className="pg-overline">Community Threat Intelligence</span>
        <h1 className="font-display text-3xl lg:text-4xl tracking-tight">
          Reports
        </h1>
        <p className="text-white/60 max-w-2xl">
          Browse community-approved phishing reports or submit a new one. All
          submissions are moderated by an administrator before becoming public.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <TabBtn
          active={tab === "browse"}
          onClick={() => setTab("browse")}
          testId="reports-tab-browse"
        >
          <MagnifyingGlass size={14} /> Browse public
        </TabBtn>
        <TabBtn
          active={tab === "mine"}
          onClick={() => setTab("mine")}
          testId="reports-tab-mine"
        >
          <Warning size={14} /> My reports ({mine.length})
        </TabBtn>
        <TabBtn
          active={tab === "submit"}
          onClick={() => setTab("submit")}
          testId="reports-tab-submit"
        >
          <Plus size={14} /> Submit
        </TabBtn>
      </div>

      {tab === "browse" && (
        <div className="flex gap-3 mb-6">
          <div className="flex items-center gap-2 pg-input flex-1">
            <MagnifyingGlass size={18} className="text-white/40" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search url, brand or description…"
              className="bg-transparent outline-none flex-1 mono text-sm"
              data-testid="reports-search-input"
              onKeyDown={(e) => {
                if (e.key === "Enter") loadAll();
              }}
            />
          </div>
          <button
            onClick={loadAll}
            className="pg-btn-secondary"
            data-testid="reports-search-btn"
          >
            Search
          </button>
        </div>
      )}

      {err && <p className="text-[var(--pg-danger)]">{err}</p>}

      {/* Submit form */}
      {tab === "submit" && (
        <form
          onSubmit={submit}
          className="pg-card p-6 lg:p-8 space-y-5 max-w-3xl"
          data-testid="report-submit-form"
        >
          <div>
            <label className="pg-overline mb-2 block">Phishing URL</label>
            <input
              required
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className="pg-input mono"
              placeholder="http://malicious-site.example/"
              data-testid="report-url-input"
            />
          </div>
          <div>
            <label className="pg-overline mb-2 block">Target Brand</label>
            <input
              required
              value={form.target_brand}
              onChange={(e) =>
                setForm({ ...form, target_brand: e.target.value })
              }
              className="pg-input"
              placeholder="e.g. PayPal, Microsoft, your bank"
              data-testid="report-brand-input"
            />
          </div>
          <div>
            <label className="pg-overline mb-2 block">Description</label>
            <textarea
              required
              rows={5}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="pg-input"
              placeholder="Describe how you encountered it, what it impersonates, what it tried to steal…"
              data-testid="report-description-input"
            />
          </div>
          <div>
            <label className="pg-overline mb-2 block">
              Evidence (one URL or note per line)
            </label>
            <textarea
              rows={3}
              value={form.evidence}
              onChange={(e) => setForm({ ...form, evidence: e.target.value })}
              className="pg-input mono"
              placeholder="screenshot link or note"
              data-testid="report-evidence-input"
            />
          </div>
          {submitErr && (
            <p
              className="text-sm text-[var(--pg-danger)]"
              data-testid="report-submit-error"
            >
              {submitErr}
            </p>
          )}
          {submitOk && (
            <p
              className="text-sm text-[var(--pg-safe)]"
              data-testid="report-submit-success"
            >
              {submitOk}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="pg-btn-primary"
            data-testid="report-submit-button"
          >
            {submitting ? "Submitting…" : "Submit report"}
          </button>
        </form>
      )}

      {/* List */}
      {tab !== "submit" && (
        <>
          {loading ? (
            <div className="pg-card p-10 text-center">
              <p className="pg-overline pg-pulse-dot text-white/60">Loading</p>
            </div>
          ) : list.length === 0 ? (
            <div
              className="pg-card p-12 text-center"
              data-testid="reports-empty"
            >
              <p className="font-display text-xl mb-2">No reports yet</p>
              <p className="text-sm text-white/50">
                {tab === "mine"
                  ? "You haven't submitted any reports."
                  : "No approved community reports match your search."}
              </p>
            </div>
          ) : (
            <div
              className="grid md:grid-cols-2 gap-4"
              data-testid="reports-list"
            >
              {list.map((r) => (
                <ReportCard key={r.id} r={r} />
              ))}
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}

function TabBtn({ active, onClick, children, testId }) {
  return (
    <button
      onClick={onClick}
      className={`pg-btn-secondary ${active ? "!bg-white/10 !border-white/40 !text-white" : ""}`}
      data-testid={testId}
    >
      {children}
    </button>
  );
}

function ReportCard({ r }) {
  const statusCls =
    r.status === "approved"
      ? "pg-badge-safe"
      : r.status === "rejected"
        ? "pg-badge-danger"
        : "pg-badge-warn";
  return (
    <div
      className="pg-card pg-card-hoverable p-6"
      data-testid={`report-card-${r.id}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="pg-overline">{r.target_brand}</span>
        <span className={`pg-badge ${statusCls}`}>{r.status}</span>
      </div>
      <p className="mono text-sm text-white break-all">{r.url}</p>
      <p className="text-sm text-white/60 mt-3 leading-relaxed line-clamp-4">
        {r.description}
      </p>
      <div className="flex items-center justify-between mt-4 text-xs mono text-white/40">
        <span>by {r.submitted_by_name || "anon"}</span>
        <span>
          {r.created_at ? new Date(r.created_at).toLocaleDateString() : ""}
        </span>
      </div>
    </div>
  );
}
