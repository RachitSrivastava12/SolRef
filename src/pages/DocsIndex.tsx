import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, AlertTriangle, Sparkles } from "lucide-react";
import Layout from "../components/Layout";
import { concepts, categories, metaFor, iconFor, levelMeta } from "../lib/concepts";

export default function DocsIndex() {
  const [cat, setCat] = useState("All");
  const list = cat === "All" ? concepts : concepts.filter((c) => c.tag === cat);

  return (
    <Layout>
      <div className="aurora" />
      <div className="shell" style={{ paddingTop: 56, position: "relative", zIndex: 1 }}>
        <div className="eyebrow reveal">Documentation</div>
        <h1 className="reveal" style={{ fontSize: 42, fontWeight: 800, margin: "10px 0 12px", letterSpacing: "-.025em", animationDelay: ".05s" }}>
          The full Solana <span className="grad-text">infrastructure</span> reference
        </h1>
        <p className="reveal" style={{ fontSize: 17, color: "var(--text-mid)", maxWidth: 620, animationDelay: ".1s" }}>
          {concepts.length} concepts, each its own deep page — diagram, production code, the gotchas that bite, and a quiz to lock it in.
        </p>

        <div className="reveal" style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "32px 0 28px", animationDelay: ".15s" }}>
          {categories.map((c) => (
            <button key={c} className={`pill ${cat === c ? "on" : ""}`} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 15, paddingBottom: 20 }}>
          {list.map((c) => {
            const m = metaFor(c.title);
            return (
              <Link key={m.id} to={`/docs/${m.id}`} className="card card-lift" style={{ padding: 22, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                  <span style={{ width: 40, height: 40, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text)", background: "var(--surface-2)" }}>{iconFor(c.icon)}</span>
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", padding: "3px 9px", borderRadius: 99, border: "1px solid var(--line-2)", color: levelMeta[m.level].color }}>{levelMeta[m.level].label}</span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{c.title}</h3>
                <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.55, flex: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{c.desc}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 16, fontSize: 12 }}>
                  {c.commonMistakes?.length > 0 && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--sol-yellow)" }}>
                      <AlertTriangle size={12} /> {c.commonMistakes.length} gotchas
                    </span>
                  )}
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--text)" }}><Sparkles size={12} /> quiz</span>
                  <ArrowRight size={14} style={{ color: "var(--text-dim)", marginLeft: "auto" }} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
