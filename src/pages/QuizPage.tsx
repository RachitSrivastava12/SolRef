import { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, X, Trophy, RotateCcw, Sparkles, BookOpen, CheckCircle2 } from "lucide-react";
import Layout from "../components/Layout";
import { conceptById, metaFor, iconFor } from "../lib/concepts";
import { getQuiz, generateQuiz, shuffleQuiz, type QuizQuestion } from "../lib/quizzes";
import { useProgress } from "../lib/useProgress";

export default function QuizPage() {
  const { id = "" } = useParams();
  const concept = conceptById(id);
  const { record, isMastered } = useProgress();
  const m = concept ? metaFor(concept.title) : null;

  const base = useMemo(() => (m ? getQuiz(m.id) : []), [m?.id]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<"bank" | "llm">("bank");

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  if (!concept || !m) {
    return <Layout><div className="shell" style={{ paddingTop: 100, textAlign: "center" }}><h1 style={{ fontSize: 26, fontWeight: 800 }}>Quiz not found</h1><Link to="/quizzes" className="btn btn-grad" style={{ marginTop: 18 }}>All quizzes</Link></div></Layout>;
  }

  const begin = (qs: QuizQuestion[], src: "bank" | "llm") => {
    setQuestions(shuffleQuiz(qs)); setSource(src); setStarted(true);
    setIdx(0); setPicked(null); setScore(0); setDone(false);
  };
  const startBank = () => begin(base, "bank");
  const startAI = async () => {
    setLoading(true);
    const { questions: qs, source: src } = await generateQuiz({
      id: m.id, title: concept.title, desc: concept.desc, details: concept.details,
      whyItMatters: concept.whyItMatters, commonMistakes: concept.commonMistakes,
    });
    begin(qs.length ? qs : base, src);
    setLoading(false);
  };

  const q = questions[idx];
  const choose = (i: number) => { if (picked !== null) return; setPicked(i); if (i === q.answer) setScore((s) => s + 1); };
  const next = () => {
    if (idx + 1 < questions.length) { setIdx(idx + 1); setPicked(null); }
    else { setDone(true); record(m.id, score, questions.length); }
  };

  return (
    <Layout>
      <div className="aurora" />
      <div className="shell" style={{ position: "relative", zIndex: 1, paddingTop: 28, maxWidth: 720 }}>
        <Link to="/quizzes" style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13.5, color: "var(--text-dim)", marginBottom: 22 }}>
          <ArrowLeft size={14} /> All quizzes
        </Link>

        {/* header */}
        <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 26 }}>
          <span style={{ width: 48, height: 48, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", color: "#06040a", background: "var(--grad)" }}>{iconFor(concept.icon)}</span>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.02em" }}>{concept.title}</h1>
            <div style={{ fontSize: 13, color: "var(--text-dim)" }}>
              {isMastered(m.id) ? <span style={{ color: "var(--sol-green)", display: "inline-flex", alignItems: "center", gap: 5 }}><CheckCircle2 size={13} /> mastered</span> : "Pass 70% to master"}
            </div>
          </div>
        </div>

        {/* START SCREEN */}
        {!started && (
          <div className="card" style={{ padding: 32, textAlign: "center" }}>
            <Sparkles size={32} style={{ color: "var(--text)", margin: "0 auto 16px" }} />
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Ready to test {concept.title}?</h2>
            <p style={{ fontSize: 14.5, color: "var(--text-mid)", maxWidth: 440, margin: "0 auto 26px", lineHeight: 1.6 }}>
              Generate a fresh set with DeepSeek — questions written live, anchored to this concept's exact material. Or use the hand-written backup set.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
              <button onClick={startAI} className="btn btn-grad" disabled={loading} style={{ minWidth: 240, justifyContent: "center" }}>
                <Sparkles size={15} /> {loading ? "Generating questions…" : "Generate AI quiz"}
              </button>
              {base.length > 0 && (
                <button onClick={startBank} className="btn btn-ghost" style={{ minWidth: 240, justifyContent: "center", fontSize: 13 }}>
                  <BookOpen size={14} /> Use the {base.length} backup questions
                </button>
              )}
            </div>
            <p style={{ marginTop: 18, fontSize: 12, color: "var(--text-dim)" }}>
              {base.length === 0
                ? "AI generation is required for this concept."
                : "If AI generation is unavailable, we fall back to the backup set automatically."}
            </p>
          </div>
        )}

        {/* RESULTS */}
        {started && done && (
          <div className="card" style={{ padding: 36, textAlign: "center" }}>
            {(() => {
              const pct = Math.round((score / questions.length) * 100);
              const passed = pct >= 70;
              return (
                <>
                  <div style={{ width: 72, height: 72, borderRadius: 20, margin: "0 auto 18px", display: "flex", alignItems: "center", justifyContent: "center", background: passed ? "var(--grad)" : "var(--surface-2)", color: passed ? "#06040a" : "var(--text-dim)" }}>
                    <Trophy size={30} />
                  </div>
                  <div style={{ fontSize: 38, fontWeight: 800 }}>{score}/{questions.length}</div>
                  <div style={{ fontSize: 15, fontFamily: "var(--font-mono)", color: passed ? "var(--sol-green)" : "var(--text-dim)", marginBottom: 8 }}>{pct}% {passed ? "· passed" : "· keep going"}</div>
                  <p style={{ fontSize: 14, color: "var(--text-mid)", maxWidth: 360, margin: "0 auto 26px" }}>{passed ? "Mastered. This concept is now marked complete on your path." : "70%+ marks it mastered. Give it another run."}</p>
                  <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                    <button onClick={() => begin(questions, source)} className="btn btn-surface"><RotateCcw size={14} /> Retake</button>
                    <button onClick={startAI} disabled={loading} className="btn btn-grad"><Sparkles size={14} /> {loading ? "Generating…" : "New AI set"}</button>
                    <Link to={`/docs/${m.id}`} className="btn btn-ghost"><BookOpen size={14} /> Review concept</Link>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* QUESTION */}
        {started && !done && q && (
          <div className="card" style={{ padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span className="eyebrow">Question {idx + 1} / {questions.length}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {source === "llm" && <span style={{ fontSize: 10.5, fontFamily: "var(--font-mono)", padding: "3px 8px", borderRadius: 99, background: "var(--surface-2)", color: "var(--text-mid)" }}>AI-generated</span>}
                <span style={{ fontSize: 12.5, fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>Score {score}</span>
              </div>
            </div>
            <div style={{ height: 5, borderRadius: 99, background: "var(--surface-2)", overflow: "hidden", marginBottom: 22 }}>
              <div style={{ height: "100%", width: `${(idx / questions.length) * 100}%`, background: "var(--grad)", transition: "width .3s" }} />
            </div>

            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 18, lineHeight: 1.5 }}>{q.q}</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {q.options.map((opt, i) => {
                const correct = i === q.answer, isPicked = i === picked;
                let border = "1px solid var(--line-2)", bg = "var(--surface-2)";
                if (picked !== null) {
                  if (correct) { border = "1px solid var(--sol-green)"; bg = "rgba(62,207,142,.10)"; }
                  else if (isPicked) { border = "1px solid var(--sol-red)"; bg = "rgba(255,84,112,.08)"; }
                }
                return (
                  <button key={i} onClick={() => choose(i)} disabled={picked !== null}
                    style={{ textAlign: "left", padding: "14px 16px", borderRadius: 11, border, background: bg, color: "var(--text)", fontSize: 14.5, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, transition: "all .15s" }}>
                    <span>{opt}</span>
                    {picked !== null && correct && <Check size={16} style={{ color: "var(--sol-green)", flexShrink: 0 }} />}
                    {picked !== null && isPicked && !correct && <X size={16} style={{ color: "var(--sol-red)", flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>

            {picked !== null && (
              <div style={{ marginTop: 16, fontSize: 13.5, color: "var(--text-mid)", lineHeight: 1.6, background: "var(--surface-2)", borderLeft: "2px solid var(--line-2)", borderRadius: 9, padding: "13px 15px" }}>{q.explain}</div>
            )}
            {picked !== null && (
              <button onClick={next} className="btn btn-grad" style={{ width: "100%", justifyContent: "center", marginTop: 18 }}>
                {idx + 1 < questions.length ? "Next question" : "See results"} <ArrowRight size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
