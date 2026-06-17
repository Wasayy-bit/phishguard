import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { ShieldCheck, Code, GraduationCap, Books } from "@phosphor-icons/react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1 max-w-5xl mx-auto px-6 lg:px-10 pt-12 pb-24">
        <span className="pg-overline">About the Project</span>
        <h1 className="font-display text-4xl lg:text-6xl tracking-tighter mt-4">
          A semester project,
          <br /> built for the real world.
        </h1>

        <p className="text-white/70 mt-6 text-lg leading-relaxed max-w-3xl">
          PhishGuard is the Final Semester Project for the course{" "}
          <span className="text-white">
            SE-494 — Open Source Software Development
          </span>
          , undertaken by a BS Cyber Security student at the University of
          Management and Technology. It demonstrates competence in modern
          open-source full-stack engineering — FastAPI on the backend, MongoDB
          for storage, React on the frontend — while delivering a tool that
          addresses a real cyber-security problem: the steady rise of phishing.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <div className="pg-card p-8">
            <GraduationCap
              size={28}
              weight="duotone"
              className="text-[var(--pg-brand)] mb-4"
            />
            <h3 className="font-display text-2xl mb-2">Author</h3>
            <p className="text-white/80">Ahmed Abdul Wasay</p>
            <p className="mono text-white/50 text-sm mt-1">F2024408023</p>
            <p className="mono text-white/50 text-sm">BS Cyber Security</p>
            <p className="mono text-white/50 text-sm">
              SE-494 — Open Source Software Development
            </p>
            <p className="mono text-white/50 text-sm">Section Y9</p>
          </div>
          <div className="pg-card p-8">
            <Code
              size={28}
              weight="duotone"
              className="text-[var(--pg-brand)] mb-4"
            />
            <h3 className="font-display text-2xl mb-2">Stack</h3>
            <ul className="text-sm text-white/70 space-y-1 mono">
              <li>• FastAPI (Python 3.11)</li>
              <li>• MongoDB + Motor async driver</li>
              <li>• React + TailwindCSS</li>
              <li>• JWT auth (bcrypt + PyJWT)</li>
              <li>• Phosphor Icons + Outfit / IBM Plex / JetBrains Mono</li>
              <li>• Render • Vercel • MongoDB Atlas</li>
            </ul>
          </div>
        </div>

        <div className="mt-16">
          <span className="pg-overline">Mission</span>
          <h2 className="font-display text-3xl mt-3 mb-4">
            Make phishing detection accessible, transparent and educational.
          </h2>
          <p className="text-white/65 leading-relaxed max-w-3xl">
            Commercial threat-intelligence services are powerful but opaque and
            out of reach for individuals, students and small businesses.
            PhishGuard offers a transparent rule-based engine: every verdict is
            paired with the exact features that produced it. The platform
            doubles as a learning resource so users can recognise the same
            indicators themselves the next time.
          </p>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-4">
          <div className="pg-card p-6">
            <ShieldCheck
              size={24}
              weight="duotone"
              className="text-[var(--pg-safe)] mb-3"
            />
            <h4 className="font-display text-lg mb-1">Trustworthy</h4>
            <p className="text-sm text-white/60">
              No hidden ML black box — every rule is documented.
            </p>
          </div>
          <div className="pg-card p-6">
            <Books
              size={24}
              weight="duotone"
              className="text-[var(--pg-warn)] mb-3"
            />
            <h4 className="font-display text-lg mb-1">Educational</h4>
            <p className="text-sm text-white/60">
              Cyber-awareness modules with quizzes are built in.
            </p>
          </div>
          <div className="pg-card p-6">
            <Code
              size={24}
              weight="duotone"
              className="text-[var(--pg-brand)] mb-3"
            />
            <h4 className="font-display text-lg mb-1">Open</h4>
            <p className="text-sm text-white/60">
              Source code is open and ready to fork on GitHub.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link to="/register" className="pg-btn-primary px-8">
            Get started — it&apos;s free
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
