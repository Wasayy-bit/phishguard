import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";
import VerdictBadge from "@/components/VerdictBadge";
import api, { formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  MagnifyingGlass,
  Lightning,
  Database,
  Lock,
  Globe,
  Brain,
  Eye,
  ArrowRight,
  CheckCircle,
  XCircle,
  Code,
} from "@phosphor-icons/react";

const featureCards = [
  {
    icon: Lightning,
    title: "Real-time URL Analysis",
    text: "Submit any URL and receive an immediate, explainable risk score driven by ten heuristic indicators.",
  },
  {
    icon: Brain,
    title: "Explainable Verdicts",
    text: "Every Safe / Suspicious / Malicious decision ships with the exact features that contributed to it.",
  },
  {
    icon: Database,
    title: "Community Threat Repository",
    text: "Report newly observed phishing campaigns and search a curated, moderator-approved database.",
  },
  {
    icon: Lock,
    title: "JWT-secured by Default",
    text: "Passwords are hashed with bcrypt, sessions issued as JSON Web Tokens, all over HTTPS.",
  },
  {
    icon: Globe,
    title: "100% Open Source",
    text: "Built with FastAPI, MongoDB and React — every line of code is readable, forkable and free.",
  },
  {
    icon: Eye,
    title: "Cyber Awareness Modules",
    text: "Bite-sized learning content with quizzes — designed for students, teams and curious users.",
  },
];

const steps = [
  {
    n: "01",
    title: "Paste a URL",
    text: "Drop any suspicious link into the scanner — short, long, IP-based, doesn't matter.",
  },
  {
    n: "02",
    title: "Heuristic Engine Runs",
    text: "Ten lexical and host-based checks compute a 0–100 risk score in milliseconds.",
  },
  {
    n: "03",
    title: "Act with Confidence",
    text: "See the verdict, the reasoning behind it, and report it to the community if malicious.",
  },
];

