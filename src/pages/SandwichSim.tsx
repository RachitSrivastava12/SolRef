import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Zap } from "lucide-react";
import Layout from "../components/Layout";

export default function SandwichSim() {
  const [slippage, setSlippage] = useState(2.0); // percent tolerance
  const [attackerSize, setAttackerSize] = useState(50); // relative size

  // toy constant-product-ish price impact model (illustrative, not a real AMM quote)
  const sim = useMemo(() => {
    const userTrade = 100;
    const frontRun = attackerSize;
    const baseImpact = (frontRun / (1000 + frontRun)) * 100;     // % the attacker pushes price up
    const userImpact = (userTrade / (1000 + frontRun + userTrade)) * 100;
    const userExpectedPrice = 1.0;
    const userExecPrice = userExpectedPrice * (1 + baseImpact / 100);
    const userSlipPct = ((userExecPrice - userExpectedPrice) / userExpectedPrice) * 100;
    const protected_ = userSlipPct > slippage;     // tx reverts if realized slip exceeds tolerance
    const attackerProfit = protected_ ? 0 : (baseImpact / 100) * userTrade * 0.6;
    return {
      baseImpact: baseImpact.toFixed(2),
      userSlipPct: userSlipPct.toFixed(2),
      protected_,
      attackerProfit: attackerProfit.toFixed(2),
      userExecPrice: userExecPrice.toFixed(4),
    };
  }, [slippage, attackerSize]);

  const Tx = ({ label, color, sub }: { label: string; color: string; sub: string }) => (
    <div style={{ flex: 1, padding: "16px 14px", borderRadius: 12, background: "var(--surface-2)", border: `1px solid ${color}`, textAlign: "center" }}>
      <div className="mono" style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".12em", color, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 13, color: "var(--text-mid)" }}>{sub}</div>
    </div>
  );

  return (
    <Layout>
      <div className="shell" style={{ position: "relative", zIndex: 1, paddingTop: 56, maxWidth: 860 }}>
        <div className="page-heading">
          <div className="eyebrow reveal">Network dynamics · interactive</div>
          <h1 className="page-title reveal" style={{ animationDelay: ".05s" }}>Sandwich simulator.</h1>
          <p className="page-subtitle reveal" style={{ animationDelay: ".1s" }}>
            A bot buys before your swap and sells after it. Tighten slippage and watch the bundle fail.
          </p>
        </div>

        {/* THE SANDWICH */}
        <div className="card" style={{ padding: 28, marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "stretch", marginBottom: 8 }}>
            <Tx label="① Front-run" color="var(--text-mid)" sub="Bot buys before you, pushing price up" />
            <Tx label="② Your swap" color={sim.protected_ ? "var(--sol-green)" : "var(--sol-yellow)"} sub={sim.protected_ ? "Reverts — slippage exceeded" : "Fills at a worse price"} />
            <Tx label="③ Back-run" color="var(--text-mid)" sub="Bot sells into your impact" />
          </div>
          <div className="mono" style={{ textAlign: "center", fontSize: 11, color: "var(--text-dim)", marginTop: 10 }}>all three land in one atomic Jito bundle — same slot, same order</div>
        </div>

        {/* CONTROLS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }} className="sim-controls">
          <div className="card" style={{ padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Your slippage tolerance</span>
              <span className="mono" style={{ fontSize: 14, color: "var(--text)" }}>{slippage.toFixed(1)}%</span>
            </div>
            <input type="range" min={0.1} max={5} step={0.1} value={slippage} onChange={(e) => setSlippage(+e.target.value)} style={{ width: "100%", accentColor: "var(--sol-green)" }} />
            <div className="mono" style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 8 }}>lower = safer, but more likely to fail in volatility</div>
          </div>
          <div className="card" style={{ padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Attacker size</span>
              <span className="mono" style={{ fontSize: 14, color: "var(--text)" }}>{attackerSize}</span>
            </div>
            <input type="range" min={10} max={300} step={10} value={attackerSize} onChange={(e) => setAttackerSize(+e.target.value)} style={{ width: "100%", accentColor: "var(--text-mid)" }} />
            <div className="mono" style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 8 }}>bigger front-run = more price impact to harvest</div>
          </div>
        </div>

        {/* OUTCOME */}
        <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 32, border: `1px solid ${sim.protected_ ? "var(--sol-green)" : "var(--sol-yellow)"}` }}>
          <div style={{ padding: "22px 26px", background: sim.protected_ ? "rgba(62,207,142,.08)" : "rgba(255,210,63,.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              {sim.protected_ ? <Shield size={20} style={{ color: "var(--text)" }} /> : <Zap size={20} style={{ color: "var(--sol-yellow)" }} />}
              <span style={{ fontSize: 18, fontWeight: 700, color: sim.protected_ ? "var(--sol-green)" : "var(--sol-yellow)" }}>
                {sim.protected_ ? "Protected — your swap reverts" : "Sandwiched — you ate the impact"}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 16 }}>
              <Stat label="Price impact" value={`${sim.baseImpact}%`} />
              <Stat label="Your realized slip" value={`${sim.userSlipPct}%`} />
              <Stat label="Attacker profit" value={`${sim.attackerProfit} units`} accent={sim.protected_ ? "var(--sol-green)" : "var(--sol-yellow)"} />
            </div>
          </div>
        </div>

        <p style={{ fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 28 }}>
          This is an illustrative model, not a live AMM quote — the takeaway is the relationship: when your realized slippage would exceed your tolerance, the swap reverts and the attacker's bundle becomes unprofitable. Tight slippage + fresh quotes are your cheapest defense.
        </p>

        <Link to="/docs/sandwich" className="grad-border" style={{ borderRadius: "var(--r-lg)", padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>Read the full breakdown</div>
            <div style={{ fontSize: 13.5, color: "var(--text-dim)" }}>Sandwich attacks &amp; protection — detection, mitigation, and the Jito angle.</div>
          </div>
          <ArrowRight size={18} style={{ color: "var(--text)", flexShrink: 0 }} />
        </Link>
      </div>

      <style>{`@media (max-width: 640px){ .sim-controls{ grid-template-columns:1fr !important } }`}</style>
    </Layout>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: accent || "var(--text)" }}>{value}</div>
    </div>
  );
}
