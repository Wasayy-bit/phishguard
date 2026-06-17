import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, SignOut, List, X } from "@phosphor-icons/react";
import { useState } from "react";

export default function PublicHeader() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const { logout } = useAuth();

  const links = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/learn-public", label: "Learn" },
  ];

  return (
    <header className="pg-header sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-3"
          data-testid="logo-home-link"
        >
          <ShieldCheck
            size={26}
            weight="duotone"
            className="text-[var(--pg-brand)]"
          />
          <span className="font-display text-xl font-semibold tracking-tight">
            PhishGuard
          </span>
          <span className="pg-overline hidden sm:inline ml-2">v1.0</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              data-testid={`nav-link-${l.label.toLowerCase()}`}
              className={({ isActive }) =>
                `text-sm tracking-wide transition-colors ${
                  isActive ? "text-white" : "text-white/60 hover:text-white"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user && user.id ? (
            <>
              <Link
                to="/app/dashboard"
                className="pg-btn-secondary"
                data-testid="header-dashboard-btn"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  logout();
                  nav("/");
                }}
                className="pg-btn-primary"
                data-testid="header-logout-btn"
              >
                <SignOut size={16} weight="bold" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="pg-btn-secondary"
                data-testid="header-login-btn"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="pg-btn-primary"
                data-testid="header-register-btn"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          aria-label="Open menu"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden text-white"
          data-testid="header-mobile-toggle"
        >
          {open ? <X size={24} /> : <List size={24} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-white/10 bg-[var(--pg-bg)] px-6 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="text-white/80"
              data-testid={`mobile-nav-${l.label.toLowerCase()}`}
            >
              {l.label}
            </Link>
          ))}
          <div className="flex gap-3 pt-2">
            {user && user.id ? (
              <Link to="/app/dashboard" className="pg-btn-primary flex-1">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="pg-btn-secondary flex-1">
                  Login
                </Link>
                <Link to="/register" className="pg-btn-primary flex-1">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
