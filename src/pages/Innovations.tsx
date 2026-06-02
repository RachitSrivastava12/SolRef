import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink, AlertTriangle } from "lucide-react";
import Layout from "../components/Layout";
import { iconFor } from "../lib/concepts";
import { innovations, txStates } from "../lib/innovations";

const ACCENT = { purple: "var(--sol-purple)", green: "var(--sol-green)", blue: "var(--sol-blue)" };

export default function Innovations() {
  const [state, setState] = useState(0);
  const cur = txStates[state];

  return (
    <Layout>
      <div className="aurora" />
      <div className="shell" style={{ position: "relative", zIndex: 1, paddingTop: 56 }}>
        <div className="eyebrow reveal">Core architecture</div>
        <h1 className="reveal" style={{ fontSize: 42, fontWeight: 800, margin: "10px 0 12px", letterSpacing: "-.025em", animationDelay: ".05s" }}>
          The 8 innovations that <span className="grad-text">make Solana fast</span>
        </h1>
        <p className="reveal" style={{ fontSize: 17, color: "var(--text-mid)", maxWidth: 640, animationDelay: ".1s" }}>
          Solana's throughput isn't one trick — it's eight interlocking systems. Here's each one, what it actually does, and where to go deeper.
        </p>

        {/* MATRIX */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px,1fr))", gap: 15, margin: "36px 0 64px" }}>
          {innovations.map((inv) => {
            const a = ACCENT[inv.accent];
            const body = (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <span style={{ width: 42, height: 42, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", color: a, background: "var(--surface-2)", flexShrink: 0 }}>{iconFor(inv.icon)}</span>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <h3 style={{ fontSize: 16.5, fontWeight: 700 }}>{inv.name}</h3>
                      {inv.legacy && <span className="mono" style={{ fontSize: 9.5, padding: "2px 7px", borderRadius: 99, background: "rgba(255,210,63,.12)", color: "var(--sol-yellow)", border: "1px solid rgba(255,210,63,.3)" }}>legacy</span>}
                    </div>
                    <div className="mono" style={{ fontSize: 11.5, color: a, marginTop: 2 }}>{inv.mechanism}</div>
                  </div>
                </div>
                <p style={{ fontSize: 13.5, color: "var(--text-mid)", lineHeight: 1.65, marginBottom: 12 }}>{inv.summary}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "var(--text-dim)", borderTop: "1px solid var(--line)", paddingTop: 12 }}>
                  <span style={{ width: 5, height: 5, borderRadius: 99, background: a }} />
                  {inv.impact}
                  {inv.conceptId && <ArrowRight size={13} style={{ marginLeft: "auto", color: a }} />}
                </div>
              </>
            );
            return inv.conceptId ? (
              <Link key={inv.name} to={`/docs/${inv.conceptId}`} className="card card-lift" style={{ padding: 22, display: "block" }}>{body}</Link>
            ) : (
              <div key={inv.name} className="card" style={{ padding: 22 }}>{body}</div>
            );
          })}
        </div>

        {/* INTERACTIVE STATE TOGGLE */}
        <div className="eyebrow" style={{ marginBottom: 8 }}>Interactive</div>
        <h2 style={{ fontSize: 30, fontWeight: 800, marginBottom: 8, letterSpacing: "-.02em" }}>Commitment states, live</h2>
        <p style={{ fontSize: 16, color: "var(--text-mid)", maxWidth: 560, marginBottom: 26 }}>
          The single most common Solana bug: treating <span className="mono" style={{ color: "var(--sol-purple)" }}>processed</span> like it's final. Toggle through the levels.
        </p>

        <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 40 }}>
          {/* status bar */}
          <div style={{ padding: "26px 28px", background: `linear-gradient(90deg, ${cur.color}14, transparent)`, borderBottom: "1px solid var(--line)", transition: "background .4s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 13, height: 13, borderRadius: 99, background: cur.color, boxShadow: `0 0 16px ${cur.color}`, animation: cur.key === "processed" ? "pulse 1.4s infinite" : "none" }} />
              <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.01em" }}>{cur.label}</span>
              {cur.key === "finalized" && <span className="mono" style={{ fontSize: 11, padding: "3px 9px", borderRadius: 99, border: `1px solid ${cur.color}`, color: cur.color }}>◆ rooted</span>}
            </div>
            <p style={{ fontSize: 14.5, color: "var(--text-mid)", marginTop: 12, lineHeight: 1.6 }}>{cur.definition}</p>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 12, fontSize: 13.5, color: cur.color }}>
              <span style={{ marginTop: 1 }}>→</span><span>{cur.ux}</span>
            </div>
          </div>
          {/* toggle track */}
          <div style={{ display: "flex", padding: 14, gap: 10 }}>
            {txStates.map((s, i) => (
              <button key={s.key} onClick={() => setState(i)}
                style={{ flex: 1, padding: "13px 10px", borderRadius: 12, border: `1px solid ${i === state ? s.color : "var(--line-2)"}`, background: i === state ? `${s.color}14` : "var(--surface-2)", color: i === state ? s.color : "var(--text-dim)", fontWeight: 600, fontSize: 13.5, transition: "all .2s", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
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
