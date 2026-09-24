import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Copy, Check, ExternalLink,
  Lightbulb, AlertTriangle, ChevronRight,
} from "lucide-react";
import Layout from "../components/Layout";
import DocsNav from "../components/DocsNav";
import { concepts, conceptById, metaFor, iconFor, levelMeta } from "../lib/concepts";
import { chapterConcepts, chapterForConceptId } from "../lib/chapters";
import { deepDiveFor } from "../lib/deepDives";
import ConceptDiagram, { hasDiagram } from "../lib/Diagrams";
import ConceptLab, { hasLab } from "../lib/Labs";

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -65% 0px", threshold: 0 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [ids.join(",")]); // eslint-disable-line
  return active;
}

export default function ConceptPage() {
  const { id = "" } = useParams();
  const concept = conceptById(id);
  const [copied, setCopied] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  const m = concept ? metaFor(concept.title) : null;
  const deepDive = m ? deepDiveFor(m.id) : undefined;
  const chapter = m ? chapterForConceptId(m.id) : undefined;
  const chapterItems = chapter ? chapterConcepts(chapter) : [];

  const toc = useMemo(() => {
    if (!concept || !m) return [] as [string, string][];
    return [
      ["overview", "Overview"],
      deepDive && ["deep", "Deep dive"],
      hasDiagram(m.id) && ["diagram", "Diagram"],
      hasLab(m.id) && ["lab", "Try it"],
      concept.whyItMatters && ["why", "Why it matters"],
      ["facts", "Key facts"],
      concept.commonMistakes?.length && ["mistakes", "Common mistakes"],
      ["code", "Code"],
      concept.links?.length && ["resources", "Resources"],
    ].filter(Boolean) as [string, string][];
  }, [concept, m, deepDive]);

  const active = useActiveSection(toc.map((t) => t[0]));

  if (!concept || !m) {
    return (
      <Layout>
        <div className="shell" style={{ paddingTop: 100, textAlign: "center" }}>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>Concept not found</h1>
          <Link to="/docs" className="btn btn-grad" style={{ marginTop: 20 }}>Back to docs <ArrowRight size={16} /></Link>
        </div>
      </Layout>
    );
  }

  const idx = concepts.findIndex((c) => metaFor(c.title).id === m.id);
  const prev = idx > 0 ? concepts[idx - 1] : null;
  const next = idx < concepts.length - 1 ? concepts[idx + 1] : null;
  const isRust = /fn\s|use solana_program|entrypoint!/.test(concept.code);

  const copy = () => { try { navigator.clipboard.writeText(concept.code); } catch { /* noop */ } setCopied(true); setTimeout(() => setCopied(false), 1800); };

  return (
    <Layout wide>
      <div className="docs-shell docs-shell--toc" style={{ position: "relative", zIndex: 1 }}>
        {/* LEFT — full docs nav */}
        <aside className="docs-nav">
          <DocsNav activeId={m.id} />
        </aside>

        {/* CENTER — article */}
        <article className="docs-content docs-content--narrow">
          {/* mobile concept switcher */}
          <div className="docs-mobilebar" style={{ marginBottom: 22 }}>
            <Link to="/docs" style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--text-dim)" }}>
              <ArrowLeft size={14} /> All concepts
            </Link>
          </div>

          {/* breadcrumb */}
          <div className="crumb" style={{ marginBottom: 22 }}>
            <Link to="/docs">Docs</Link>
            <ChevronRight size={12} style={{ opacity: .5 }} />
            <Link to={`/docs?cat=${encodeURIComponent(concept.tag)}`}>{concept.tag}</Link>
            <ChevronRight size={12} style={{ opacity: .5 }} />
            <span style={{ color: "var(--text-mid)" }}>{concept.title}</span>
          </div>

          {/* header */}
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
            <span style={{ width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--neon-green)", background: "var(--surface-2)", border: "1px solid var(--line)", flexShrink: 0 }}>{iconFor(concept.icon)}</span>
            <span className="doc-muted">{concept.tag}</span>
            <span style={{ width: 3, height: 3, borderRadius: 99, background: "var(--line-3)" }} />
            <span className="doc-muted" style={{ color: levelMeta[m.level].color }}>{levelMeta[m.level].label}</span>
          </div>

          <h1 id="overview" className="concept-title" style={{ scrollMarginTop: "calc(var(--nav-h) + 8px)" }}>{concept.title}</h1>
          <p className="doc-lede" style={{ margin: "20px 0 36px", maxWidth: "68ch" }}>{concept.desc}</p>

          {chapter && (
            <section className="chapter-context" style={{ marginBottom: 34 }}>
              <div>
                <span className="eyebrow">Chapter context</span>
                <h2><Link to={`/deep-dives/${chapter.id}`} style={{ color: "inherit" }}>{chapter.title}</Link></h2>
                <p>{chapter.outcome}</p>
              </div>
              <div className="chapter-context__links">
                {chapterItems.slice(0, 6).map(({ concept: item, meta }) => (
                  <Link key={meta.id} to={`/docs/${meta.id}`} className={meta.id === m.id ? "on" : ""}>
                    {item.title}
                  </Link>
                ))}
                <Link to={`/deep-dives/${chapter.id}`} className="chapter-context__all">
                  Open track <ArrowRight size={12} />
                </Link>
              </div>
            </section>
          )}

          {deepDive && (
            <section id="deep" className="deep-dive" style={{ scrollMarginTop: "calc(var(--nav-h) + 8px)", marginBottom: 42 }}>
              <div className="deep-dive__thesis">
                <span className="eyebrow">Deep dive</span>
                <p>{deepDive.thesis}</p>
                {deepDive.stages && (
                  <div className="deep-dive__stages">
                    {deepDive.stages.map((stage, i) => (
                      <span key={stage}>{i + 1}. {stage}</span>
                    ))}
                  </div>
                )}
              </div>
              {deepDive.sourceNotes?.length ? (
                <div className="deep-dive__source">
                  <span className="eyebrow">Engineering Solana lens</span>
                  <ul>
                    {deepDive.sourceNotes.map((note) => <li key={note}>{note}</li>)}
                  </ul>
                </div>
              ) : null}
              <div className="deep-dive__sections">
                {deepDive.sections.map((section) => (
                  <article key={section.title}>
                    <span>{section.eyebrow}</span>
                    <h3>{section.title}</h3>
                    <p>{section.body}</p>
                    <ul>
                      {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                    </ul>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* diagram */}
          {hasDiagram(m.id) && <div id="diagram" style={{ marginBottom: 40, scrollMarginTop: "calc(var(--nav-h) + 8px)" }}><ConceptDiagram id={m.id} /></div>}

          {/* interactive lab */}
          {hasLab(m.id) && (
            <section id="lab" style={{ marginBottom: 44, scrollMarginTop: "calc(var(--nav-h) + 8px)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span className="eyebrow">Try it</span>
              </div>
              <ConceptLab id={m.id} />
            </section>
          )}

          {/* why it matters */}
          {concept.whyItMatters && (
            <section id="why" style={{ scrollMarginTop: "calc(var(--nav-h) + 8px)", marginBottom: 44 }}>
              <div className="grad-border" style={{ borderRadius: "var(--r-md)", padding: 22 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <Lightbulb size={15} style={{ color: "var(--neon-green)" }} />
                  <span className="eyebrow">Why it matters</span>
                </div>
                <p style={{ fontSize: 15.5, color: "var(--text-mid)", lineHeight: 1.75 }}>{concept.whyItMatters}</p>
              </div>
            </section>
          )}

          {/* key facts */}
          <section id="facts" style={{ scrollMarginTop: "calc(var(--nav-h) + 8px)", marginBottom: 44 }}>
            <h2 className="doc-h2" style={{ marginBottom: 18 }}>Key facts</h2>
            <div style={{ display: "grid", gap: 7 }}>
              {concept.details.map((d) => (
                <div key={d} style={{ display: "flex", gap: 11, alignItems: "flex-start", fontSize: 14, padding: "12px 14px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 9 }}>
                  <span style={{ width: 5, height: 5, borderRadius: 99, background: "var(--neon-green)", flexShrink: 0, marginTop: 8 }} />
                  <span style={{ color: "var(--text-mid)", lineHeight: 1.55 }}>{d}</span>
                </div>
              ))}
            </div>
          </section>

          {/* common mistakes */}
          {concept.commonMistakes?.length > 0 && (
            <section id="mistakes" style={{ scrollMarginTop: "calc(var(--nav-h) + 8px)", marginBottom: 44 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 18 }}>
                <AlertTriangle size={17} style={{ color: "var(--sol-yellow)" }} />
                <h2 className="doc-h2">Common mistakes</h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {concept.commonMistakes.map((mk) => (
                  <div key={mk} style={{ display: "flex", gap: 11, alignItems: "flex-start", fontSize: 14.5, background: "rgba(245,196,81,.045)", border: "1px solid rgba(245,196,81,.18)", borderRadius: 10, padding: "13px 16px" }}>
                    <span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--sol-yellow)", flexShrink: 0, marginTop: 7 }} />
                    <span style={{ color: "var(--text-mid)", lineHeight: 1.6 }}>{mk}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* code */}
          <section id="code" style={{ scrollMarginTop: "calc(var(--nav-h) + 8px)", marginBottom: 44 }}>
            <h2 className="doc-h2" style={{ marginBottom: 16 }}>Code</h2>
            <div className="codeblock">
              <div className="codeblock__bar">
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--text-dim)" }}>
                  <span style={{ display: "flex", gap: 5 }}>
                    <i style={{ width: 9, height: 9, borderRadius: 99, background: "#2a2a2a", display: "block" }} />
                    <i style={{ width: 9, height: 9, borderRadius: 99, background: "#2a2a2a", display: "block" }} />
                    <i style={{ width: 9, height: 9, borderRadius: 99, background: "#2a2a2a", display: "block" }} />
                  </span>
                  {isRust ? "rust" : "typescript"}
                </span>
                <button onClick={copy} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 7, background: "var(--surface-2)", border: "1px solid var(--line-2)", color: copied ? "var(--neon-green)" : "var(--text-dim)", fontSize: 11.5, fontFamily: "var(--font-mono)" }}>
                  {copied ? <Check size={12} /> : <Copy size={12} />}{copied ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="codeblock__body">
                <pre style={{ color: "var(--text-mid)" }}>{concept.code}</pre>
              </div>
            </div>
          </section>

          {/* resources */}
          {concept.links?.length ? (
            <section id="resources" style={{ scrollMarginTop: "calc(var(--nav-h) + 8px)", marginBottom: 44 }}>
              <h2 className="doc-h2" style={{ marginBottom: 16 }}>Resources</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {concept.links.map((l) => (
                  <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="card card-lift" style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{l.label}</span>
                    <ExternalLink size={14} style={{ color: "var(--text-dim)", flexShrink: 0 }} />
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          {/* prev / next */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, paddingTop: 8, borderTop: "1px solid var(--line)" }} className="prevnext">
            {prev ? (
              <Link to={`/docs/${metaFor(prev.title).id}`} className="card card-lift" style={{ padding: 16, marginTop: 20 }}>
                <div style={{ fontSize: 11.5, color: "var(--text-dim)", display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}><ArrowLeft size={12} /> Previous</div>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>{prev.title}</div>
              </Link>
            ) : <div />}
            {next ? (
              <Link to={`/docs/${metaFor(next.title).id}`} className="card card-lift" style={{ padding: 16, textAlign: "right", marginTop: 20 }}>
                <div style={{ fontSize: 11.5, color: "var(--text-dim)", display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end", marginBottom: 6 }}>Next <ArrowRight size={12} /></div>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>{next.title}</div>
              </Link>
            ) : <div />}
          </div>
        </article>

        {/* RIGHT — on this page */}
        <aside className="docs-toc">
          <div className="docs-toc__label">On this page</div>
          <nav style={{ marginBottom: 22 }}>
            {toc.map(([anchor, label]) => (
              <a key={anchor} href={`#${anchor}`} className={`docs-toc__link ${active === anchor ? "on" : ""}`}>{label}</a>
            ))}
          </nav>
        </aside>
      </div>

      <style>{`
        .docs-mobilebar { display: none; }
        @media (max-width: 900px) {
          .docs-mobilebar { display: flex; }
        }
        @media (max-width: 560px) { .prevnext { grid-template-columns: 1fr !important; } }
      `}</style>
    </Layout>
  );
}
