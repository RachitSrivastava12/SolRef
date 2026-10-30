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
  frontier?: boolean;      // highlighted protocol or infrastructure change
  statusLabel?: string;    // current rollout state, when useful
  accent: "purple" | "green" | "blue";
}

export const innovations: Innovation[] = [
  {
    name: "Proof of History",
    icon: "Clock",
    mechanism: "SHA-256 recursive hashing",
    impact: "Tower-era cryptographic clock; historical ordering model",
    summary: "Proof of History is a sequential SHA-256 hash chain. It supplied Solana's cryptographic clock under Tower BFT. Since Alpenglow activated, PoH no longer paces block production, and the Clock sysvar timestamp has a new source.",
    conceptId: "proof-of-history",
    accent: "purple",
  },
  {
    name: "Tower BFT",
    icon: "Shield",
    mechanism: "PBFT + PoH lockout",
    impact: "Former consensus; replaced by Votor in October 2026",
    summary: "Tower BFT was Solana's PBFT-derived consensus before Alpenglow. It used PoH and exponential vote lockouts to finalize blocks over roughly 32 slots (about 12.8 seconds). Votor has replaced it on mainnet with direct votes and aggregate BLS certificates.",
    conceptId: "tower-bft",
    accent: "purple",
  },
  {
    name: "Turbine",
    icon: "Network",
    mechanism: "Erasure-coded shreds",
    impact: "Spreads block data through a stake-weighted tree",
    summary: "Turbine divides block data into erasure-coded shreds and forwards them through a stake-weighted tree. Validators can use enough data and coding shreds to recover missing pieces. Rotor, a planned Alpenglow phase, may replace Turbine later; it is not live.",
    conceptId: "turbine",
    accent: "green",
  },
  {
    name: "Gulf Stream",
    icon: "Wifi",
    mechanism: "Leader-ahead forwarding",
    impact: "Leader-ahead forwarding; queues still exist",
    summary: "Gulf Stream describes a leader-ahead forwarding design: RPCs can use the known leader schedule to send transactions to upcoming leaders. This does not mean transactions never queue or that private order flow is impossible. Provider behavior and retries still matter.",
    conceptId: "gulf-stream",
    accent: "green",
  },
  {
    name: "Sealevel",
    icon: "Cpu",
    mechanism: "Parallel execution",
    impact: "Processes non-conflicting accounts across threads",
    summary: "Sealevel is Solana's model for scheduling transactions that do not conflict on account access. Programs and instructions declare the accounts they need, allowing validator software to run some transactions concurrently. Transactions that write the same account must be sequenced.",
    conceptId: "sealevel",
    accent: "blue",
  },
  {
    name: "Pipelining",
    icon: "Activity",
    mechanism: "TPU stage management",
    impact: "Splits validator work into stages",
    summary: "Validator clients split transaction handling into stages such as receiving packets, verifying signatures, executing transactions, and recording block data. The exact stage layout and hardware acceleration depend on the client version. Under Alpenglow, Proof of History no longer paces block production.",
    accent: "blue",
  },
  {
    name: "Cloudbreak",
    icon: "HardDrive",
    mechanism: "Memory-mapped DB",
    impact: "Stores and indexes current account state",
    summary: "Cloudbreak is Solana's account-storage design, built for concurrent reads and writes across validator storage. Current Agave implementations use AccountsDB components including account files, indexes, and caches. Lookup cost and storage behavior depend on the implementation and workload.",
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
    mechanism: "Votor (BLS) live · Rotor planned",
    impact: "Tower retired; ~150ms finality target",
    summary: "Alpenglow is Solana's live mainnet consensus protocol. Votor replaced Tower BFT at slot 459,653,000 in epoch 1064 on October 21, 2026. Validators exchange votes directly and aggregate BLS signatures into certificates instead of including vote transactions in blocks; finality targets roughly 150ms, down from about 12.8 seconds. Rotor is planned to replace Turbine's multi-hop propagation in a later, unscheduled release. Transaction execution is unchanged.",
    conceptId: "alpenglow",
    frontier: true,
    statusLabel: "Live on mainnet",
    accent: "green",
  },
  {
    name: "Firedancer",
    icon: "Flame",
    mechanism: "Independent C validator client",
    impact: "Adds another implementation of Solana's validator software",
    summary: "Firedancer is an independently built Solana validator client from Jump Crypto. Its repository publishes mainnet-ready releases and describes a tile-based design with specialized networking. The Solana Foundation's current Alpenglow migration guidance says Firedancer and Frankendancer were not supported for that migration, so operators must check current compatibility before choosing a release. Client diversity can reduce shared-software risk but does not guarantee network safety.",
    conceptId: "firedancer",
    frontier: true,
    accent: "blue",
  },
  {
    name: "DoubleZero",
    icon: "Globe",
    mechanism: "Opt-in network for validator traffic",
    impact: "Adds an alternate path for participating validators",
    summary: "DoubleZero is an opt-in networking service for validators. Participating operators can route some validator traffic over dedicated network links. Its coverage, performance, and effect depend on location, configuration, and adoption; it does not replace public internet connectivity for users.",
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
  { n: 1, title: "Client signs", trigger: "Wallet signTransaction event", detail: "The wallet signs a legacy/v0 transaction up to 1,232 bytes or a v1 transaction up to 4,096 bytes.", icon: "Lock" },
  { n: 2, title: "RPC forwarding", trigger: "RPC receives packet via HTTPS/WSS", detail: "Node validates the packet and identifies the upcoming leaders from the deterministic schedule.", icon: "Wifi" },
  { n: 3, title: "TPU execution", trigger: "TPU Fetch stage receives packet", detail: "The current leader executes the transaction inside its ~200ms mainnet slot, entering the Sealevel parallel runtime.", icon: "Cpu" },
  { n: 4, title: "Turbine propagation", trigger: "TPU Write stage completes", detail: "The block data is divided into data and coding shreds, then forwarded through a stake-weighted validator tree.", icon: "Network" },
  { n: 5, title: "Votor consensus", trigger: "Validators exchange direct votes", detail: "Votor validators sign votes with BLS keys and aggregate them into certificates outside the transaction stream. Mainnet blocks no longer include Tower vote transactions.", icon: "Shield" },
  { n: 6, title: "Finalization", trigger: "Votor certificate finalizes the bank", detail: "Alpenglow targets roughly 150ms finality, down from about 12.8 seconds under Tower. On mainnet, `confirmed` and `finalized` currently describe the same state; new code should prefer `finalized`.", icon: "CheckCircle" },
];

// Commitment states.
export interface TxState {
  key: "processed" | "confirmed" | "finalized";
  label: string; definition: string; ux: string; color: string;
}
export const txStates: TxState[] = [
  { key: "processed", label: "Processed", definition: "A validator has processed the transaction, but it is still provisional and may be rolled back.", ux: "Use for quick, temporary UI feedback; wait for consensus before treating the action as final.", color: "var(--text-mid)" },
  { key: "confirmed", label: "Confirmed", definition: "Currently the same Votor consensus state as `finalized` on mainnet; planned for removal in a later release.", ux: "Prefer `finalized` in new code. `processed` remains provisional.", color: "var(--sol-green)" },
  { key: "finalized", label: "Finalized", definition: "Votor's finalized consensus state on mainnet.", ux: "Use for actions that need final confirmation; the target is roughly 150ms.", color: "var(--sol-green)" },
];
