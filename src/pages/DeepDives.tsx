import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Route, Sparkles } from "lucide-react";
import Layout from "../components/Layout";
import { chapters, chapterConcepts, hotPathStages } from "../lib/chapters";
import { conceptById, iconFor, metaFor } from "../lib/concepts";

function ChapterCard({ chapter, index }: { chapter: (typeof chapters)[number]; index: number }) {
  const concepts = chapterConcepts(chapter);

  return (
    <Link to={`/deep-dives/${chapter.id}`} className="chapter-card">
      <span className="chapter-card__index">0{index + 1}</span>
      <div>
        <span className="chapter-card__domain">{chapter.domain}</span>
        <strong>{chapter.title}</strong>
        <em>{chapter.summary}</em>
      </div>
      <div className="chapter-card__concepts">
        {concepts.slice(0, 5).map(({ concept, meta }) => (
          <span key={meta.id}>{concept.title.replace(" & Validator Clients", "")}</span>
        ))}
      </div>
      <span className="chapter-card__footer">
        {concepts.length} linked pages <ArrowRight size={13} />
      </span>
    </Link>
  );
}

export default function DeepDives() {
  const primary = chapters.slice(0, 3);
  const secondary = chapters.slice(3);

  return (
    <Layout wide>
      <div className="shell-wide" style={{ paddingTop: 54, position: "relative", zIndex: 1 }}>
        <div className="page-heading" style={{ maxWidth: 830 }}>
          <div className="eyebrow reveal">Deep dives</div>
          <h1 className="page-title reveal deep-page-title" style={{ animationDelay: ".05s" }}>Few paths, real depth.</h1>
          <p className="page-subtitle reveal deep-page-subtitle" style={{ animationDelay: ".1s" }}>
            Curated routes through Solana internals — the validator hot path, consensus and finality, the runtime,
            state, and the 2025 frontier — each read in an order that builds on itself.
          </p>
        </div>

        <section className="landing-section" style={{ paddingTop: 18 }}>
          <div className="landing-head landing-head--compact">
            <div>
              <div className="eyebrow">Validator hot path</div>
              <h2>Follow one transaction through the machine.</h2>
            </div>
            <p>
              Learn the exact handoffs a transaction makes — from network ingress through execution and state writes
              to broadcast. Each stage links to its full page.
            </p>
          </div>

          <div className="hot-path">
            {hotPathStages.map((stage, i) => {
              const concept = conceptById(stage.conceptId);
              const meta = concept ? metaFor(concept.title) : null;
              return (
                <Link key={stage.label} to={meta ? `/docs/${meta.id}` : "/docs"} className="hot-path__stage">
                  <span className="hot-path__num">0{i + 1}</span>
                  <strong>{stage.label}</strong>
                  <em>{stage.detail}</em>
                  <small>{concept?.tag ?? "Docs"}</small>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="landing-section">
          <div className="landing-head">
            <div>
              <div className="eyebrow">Core tracks</div>
              <h2>Start with the three tracks that explain most of Solana.</h2>
            </div>
            <p>
              Start with these three — together they explain most of how Solana works, then branch into the rest.
            </p>
          </div>
          <div className="chapter-grid">
            {primary.map((chapter, i) => <ChapterCard key={chapter.id} chapter={chapter} index={i} />)}
          </div>
        </section>

        <section className="landing-section">
          <div className="chapter-list">
            {secondary.map((chapter, i) => {
              const concepts = chapterConcepts(chapter);
              return (
                <article key={chapter.id} id={chapter.id} className="chapter-row">
                  <div className="chapter-row__meta">
                    <span>0{i + primary.length + 1}</span>
                    <em>{chapter.domain}</em>
                  </div>
                  <div className="chapter-row__body">
                    <h2>{chapter.title}</h2>
                    <p>{chapter.summary}</p>
                    <strong>{chapter.outcome}</strong>
                    <div className="chapter-row__checks">
                      {chapter.checkpoints.map((checkpoint) => <span key={checkpoint}>{checkpoint}</span>)}
                    </div>
                  </div>
                  <div className="chapter-row__refs">
                    <div className="chapter-row__refs-head">
                      <BookOpen size={13} /> Read next
                    </div>
                    {concepts.slice(0, 4).map(({ concept, meta }) => (
                      <Link key={meta.id} to={`/docs/${meta.id}`}>
                        {iconFor(concept.icon)}
                        <span>{concept.title}</span>
                        <ArrowRight size={12} />
                      </Link>
                    ))}
                    <Link to={`/deep-dives/${chapter.id}`} style={{ color: "var(--neon-green)" }}>
                      <Route size={13} />
                      <span>Open track</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="landing-section landing-section--last">
          <div className="grad-border" style={{ borderRadius: 8, padding: 24, display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 18, alignItems: "center" }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Go deeper</div>
              <h2 style={{ fontSize: 24, lineHeight: 1.14, letterSpacing: 0, marginBottom: 8 }}>The depth is inside the pages.</h2>
              <p style={{ color: "var(--text-mid)", fontSize: 14.5, lineHeight: 1.68, maxWidth: 720 }}>
                Proof of History, Tower BFT, Alpenglow, the Banking Stage, the SVM, AccountsDB, and QUIC/SWQoS each carry a full deep dive — the mental model, the mechanism, and the why.
              </p>
            </div>
            <Link to="/docs/proof-of-history" className="btn btn-grad">
              <Sparkles size={15} /> Open PoH
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
