import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, CheckCircle2, Trophy } from "lucide-react";
import Layout from "../components/Layout";
import { concepts, metaFor, iconFor, levelMeta } from "../lib/concepts";
import { getQuiz } from "../lib/quizzes";
import { useProgress } from "../lib/useProgress";

export default function QuizzesIndex() {
  const { progress, isMastered } = useProgress();
  const totalQ = concepts.reduce((n, c) => n + getQuiz(metaFor(c.title).id).length, 0);
  const masteredCount = concepts.filter((c) => isMastered(metaFor(c.title).id)).length;

  return (
    <Layout>
      <div className="aurora" />
      <div className="shell" style={{ position: "relative", zIndex: 1, paddingTop: 56 }}>
        <div className="eyebrow reveal">Test yourself</div>
        <h1 className="reveal" style={{ fontSize: 42, fontWeight: 800, margin: "10px 0 12px", letterSpacing: "-.025em", animationDelay: ".05s" }}>
          Quizzes <span className="grad-text">grounded in the docs</span>
        </h1>
        <p className="reveal" style={{ fontSize: 17, color: "var(--text-mid)", maxWidth: 620, animationDelay: ".1s" }}>
          {totalQ}+ hand-written questions, plus fresh AI-generated sets powered by DeepSeek — anchored strictly to each concept's material. Pass 70% to master a concept.
        </p>

        <div className="reveal" style={{ display: "flex", gap: 14, margin: "28px 0 32px", flexWrap: "wrap", animationDelay: ".15s" }}>
          <div className="card" style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 10 }}>
            <Trophy size={16} style={{ color: "var(--text)" }} />
            <span style={{ fontSize: 14 }}><b>{masteredCount}</b><span style={{ color: "var(--text-dim)" }}> / {concepts.length} mastered</span></span>
          </div>
          <div className="card" style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 10 }}>
            <Sparkles size={16} style={{ color: "var(--sol-purple)" }} />
            <span style={{ fontSize: 14 }}><b>{totalQ}+</b><span style={{ color: "var(--text-dim)" }}> questions</span></span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 14 }}>
          {concepts.map((c) => {
            const m = metaFor(c.title);
            const n = getQuiz(m.id).length;
            const mastered = isMastered(m.id);
            const best = progress.scores[m.id];
            return (
              <Link key={m.id} to={`/quizzes/${m.id}`} className="card card-lift" style={{ padding: 20, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text)", background: "var(--surface-2)" }}>{iconFor(c.icon)}</span>
                  {mastered && <CheckCircle2 size={18} style={{ color: "var(--text)" }} />}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{c.title}</h3>
                <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginBottom: 14 }}>
                  {n} questions · <span style={{ color: levelMeta[m.level].color }}>{levelMeta[m.level].label}</span>
                  {best && <> · best {best.best}/{best.total}</>}
                </div>
                <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text)", fontWeight: 600 }}>
                  {best ? "Retake" : "Start"} quiz <ArrowRight size={14} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
