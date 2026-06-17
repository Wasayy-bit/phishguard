import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  ShieldCheck,
  EnvelopeSimple,
  LockSimple,
  User,
  ArrowRight,
} from "@phosphor-icons/react";

export default function RegisterPage() {
  const { user, ready, register } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && user && user.id) nav("/app/dashboard", { replace: true });
  }, [ready, user, nav]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await register(email.trim(), password, name.trim());
    setLoading(false);
    if (!res.ok) setError(res.error);
    else nav("/app/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-between p-12 border-r border-white/10 overflow-hidden">
        <div className="absolute inset-0 pg-grid-bg opacity-50" />
        <div className="absolute inset-0 pg-radial" />
        <div className="relative">
          <Link to="/" className="flex items-center gap-3">
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
            Create Account
          </span>
          <h2 className="font-display text-4xl lg:text-5xl mt-4 tracking-tighter">
            Join the&nbsp;defenders.
          </h2>
          <p className="text-white/60 mt-5 leading-relaxed">
            Free, open-source and built for students, researchers and the
            curious. Your account unlocks scan history, community reporting and
            learning modules.
          </p>
        </div>
        <p className="relative mono text-xs text-white/40">
          Final Semester Project • UMT — Department of Cyber Security
        </p>
      </div>

      <div className="flex items-center justify-center px-6 lg:px-12 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center gap-3 mb-10">
            <ShieldCheck
              size={26}
              weight="duotone"
              className="text-[var(--pg-brand)]"
            />
            <span className="font-display text-xl font-semibold">
              PhishGuard
            </span>
          </Link>
          <span className="pg-overline">New Account</span>
          <h1 className="font-display text-3xl lg:text-4xl mt-3 tracking-tighter">
            Create your account
          </h1>
          <p className="text-white/60 mt-2 text-sm">
            Already a member?{" "}
            <Link
              to="/login"
              className="text-[var(--pg-brand)] hover:underline"
              data-testid="register-go-login-link"
            >
              Sign in
            </Link>
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div>
              <label className="pg-overline mb-2 block">Display name</label>
              <div className="flex items-center gap-2 pg-input">
                <User size={18} className="text-white/40" />
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="flex-1 bg-transparent outline-none text-sm"
                  data-testid="register-name-input"
                />
              </div>
            </div>
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
                  className="flex-1 bg-transparent outline-none mono text-sm"
                  data-testid="register-email-input"
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
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="flex-1 bg-transparent outline-none mono text-sm"
                  data-testid="register-password-input"
                />
              </div>
            </div>
            {error && (
              <p
                className="text-sm text-[var(--pg-danger)]"
                data-testid="register-error"
              >
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="pg-btn-primary w-full"
              data-testid="register-submit-button"
            >
              {loading ? (
                "Creating…"
              ) : (
                <>
                  Create account <ArrowRight size={16} weight="bold" />
                </>
              )}
            </button>
          </form>
          <p className="text-xs text-white/40 mt-6 mono">
            By creating an account you agree to use PhishGuard for educational
            and defensive purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}
