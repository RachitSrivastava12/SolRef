import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Layout from "../components/Layout";
import { iconFor } from "../lib/concepts";
import { innovations, txStates } from "../lib/innovations";

export default function Innovations() {
  const [state, setState] = useState(0);
  const cur = txStates[state];

  return (
    <Layout>
      <div className="shell" style={{ position: "relative", zIndex: 1, paddingTop: 56 }}>
        <div className="page-heading">
          <div className="eyebrow reveal">Core architecture</div>
          <h1 className="page-title reveal" style={{ animationDelay: ".05s" }}>{innovations.length} protocol systems.</h1>
          <p className="page-subtitle reveal" style={{ animationDelay: ".1s" }}>
            The core mechanisms behind Solana throughput — from the network clock to parallel execution and
            data propagation — plus recent protocol and infrastructure changes now reshaping it.
          </p>
        </div>

        <div className="doc-list" style={{ marginBottom: 64 }}>
          {innovations.map((inv) => {
            const body = (
              <>
                <span className="doc-row__icon">{iconFor(inv.icon)}</span>
                <div>
                  <div className="doc-row__title">
                    <strong>{inv.name}</strong>
                    <span>{inv.mechanism}</span>
                  </div>
                  <p>{inv.impact}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {inv.statusLabel && <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--neon-green)", border: "1px solid rgba(20,241,149,.3)", borderRadius: 99, padding: "3px 8px" }}>{inv.statusLabel}</span>}
                  {!inv.statusLabel && inv.frontier && <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--neon-green)", border: "1px solid rgba(20,241,149,.3)", borderRadius: 99, padding: "3px 8px" }}>2025</span>}
                  {inv.legacy && <span className="doc-muted" style={{ color: "var(--sol-yellow)" }}>legacy</span>}
                  {inv.conceptId && <ArrowRight size={14} style={{ color: "var(--text-dim)" }} />}
                </div>
              </>
            );
            return inv.conceptId ? (
              <Link key={inv.name} to={`/docs/${inv.conceptId}`} className="doc-row">{body}</Link>
            ) : (
              <div key={inv.name} className="doc-row">{body}</div>
            );
          })}
        </div>

        <div className="eyebrow" style={{ marginBottom: 8 }}>Interactive</div>
        <h2 className="section-title" style={{ marginBottom: 8 }}>Commitment states</h2>
        <p style={{ fontSize: 16, color: "var(--text-mid)", maxWidth: 560, marginBottom: 26 }}>
          Alpenglow is live: <span className="mono" style={{ color: "var(--text)" }}>processed</span> stays provisional, while <span className="mono" style={{ color: "var(--text)" }}>confirmed</span> and <span className="mono" style={{ color: "var(--text)" }}>finalized</span> describe the same mainnet state.
        </p>

        <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 40 }}>
          <div style={{ padding: "26px 28px", background: "var(--surface)", borderBottom: "1px solid var(--line)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 10, height: 10, borderRadius: 99, background: cur.color }} />
              <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: 0 }}>{cur.label}</span>
              {cur.key === "finalized" && <span className="mono" style={{ fontSize: 11, padding: "3px 9px", borderRadius: 99, border: `1px solid ${cur.color}`, color: cur.color }}>◆ same state as confirmed</span>}
            </div>
            <p style={{ fontSize: 14.5, color: "var(--text-mid)", marginTop: 12, lineHeight: 1.6 }}>{cur.definition}</p>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 12, fontSize: 13.5, color: cur.color }}>
              <span style={{ marginTop: 1 }}>→</span><span>{cur.ux}</span>
            </div>
          </div>
          <div style={{ display: "flex", padding: 14, gap: 10 }}>
            {txStates.map((s, i) => (
              <button key={s.key} onClick={() => setState(i)}
                style={{ flex: 1, padding: "13px 10px", borderRadius: 10, border: `1px solid ${i === state ? "var(--text)" : "var(--line-2)"}`, background: i === state ? "var(--text)" : "var(--surface-2)", color: i === state ? "var(--bg)" : "var(--text-dim)", fontWeight: 600, fontSize: 13.5, transition: "background .18s var(--ease-out), border-color .18s var(--ease-out), color .18s var(--ease-out)", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <span className="mono" style={{ fontSize: 10, opacity: .7 }}>{i + 1}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <Link to="/lifecycle" className="grad-border" style={{ borderRadius: "var(--r-lg)", padding: "26px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>See how a transaction reaches finality</div>
            <div style={{ fontSize: 13.5, color: "var(--text-dim)" }}>Walk the full six-step lifecycle, with the trigger behind each stage.</div>
          </div>
          <ArrowRight size={18} style={{ color: "var(--text)", flexShrink: 0 }} />
        </Link>
      </div>
    </Layout>
  );
}
