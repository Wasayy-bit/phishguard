import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import VerdictBadge, { verdictMeta } from "@/components/VerdictBadge";
import api, { formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  MagnifyingGlass,
  CheckCircle,
  XCircle,
  ArrowsClockwise,
  Sparkle,
} from "@phosphor-icons/react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get("/scan/history?limit=5");
      setHistory(data.items || []);
    } catch (e) {
      /* silently ignore */
    }
  };

  useEffect(() => {
    fetchHistory();
    const pending = sessionStorage.getItem("pg_pending_url");
    if (pending) {
      setUrl(pending);
      sessionStorage.removeItem("pg_pending_url");
    }
  }, []);

  const onScan = async (e) => {
    e?.preventDefault?.();
    setError("");
    setResult(null);
    if (!url.trim()) return;
    setScanning(true);
    try {
      const { data } = await api.post("/scan", { url });
      setResult(data);
      fetchHistory();
    } catch (e) {
      setError(formatApiError(e, "Unable to scan URL"));
    } finally {
      setScanning(false);
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-2 mb-8">
        <span className="pg-overline">
          Welcome, {user?.display_name?.split(" ")[0] || "User"}
        </span>
        <h1 className="font-display text-3xl lg:text-4xl tracking-tight">
          URL Scanner Console
        </h1>
        <p className="text-white/60 max-w-2xl">
          Submit any URL below. The heuristic engine returns an explainable
          verdict in real time and every scan is saved to your history.
        </p>
      </div>

      {/* Scanner */}
      <form
        onSubmit={onScan}
        className="pg-glow-border pg-card p-2 flex flex-col sm:flex-row gap-2"
        data-testid="dashboard-scan-form"
      >
        <div className="flex items-center gap-3 px-4 flex-1">
          <MagnifyingGlass size={20} className="text-white/40" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/login"
            className="bg-transparent outline-none flex-1 py-3 mono text-sm placeholder:text-white/30"
            data-testid="dashboard-scan-input"
          />
        </div>
        <button
          type="submit"
          disabled={scanning}
          className="pg-btn-primary px-6 min-w-[160px]"
          data-testid="dashboard-scan-submit"
        >
          {scanning ? (
            "Scanning…"
          ) : (
            <>
              Scan URL <Sparkle size={16} weight="bold" />
            </>
          )}
        </button>
      </form>
      {error && (
        <p
          className="mt-3 text-sm text-[var(--pg-danger)]"
          data-testid="dashboard-scan-error"
        >
          {error}
        </p>
      )}

      {/* Result */}
      {result && <ScanResultPanel result={result} />}

      {/* Quick stats / recent */}
      <div className="grid lg:grid-cols-3 gap-4 mt-10">
        <RecentScansCard items={history} />
        <TipCard
          title="Always check the TLD"
          body="Phishers love cheap or free TLDs like .tk, .ml, .ga, .cf and .xyz. Legitimate brands almost never use them."
        />
        <TipCard
          title="Inspect, then click"
          body="Hover any link to preview its destination. On mobile, long-press. If the URL doesn't match the brand exactly, don't click."
        />
      </div>
    </AppShell>
  );
}

function ScanResultPanel({ result }) {
  const m = verdictMeta(result.verdict);
  return (
    <div
      className="mt-8 pg-card p-6 lg:p-8"
      data-testid="dashboard-scan-result"
    >
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <span className="pg-overline">Verdict</span>
          <div className="mt-3 flex items-center gap-3">
            <m.icon size={42} weight="duotone" style={{ color: m.color }} />
            <div>
              <p className="font-display text-3xl" style={{ color: m.color }}>
                {m.label}
              </p>
              <p className="mono text-xs text-white/50 mt-1">
                Risk score &nbsp;{result.risk_score} / 100
              </p>
            </div>
          </div>
          <div className="pg-risk-bar mt-5">
            <div
              className="pg-risk-fill"
              style={{
                width: `${result.risk_score}%`,
                backgroundColor: m.color,
              }}
            />
          </div>

          <div className="mt-6 space-y-2">
            <p className="pg-overline">Target</p>
            <p
              className="mono text-sm text-white break-all"
              data-testid="dashboard-scan-result-url"
            >
              {result.url}
            </p>
            <div className="flex gap-3 mt-3 text-xs mono text-white/50">
              <span>HOST · {result.host || "—"}</span>
              <span>SCHEME · {(result.scheme || "—").toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 lg:border-l lg:border-white/10 lg:pl-8">
          <span className="pg-overline">Feature Breakdown</span>
          <ul className="mt-3">
            {result.features.map((f) => (
              <li key={f.name} className="pg-feature-row">
                <div className="flex items-center gap-3">
                  {f.passed ? (
                    <CheckCircle
                      size={18}
                      weight="duotone"
                      className="text-[var(--pg-safe)] shrink-0"
                    />
                  ) : (
                    <XCircle
                      size={18}
                      weight="duotone"
                      className="text-[var(--pg-danger)] shrink-0"
                    />
                  )}
                  <div>
                    <p className="text-sm text-white">{f.name}</p>
                    <p className="text-xs text-white/50">{f.detail}</p>
                  </div>
                </div>
                <span
                  className={`mono text-xs ${
                    f.passed ? "text-white/40" : "text-[var(--pg-danger)]"
                  }`}
                >
                  {f.passed ? "0" : `+${f.weight}`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function RecentScansCard({ items }) {
  return (
    <div className="pg-card p-6 lg:col-span-1">
      <div className="flex items-center justify-between mb-4">
        <span className="pg-overline">Recent scans</span>
        <ArrowsClockwise size={16} className="text-white/40" />
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-white/50">No scans yet — try one above.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((it) => (
            <li
              key={it.id}
              className="flex items-center justify-between gap-2 text-sm"
              data-testid={`recent-scan-${it.id}`}
            >
              <span className="mono text-white/80 truncate flex-1">
                {it.url}
              </span>
              <VerdictBadge verdict={it.verdict} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TipCard({ title, body }) {
  return (
    <div className="pg-card p-6">
      <span className="pg-overline">Awareness Tip</span>
      <h3 className="font-display text-lg mt-2 mb-2">{title}</h3>
      <p className="text-sm text-white/60 leading-relaxed">{body}</p>
    </div>
  );
}
