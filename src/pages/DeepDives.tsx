import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, GraduationCap } from "lucide-react";
import Layout from "../components/Layout";
import { chapters, chapterConcepts, learningPhases } from "../lib/chapters";

function ChapterCard({ chapter }: { chapter: (typeof chapters)[number] }) {
  const concepts = chapterConcepts(chapter);
  const prerequisites = chapter.prerequisites
    .map((id) => chapters.find((item) => item.id === id)?.title)
    .filter(Boolean);

  return (
    <Link to={`/deep-dives/${chapter.id}`} className="chapter-card">
      <div className="chapter-card__meta">
        <span className="chapter-card__index">TRACK {String(chapter.sequence).padStart(2, "0")}</span>
        <span className="chapter-card__domain">{chapter.domain}</span>
      </div>
      <strong>{chapter.title}</strong>
      <em>{chapter.summary}</em>
      <p className="chapter-card__outcome">{chapter.outcome}</p>
      <div className="chapter-card__concepts">
        {concepts.slice(0, 5).map(({ concept, meta }) => (
          <span key={meta.id}>{concept.title.replace(" & Validator Clients", "")}</span>
        ))}
        {concepts.length > 5 && <span>+{concepts.length - 5} more</span>}
      </div>
      <div className="chapter-card__footer">
        <span>{concepts.length} references{prerequisites.length ? ` · after ${prerequisites.join(" and ")}` : " · start here"}</span>
        <ArrowRight size={14} aria-hidden="true" />
      </div>
    </Link>
  );
}

export default function DeepDives() {
  const coveredConceptCount = new Set(chapters.flatMap((chapter) => chapter.conceptIds)).size;
  const startChapter = chapters[0];
  const finishChapter = chapters[chapters.length - 1];

  return (
    <Layout wide>
      <div className="shell-wide curriculum-shell" style={{ paddingTop: 54, position: "relative", zIndex: 1 }}>
        <header className="page-heading curriculum-intro" style={{ maxWidth: 850 }}>
          <div className="eyebrow reveal">The SolRef route · {chapters.length} tracks</div>
          <h1 className="page-title reveal deep-page-title" style={{ animationDelay: ".05s" }}>From the first transaction to the protocol frontier.</h1>
          <p className="page-subtitle reveal deep-page-subtitle" style={{ animationDelay: ".1s" }}>
            Follow the five stages in order. They connect {coveredConceptCount} reference pages into one model of how Solana processes, propagates, and finalizes transactions.
          </p>
          {startChapter && (
            <Link to={`/deep-dives/${startChapter.id}`} className="btn btn-grad" style={{ marginTop: 20 }}>
              Start with Track 01 · {startChapter.title} <ArrowRight size={16} />
            </Link>
          )}
        </header>

        <div className="curriculum-roadmap">
          {learningPhases.map((phase) => {
            const phaseTracks = chapters.filter((chapter) => chapter.phase === phase.id);
            return (
              <section key={phase.id} className="landing-section curriculum-phase-section" aria-labelledby={`deep-phase-${phase.id}`}>
                <div className="landing-head landing-head--compact">
                  <div>
                    <div className="eyebrow">Stage 0{phase.id} · {phaseTracks.length} {phaseTracks.length === 1 ? "track" : "tracks"}</div>
                    <h2 id={`deep-phase-${phase.id}`}>{phase.title}</h2>
                  </div>
                  <p>{phase.summary}</p>
                </div>
                <div className="chapter-grid">
                  {phaseTracks.map((chapter) => <ChapterCard key={chapter.id} chapter={chapter} />)}
                </div>
              </section>
            );
          })}
        </div>

        {finishChapter && (
          <section className="curriculum-finish" aria-labelledby="deep-finish-title">
            <div className="curriculum-finish__icon"><GraduationCap size={22} aria-hidden="true" /></div>
            <div className="curriculum-finish__content">
              <div className="eyebrow">Finish line · Track {String(finishChapter.sequence).padStart(2, "0")}</div>
              <h2 id="deep-finish-title">Explain one transaction from signature to finality.</h2>
              <p>Finish the route when you can connect the data model, validator execution, network propagation, consensus, and fees in one explanation.</p>
              <Link to={`/deep-dives/${finishChapter.id}`} className="btn btn-grad" style={{ marginTop: 16 }}>
                Finish with {finishChapter.title} <ArrowRight size={16} />
              </Link>
            </div>
          </section>
        )}

        <Link to="/learn" className="curriculum-library-link">
          <BookOpen size={16} aria-hidden="true" /> See the start guide and browse all references <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </Layout>
  );
}
