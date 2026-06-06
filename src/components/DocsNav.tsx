import { Link } from "react-router-dom";
import { concepts, categories, metaFor } from "../lib/concepts";

// Ordered category groups for the docs sidebar (skip the "All" pseudo-category).
const GROUPS = categories.filter((c) => c !== "All");

export default function DocsNav({ activeId }: { activeId?: string }) {
  return (
    <nav aria-label="Documentation">
      <Link to="/docs" className={`docs-nav__link ${activeId === "__overview" ? "on" : ""}`} style={{ marginBottom: 18, fontWeight: 550, color: activeId === "__overview" ? "var(--text)" : "var(--text-mid)" }}>
        <span className="docs-nav__dot" /> Overview
      </Link>
      {GROUPS.map((group) => {
        const items = concepts.filter((c) => c.tag === group);
        if (items.length === 0) return null;
        return (
          <div key={group} className="docs-nav__group">
            <div className="docs-nav__label">{group}</div>
            {items.map((c) => {
              const m = metaFor(c.title);
              const on = m.id === activeId;
              return (
                <Link key={m.id} to={`/docs/${m.id}`} className={`docs-nav__link ${on ? "on" : ""}`}>
                  {!on && <span className="docs-nav__dot" />}
                  <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</span>
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
