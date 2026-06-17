import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import api, { formatApiError } from "@/lib/api";
import {
  GraduationCap,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "@phosphor-icons/react";

export default function LearnPage() {
  const [modules, setModules] = useState([]);
  const [active, setActive] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api
      .get("/modules")
      .then((r) => setModules(r.data.items || []))
      .catch((e) => setErr(formatApiError(e, "Could not load modules")));
  }, []);

  return (
    <AppShell>
      <div className="flex flex-col gap-2 mb-8">
        <span className="pg-overline">Cyber Awareness</span>
        <h1 className="font-display text-3xl lg:text-4xl tracking-tight">
          Learning Modules
        </h1>
        <p className="text-white/60 max-w-2xl">
          Short, focused lessons that teach you how to recognise and respond to
          phishing.
        </p>
      </div>

      {err && <p className="text-[var(--pg-danger)]">{err}</p>}

      {active ? (
        <ModuleDetail
          mod={active}
          onBack={() => setActive(null)}
          dataTestId="learn-module-detail"
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((m) => (
            <button
              key={m.id}
              onClick={() => setActive(m)}
              className="pg-card pg-card-hoverable p-6 text-left flex flex-col"
              data-testid={`learn-module-${m.id}`}
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
              <span className="mono text-xs text-[var(--pg-brand)] mt-4">
                {m.quiz?.length || 0} quiz question
                {(m.quiz?.length || 0) === 1 ? "" : "s"} →
              </span>
            </button>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function ModuleDetail({ mod, onBack }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const quiz = mod.quiz || [];
  const correct = quiz.reduce(
    (acc, q, i) => (answers[i] === q.answer_index ? acc + 1 : acc),
    0,
  );

  return (
    <div className="pg-card p-6 lg:p-10" data-testid="learn-module-detail-card">
      <button
        onClick={onBack}
        className="pg-btn-secondary mb-6"
        data-testid="learn-back-btn"
      >
        <ArrowLeft size={14} /> Back to modules
      </button>
      <span className="pg-overline">{mod.category}</span>
      <h2 className="font-display text-3xl lg:text-4xl mt-3 tracking-tight">
        {mod.title}
      </h2>
      <article className="mt-6 text-white/80 leading-relaxed whitespace-pre-wrap max-w-3xl">
        {mod.content}
      </article>

      {quiz.length > 0 && (
        <div className="mt-10 border-t border-white/10 pt-8 max-w-3xl">
          <span className="pg-overline">Quick Quiz</span>
          <h3 className="font-display text-2xl mt-2 mb-6">
            Check your understanding
          </h3>
          <div className="space-y-6">
            {quiz.map((q, i) => (
              <div key={i} data-testid={`quiz-q-${i}`}>
                <p className="font-medium mb-3">
                  {i + 1}. {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => {
                    const selected = answers[i] === oi;
                    const isCorrect = submitted && oi === q.answer_index;
                    const isWrong =
                      submitted && selected && oi !== q.answer_index;
                    return (
                      <button
                        key={oi}
                        onClick={() =>
                          !submitted && setAnswers({ ...answers, [i]: oi })
                        }
                        className={`w-full text-left px-4 py-3 border transition-colors flex items-center justify-between ${
                          selected
                            ? "border-[var(--pg-brand)] bg-white/5"
                            : "border-white/10 hover:bg-white/[0.03]"
                        } ${isCorrect ? "!border-[var(--pg-safe)] !bg-emerald-500/10" : ""} ${
                          isWrong
                            ? "!border-[var(--pg-danger)] !bg-red-500/10"
                            : ""
                        }`}
                        data-testid={`quiz-q-${i}-opt-${oi}`}
                      >
                        <span className="text-sm">{opt}</span>
                        {isCorrect && (
                          <CheckCircle
                            size={18}
                            className="text-[var(--pg-safe)]"
                          />
                        )}
                        {isWrong && (
                          <XCircle
                            size={18}
                            className="text-[var(--pg-danger)]"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {!submitted ? (
            <button
              onClick={() => setSubmitted(true)}
              disabled={Object.keys(answers).length < quiz.length}
              className="pg-btn-primary mt-6"
              data-testid="quiz-submit-btn"
            >
              Submit answers
            </button>
          ) : (
            <div className="pg-card p-5 mt-6" data-testid="quiz-result">
              <p className="font-display text-xl">
                Score:{" "}
                <span className="text-[var(--pg-brand)]">
                  {correct} / {quiz.length}
                </span>
              </p>
              <p className="text-sm text-white/60 mt-1">
                {correct === quiz.length
                  ? "Perfect — you're ready to spot phishing in the wild."
                  : "Review the content above and try again."}
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setAnswers({});
                }}
                className="pg-btn-secondary mt-4"
                data-testid="quiz-retry-btn"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
