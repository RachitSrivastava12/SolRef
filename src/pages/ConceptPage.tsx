import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Copy, Check, ExternalLink,
  Lightbulb, AlertTriangle, Sparkles, Terminal, BookOpen, CheckCircle2, Target,
} from "lucide-react";
import Layout from "../components/Layout";
import { concepts, conceptById, metaFor, iconFor, levelMeta } from "../lib/concepts";
import { tasksFor } from "../lib/tasks";
import ConceptDiagram from "../lib/Diagrams";
import { useProgress } from "../lib/useProgress";

export default function ConceptPage() {
  const { id = "" } = useParams();
  const concept = conceptById(id);
  const { visit, isMastered } = useProgress();
  const [copied, setCopied] = useState(false);

  useEffect(() => { if (concept) { visit(metaFor(concept.title).id); window.scrollTo(0, 0); } }, [id]); // eslint-disable-line

  if (!concept) {
    return (
      <Layout>
        <div className="shell" style={{ paddingTop: 100, textAlign: "center" }}>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>Concept not found</h1>
          <Link to="/docs" className="btn btn-grad" style={{ marginTop: 20 }}>Back to docs <ArrowRight size={16} /></Link>
        </div>
      </Layout>
    );
  }

  const m = metaFor(concept.title);
  const idx = concepts.findIndex((c) => metaFor(c.title).id === m.id);
  const prev = idx > 0 ? concepts[idx - 1] : null;
  const next = idx < concepts.length - 1 ? concepts[idx + 1] : null;
  const mastered = isMastered(m.id);
  const conceptTasks = tasksFor(m.id);

  const copy = () => { try { navigator.clipboard.writeText(concept.code); } catch { /* noop */ } setCopied(true); setTimeout(() => setCopied(false), 1800); };

  return (
    <Layout wide>
      <div className="aurora" />
      <div className="shell-wide" style={{ position: "relative", zIndex: 1, paddingTop: 28 }}>
        <Link to="/docs" style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13.5, color: "var(--text-dim)", marginBottom: 22 }}>
          <ArrowLeft size={14} /> All concepts
        </Link>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 300px", gap: 40, alignItems: "start" }} className="doc-grid">
          {/* MAIN */}
          <article>
            {/* header */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <span style={{ width: 52, height: 52, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", color: "#06040a", background: "var(--grad)", flexShrink: 0 }}>{iconFor(concept.icon)}</span>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 5 }}>
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", padding: "3px 9px", borderRadius: 99, background: "var(--surface-2)", border: "1px solid var(--line-2)", color: "var(--text-mid)" }}>{concept.tag}</span>
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: levelMeta[m.level].color }}>{levelMeta[m.level].label}</span>
                  {mastered && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text)", fontFamily: "var(--font-mono)" }}><CheckCircle2 size={12} /> mastered</span>}
                </div>
                <h1 style={{ fontSize: "clamp(30px,4vw,42px)", fontWeight: 800, letterSpacing: "-.025em", lineHeight: 1.05 }}>{concept.title}</h1>
              </div>
            </div>

            <p style={{ fontSize: 17, color: "var(--text-mid)", lineHeight: 1.7, marginBottom: 28 }}>{concept.desc}</p>

            {/* diagram */}
            {m.diagramKey && <div id="diagram" style={{ marginBottom: 30, scrollMarginTop: 84 }}><ConceptDiagram diagramKey={m.diagramKey} /></div>}

            {/* why it matters */}
            {concept.whyItMatters && (
              <div id="why" style={{ scrollMarginTop: 84, borderRadius: "var(--r-md)", padding: 22, marginBottom: 30, background: "var(--surface-2)", border: "1px solid var(--line)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <Lightbulb size={15} style={{ color: "var(--text)" }} />
                  <span className="eyebrow">Why it matters</span>
                </div>
                <p style={{ fontSize: 15, color: "var(--text-mid)", lineHeight: 1.7 }}>{concept.whyItMatters}</p>
              </div>
            )}

            {/* key facts */}
            <div id="facts" style={{ scrollMarginTop: 84, marginBottom: 30 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 14 }}>Key facts</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: 10 }}>
                {concept.details.map((d) => (
                  <div key={d} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, fontFamily: "var(--font-mono)", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, padding: "11px 14px" }}>
                    <span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--text)", flexShrink: 0, marginTop: 6 }} />
                    <span style={{ color: "var(--text-mid)", lineHeight: 1.5 }}>{d}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* common mistakes */}
            {concept.commonMistakes?.length > 0 && (
              <div id="mistakes" style={{ scrollMarginTop: 84, marginBottom: 30 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <AlertTriangle size={16} style={{ color: "var(--sol-yellow)" }} />
                  <h2 style={{ fontSize: 22, fontWeight: 700 }}>Common mistakes</h2>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {concept.commonMistakes.map((mk) => (
                    <div key={mk} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, background: "rgba(255,210,63,.05)", border: "1px solid rgba(255,210,63,.2)", borderRadius: 10, padding: "12px 15px" }}>
                      <span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--sol-yellow)", flexShrink: 0, marginTop: 7 }} />
                      <span style={{ color: "var(--text-mid)", lineHeight: 1.6 }}>{mk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* code */}
            <div id="code" style={{ scrollMarginTop: 84, marginBottom: 30 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700 }}>Code</h2>
                <button onClick={copy} className="btn btn-surface" style={{ padding: "8px 14px", fontSize: 12.5 }}>
                  {copied ? <Check size={13} style={{ color: "var(--sol-green)" }} /> : <Copy size={13} />}{copied ? "Copied" : "Copy"}
                </button>
              </div>
              <div style={{ background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: 20, overflowX: "auto" }}>
                <pre style={{ color: "var(--text)" }}>{concept.code}</pre>
              </div>
            </div>

            {/* practice tasks */}
            {conceptTasks.length > 0 && (
              <div id="practice" style={{ scrollMarginTop: 84, marginBottom: 30 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <Target size={16} style={{ color: "var(--text)" }} />
                  <h2 style={{ fontSize: 22, fontWeight: 700 }}>Practice to master this</h2>
                </div>
                <p style={{ fontSize: 14, color: "var(--text-dim)", marginBottom: 16 }}>Open a task in the workspace — write the code, get hints, and have it evaluated.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {conceptTasks.map((t) => (
                    <Link key={t.id} to={`/workspace?c=${m.id}&task=${t.id}`} className="card card-lift" style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                      <span style={{ width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface-2)", color: "var(--text)", flexShrink: 0 }}><Terminal size={17} /></span>
                      <span style={{ flex: 1 }}>
                        <span style={{ display: "block", fontSize: 14.5, fontWeight: 600 }}>{t.title}</span>
                        <span style={{ display: "block", fontSize: 12.5, color: "var(--text-dim)", marginTop: 2, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" } as React.CSSProperties}>{t.goal}</span>
                      </span>
                      <span className="mono" style={{ fontSize: 10.5, padding: "3px 9px", borderRadius: 99, border: "1px solid var(--line-2)", color: "var(--text-dim)", flexShrink: 0 }}>{t.difficulty}</span>
                      <ArrowRight size={16} style={{ color: "var(--text-dim)", flexShrink: 0 }} />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* resources */}
            {concept.links?.length ? (
              <div id="resources" style={{ scrollMarginTop: 84, marginBottom: 30 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 14 }}>Resources</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {concept.links.map((l) => (
                    <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="card" style={{ padding: "13px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{l.label}</span>
                      <ExternalLink size={14} style={{ color: "var(--text-dim)" }} />
                    </a>
                  ))}
                </div>
              </div>
            ) : null}

            {/* quiz CTA */}
            <Link to={`/quizzes/${m.id}`} className="grad-border" style={{ borderRadius: "var(--r-md)", padding: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 36 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--grad)", color: "#06040a", flexShrink: 0 }}><Sparkles size={20} /></span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>Test yourself on {concept.title}</div>
                  <div style={{ fontSize: 13, color: "var(--text-dim)" }}>Grounded questions · pass 70% to master this concept</div>
                </div>
              </div>
              <ArrowRight size={18} style={{ color: "var(--text)", flexShrink: 0 }} />
            </Link>

            {/* prev / next */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }} className="prevnext">
              {prev ? (
                <Link to={`/docs/${metaFor(prev.title).id}`} className="card card-lift" style={{ padding: 16 }}>
                  <div style={{ fontSize: 11.5, color: "var(--text-dim)", display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}><ArrowLeft size={12} /> Previous</div>
                  <div style={{ fontSize: 14.5, fontWeight: 600 }}>{prev.title}</div>
                </Link>
              ) : <div />}
              {next ? (
                <Link to={`/docs/${metaFor(next.title).id}`} className="card card-lift" style={{ padding: 16, textAlign: "right" }}>
                  <div style={{ fontSize: 11.5, color: "var(--text-dim)", display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end", marginBottom: 6 }}>Next <ArrowRight size={12} /></div>
                  <div style={{ fontSize: 14.5, fontWeight: 600 }}>{next.title}</div>
                </Link>
              ) : <div />}
            </div>
          </article>

          {/* SIDEBAR — on this page */}
          <aside className="doc-aside" style={{ position: "sticky", top: 84 }}>
            <div className="card" style={{ padding: 18 }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>On this page</div>
              <nav style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {[
                  m.diagramKey && ["diagram", "Diagram"],
                  concept.whyItMatters && ["why", "Why it matters"],
                  ["facts", "Key facts"],
                  concept.commonMistakes?.length && ["mistakes", "Common mistakes"],
                  ["code", "Code"],
                  conceptTasks.length > 0 && ["practice", "Practice"],
                  concept.links?.length && ["resources", "Resources"],
                ].filter(Boolean).map((x) => {
                  const [anchor, label] = x as [string, string];
                  return <a key={anchor} href={`#${anchor}`} style={{ fontSize: 13, color: "var(--text-dim)" }}>{label}</a>;
                })}
              </nav>
              <div style={{ height: 1, background: "var(--line)", margin: "16px 0" }} />
              {conceptTasks.length > 0 && (
                <Link to={`/workspace?c=${m.id}&task=${conceptTasks[0].id}`} className="btn btn-surface" style={{ width: "100%", justifyContent: "center", fontSize: 13, marginBottom: 8 }}><Terminal size={13} /> Practice in workspace</Link>
              )}
              <Link to={`/quizzes/${m.id}`} className="btn btn-grad" style={{ width: "100%", justifyContent: "center", fontSize: 13 }}><Sparkles size={13} /> Take the quiz</Link>
            </div>
            <Link to="/docs" className="card card-lift" style={{ padding: 16, display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
              <BookOpen size={16} style={{ color: "var(--text)" }} />
              <span style={{ fontSize: 13.5 }}>All {concepts.length} concepts</span>
            </Link>
          </aside>
        </div>
      </div>

      <style>{`
        @media (max-width: 980px) {
          .doc-grid { grid-template-columns: 1fr !important; }
          .doc-aside { display: none !important; }
        }
        @media (max-width: 560px) { .prevnext { grid-template-columns: 1fr !important; } }
      `}</style>
    </Layout>
  );
}
