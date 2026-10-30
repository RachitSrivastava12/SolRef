import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink, BookOpen, FileText, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import RaysHero from "../components/RaysHero";
import { concepts, conceptById, metaFor } from "../lib/concepts";
import { innovations } from "../lib/innovations";
import { chapters, hotPathStages } from "../lib/chapters";

const RPC = (import.meta.env.VITE_SOLANA_RPC as string) || "https://api.mainnet-beta.solana.com";

const PILLARS = [
  { to: "/learn", icon: <BookOpen size={18} />, label: "Curriculum", title: `${chapters.length} ordered tracks`, desc: "Start with foundations; finish with the protocol frontier." },
  { to: "/docs", icon: <FileText size={18} />, label: "Reference", title: `${concepts.length} concept pages`, desc: "Focused, source-aware references for Solana internals." },
  { to: "/innovations", icon: <Sparkles size={18} />, label: "Architecture", title: `${innovations.length} protocol systems`, desc: "The mechanisms and frontier upgrades behind Solana throughput." },
];

const INTERACTIVE = [
  { to: "/labs#poh", label: "Proof of History (Tower-era model)", desc: "See how PoH supplied Solana's clock under the retired Tower design." },
  { to: "/labs#sealevel", label: "Sealevel scheduler", desc: "See which transactions run in parallel — and which serialize." },
  { to: "/labs#fees", label: "Fee estimator", desc: "Slide compute limit and price; watch the fee." },
  { to: "/labs#tower", label: "Tower lockouts (historical)", desc: "Explore the retired lockout path Votor replaced on mainnet." },
  { to: "/lifecycle", label: "Transaction lifecycle", desc: "Signature to finality, step by step." },
  { to: "/sandwich", label: "Sandwich simulator", desc: "Slippage, bundles, and protection." },
];

const QUICK_LINKS = [
  { label: "Solana Docs", url: "https://docs.solana.com", desc: "Official reference" },
  { label: "Solana Cookbook", url: "https://solanacookbook.com", desc: "Practical recipes" },
  { label: "Anchor", url: "https://www.anchor-lang.com", desc: "Program framework" },
  { label: "Helius Blog", url: "https://www.helius.dev/blog", desc: "Deep technical posts" },
  { label: "Jito Labs", url: "https://docs.jito.wtf", desc: "MEV infrastructure" },
  { label: "QuickNode Guides", url: "https://www.quicknode.com/guides/solana-development", desc: "Dev tutorials" },
  { label: "Solana Playground", url: "https://beta.solpg.io", desc: "Browser IDE" },
  { label: "Solscan", url: "https://solscan.io", desc: "Explorer" },
];

function useLiveTps() {
  const [tps, setTps] = useState<string | null>(null);
  const [epoch, setEpoch] = useState<string | null>(null);
  useEffect(() => {
    let off = false;
    (async () => {
      try {
        const r = await fetch(RPC, { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify([
            { jsonrpc: "2.0", id: 1, method: "getRecentPerformanceSamples", params: [1] },
            { jsonrpc: "2.0", id: 2, method: "getEpochInfo" },
          ]) });
        const j = await r.json();
        if (off) return;
        const p = j.find((x: { id: number }) => x.id === 1)?.result?.[0];
        const e = j.find((x: { id: number }) => x.id === 2)?.result;
        if (p) setTps(Math.round((p.numNonVoteTransactions ?? p.numTransactions) / p.samplePeriodSecs).toLocaleString());
        if (e) setEpoch(String(e.epoch));
      } catch { /* noop */ }
    })();
    return () => { off = true; };
  }, []);
  return { tps, epoch };
}