export default function LandingPage() {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const nav = useNavigate();

  const handleScan = async (e) => {
    e?.preventDefault?.();
    setError("");
    setResult(null);
    if (!url.trim()) return;
    if (!user || !user.id) {
      // route to login but remember URL
      sessionStorage.setItem("pg_pending_url", url);
      nav("/login");
      return;
    }
    setScanning(true);
    try {
      const { data } = await api.post("/scan", { url });
      setResult(data);
    } catch (e) {
      setError(formatApiError(e, "Unable to scan URL"));
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pg-grid-bg opacity-60" />
        <div className="absolute inset-0 pg-radial" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-24 lg:pt-24 lg:pb-32">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <span className="pg-overline pg-pulse-dot text-[var(--pg-brand)]">
                Open-Source Threat Intelligence
              </span>
              <h1 className="font-display font-semibold text-4xl sm:text-5xl lg:text-6xl tracking-tighter mt-4 leading-[1.05]">
                Stop phishing
                <br />
                <span className="text-white">before</span> the{" "}
                <span className="text-[var(--pg-brand)]">click</span>.
              </h1>
              <p className="text-white/65 text-lg leading-relaxed mt-6 max-w-xl">
                PhishGuard analyses any URL in real time, explains exactly why
                it might be dangerous, and lets you contribute to a shared
                community repository of phishing threats — all built on a fully
                open-source stack.
              </p>

              {/* Scanner */}
              <form
                onSubmit={handleScan}
                className="mt-10 pg-glow-border pg-card p-2 flex flex-col sm:flex-row gap-2 max-w-2xl"
                data-testid="hero-scan-form"
              >
                <div className="flex items-center gap-3 px-4 flex-1">
                  <MagnifyingGlass size={20} className="text-white/40" />
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="paste-a-url-here.example.com/login"
                    className="bg-transparent outline-none flex-1 py-3 text-white mono text-sm placeholder:text-white/30"
                    data-testid="hero-scan-input"
                  />
                </div>
                <button
                  type="submit"
                  disabled={scanning}
                  className="pg-btn-primary px-6 min-w-[160px]"
                  data-testid="hero-scan-submit"
                >
                  {scanning ? (
                    "Scanning…"
                  ) : (
                    <>
                      Scan URL <ArrowRight size={16} weight="bold" />
                    </>
                  )}
                </button>
              </form>
              <p className="text-xs text-white/40 mono mt-3">
                {user && user.id
                  ? "Heuristic engine • 10 indicators • Result in <300 ms"
                  : "Sign in or create an account to scan and save your history."}
              </p>
              {error && (
                <p
                  className="text-sm text-[var(--pg-danger)] mt-3"
                  data-testid="hero-error"
                >
                  {error}
                </p>
              )}

              {result && (
                <div
                  className="mt-6 pg-card p-6 max-w-2xl"
                  data-testid="hero-scan-result"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="pg-overline">Verdict</span>
                    <VerdictBadge
                      verdict={result.verdict}
                      dataTestId="hero-result-badge"
                    />
                  </div>
                  <p className="mono text-sm text-white/80 break-all mb-4">
                    {result.url}
                  </p>
                  <div className="pg-risk-bar">
                    <div
                      className="pg-risk-fill"
                      style={{
                        width: `${result.risk_score}%`,
                        backgroundColor:
                          result.verdict === "Safe"
                            ? "var(--pg-safe)"
                            : result.verdict === "Suspicious"
                              ? "var(--pg-warn)"
                              : "var(--pg-danger)",
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs mt-2 text-white/50 mono">
                    <span>Risk score</span>
                    <span>{result.risk_score} / 100</span>
                  </div>
                  <Link
                    to="/app/dashboard"
                    className="pg-btn-secondary mt-5 w-full"
                  >
                    Open Full Console <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>

            {/* Side info card */}
            <div className="lg:col-span-5">
              <div className="pg-card p-6 lg:p-8 relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-32 pointer-events-none">
                  <div className="pg-scanline absolute inset-0" />
                </div>
                <span className="pg-overline">Live Heuristics</span>
                <h3 className="font-display text-2xl mt-2 mb-6">
                  Inside the engine
                </h3>
                <ul className="space-y-3 text-sm">
                  {[
                    ["HTTPS / TLS check", "passed"],
                    ["IP-as-host detector", "passed"],
                    ["TLD reputation", "warning"],
                    ["Brand keyword filter", "failed"],
                    ["Punycode / IDN check", "passed"],
                    ["Shortener resolver", "passed"],
                    ["URL length", "passed"],
                    ["Hyphen anomaly", "warning"],
                  ].map(([name, state]) => (
                    <li key={name} className="pg-feature-row">
                      <span className="text-white/80">{name}</span>
                      {state === "passed" && (
                        <CheckCircle
                          size={18}
                          weight="duotone"
                          className="text-[var(--pg-safe)]"
                        />
                      )}
                      {state === "warning" && (
                        <span className="mono text-[var(--pg-warn)] text-xs">
                          REVIEW
                        </span>
                      )}
                      {state === "failed" && (
                        <XCircle
                          size={18}
                          weight="duotone"
                          className="text-[var(--pg-danger)]"
                        />
                      )}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                  <span className="text-xs text-white/50 mono">
                    DEMO • not a real scan
                  </span>
                  <Code size={18} className="text-white/30" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-white/10 bg-[var(--pg-surface)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-2 md:grid-cols-4 gap-px">
          {[
            ["10+", "Heuristic Indicators"],
            ["16", "REST API Endpoints"],
            ["3", "Color-coded Verdicts"],
            ["100%", "Open Source"],
          ].map(([k, v]) => (
            <div key={v} className="bg-[var(--pg-bg)] px-6 py-10 text-center">
              <p className="font-display text-4xl font-semibold text-white">
                {k}
              </p>
              <p className="pg-overline mt-2">{v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-24">
        <div className="grid md:grid-cols-12 gap-8 mb-12 items-end">
          <div className="md:col-span-7">
            <span className="pg-overline">Capabilities</span>
            <h2 className="font-display text-3xl lg:text-5xl mt-3 tracking-tight">
              An end-to-end toolkit
              <br />
              against social engineering.
            </h2>
          </div>
          <p className="md:col-span-5 text-white/60 leading-relaxed">
            PhishGuard combines detection, community intelligence and education
            in a single open-source platform that anyone can run, audit and
            extend.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featureCards.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="pg-card pg-card-hoverable p-6"
              data-testid={`feature-${title.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <Icon
                size={28}
                weight="duotone"
                className="text-[var(--pg-brand)] mb-4"
              />
              <h3 className="font-display text-xl mb-2">{title}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-24">
          <span className="pg-overline">Workflow</span>
          <h2 className="font-display text-3xl lg:text-5xl mt-3 tracking-tight">
            How it works.
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {steps.map(({ n, title, text }) => (
              <div key={n} className="pg-card p-8 relative">
                <span className="mono text-[var(--pg-brand)] text-sm tracking-widest">
                  {n}
                </span>
                <h3 className="font-display text-2xl mt-3 mb-2">{title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-24 text-center">
        <span className="pg-overline">Get started</span>
        <h2 className="font-display text-3xl lg:text-5xl mt-3 tracking-tight max-w-3xl mx-auto">
          Create an account in seconds and start scanning.
        </h2>
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          <Link
            to="/register"
            className="pg-btn-primary px-8"
            data-testid="cta-register-btn"
          >
            Create free account <ArrowRight size={16} weight="bold" />
          </Link>
          <Link
            to="/login"
            className="pg-btn-secondary px-8"
            data-testid="cta-login-btn"
          >
            I already have an account
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
