import { useEffect, useState } from "react";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";
import api, { formatApiError } from "@/lib/api";
import { GraduationCap } from "@phosphor-icons/react";
import { Link } from "react-router-dom";

export default function PublicLearnPage() {
  const [modules, setModules] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    api
      .get("/modules")
      .then((r) => setModules(r.data.items || []))
      .catch((e) => setErr(formatApiError(e, "Could not load modules")));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1 max-w-6xl mx-auto px-6 lg:px-10 pt-12 pb-24 w-full">
        <span className="pg-overline">Cyber Awareness</span>
        <h1 className="font-display text-4xl lg:text-6xl tracking-tighter mt-4">
          Learn to spot phishing
          <br /> before it spots you.
        </h1>
        <p className="text-white/65 mt-6 text-lg max-w-2xl">
          Bite-sized modules covering the fundamentals of phishing, the
          indicators of a malicious URL and the steps to take after a
          compromise. Each module ships with a short quiz.
        </p>

        {err && <p className="mt-6 text-[var(--pg-danger)]">{err}</p>}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
          {modules.map((m) => (
            <div
              key={m.id}
              className="pg-card pg-card-hoverable p-6 flex flex-col"
              data-testid={`public-module-${m.id}`}
            >
              <span className="pg-overline mb-3">{m.category}</span>
              <GraduationCap
                size={26}
                weight="duotone"
                className="text-[var(--pg-brand)] mb-3"
              />
              <h3 className="font-display text-xl mb-2">{m.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed line-clamp-4 flex-1">
                {m.content.slice(0, 180)}…
              </p>
              <Link
                to="/login"
                className="pg-btn-secondary mt-5 w-full text-center"
              >
                Open module
              </Link>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
