import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink, BookOpen, GraduationCap, Terminal, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import RaysHero from "../components/RaysHero";
import { concepts, metaFor, iconFor, levelMeta } from "../lib/concepts";

const RPC = (import.meta.env.VITE_SOLANA_RPC as string) || "https://api.mainnet-beta.solana.com";

const PILLARS = [
  { to: "/innovations", icon: <Sparkles size={20} />, label: "Innovations", title: "The 8 innovations", desc: "PoH, Turbine, Gulf Stream, Sealevel and the rest — the eight interlocking systems behind Solana's throughput, with an interactive commitment-state toggle." },
  { to: "/docs", icon: <BookOpen size={20} />, label: "Docs", title: "Read the deep dives", desc: "20 concepts — each a focused page with diagrams, code, and the gotchas that bite in production." },
  { to: "/workspace", icon: <Terminal size={20} />, label: "Workspace", title: "Practice the concepts", desc: "A real Monaco editor with per-concept tasks — write the code, take progressive hints, and have your solution evaluated by AI." },
  { to: "/quizzes", icon: <GraduationCap size={20} />, label: "Quizzes", title: "Test yourself", desc: "AI-generated questions grounded strictly in the docs, powered by DeepSeek — with a hand-written bank as the always-on fallback." },
];

const INTERACTIVE = [
  { to: "/lifecycle", label: "Transaction lifecycle", desc: "Six-stage stepper from signature to finality, with the trigger behind each stage." },
  { to: "/sandwich", label: "Sandwich simulator", desc: "Tighten your slippage and watch the attacker's bundle stop being profitable." },
  { to: "/innovations", label: "Commitment states", desc: "Toggle processed → confirmed → finalized and see what's safe at each level." },
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
  const featured = ["proof-of-history", "turbine", "mev", "pda", "sealevel", "gulf-stream"]
    .map((id) => concepts.find((c) => metaFor(c.title).id === id)).filter(Boolean) as typeof concepts;

  return (
    <Layout>
      <div className="aurora" />

      {/* FULL-SCREEN RAYS HERO */}
      <RaysHero />

      {/* live network strip (quiet, below the fold) */}
      {tps && (
        <div className="shell" style={{ position: "relative", zIndex: 1, paddingTop: 8, paddingBottom: 8 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 9, fontSize: 12.5, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--text)", animation: "pulse 2s infinite" }} />
            mainnet live · {tps} TPS{epoch && <> · epoch {epoch}</>}
          </div>
        </div>
      )}

      {/* PILLARS — four product surfaces, NotebookLM-style */}
      <section className="shell" style={{ paddingTop: 30 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(255px, 1fr))", gap: 16 }}>
          {PILLARS.map((p, i) => (
            <Link key={p.to} to={p.to} className="card card-lift reveal" style={{ padding: 26, display: "block", animationDelay: `${.06 * i}s` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <span style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#06040a", background: "var(--grad)" }}>{p.icon}</span>
                <span className="eyebrow">{p.label}</span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{p.title}</h3>
              <p style={{ fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.6 }}>{p.desc}</p>
              <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text)", fontWeight: 600 }}>
                Open <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED CONCEPTS */}
      <section className="shell" style={{ paddingTop: 72 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 26, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="eyebrow">Start here</div>
            <h2 style={{ fontSize: 30, fontWeight: 800, marginTop: 8, letterSpacing: "-.02em" }}>The concepts that confuse everyone</h2>
          </div>
          <Link to="/docs" style={{ fontSize: 14, color: "var(--text-mid)", display: "inline-flex", alignItems: "center", gap: 6 }}>See all 20 <ArrowRight size={14} /></Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {featured.map((c) => {
            const m = metaFor(c.title);
            return (
              <Link key={m.id} to={`/docs/${m.id}`} className="card card-lift" style={{ padding: 22, display: "block" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <span style={{ width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text)", background: "var(--surface-2)" }}>{iconFor(c.icon)}</span>
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: levelMeta[m.level].color }}>{levelMeta[m.level].label}</span>
                </div>
                <h3 style={{ fontSize: 16.5, fontWeight: 700, marginBottom: 7 }}>{c.title}</h3>
                <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{c.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* INTERACTIVE TOOLS */}
      <section className="shell" style={{ paddingTop: 72 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Interactive</div>
        <h2 style={{ fontSize: 30, fontWeight: 800, marginBottom: 26, letterSpacing: "-.02em" }}>Learn by playing with it</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: 14 }}>
          {INTERACTIVE.map((t) => (
            <Link key={t.to} to={t.to} className="card card-lift" style={{ padding: 24, display: "block", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -30, right: -30, width: 90, height: 90, borderRadius: "50%", background: "var(--grad-soft)", opacity: .6 }} />
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, position: "relative" }}>{t.label}</h3>
              <p style={{ fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.6, position: "relative" }}>{t.desc}</p>
              <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text)", fontWeight: 600, position: "relative" }}>Try it <ArrowRight size={14} /></div>
            </Link>
          ))}
        </div>
      </section>

      {/* QUICK LINKS */}
      <section className="shell" style={{ paddingTop: 72 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Essential links</div>
        <h2 style={{ fontSize: 30, fontWeight: 800, marginBottom: 26, letterSpacing: "-.02em" }}>The rest of the ecosystem</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {QUICK_LINKS.map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="card card-lift" style={{ padding: 18, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <span>
                <span style={{ display: "block", fontSize: 14, fontWeight: 600 }}>{l.label}</span>
                <span style={{ display: "block", fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>{l.desc}</span>
              </span>
              <ExternalLink size={14} style={{ color: "var(--text-dim)", flexShrink: 0 }} />
            </a>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="shell" style={{ paddingTop: 56 }}>
        <div className="grad-border" style={{ borderRadius: "var(--r-lg)", padding: "34px 28px", textAlign: "center", overflow: "hidden", position: "relative", maxWidth: 860, margin: "0 auto" }}>
          <div style={{ position: "absolute", inset: 0, background: "var(--grad-soft)", opacity: .5 }} />
          <div style={{ position: "relative" }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-.02em" }}>Ready to actually understand it?</h2>
            <p style={{ color: "var(--text-mid)", fontSize: 15, maxWidth: 430, margin: "0 auto 22px" }}>Start with the guided path, or jump straight into the concept that's been confusing you.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/learn" className="btn btn-grad">Start the path <ArrowRight size={16} /></Link>
              <Link to="/workspace" className="btn btn-ghost">Try the workspace <Terminal size={15} /></Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
