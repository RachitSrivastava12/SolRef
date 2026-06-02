import { ExternalLink } from "lucide-react";
import Layout from "../components/Layout";

const GROUPS: { title: string; links: { label: string; url: string; desc: string }[] }[] = [
  {
    title: "Official",
    links: [
      { label: "Solana Docs", url: "https://docs.solana.com", desc: "The canonical reference" },
      { label: "Solana Cookbook", url: "https://solanacookbook.com", desc: "Task-oriented recipes" },
      { label: "Solana Whitepaper", url: "https://solana.com/solana-whitepaper.pdf", desc: "Proof of History, the original" },
      { label: "Solana Brand", url: "https://solana.com/branding", desc: "Logos & palette" },
    ],
  },
  {
    title: "Frameworks & tooling",
    links: [
      { label: "Anchor", url: "https://www.anchor-lang.com", desc: "The program framework" },
      { label: "Solana Playground", url: "https://beta.solpg.io", desc: "Browser IDE — build, deploy, test" },
      { label: "web3.js", url: "https://solana-labs.github.io/solana-web3.js", desc: "Client SDK reference" },
      { label: "Solana Kit", url: "https://github.com/anza-xyz/kit", desc: "Modern client tooling" },
    ],
  },
  {
    title: "Infra & RPC",
    links: [
      { label: "Helius", url: "https://www.helius.dev", desc: "RPC, webhooks, DAS API" },
      { label: "QuickNode", url: "https://www.quicknode.com/chains/sol", desc: "RPC + add-ons" },
      { label: "Triton", url: "https://triton.one", desc: "Dedicated RPC" },
      { label: "Jito Labs", url: "https://docs.jito.wtf", desc: "MEV & bundles" },
    ],
  },
  {
    title: "Explorers & data",
    links: [
      { label: "Solscan", url: "https://solscan.io", desc: "Tx & account explorer" },
      { label: "Solana Explorer", url: "https://explorer.solana.com", desc: "Official explorer" },
      { label: "SolanaFM", url: "https://solana.fm", desc: "Developer explorer" },
      { label: "Solana Beach", url: "https://solanabeach.io", desc: "Validators & network stats" },
    ],
  },
  {
    title: "Deep reading",
    links: [
      { label: "Helius Blog", url: "https://www.helius.dev/blog", desc: "Best technical writing in the ecosystem" },
      { label: "QuickNode Guides", url: "https://www.quicknode.com/guides/solana-development", desc: "Step-by-step tutorials" },
      { label: "Anza Blog", url: "https://www.anza.xyz/blog", desc: "Core engineering" },
      { label: "Solana StackExchange", url: "https://solana.stackexchange.com", desc: "Q&A" },
    ],
  },
];

export default function Resources() {
  return (
    <Layout>
      <div className="aurora" />
      <div className="shell" style={{ position: "relative", zIndex: 1, paddingTop: 56 }}>
        <div className="eyebrow reveal">Resources</div>
        <h1 className="reveal" style={{ fontSize: 42, fontWeight: 800, margin: "10px 0 12px", letterSpacing: "-.025em", animationDelay: ".05s" }}>
          The whole <span className="grad-text">ecosystem</span>, curated
        </h1>
        <p className="reveal" style={{ fontSize: 17, color: "var(--text-mid)", maxWidth: 600, marginBottom: 40, animationDelay: ".1s" }}>
          The links worth bookmarking — official docs, frameworks, infra, explorers, and the deep reading that actually moves you forward.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 40, paddingBottom: 20 }}>
          {GROUPS.map((g) => (
            <div key={g.title}>
              <h2 style={{ fontSize: 14, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: ".15em", color: "var(--text-dim)", marginBottom: 16 }}>{g.title}</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: 12 }}>
                {g.links.map((l) => (
                  <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="card card-lift" style={{ padding: 18, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <span>
                      <span style={{ display: "block", fontSize: 14.5, fontWeight: 600 }}>{l.label}</span>
                      <span style={{ display: "block", fontSize: 12.5, color: "var(--text-dim)", marginTop: 3 }}>{l.desc}</span>
                    </span>
                    <ExternalLink size={15} style={{ color: "var(--text-dim)", flexShrink: 0 }} />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
