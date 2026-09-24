import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, GraduationCap } from "lucide-react";
import Layout from "../components/Layout";
import { concepts, conceptsByLevel, metaFor, iconFor, levelMeta, levelOrder } from "../lib/concepts";

export default function Learn() {
  return (
    <Layout>
      <div className="shell" style={{ position: "relative", zIndex: 1, paddingTop: 56 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 20, flexWrap: "wrap", marginBottom: 36 }}>
          <div className="page-heading" style={{ marginBottom: 0 }}>
            <div className="eyebrow reveal">Guided path</div>
            <h1 className="page-title reveal" style={{ animationDelay: ".05s" }}>Learning path.</h1>
            <p className="page-subtitle reveal" style={{ animationDelay: ".1s" }}>
              Work top to bottom: beginner references first, then the runtime, validator hot path, and frontier upgrades.
            </p>
          </div>
          <div className="card reveal" style={{ padding: 20, minWidth: 240, animationDelay: ".15s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <BookOpen size={18} style={{ color: "var(--sol-green)" }} />
              <span style={{ fontSize: 14, fontWeight: 600 }}>Reference scope</span>
            </div>
            <div style={{ fontSize: 12.5, fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>{concepts.length} open reference pages</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px,1fr))", gap: 16 }}>
          {levelOrder.map((lvl) => (
            <div key={lvl} className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
                <span style={{ width: 9, height: 9, borderRadius: 99, background: levelMeta[lvl].color }} />
                <h2 style={{ fontSize: 15, fontWeight: 700, color: levelMeta[lvl].color }}>{levelMeta[lvl].label}</h2>
                <span style={{ fontSize: 12, color: "var(--text-dim)", marginLeft: "auto", fontFamily: "var(--font-mono)" }}>{conceptsByLevel(lvl).length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {conceptsByLevel(lvl).map((c) => {
                  const id = metaFor(c.title).id;
                  return (
                    <Link key={id} to={`/docs/${id}`} className="card card-lift" style={{ padding: "11px 14px", display: "flex", alignItems: "center", gap: 11, background: "var(--surface-2)" }}>
                      <span style={{ color: "var(--sol-green)", opacity: .75, flexShrink: 0, display: "flex" }}>{iconFor(c.icon)}</span>
                      <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</span>
                      <span style={{ color: "var(--sol-green)", opacity: .6, flexShrink: 0, display: "flex" }}>{iconFor(c.icon)}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="grad-border" style={{ borderRadius: "var(--r-lg)", padding: "32px 28px", marginTop: 36, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <GraduationCap size={28} style={{ color: "var(--sol-green)" }} />
            <div>
              <div style={{ fontSize: 17, fontWeight: 700 }}>New to Solana? Start at the top.</div>
              <div style={{ fontSize: 13.5, color: "var(--text-dim)" }}>Transactions → Accounts → Lifecycle is the natural first run.</div>
            </div>
          </div>
          <Link to="/docs/transactions" className="btn btn-grad">Begin with Transactions <ArrowRight size={16} /></Link>
        </div>
      </div>
    </Layout>
  );
}
