import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  ShieldCheck,
  EnvelopeSimple,
  LockSimple,
  ArrowRight,
} from "@phosphor-icons/react";

export default function LoginPage() {
  const { user, ready, login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && user && user.id) {
      const to = loc.state?.from?.pathname || "/app/dashboard";
      nav(to, { replace: true });
    }
  }, [ready, user, nav, loc.state]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await login(email.trim(), password);
    setLoading(false);
    if (!res.ok) setError(res.error);
    else nav("/app/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left visual */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 border-r border-white/10 overflow-hidden">
        <div className="absolute inset-0 pg-grid-bg opacity-50" />
        <div className="absolute inset-0 pg-radial" />
        <div className="relative">
          <Link
            to="/"
            className="flex items-center gap-3"
            data-testid="auth-logo-link"
          >
            <ShieldCheck
              size={26}
              weight="duotone"
              className="text-[var(--pg-brand)]"
            />
            <span className="font-display text-xl font-semibold">
              PhishGuard
            </span>
          </Link>
        </div>
        <div className="relative max-w-md">
          <span className="pg-overline pg-pulse-dot text-[var(--pg-brand)]">
            Secure Sign-in
          </span>
          <h2 className="font-display text-4xl lg:text-5xl mt-4 tracking-tighter">
            Welcome back.
            <br />
            Let&apos;s scan the&nbsp;web.
          </h2>
          <p className="text-white/60 mt-5 leading-relaxed">
            Sign in to your PhishGuard console to scan URLs, review your
            detection history and contribute to the community threat repository.
          </p>
        </div>
        <p className="relative mono text-xs text-white/40">
          Final Semester Project • SE-494 — Open Source Software Development
        </p>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center px-6 lg:px-12 py-12">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="lg:hidden flex items-center gap-3 mb-10"
            data-testid="auth-mobile-logo-link"
          >
            <ShieldCheck
              size={26}
              weight="duotone"
              className="text-[var(--pg-brand)]"
            />
            <span className="font-display text-xl font-semibold">
              PhishGuard
            </span>
          </Link>
          <span className="pg-overline">Account</span>
          <h1 className="font-display text-3xl lg:text-4xl mt-3 tracking-tighter">
            Sign in
          </h1>
          <p className="text-white/60 mt-2 text-sm">
            New here?{" "}
            <Link
              to="/register"
              className="text-[var(--pg-brand)] hover:underline"
              data-testid="login-go-register-link"
            >
              Create an account
            </Link>
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div>
              <label className="pg-overline mb-2 block">Email</label>
              <div className="flex items-center gap-2 pg-input">
                <EnvelopeSimple size={18} className="text-white/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 bg-transparent outline-none mono text-sm placeholder:text-white/30"
                  data-testid="login-email-input"
                />
              </div>
            </div>
            <div>
              <label className="pg-overline mb-2 block">Password</label>
              <div className="flex items-center gap-2 pg-input">
                <LockSimple size={18} className="text-white/40" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent outline-none mono text-sm placeholder:text-white/30"
                  data-testid="login-password-input"
                />
              </div>
            </div>
            {error && (
              <p
                className="text-sm text-[var(--pg-danger)]"
                data-testid="login-error"
              >
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="pg-btn-primary w-full"
              data-testid="login-submit-button"
            >
              {loading ? (
                "Signing in…"
              ) : (
                <>
                  Sign in <ArrowRight size={16} weight="bold" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pg-card p-4 text-xs text-white/60 mono">
            <p className="text-white/80 mb-1">Evaluator credentials</p>
            <p>admin@phishguard.io / Admin@PhishGuard2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
