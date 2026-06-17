import { Link } from "react-router-dom";
import { ShieldCheck, GithubLogo } from "@phosphor-icons/react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12 grid md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck
              size={22}
              weight="duotone"
              className="text-[var(--pg-brand)]"
            />
            <span className="font-display text-lg font-semibold">
              PhishGuard
            </span>
          </div>
          <p className="text-sm text-white/60 leading-relaxed max-w-sm">
            An open-source phishing URL detection, reporting and cyber-awareness
            platform. Built as a Final Semester Project for SE-494 Open Source
            Software Development.
          </p>
        </div>
        <div>
          <p className="pg-overline mb-4">Navigate</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="text-white/70 hover:text-white">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="text-white/70 hover:text-white">
                About
              </Link>
            </li>
            <li>
              <Link
                to="/learn-public"
                className="text-white/70 hover:text-white"
              >
                Learning Modules
              </Link>
            </li>
            <li>
              <Link to="/login" className="text-white/70 hover:text-white">
                Login
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="pg-overline mb-4">Author</p>
          <p className="text-sm text-white/70">Ahmed Abdul Wasay</p>
          <p className="text-xs text-white/50 mono mt-1">
            F2024408023 — BS Cyber Security
          </p>
          <p className="text-xs text-white/50 mono">SE-494 OSSD — Section Y9</p>

          {/* GitHub Repository Clickable Link */}
          <a
            href="https://github.com/Wasayy-bit/phishguard"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors duration-200"
          >
            <GithubLogo size={16} />
            <span>Open-source on GitHub</span>
          </a>
        </div>
      </div>
      <div className="border-t border-white/5 py-5">
        <p className="text-center text-xs text-white/40 mono">
          © {new Date().getFullYear()} PhishGuard • University of Management and
          Technology
        </p>
      </div>
    </footer>
  );
}
