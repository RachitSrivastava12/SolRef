import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Target, CheckCircle2, Sparkles } from "lucide-react";
import Layout from "../components/Layout";
import { chapters, chapterConcepts } from "../lib/chapters";
import { iconFor, levelMeta } from "../lib/concepts";
import { deepDiveFor } from "../lib/deepDives";

export default function ChapterPage() {
  const { id = "" } = useParams();
  const idx = chapters.findIndex((c) => c.id === id);
  const chapter = idx >= 0 ? chapters[idx] : undefined;

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  if (!chapter) {
    return (
      <Layout>
        <div className="shell" style={{ paddingTop: 100, textAlign: "center" }}>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>Track not found</h1>
          <Link to="/deep-dives" className="btn btn-grad" style={{ marginTop: 20 }}>All deep dives <ArrowRight size={16} /></Link>
        </div>
      </Layout>
    );
  }

  const items = chapterConcepts(chapter);
  const firstId = items[0]?.meta.id;
  const prev = idx > 0 ? chapters[idx - 1] : null;
  const next = idx < chapters.length - 1 ? chapters[idx + 1] : null;

  return (
    <Layout>
      <div className="shell" style={{ paddingTop: 56, position: "relative", zIndex: 1, maxWidth: 900 }}>
        <Link to="/deep-dives" style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--text-dim)", marginBottom: 22 }}>
          <ArrowLeft size={14} /> Deep dives
        </Link>

        <div className="page-heading" style={{ maxWidth: 760, marginBottom: 28 }}>
          <div className="eyebrow reveal">{chapter.domain}</div>
          <h1 className="page-title reveal" style={{ animationDelay: ".05s" }}>{chapter.title}</h1>
          <p className="page-subtitle reveal" style={{ animationDelay: ".1s" }}>{chapter.summary}</p>
        </div>

        {/* outcome */}
        <div className="grad-border reveal" style={{ borderRadius: "var(--r-md)", padding: 20, marginBottom: 32, animationDelay: ".12s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
            <Target size={15} style={{ color: "var(--neon-green)" }} />
            <span className="eyebrow">What you'll be able to do</span>
          </div>
          <p style={{ fontSize: 15.5, color: "var(--text-mid)", lineHeight: 1.7 }}>{chapter.outcome}</p>
          {chapter.prerequisites.length > 0 && (
            <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6, marginTop: 12 }}>
              Read first: {chapter.prerequisites.map((prerequisiteId, index) => {
                const prerequisite = chapters.find((item) => item.id === prerequisiteId);
                return prerequisite ? <span key={prerequisiteId}>{index > 0 && " · "}<Link to={`/deep-dives/${prerequisite.id}`} style={{ color: "var(--text-mid)" }}>{prerequisite.title}</Link></span> : null;
              })}
            </p>
          )}
        </div>

        {/* ordered path */}
        <div className="eyebrow" style={{ marginBottom: 12 }}>The path · {items.length} pages, in order</div>
        <div className="doc-list" style={{ marginBottom: 36 }}>
          {items.map(({ concept, meta }, i) => (
            <Link key={meta.id} to={`/docs/${meta.id}`} className="doc-row">
              <span className="doc-row__icon">{iconFor(concept.icon)}</span>
              <div>
                <div className="doc-row__title">
                  <strong>{concept.title}</strong>
                  <span>{levelMeta[meta.level].label}</span>
                </div>
                <p>{concept.desc}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {deepDiveFor(meta.id) && (
                  <span className="doc-muted" style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--neon-green)" }}>
                    <Sparkles size={12} /> deep dive
                  </span>
                )}
                <span className="doc-muted mono">{String(i + 1).padStart(2, "0")}</span>
                <ArrowRight size={14} style={{ color: "var(--text-dim)" }} />
              </div>
            </Link>
          ))}
        </div>

        {/* checkpoints */}
        <section style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
            <CheckCircle2 size={16} style={{ color: "var(--neon-green)" }} />
            <h2 className="doc-h2">Checkpoints</h2>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {chapter.checkpoints.map((cp) => (
              <div key={cp} style={{ display: "flex", gap: 11, alignItems: "flex-start", fontSize: 14, padding: "12px 14px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 9 }}>
                <span style={{ width: 5, height: 5, borderRadius: 99, background: "var(--neon-green)", flexShrink: 0, marginTop: 8 }} />
                <span style={{ color: "var(--text-mid)", lineHeight: 1.55 }}>{cp}</span>
              </div>
            ))}
          </div>
        </section>

        <a
          href={`https://github.com/RachitSrivastava12/SolRef/issues/new?template=reference-feedback.yml&title=${encodeURIComponent(`[Track] ${chapter.title}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "inline-block", marginBottom: 32, color: "var(--text-mid)", fontSize: 13 }}
        >
          Report where this track became unclear ↗
        </a>

        {/* source notes */}
        {chapter.sourceNotes?.length ? (
          <section style={{ marginBottom: 36 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Track notes</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {chapter.sourceNotes.map((n) => (
                <div key={n} style={{ fontSize: 14, color: "var(--text-mid)", lineHeight: 1.65, background: "var(--surface)", borderLeft: "2px solid var(--line-2)", borderRadius: 9, padding: "12px 15px" }}>{n}</div>
              ))}
            </div>
          </section>
        ) : null}

        {/* CTA */}
        {firstId && (
          <Link to={`/docs/${firstId}`} className="btn btn-grad" style={{ marginBottom: 32 }}>
            Start the track <ArrowRight size={16} />
          </Link>
        )}

        {/* prev / next track */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, paddingTop: 22, borderTop: "1px solid var(--line)" }} className="prevnext">
          {prev ? (
            <Link to={`/deep-dives/${prev.id}`} className="card card-lift" style={{ padding: 16 }}>
              <div style={{ fontSize: 11.5, color: "var(--text-dim)", display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}><ArrowLeft size={12} /> Previous track</div>
              <div style={{ fontSize: 14.5, fontWeight: 600 }}>{prev.title}</div>
            </Link>
          ) : <div />}
          {next ? (
            <Link to={`/deep-dives/${next.id}`} className="card card-lift" style={{ padding: 16, textAlign: "right" }}>
              <div style={{ fontSize: 11.5, color: "var(--text-dim)", display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end", marginBottom: 6 }}>Next track <ArrowRight size={12} /></div>
              <div style={{ fontSize: 14.5, fontWeight: 600 }}>{next.title}</div>
            </Link>
          ) : <div />}
        </div>
      </div>

      <style>{`@media (max-width: 560px) { .prevnext { grid-template-columns: 1fr !important; } }`}</style>
    </Layout>
  );
}