export default function Landing() {
  const { tps, epoch } = useLiveTps();
  const startChapter = chapters[0];
  const finishChapter = chapters[chapters.length - 1];

  return (
    <Layout>
      <RaysHero />

      {tps && (
        <div className="shell" style={{ position: "relative", zIndex: 1, paddingTop: 8, paddingBottom: 8 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 9, fontSize: 12.5, color: "var(--text-mid)", fontFamily: "var(--font-mono)" }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--neon-green)" }} />
            mainnet live · {tps} TPS{epoch && <> · epoch {epoch}</>}
          </div>
        </div>
      )}

      <section id="surfaces" className="shell" style={{ paddingTop: 30, scrollMarginTop: 96 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 10 }}>
          {PILLARS.map((p, i) => (
            <Link key={p.to} to={p.to} className="card card-lift reveal" style={{ padding: 20, display: "block", animationDelay: `${.04 * i}s` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ width: 38, height: 38, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--neon-green)", background: "var(--surface-2)", border: "1px solid var(--line)" }}>{p.icon}</span>
                <span className="doc-muted">{p.label}</span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{p.title}</h3>
              <p style={{ fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.55 }}>{p.desc}</p>
              <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text)", fontWeight: 650 }}>
                Open <ArrowRight size={13} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="shell" style={{ paddingTop: 58 }}>
        <div className="landing-start">
          <div className="landing-start__main">
            <div className="eyebrow">Start here · Track 01 of {chapters.length}</div>
            <h2>Core Foundations</h2>
            <p>Begin with transactions, accounts, instructions, signatures, and clusters. The route then follows execution, network data, finality, and fees.</p>
            {startChapter && (
              <Link to={`/deep-dives/${startChapter.id}`} className="btn btn-grad">
                Start with Track 01 <ArrowRight size={16} />
              </Link>
            )}
          </div>
          {finishChapter && (
            <Link to={`/deep-dives/${finishChapter.id}`} className="landing-start__finish">
              <span>Finish line · Track {String(finishChapter.sequence).padStart(2, "0")}</span>
              <strong>{finishChapter.title}</strong>
              <small>Connect the whole system at the protocol frontier <ArrowRight size={13} /></small>
            </Link>
          )}
        </div>
      </section>

      <section className="shell" style={{ paddingTop: 66 }}>
        <div className="landing-head landing-head--compact" style={{ marginTop: 0 }}>
          <div>
            <div className="eyebrow">Track 03 preview · after foundations and runtime</div>
            <h2>Inside the validator: one transaction, end to end.</h2>
          </div>
          <p>
            See the validator journey here after you have the data model. The full curriculum starts with Track 01 and builds toward this execution path.
          </p>
        </div>
        <div className="hot-path">
          {hotPathStages.map((stage, i) => {
            const concept = conceptById(stage.conceptId);
            const meta = concept ? metaFor(concept.title) : null;
            return (
              <Link key={stage.label} to={meta ? `/docs/${meta.id}` : "/deep-dives"} className="hot-path__stage">
                <span className="hot-path__num">0{i + 1}</span>
                <strong>{stage.label}</strong>
                <em>{stage.detail}</em>
                <small>{concept?.tag ?? "Track"}</small>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="shell" style={{ paddingTop: 72 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Interactive</div>
        <h2 className="section-title" style={{ marginBottom: 26 }}>Small labs</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: 14 }}>
          {INTERACTIVE.map((t) => (
            <Link key={t.to} to={t.to} className="card card-lift" style={{ padding: 20, display: "block", position: "relative", overflow: "hidden", borderColor: "var(--line)" }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, position: "relative" }}>{t.label}</h3>
              <p style={{ fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.6, position: "relative" }}>{t.desc}</p>
              <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text)", fontWeight: 650, position: "relative" }}>Try it <ArrowRight size={14} /></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="shell" style={{ paddingTop: 72 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Essential links</div>
        <h2 className="section-title" style={{ marginBottom: 26 }}>Ecosystem shortcuts</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {QUICK_LINKS.map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="card card-lift" style={{ padding: 18, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, borderColor: "rgba(20,241,149,.16)" }}>
              <span>
                <span style={{ display: "block", fontSize: 14, fontWeight: 600 }}>{l.label}</span>
                <span style={{ display: "block", fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>{l.desc}</span>
              </span>
              <ExternalLink size={14} style={{ color: "var(--text-dim)", flexShrink: 0 }} />
            </a>
          ))}
        </div>
      </section>

      <section className="shell" style={{ paddingTop: 56 }}>
        <div className="grad-border" style={{ borderRadius: "var(--r-lg)", padding: "30px 28px", textAlign: "center", overflow: "hidden", position: "relative", maxWidth: 760, margin: "0 auto" }}>
          <div style={{ position: "relative" }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>The finish line</div>
            <h2 style={{ fontSize: 24, fontWeight: 750, margin: "0 0 8px", letterSpacing: 0 }}>Explain one transaction from signature to finality.</h2>
            <p style={{ color: "var(--text-mid)", fontSize: 14.5, maxWidth: 520, margin: "0 auto 22px" }}>The guided route begins with foundations and ends by connecting execution, state, consensus, fees, and the current protocol frontier.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              {finishChapter && <Link to={`/deep-dives/${finishChapter.id}`} className="btn btn-grad">Open the final track <ArrowRight size={16} /></Link>}
              <Link to="/docs" className="btn btn-ghost">Open reference <FileText size={15} /></Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
