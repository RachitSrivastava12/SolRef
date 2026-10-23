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
      <div className="shell" style={{ position: "relative", zIndex: 1, paddingTop: 56 }}>
        <div className="page-heading">
          <div className="eyebrow reveal">Data flow</div>
          <h1 className="page-title reveal" style={{ animationDelay: ".05s" }}>Transaction lifecycle.</h1>
          <p className="page-subtitle reveal" style={{ animationDelay: ".1s" }}>
            From local signature to Alpenglow finality: six stages, each with the trigger that advances it.
          </p>
        </div>

        {/* STEPPER TRACK */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 36, overflowX: "auto", paddingBottom: 8 }}>
          {lifecycle.map((s, i) => (
            <div key={s.n} style={{ display: "flex", alignItems: "center", flex: "1 0 auto" }}>
              <button onClick={() => setActive(i)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, background: "none", border: "none", minWidth: 92 }}>
                <span style={{ width: 52, height: 52, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${i <= active ? "var(--text)" : "var(--line-2)"}`, background: i <= active ? "var(--text)" : "var(--surface)", color: i <= active ? "var(--bg)" : "var(--text-dim)", transition: "background .22s var(--ease-out), border-color .22s var(--ease-out), color .22s var(--ease-out), transform .22s var(--ease-out)", transform: i === active ? "scale(1.04)" : "scale(1)" }}>
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
            <span style={{ width: 52, height: 52, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface-2)", border: "1px solid var(--line)", color: "var(--neon-green)" }}>{iconFor(step.icon)}</span>
            <div>
              <div className="mono" style={{ fontSize: 11, color: "var(--text-dim)" }}>STEP {step.n} / 6</div>
              <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: 0 }}>{step.title}</h2>
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
