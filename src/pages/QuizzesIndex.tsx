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
      <div className="shell" style={{ position: "relative", zIndex: 1, paddingTop: 56 }}>
        <div className="page-heading">
          <div className="eyebrow reveal">Test yourself</div>
          <h1 className="page-title reveal" style={{ animationDelay: ".05s" }}>Quiz bank.</h1>
          <p className="page-subtitle reveal" style={{ animationDelay: ".1s" }}>
            {totalQ}+ instant questions across all Solana concepts. AI sets fall back fast to the local bank, so practice never stalls.
          </p>
        </div>

        <div className="reveal" style={{ display: "flex", gap: 14, margin: "28px 0 32px", flexWrap: "wrap", animationDelay: ".15s" }}>
          <div className="card" style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 10 }}>
            <Trophy size={16} style={{ color: "var(--text)" }} />
            <span style={{ fontSize: 14 }}><b>{masteredCount}</b><span style={{ color: "var(--text-dim)" }}> / {concepts.length} mastered</span></span>
          </div>
          <div className="card" style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 10 }}>
            <Sparkles size={16} style={{ color: "var(--text)" }} />
            <span style={{ fontSize: 14 }}><b>{totalQ}+</b><span style={{ color: "var(--text-dim)" }}> questions</span></span>
          </div>
        </div>

        <div className="doc-list">
          {concepts.map((c) => {
            const m = metaFor(c.title);
            const n = getQuiz(m.id).length;
            const mastered = isMastered(m.id);
            const best = progress.scores[m.id];
            return (
              <Link key={m.id} to={`/quizzes/${m.id}`} className="doc-row">
                <span className="doc-row__icon">{iconFor(c.icon)}</span>
                <div>
                  <div className="doc-row__title">
                    <strong>{c.title}</strong>
                    <span>{levelMeta[m.level].label}</span>
                  </div>
                  <p>
                    {n} questions{best ? ` · best ${best.best}/${best.total}` : ""} · {c.tag}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {mastered && <span className="doc-muted" style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--text)" }}><CheckCircle2 size={12} /> mastered</span>}
                  <span className="doc-muted">{best ? "retake" : "start"}</span>
                  <ArrowRight size={14} style={{ color: "var(--text-dim)" }} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
