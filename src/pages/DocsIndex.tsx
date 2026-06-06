import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, AlertTriangle, Sparkles } from "lucide-react";
import Layout from "../components/Layout";
import DocsNav from "../components/DocsNav";
import { concepts, categories, metaFor, iconFor, levelMeta } from "../lib/concepts";

const GROUPS = categories.filter((c) => c !== "All");

function ConceptRow({ title, tag }: { title: string; tag?: string }) {
  void tag;
  const c = concepts.find((x) => x.title === title)!;
  const m = metaFor(c.title);
  return (
    <Link to={`/docs/${m.id}`} className="doc-row">
      <span className="doc-row__icon">{iconFor(c.icon)}</span>
      <div>
        <div className="doc-row__title">
          <strong>{c.title}</strong>
          <span>{levelMeta[m.level].label}</span>
        </div>
        <p>{c.desc}</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {c.commonMistakes?.length > 0 && (
          <span className="doc-muted" style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--sol-yellow)" }}>
            <AlertTriangle size={12} /> {c.commonMistakes.length}
          </span>
        )}
        <span className="doc-muted" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Sparkles size={12} /> quiz</span>
        <ArrowRight size={14} style={{ color: "var(--text-dim)" }} />
      </div>
    </Link>
  );
}

export default function DocsIndex() {
  const [searchParams, setSearchParams] = useSearchParams();
  const catParam = searchParams.get("cat");
  const cat = catParam && categories.includes(catParam) ? catParam : "All";
  const setCat = (next: string) => {
    const params = new URLSearchParams(searchParams);
    if (next === "All") params.delete("cat");
    else params.set("cat", next);
    setSearchParams(params, { replace: true });
  };

  const groupsToShow = cat === "All" ? GROUPS : [cat];

  return (
    <Layout wide>
      <div className="docs-shell" style={{ position: "relative", zIndex: 1 }}>
        <aside className="docs-nav">
          <DocsNav activeId="__overview" />
        </aside>

        <div className="docs-content">
          <div className="crumb" style={{ marginBottom: 18 }}>
            <span style={{ color: "var(--text-mid)" }}>Documentation</span>
          </div>
          <h1 className="page-title reveal" style={{ marginTop: 0 }}>Solana internals, organized.</h1>
          <p className="page-subtitle reveal" style={{ animationDelay: ".05s", marginBottom: 28 }}>
            {concepts.length} focused references across the frontier, runtime, consensus, networking, programs, and economics —
            each with diagrams, runnable code, and the gotchas.
          </p>

          {/* domain filter chips */}
          <div className="reveal" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 38, animationDelay: ".1s" }}>
            {categories.map((c) => (
              <button key={c} onClick={() => setCat(c)} className={`pill ${cat === c ? "on" : ""}`}>
                <span>{c}</span>
                <span style={{ opacity: .6 }}>{c === "All" ? concepts.length : concepts.filter((x) => x.tag === c).length}</span>
              </button>
            ))}
          </div>

          {/* grouped sections */}
          {groupsToShow.map((group) => {
            const items = concepts.filter((c) => c.tag === group);
            if (items.length === 0) return null;
            return (
              <section key={group} id={group} style={{ marginBottom: 44, scrollMarginTop: "calc(var(--nav-h) + 8px)" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14, gap: 12 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 650, letterSpacing: "-0.02em" }}>
                    {group === "Frontier" && <span style={{ color: "var(--neon-green)" }}>● </span>}{group}
                  </h2>
                  <span className="doc-muted">{items.length} {items.length === 1 ? "page" : "pages"}</span>
                </div>
                <div className="doc-list">
                  {items.map((c) => <ConceptRow key={c.title} title={c.title} />)}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
