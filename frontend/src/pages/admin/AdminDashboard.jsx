import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import api, { formatApiError } from "@/lib/api";
import VerdictBadge from "@/components/VerdictBadge";
import {
  Users,
  MagnifyingGlass,
  Warning,
  GraduationCap,
  ShieldCheck,
} from "@phosphor-icons/react";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api
      .get("/admin/stats")
      .then((r) => setStats(r.data))
      .catch((e) => setErr(formatApiError(e, "Could not load stats")));
  }, []);

  return (
    <AppShell>
      <div className="flex flex-col gap-2 mb-8">
        <span className="pg-overline text-[var(--pg-brand)]">
          Administrator
        </span>
        <h1 className="font-display text-3xl lg:text-4xl tracking-tight">
          Admin Console
        </h1>
        <p className="text-white/60 max-w-2xl">
          Platform-wide statistics, moderation queue and management.
        </p>
      </div>

      {err && <p className="text-[var(--pg-danger)]">{err}</p>}

      {!stats ? (
        <div className="pg-card p-10 text-center">
          <p className="pg-overline pg-pulse-dot text-white/60">Loading</p>
        </div>
      ) : (
        <>
          {/* Top stat strip */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat
              icon={Users}
              label="Total users"
              value={stats.users.total}
              accent={`${stats.users.admins} admin${stats.users.admins === 1 ? "" : "s"}`}
              testid="stat-users"
            />
            <Stat
              icon={MagnifyingGlass}
              label="Total scans"
              value={stats.scans.total}
              accent={`${stats.scans.malicious} malicious • ${stats.scans.suspicious} suspicious`}
              testid="stat-scans"
            />
            <Stat
              icon={Warning}
              label="Pending reports"
              value={stats.reports.pending}
              accent={`${stats.reports.approved} approved • ${stats.reports.rejected} rejected`}
              testid="stat-reports"
            />
            <Stat
              icon={GraduationCap}
              label="Learning modules"
              value={stats.modules.total}
              accent="Cyber awareness"
              testid="stat-modules"
            />
          </div>

          {/* Bento grid */}
          <div className="grid lg:grid-cols-3 gap-4 mt-6">
            {/* Verdict distribution */}
            <div className="pg-card p-6 lg:col-span-1">
              <span className="pg-overline">Verdict distribution</span>
              <h3 className="font-display text-xl mt-2 mb-4">Engine outputs</h3>
              <DistRow
                label="Safe"
                value={stats.scans.safe}
                total={stats.scans.total}
                color="var(--pg-safe)"
              />
              <DistRow
                label="Suspicious"
                value={stats.scans.suspicious}
                total={stats.scans.total}
                color="var(--pg-warn)"
              />
              <DistRow
                label="Malicious"
                value={stats.scans.malicious}
                total={stats.scans.total}
                color="var(--pg-danger)"
              />
            </div>

            {/* Recent scans */}
            <div className="pg-card p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <span className="pg-overline">Recent platform scans</span>
                <ShieldCheck size={16} className="text-white/40" />
              </div>
              {stats.recent_scans.length === 0 ? (
                <p className="text-sm text-white/50">No scans yet.</p>
              ) : (
                <ul className="space-y-3">
                  {stats.recent_scans.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="mono text-white/80 truncate flex-1">
                        {s.url}
                      </span>
                      <span className="mono text-xs text-white/40 hidden sm:inline">
                        {s.risk_score}
                      </span>
                      <VerdictBadge verdict={s.verdict} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}

function Stat({ icon: Icon, label, value, accent, testid }) {
  return (
    <div className="pg-card p-6" data-testid={testid}>
      <div className="flex items-start justify-between">
        <Icon size={22} weight="duotone" className="text-[var(--pg-brand)]" />
        <span className="pg-overline">{label}</span>
      </div>
      <p className="font-display text-4xl mt-4">{value}</p>
      <p className="mono text-xs text-white/40 mt-1">{accent}</p>
    </div>
  );
}

function DistRow({ label, value, total, color }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between text-xs mono text-white/60 mb-1">
        <span>{label}</span>
        <span>
          {value} ({pct}%)
        </span>
      </div>
      <div className="pg-risk-bar">
        <div
          className="pg-risk-fill"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
