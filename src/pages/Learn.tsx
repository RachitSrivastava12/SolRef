import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, GraduationCap } from "lucide-react";
import Layout from "../components/Layout";
import { concepts, conceptsByLevel, metaFor, iconFor, levelMeta, levelOrder } from "../lib/concepts";
import { chapters, learningPhases } from "../lib/chapters";

function TrackCard({ chapter, total }: { chapter: (typeof chapters)[number]; total: number }) {
  const prerequisites = chapter.prerequisites
    .map((id) => chapters.find((item) => item.id === id)?.title)
    .filter(Boolean);

  return (
    <Link to={`/deep-dives/${chapter.id}`} className="curriculum-track">
      <div className="curriculum-track__top">
        <span className="curriculum-track__number">TRACK {String(chapter.sequence).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
        <span className="curriculum-track__count">{chapter.conceptIds.length} references</span>
      </div>
      <div className="curriculum-track__body">
        <span className="curriculum-track__domain">{chapter.domain}</span>
        <h3>{chapter.title}</h3>
        <p>{chapter.summary}</p>
        <strong>{chapter.outcome}</strong>
        <small>{prerequisites.length ? `First: ${prerequisites.join(" · ")}` : "Start here · no prerequisites"}</small>
      </div>
      <ArrowRight className="curriculum-track__arrow" size={17} aria-hidden="true" />
    </Link>
  );
}

export default function Learn() {
  const startChapter = chapters[0];
  const finishChapter = chapters[chapters.length - 1];
  const coveredConceptCount = new Set(chapters.flatMap((chapter) => chapter.conceptIds)).size;

  return (
    <Layout>
      <div className="shell curriculum-shell" style={{ position: "relative", zIndex: 1, paddingTop: 56 }}>
        <header className="curriculum-intro">
          <div className="eyebrow reveal">SolRef curriculum</div>
          <h1 className="page-title reveal" style={{ animationDelay: ".05s" }}>Start with the basics. Finish with the whole system.</h1>
          <p className="page-subtitle reveal" style={{ animationDelay: ".1s" }}>
            Follow {chapters.length} tracks in order. Each track links the references to read and the ideas to carry forward.
          </p>
          <div className="curriculum-intro__actions">
            <Link to={startChapter ? `/deep-dives/${startChapter.id}` : "/docs"} className="btn btn-grad">
              Start · Track 01 {startChapter?.title} <ArrowRight size={16} />
            </Link>
            <a href="#reference-library" className="btn btn-surface">Browse the reference library</a>
          </div>
          <div className="curriculum-stats" aria-label="Curriculum coverage">
            <span><strong>{learningPhases.length}</strong> stages</span>
            <span><strong>{chapters.length}</strong> tracks</span>
            <span><strong>{coveredConceptCount}</strong> of {concepts.length} references in the route</span>
          </div>
        </header>

        <section className="curriculum-roadmap" aria-labelledby="roadmap-title">
          <div className="curriculum-section-heading">
            <div className="eyebrow">The route</div>
            <h2 id="roadmap-title">Five stages, from first concepts to the frontier.</h2>
            <p>Read the tracks from top to bottom. The final stage is the finish line.</p>
          </div>

          {learningPhases.map((phase) => {
            const phaseTracks = chapters.filter((chapter) => chapter.phase === phase.id);
            return (
              <section key={phase.id} className="curriculum-phase" aria-labelledby={`phase-${phase.id}`}>
                <div className="curriculum-phase__heading">
                  <span className="curriculum-phase__number">0{phase.id}</span>
                  <div>
                    <h3 id={`phase-${phase.id}`}>{phase.title}</h3>
                    <p>{phase.summary}</p>
                  </div>
                  <span className="curriculum-phase__track-count">{phaseTracks.length} {phaseTracks.length === 1 ? "track" : "tracks"}</span>
                </div>
                <div className="curriculum-tracks">
                  {phaseTracks.map((chapter) => <TrackCard key={chapter.id} chapter={chapter} total={chapters.length} />)}
                </div>
              </section>
            );
          })}
        </section>

        {finishChapter && (
          <section className="curriculum-finish" aria-labelledby="finish-title">
            <div className="curriculum-finish__icon"><GraduationCap size={22} aria-hidden="true" /></div>
            <div className="curriculum-finish__content">
              <div className="eyebrow">Finish line · Track {String(finishChapter.sequence).padStart(2, "0")}</div>
              <h2 id="finish-title">Explain one transaction from signature to finality.</h2>
              <p>Use the route to connect these pieces in your own words:</p>
              <ol>
                <li>What the transaction declares: instructions, signers, accounts, and fees.</li>
                <li>How it reaches a validator, gets scheduled, executes, and changes account state.</li>
                <li>How blocks propagate, consensus establishes finality, and apps observe the result.</li>
                <li>Where fees, ordering, and current protocol changes affect the outcome.</li>
              </ol>
              <Link to={`/deep-dives/${finishChapter.id}`} className="btn btn-grad">
                Finish with {finishChapter.title} <ArrowRight size={16} />
              </Link>
            </div>
          </section>
        )}

        <details id="reference-library" className="curriculum-library">
          <summary><BookOpen size={17} aria-hidden="true" /> Browse all {concepts.length} references by level</summary>
          <div className="curriculum-library__grid">
            {levelOrder.map((level) => (
              <section key={level} className="curriculum-library__level">
                <div className="curriculum-library__level-heading" style={{ color: levelMeta[level].color }}>
                  <span>{levelMeta[level].label}</span>
                  <span>{conceptsByLevel(level).length}</span>
                </div>
                <div className="curriculum-library__links">
                  {conceptsByLevel(level).map((concept) => {
                    const id = metaFor(concept.title).id;
                    return (
                      <Link key={id} to={`/docs/${id}`}>
                        {iconFor(concept.icon)}
                        <span>{concept.title}</span>
                        <ArrowRight size={13} aria-hidden="true" />
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </details>
      </div>
    </Layout>
  );
}
