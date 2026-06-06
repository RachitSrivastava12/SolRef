// The 8 core innovations of Solana — the canonical framing.
// Several map to existing concept pages; three (Pipelining, Cloudbreak,
// Archivers) are infra internals we surface here. `conceptId` links to a
// full doc page when one exists. `legacy` flags historical/superseded design.

export interface Innovation {
  name: string;
  icon: string;            // lucide icon name (rendered via iconFor)
  mechanism: string;       // technical mechanism (short)
  impact: string;          // network impact (short)
  summary: string;         // deep-dive paragraph, grounded
  conceptId?: string;      // link to a /docs/:id page if we have one
  legacy?: boolean;        // mark superseded/partial designs
  frontier?: boolean;      // 2024-2025 breakthrough, shipping now
  accent: "purple" | "green" | "blue";
}

export const innovations: Innovation[] = [
  {
    name: "Proof of History",
    icon: "Clock",
    mechanism: "SHA-256 recursive hashing",
    impact: "Cryptographic clock; orders events without wait-states",
    summary: "PoH is a Verifiable Delay Function using a SHA-256 hash chain to prove time elapsed between two events. This creates a tamper-proof timeline that lets the leader order transactions without waiting for global consensus. Validators verify the timeline in parallel, bypassing the single-threaded bottleneck of traditional time consensus.",
    conceptId: "proof-of-history",
    accent: "purple",
  },
  {
    name: "Tower BFT",
    icon: "Shield",
    mechanism: "PBFT + PoH lockout",
    impact: "Consensus; 32 votes lead to 100% finality",
    summary: "A PBFT-derived consensus that leverages PoH to cut messaging overhead. It uses an exponential lockout: each consecutive vote on a fork doubles the time a validator is committed to it. This makes attacking consensus mathematically and economically unfeasible as a block roots toward finality.",
    conceptId: "tower-bft",
    accent: "purple",
  },
  {
    name: "Turbine",
    icon: "Network",
    mechanism: "Erasure-coded shreds",
    impact: "Propagates data via a tree; O(n log n) scaling",
    summary: "Turbine solves the bandwidth bottleneck by fragmenting blocks into erasure-coded shreds of ~1228 bytes, distributed through a stake-weighted tree where each validator forwards to a neighborhood of peers. This BitTorrent-style propagation keeps throughput high with Forward Error Correction even under packet loss.",
    conceptId: "turbine",
    accent: "green",
  },
  {
    name: "Gulf Stream",
    icon: "Wifi",
    mechanism: "Leader-ahead forwarding",
    impact: "Eliminates mempools; RPCs forward to leaders",
    summary: "Gulf Stream removes the public mempool by forwarding transactions directly to upcoming leaders in the deterministic schedule. RPC nodes pre-cache and route transactions to the next leaders before their slots begin — preventing the frontrunning common on Ethereum and keeping the network performant under load.",
    conceptId: "gulf-stream",
    accent: "green",
  },
  {
    name: "Sealevel",
    icon: "Cpu",
    mechanism: "Parallel execution",
    impact: "Processes non-conflicting accounts across threads",
    summary: "Sealevel is the parallel smart-contract runtime that executes tens of thousands of contracts at once. By requiring every instruction to declare its account dependencies upfront, the runtime identifies non-overlapping transactions for concurrent execution — a multi-threaded environment that maximizes modern CPU hardware.",
    conceptId: "sealevel",
    accent: "blue",
  },
  {
    name: "Pipelining",
    icon: "Activity",
    mechanism: "TPU stage management",
    impact: "Saturates Fetch / Verify / Bank / Write cycles",
    summary: "The Transaction Processing Unit uses a four-stage pipeline to streamline a transaction's lifecycle inside validator hardware: Fetching (kernel level), Verification (GPU-accelerated signatures), Banking (Sealevel execution), and Writing (ledger updates). This keeps CPU, GPU, and SSD consistently saturated.",
    accent: "blue",
  },
  {
    name: "Cloudbreak",
    icon: "HardDrive",
    mechanism: "Memory-mapped DB",
    impact: "Horizontally-scaled storage; O(1) lookup",
    summary: "Cloudbreak is the accounts database optimized for concurrent reads and writes using memory-mapped files. It scales horizontally across multiple disks so account lookups stay O(1) regardless of database growth — essential for sub-second confirmations as the network scales to billions of accounts.",
    accent: "purple",
  },
  {
    name: "Archivers",
    icon: "Database",
    mechanism: "Proof of Replication",
    impact: "Offloads historical data to distributed storage",
    summary: "Archivers were the original design for distributed historical storage: nodes using Proof of Replication to verify they store specific ledger fragments without joining consensus. Note: this is largely historical — modern Solana relies on warehouse nodes and services like Google BigTable plus the broader RPC/indexer ecosystem for history.",
    legacy: true,
    accent: "green",
  },
  {
    name: "Alpenglow",
    icon: "Zap",
    mechanism: "Votor (BLS) + Rotor",
    impact: "Retires Tower BFT/PoH voting; ~150ms finality",
    summary: "Alpenglow is Solana's largest-ever consensus change, approved by 98% of voting stake in 2025. Votor replaces on-chain vote transactions with off-chain BLS-aggregated certificates, and Rotor supersedes Turbine's multi-hop tree with a flatter single-relay broadcast. Finality drops from ~12.8s to roughly 100-150ms, while removing the network's single biggest source of ledger bloat.",
    conceptId: "alpenglow",
    frontier: true,
    accent: "green",
  },
  {
    name: "Firedancer",
    icon: "Flame",
    mechanism: "Independent C client",
    impact: "Client diversity; 600k+ TPS demonstrated",
    summary: "Firedancer is a from-scratch validator client written in C by Jump Crypto, independent of the Rust Agave client. A second implementation means a consensus bug in one client can't halt the chain. With kernel-bypass networking and a tile-based architecture, it raises the performance ceiling on the path toward 1M TPS — the hybrid Frankendancer already runs a meaningful share of stake.",
    conceptId: "firedancer",
    frontier: true,
    accent: "blue",
  },
  {
    name: "DoubleZero",
    icon: "Globe",
    mechanism: "Dedicated fiber + multicast",
    impact: "Up to ~50% lower consensus latency",
    summary: "DoubleZero is a private fiber network for validators — a 'Network Layer 1' that bypasses the public internet for consensus traffic. FPGAs filter and deduplicate at line rate while multicast broadcasts each block to all validators at once instead of relaying hop-by-hop. Mainnet-beta launched in 2025 with a large share of staked SOL connected, complementing Alpenglow's faster finality.",
    conceptId: "doublezero",
    frontier: true,
    accent: "purple",
  },
];

