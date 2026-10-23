import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Activity, Crosshair } from "lucide-react";
import Layout from "../components/Layout";
import ConceptLab from "../lib/Labs";
import { conceptById, metaFor } from "../lib/concepts";

const LABS = [
  { id: "proof-of-history", anchor: "poh", title: "Proof of History (Tower-era model)", blurb: "Play the SHA-256 chain forward and see how PoH supplied Solana's clock under Tower BFT. Alpenglow changed block pacing and timestamp semantics." },
  { id: "sealevel", anchor: "sealevel", title: "Sealevel scheduler", blurb: "Change which account each transaction writes and watch what runs in parallel vs. what serializes." },
  { id: "priority-fees", anchor: "fees", title: "Fee & compute estimator", blurb: "Slide the compute-unit limit and price; watch the base + priority fee update live." },
  { id: "tower-bft", anchor: "tower", title: "Tower lockouts (retired model)", blurb: "Replay the lockout mechanism Tower BFT used before Votor replaced it on mainnet." },
];

const MORE = [
  { to: "/lifecycle", icon: <Activity size={18} />, title: "Transaction lifecycle", desc: "Step a transaction from signature to finality, one stage at a time." },
  { to: "/sandwich", icon: <Crosshair size={18} />, title: "Sandwich simulator", desc: "Set slippage and attacker size; see the extracted value and how protection changes it." },
];

export default function Labs() {
  useEffect(() => {
    const h = window.location.hash.slice(1);
    if (h) {
      const el = document.getElementById(h);
      if (el) { setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 90); return; }
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <Layout>
      <div className="shell" style={{ paddingTop: 56, maxWidth: 940, position: "relative", zIndex: 1 }}>
        <div className="page-heading">
          <div className="eyebrow reveal">Interactive</div>
          <h1 className="page-title reveal" style={{ animationDelay: ".05s" }}>Labs.</h1>
          <p className="page-subtitle reveal" style={{ animationDelay: ".1s" }}>
            Hands-on widgets for the ideas that don't land from prose — the clock, the parallel scheduler,
            the fee market, and finality. Each one links to its full reference page.
          </p>
        </div>

        {LABS.map((l, i) => {
          const c = conceptById(l.id);
          const m = c ? metaFor(c.title) : null;
          return (
            <section key={l.id} id={l.anchor} style={{ marginBottom: 44, scrollMarginTop: "calc(var(--nav-h) + 14px)" }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
                <div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--text-dim)", letterSpacing: ".12em" }}>LAB 0{i + 1}</div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", marginTop: 4 }}>{l.title}</h2>
                  <p style={{ color: "var(--text-dim)", fontSize: 14, marginTop: 5, maxWidth: 600, lineHeight: 1.55 }}>{l.blurb}</p>
                </div>
                {m && (
                  <Link to={`/docs/${m.id}`} style={{ fontSize: 13, color: "var(--text-mid)", display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    Full page <ArrowRight size={13} />
                  </Link>
                )}
              </div>
              <ConceptLab id={l.id} />
            </section>
          );
        })}

        <section style={{ marginTop: 8, marginBottom: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>More interactive tools</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
            {MORE.map((t) => (
              <Link key={t.to} to={t.to} className="card card-lift" style={{ padding: 20, display: "block" }}>
                <span style={{ width: 38, height: 38, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--neon-green)", background: "var(--surface-2)", border: "1px solid var(--line)", marginBottom: 14 }}>{t.icon}</span>
                <h3 style={{ fontSize: 16.5, fontWeight: 700, marginBottom: 7 }}>{t.title}</h3>
                <p style={{ fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.55 }}>{t.desc}</p>
                <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text)", fontWeight: 650 }}>Open <ArrowRight size={13} /></div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
