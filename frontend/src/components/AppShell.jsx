import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  House,
  MagnifyingGlass,
  ClockCounterClockwise,
  Warning,
  GraduationCap,
  UserCircle,
  ShieldCheck,
  SignOut,
  Gauge,
  Users,
} from "@phosphor-icons/react";

const userLinks = [
  { to: "/app/dashboard", label: "Scan", icon: MagnifyingGlass },
  { to: "/app/history", label: "History", icon: ClockCounterClockwise },
  { to: "/app/reports", label: "Reports", icon: Warning },
  { to: "/app/learn", label: "Learn", icon: GraduationCap },
  { to: "/app/profile", label: "Profile", icon: UserCircle },
];

const adminLinks = [
  { to: "/app/admin", label: "Admin Console", icon: Gauge },
  { to: "/app/admin/reports", label: "Moderation", icon: Warning },
  { to: "/app/admin/users", label: "Users", icon: Users },
];

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--pg-bg)]">
      {/* Top bar */}
      <header className="pg-header sticky top-0 z-30">
        <div className="px-6 lg:px-10 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3"
            data-testid="app-logo-link"
          >
            <ShieldCheck
              size={24}
              weight="duotone"
              className="text-[var(--pg-brand)]"
            />
            <span className="font-display text-lg font-semibold">
              PhishGuard
            </span>
            <span className="pg-overline ml-2 hidden sm:inline">Console</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-sm">{user?.display_name || "User"}</span>
              <span className="pg-overline">
                {user?.role === "admin" ? "Administrator" : "Member"}
              </span>
            </div>
            <button
              onClick={() => {
                logout();
                nav("/");
              }}
              className="pg-btn-secondary"
              data-testid="app-logout-btn"
              title="Logout"
            >
              <SignOut size={16} />{" "}
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="border-r border-white/10 px-4 py-6 hidden lg:block">
          <div className="px-2 mb-4">
            <p className="pg-overline">Workspace</p>
          </div>
          <nav className="flex flex-col gap-1">
            {userLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/app/dashboard"}
                data-testid={`sidebar-link-${label.toLowerCase()}`}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 text-sm transition-colors border-l-2 ${
                    isActive
                      ? "text-white border-[var(--pg-brand)] bg-white/5"
                      : "text-white/60 hover:text-white border-transparent hover:bg-white/[0.03]"
                  }`
                }
              >
                <Icon size={18} weight="duotone" /> {label}
              </NavLink>
            ))}
          </nav>

          {user?.role === "admin" && (
            <>
              <div className="px-2 mt-6 mb-4">
                <p className="pg-overline text-[var(--pg-brand)]">Admin</p>
              </div>
              <nav className="flex flex-col gap-1">
                {adminLinks.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === "/app/admin"}
                    data-testid={`sidebar-admin-link-${label.toLowerCase().replace(/\s+/g, "-")}`}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 text-sm transition-colors border-l-2 ${
                        isActive
                          ? "text-white border-[var(--pg-brand)] bg-white/5"
                          : "text-white/60 hover:text-white border-transparent hover:bg-white/[0.03]"
                      }`
                    }
                  >
                    <Icon size={18} weight="duotone" /> {label}
                  </NavLink>
                ))}
              </nav>
            </>
          )}

          <div className="mt-8 mx-2 pg-card p-4">
            <p className="pg-overline mb-2">Tip</p>
            <p className="text-xs text-white/70 leading-relaxed">
              Hover any feature in a scan result to learn why it contributed to
              the final verdict.
            </p>
          </div>
        </aside>

        {/* Mobile nav */}
        <div className="lg:hidden border-b border-white/10 px-4 py-3 flex gap-2 overflow-x-auto">
          {userLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/app/dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 text-xs whitespace-nowrap border ${
                  isActive
                    ? "border-[var(--pg-brand)] text-white"
                    : "border-white/10 text-white/60"
                }`
              }
            >
              <Icon size={14} /> {label}
            </NavLink>
          ))}
        </div>

        <main className="px-6 lg:px-10 py-8 lg:py-10 max-w-7xl w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