// Transaction lifecycle — six steps with triggers (grounded in the spec).
export interface LifecycleStep {
  n: number; title: string; trigger: string; detail: string; icon: string;
}
export const lifecycle: LifecycleStep[] = [
  { n: 1, title: "Client signs", trigger: "Wallet signTransaction event", detail: "User signs the transaction (max 1232 bytes) with their private key locally.", icon: "Lock" },
  { n: 2, title: "RPC forwarding", trigger: "RPC receives packet via HTTPS/WSS", detail: "Node validates the packet and identifies the upcoming leaders from the deterministic schedule.", icon: "Wifi" },
  { n: 3, title: "TPU execution", trigger: "TPU Fetch stage receives packet", detail: "The current leader executes the transaction inside its ~400ms slot, entering the Sealevel parallel runtime.", icon: "Cpu" },
  { n: 4, title: "Turbine propagation", trigger: "TPU Write stage completes", detail: "The block is fragmented into ~1228-byte data and coding shreds, distributed recursively across the validator tree.", icon: "Network" },
  { n: 5, title: "Tower consensus", trigger: "Validators receive 2/3 of shreds", detail: "The network votes on the block via vote transactions until a supermajority is reached.", icon: "Shield" },
  { n: 6, title: "Finalization", trigger: "32 consecutive lockouts reached", detail: "The block is rooted after 32 consecutive confirmations — mathematically irreversible.", icon: "CheckCircle" },
];

// Commitment states.
export interface TxState {
  key: "processed" | "confirmed" | "finalized";
  label: string; definition: string; ux: string; color: string;
}
export const txStates: TxState[] = [
  { key: "processed", label: "Processed", definition: "Leader processed the tx; not yet voted on. Susceptible to rollbacks.", ux: "Only for real-time optimistic UI feedback — never release funds.", color: "var(--text-mid)" },
  { key: "confirmed", label: "Confirmed", definition: "2/3+ of stake has voted on the block.", ux: "Safe for NFT mints, swaps, and ~99% of app actions.", color: "var(--sol-green)" },
  { key: "finalized", label: "Finalized", definition: "Block rooted after 32 consecutive votes — mathematically irreversible.", ux: "Required for high-value OTC, bridging, and cross-chain settlement.", color: "var(--sol-blue)" },
];
