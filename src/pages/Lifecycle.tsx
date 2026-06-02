import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";
import Layout from "../components/Layout";
import { iconFor } from "../lib/concepts";
import { lifecycle } from "../lib/innovations";

export default function Lifecycle() {
  const [active, setActive] = useState(0);
  const step = lifecycle[active];

  return (
    <Layout>
      <div className="aurora" />
      <div className="shell" style={{ position: "relative", zIndex: 1, paddingTop: 56 }}>
        <div className="eyebrow reveal">Data flow</div>
        <h1 className="reveal" style={{ fontSize: 42, fontWeight: 800, margin: "10px 0 12px", letterSpacing: "-.025em", animationDelay: ".05s" }}>
          A transaction's <span className="grad-text">journey to finality</span>
        </h1>
        <p className="reveal" style={{ fontSize: 17, color: "var(--text-mid)", maxWidth: 620, marginBottom: 40, animationDelay: ".1s" }}>
          From a signature on your laptop to an irreversible block — six stages, each with the exact trigger that advances it.
        </p>

        {/* STEPPER TRACK */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 36, overflowX: "auto", paddingBottom: 8 }}>
          {lifecycle.map((s, i) => (
            <div key={s.n} style={{ display: "flex", alignItems: "center", flex: "1 0 auto" }}>
              <button onClick={() => setActive(i)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, background: "none", border: "none", minWidth: 92 }}>
                <span style={{ width: 52, height: 52, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${i <= active ? "transparent" : "var(--line-2)"}`, background: i <= active ? "var(--grad)" : "var(--surface)", color: i <= active ? "#06040a" : "var(--text-dim)", transition: "all .3s", transform: i === active ? "scale(1.08)" : "scale(1)" }}>
                  {iconFor(s.icon)}
                </span>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: i === active ? "var(--text)" : "var(--text-dim)", textAlign: "center", maxWidth: 90 }}>{s.title}</span>
              </button>
              {i < lifecycle.length - 1 && <ChevronRight size={16} style={{ color: i < active ? "var(--sol-green)" : "var(--line-2)", flexShrink: 0, transition: "color .3s" }} />}
            </div>
          ))}
        </div>

        {/* ACTIVE STEP DETAIL */}
        <div className="card" style={{ padding: 32, marginBottom: 28, minHeight: 200 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
            <span style={{ width: 54, height: 54, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--grad)", color: "#06040a" }}>{iconFor(step.icon)}</span>
            <div>
              <div className="mono" style={{ fontSize: 11, color: "var(--text-dim)" }}>STEP {step.n} / 6</div>
              <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.02em" }}>{step.title}</h2>
            </div>
          </div>
          <p style={{ fontSize: 16, color: "var(--text-mid)", lineHeight: 1.7, marginBottom: 20 }}>{step.detail}</p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "11px 16px", borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--line)" }}>
            <span className="mono" style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".15em", color: "var(--text)" }}>Trigger</span>
            <span className="mono" style={{ fontSize: 13, color: "var(--text)" }}>{step.trigger}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <button onClick={() => setActive((a) => Math.max(0, a - 1))} disabled={active === 0} className="btn btn-surface" style={{ opacity: active === 0 ? .4 : 1 }}>Previous</button>
          {active < lifecycle.length - 1
            ? <button onClick={() => setActive((a) => a + 1)} className="btn btn-grad">Next stage <ArrowRight size={16} /></button>
            : <Link to="/docs/tx-lifecycle" className="btn btn-grad">Read the full concept <ArrowRight size={16} /></Link>}
        </div>
      </div>
    </Layout>
  );
}
