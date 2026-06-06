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
      <div className="shell" style={{ position: "relative", zIndex: 1, paddingTop: 56 }}>
        <div className="page-heading">
          <div className="eyebrow reveal">Resources</div>
          <h1 className="page-title reveal" style={{ animationDelay: ".05s" }}>Ecosystem index.</h1>
          <p className="page-subtitle reveal" style={{ animationDelay: ".1s" }}>
            Official references, frameworks, infra, explorers, and deep technical reading worth keeping open.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 34, paddingBottom: 20 }}>
          {GROUPS.map((g) => (
            <div key={g.title}>
              <h2 className="eyebrow" style={{ marginBottom: 12 }}>{g.title}</h2>
              <div className="doc-list">
                {g.links.map((l) => (
                  <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="doc-row">
                    <span className="doc-row__icon"><ExternalLink size={16} /></span>
                    <div>
                      <div className="doc-row__title">
                        <strong>{l.label}</strong>
                        <span>{g.title}</span>
                      </div>
                      <p>{l.desc}</p>
                    </div>
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
