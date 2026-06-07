import { conceptById, metaFor } from "./concepts";

export interface Chapter {
  id: string;
  title: string;
  domain: string;
  summary: string;
  outcome: string;
  conceptIds: string[];
  checkpoints: string[];
  sourceNotes?: string[];
}

export const chapters: Chapter[] = [
  {
    id: "execution-hot-path",
    title: "Execution Hot Path",
    domain: "TPU -> Banking -> SVM -> AccountsDB",
    summary: "Follow one transaction from sender ingress through scheduling, execution, account writes, and block propagation.",
    outcome: "You can explain why a transaction lands, drops, serializes on a hot account, or becomes visible through RPC.",
    conceptIds: ["transactions", "quic-swqos", "gulf-stream", "tx-lifecycle", "banking-stage", "svm-bytecode", "accountsdb", "turbine"],
    checkpoints: ["Where packets enter the leader", "How conflicts are scheduled", "Where state is mutated", "Why confirmation is separate from send"],
    sourceNotes: [
      "Engineering Solana frames this as the validator hot path: QUIC ingress to committed state, not a loose topic list.",
      "The deepest learning value is the handoff between TPU, Banking Stage, SVM, Bank, and AccountsDB.",
    ],
  },
  {
    id: "consensus-finality",
    title: "Consensus & Finality",
    domain: "PoH, Tower BFT, voting, Alpenglow",
    summary: "Separate the clock, the fork-choice rules, validator votes, commitment levels, and the Alpenglow finality redesign.",
    outcome: "You can talk about PoH, Tower, roots, and Alpenglow without mixing clocking, ordering, and consensus.",
    conceptIds: ["blocks-slots", "proof-of-history", "tower-bft", "epochs-validators", "alpenglow"],
    checkpoints: ["Slot vs block", "PoH as ordering clock", "Tower lockouts", "Votor certificates", "Commitment semantics"],
    sourceNotes: [
      "PoH gives Tower a ledger-encoded clock; Tower uses that clock for vote lockouts and fork commitment.",
      "Alpenglow belongs after Tower: it is easier to understand as a redesign of the current voting/finality path.",
    ],
  },
  {
    id: "runtime-programs",
    title: "Runtime & Program Side",
    domain: "Accounts, Sealevel, SBF, CPI, PDAs",
    summary: "Understand the account model and why Solana programs are passed every piece of state they touch.",
    outcome: "You can design programs that cooperate with Sealevel instead of fighting write locks and account limits.",
    conceptIds: ["accounts-model", "sealevel", "instructions-cpis", "pda", "compute-units", "rent", "lookup-tables", "token-extensions"],
    checkpoints: ["Executable vs data accounts", "Read/write declarations", "CPI call depth", "PDA signing", "Compute budgets"],
    sourceNotes: [
      "The key distinction is SVM as the execution environment and Sealevel as the parallel execution strategy around declared account access.",
      "Program design is performance design because writable account choices determine scheduler parallelism.",
    ],
  },
  {
    id: "network-propagation",
    title: "Networking & Propagation",
    domain: "QUIC, SWQoS, Gossip, Turbine, Repair",
    summary: "Map how transactions, metadata, shreds, and missing data move across validators under load.",
    outcome: "You can identify whether a problem is sender ingress, leader forwarding, block propagation, or repair.",
    conceptIds: ["quic-swqos", "gulf-stream", "gossip-repair", "turbine", "doublezero"],
    checkpoints: ["Stake-weighted lanes", "No public mempool", "CRDS gossip", "Shreds and repair", "Private validator pipes"],
    sourceNotes: [
      "QUIC, SWQoS, tpu_vote, and tpu_forwards are separate concerns inside the validator ingress story.",
      "No global mempool does not mean no queues; the TPU still uses bounded in-memory queues between stages.",
    ],
  },
  {
    id: "state-data",
    title: "State, Data & Observability",
    domain: "AccountsDB, ledger, snapshots, Geyser",
    summary: "Distinguish live state, historical ledger data, snapshots, streaming, and compressed state.",
    outcome: "You can choose the correct read path: direct RPC, archival RPC, Geyser stream, DAS, or indexer.",
    conceptIds: ["accountsdb", "geyser", "state-compression", "rpc-infra", "clusters"],
    checkpoints: ["Current state vs history", "Snapshot bootstrapping", "Streaming writes", "DAS reads", "RPC limits"],
    sourceNotes: [
      "AccountsDB is the live state engine, not an archive of every historical interaction.",
      "Append-only account files plus a sharded index are the center of the performance story.",
    ],
  },
  {
    id: "fees-mev-roadmap",
    title: "Fees, MEV & Roadmap",
    domain: "Scheduler economics, Jito, Firedancer, APE",
    summary: "Connect inclusion economics with validator clients and the performance upgrades that change the ceiling.",
    outcome: "You can reason about priority fees, local fee markets, MEV ordering, and why client performance gates block limit raises.",
    conceptIds: ["priority-fees", "local-fee-markets", "mev", "jito", "sandwich", "firedancer", "async-execution", "validator-economics"],
    checkpoints: ["CU price vs CU limit", "Hot-account local fees", "Bundle auctions", "Client diversity", "Async execution"],
    sourceNotes: [
      "Performance work only matters when it preserves deterministic execution and validator replay safety.",
      "Firedancer/Frankendancer should be read as validator-client architecture and resilience, not an app-facing feature.",
    ],
  },
  {
    id: "frontier-2025",
    title: "Frontier · 2025",
    domain: "Alpenglow, Firedancer, DoubleZero, async execution",
    summary: "The 2025 breakthroughs changing Solana's ceiling: a new consensus, a second validator client, a dedicated network layer, and asynchronous execution.",
    outcome: "You can explain what Alpenglow, Firedancer, and DoubleZero each change — and why finality, client diversity, and propagation are separate wins, not one feature.",
    conceptIds: ["alpenglow", "firedancer", "doublezero", "async-execution"],
    checkpoints: ["Votor vs Tower voting", "Why client diversity matters", "Dedicated fiber vs the public internet", "Ordering decoupled from execution"],
    sourceNotes: [
      "These are independent levers: Alpenglow is latency, Firedancer is resilience + throughput headroom, DoubleZero is propagation, async execution is the scaling re-architecture.",
      "Read Alpenglow after Tower BFT — it is a redesign of the existing voting/finality path, not a new runtime.",
    ],
  },
];

export const hotPathStages = [
  { label: "QUIC", detail: "stake-weighted ingress", conceptId: "quic-swqos" },
  { label: "Fetch / SigVerify", detail: "packets become verified txs", conceptId: "tx-lifecycle" },
  { label: "Banking", detail: "scheduler batches conflicts", conceptId: "banking-stage" },
  { label: "SVM", detail: "SBF instructions execute", conceptId: "svm-bytecode" },
  { label: "AccountsDB", detail: "state writes land", conceptId: "accountsdb" },
  { label: "PoH / Broadcast", detail: "entries propagate as shreds", conceptId: "turbine" },
];

export function chapterConcepts(chapter: Chapter) {
  return chapter.conceptIds
    .map((id) => conceptById(id))
    .filter(Boolean)
    .map((concept) => {
      const c = concept!;
      return { concept: c, meta: metaFor(c.title) };
    });
}

export function chapterForConceptId(conceptId: string): Chapter | undefined {
  return chapters.find((chapter) => chapter.conceptIds.includes(conceptId));
}
