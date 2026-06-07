// Practice tasks — the "master this topic" challenges. Each opens in the
// Workspace with its goal, starter code, progressive hints, and AI evaluation.
//
// Two kinds:
//   • code      — write real Solana/web3.js code; AI evaluates correctness
//   • reasoning — explain the internal mechanism in comments/JS; AI checks
//                 your understanding. This is how you internalize WHY Solana
//                 works, not just which API to call.
//
// A concept can have any number of tasks (escalating easy → hard).

export type TaskKind = "code" | "reasoning";

export interface Task {
  id: string;
  title: string;
  kind: TaskKind;
  goal: string;
  starter: string;
  hints: string[];
  criteria: string;
  difficulty: "easy" | "medium" | "hard";
}

export const tasks: Record<string, Task[]> = {
  // ── 1. TRANSACTIONS ────────────────────────────────────────────────────
  transactions: [
    {
      id: "tx-build", kind: "code", difficulty: "easy",
      title: "Build a transfer transaction",
      goal: "Construct a Transaction that transfers 0.1 SOL from `payer` to `recipient` using SystemProgram.transfer. Set the fee payer.",
      starter: `import { Transaction, SystemProgram, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

const payer = new PublicKey("11111111111111111111111111111111");
const recipient = new PublicKey("22222222222222222222222222222222");

// TODO: build a transaction sending 0.1 SOL from payer to recipient
const tx = new Transaction();
`,
      hints: [
        "SystemProgram.transfer takes { fromPubkey, toPubkey, lamports }.",
        "0.1 SOL = 0.1 * LAMPORTS_PER_SOL lamports.",
        "tx.add(ix) the instruction and set tx.feePayer = payer.",
      ],
      criteria: "Adds a SystemProgram.transfer instruction with fromPubkey=payer, toPubkey=recipient, lamports=0.1*LAMPORTS_PER_SOL, and sets tx.feePayer. Bonus for noting recentBlockhash is needed before signing.",
    },
    {
      id: "tx-size", kind: "reasoning", difficulty: "medium",
      title: "Why the 1232-byte limit?",
      goal: "In comments, explain WHY a Solana transaction is hard-capped at 1232 bytes (hint: it's about the network layer), and what that forces developers to do when they need many accounts.",
      starter: `// Solana transactions have a hard maximum size of 1232 bytes.
// TODO: explain WHY this number exists (network/packet reason),
//       and what tool solves the "too many accounts" problem.
`,
      hints: [
        "1232 bytes ties to the IPv6 MTU minus headers — a tx must fit in a single UDP packet (no fragmentation).",
        "Each account reference is 32 bytes, so you hit the ceiling fast.",
        "Address Lookup Tables (Versioned Transactions) let you reference accounts by 1-byte index instead of 32 bytes.",
      ],
      criteria: "Explains 1232 derives from fitting one UDP/IPv6 packet without fragmentation, that 32-byte account keys consume the budget, and that Address Lookup Tables / versioned transactions are the solution.",
    },
  ],

  // ── 2. BLOCKS & SLOTS ──────────────────────────────────────────────────
  "blocks-slots": [
    {
      id: "bs-distinguish", kind: "reasoning", difficulty: "easy",
      title: "Slot vs block — the difference",
      goal: "Explain the difference between a SLOT and a BLOCK, and why a slot can be empty. Model it with a small JS array showing slots where some produce blocks and some are skipped.",
      starter: `// A slot is a time window (~400ms) assigned to a leader.
// A block is the data produced IF that leader succeeds.
// TODO: explain the difference + why slots can be skipped,
//       then model a sequence of slots (some empty) as an array.
const slots = [];
`,
      hints: [
        "A slot is a ~400ms scheduled opportunity for the assigned leader to produce a block.",
        "If the leader is offline or too slow, the slot is 'skipped' — no block, but the slot number still increments.",
        "Model: [{slot:100, block:true},{slot:101, block:false}, ...] — block height < slot height over time.",
      ],
      criteria: "Correctly distinguishes slot (time window/leader opportunity) from block (produced data), explains skipped slots when a leader fails, and shows a sequence where block count lags slot count.",
    },
    {
      id: "bs-fetch", kind: "code", difficulty: "medium",
      title: "Read current slot + block height",
      goal: "Using a Connection, fetch the current slot and the current block height, and log the gap between them (skipped slots).",
      starter: `import { Connection, clusterApiUrl } from "@solana/web3.js";
const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

// TODO: get current slot and block height, log the difference
`,
      hints: [
        "connection.getSlot() returns the current slot.",
        "connection.getBlockHeight() returns the current block height.",
        "await both, subtract — the gap is roughly the count of skipped slots over chain history.",
      ],
      criteria: "Calls getSlot() and getBlockHeight() (awaited), and computes/logs the difference between slot and block height.",
    },
  ],

  // ── 3. PROOF OF HISTORY ────────────────────────────────────────────────
  "proof-of-history": [
    {
      id: "poh-chain", kind: "reasoning", difficulty: "medium",
      title: "Model the PoH hash chain",
      goal: "Write a tiny JS loop that simulates a PoH sequence: repeatedly hash the previous output N times. Explain in a comment why this PROVES time passed and why it can't be parallelized to cheat.",
      starter: `import { createHash } from "crypto";

// PoH is a Verifiable Delay Function: hash output -> input, repeatedly.
// TODO: loop sha256 over its own output N times, keep a counter.
//       Comment: why does this prove real time elapsed?
let h = Buffer.from("seed");
`,
      hints: [
        "Each step: h = sha256(h). The output of step n feeds step n+1 — strictly sequential.",
        "You can't compute step 1000 without doing steps 1..999 first — that sequential dependency IS the proof of elapsed time.",
        "Verifiers can CHECK it in parallel, but producing it is inherently serial — that asymmetry is the trick.",
      ],
      criteria: "Loop chains sha256 over its previous output with a counter, and the comment explains the sequential dependency proves elapsed time and resists parallel shortcuts (while verification can be parallel).",
    },
    {
      id: "poh-not-consensus", kind: "reasoning", difficulty: "easy",
      title: "PoH is NOT consensus",
      goal: "Explain the single most common misconception: that PoH is Solana's consensus. State what PoH actually does and what handles consensus instead.",
      starter: `// Common myth: "Proof of History is how Solana reaches consensus."
// TODO: correct it. What does PoH actually provide? What does consensus?
`,
      hints: [
        "PoH is a clock — it orders events in verifiable time before consensus runs.",
        "Consensus is Tower BFT (a PBFT variant), which decides which fork wins.",
        "PoH makes consensus cheaper/faster by removing the need to agree on time, but it isn't consensus itself.",
      ],
      criteria: "Clearly states PoH is a cryptographic clock / ordering mechanism (not consensus), and that Tower BFT provides consensus. Bonus for explaining PoH reduces consensus messaging overhead.",
    },
  ],

  // ── 4. TRANSACTION LIFECYCLE ───────────────────────────────────────────
  "tx-lifecycle": [
    {
      id: "tl-order", kind: "reasoning", difficulty: "easy",
      title: "Order the six stages",
      goal: "Put the transaction lifecycle in correct order as a JS array, and annotate each with its trigger: client sign, RPC forward, TPU execute, Turbine propagate, Tower consensus, finalize.",
      starter: `// TODO: order the six lifecycle stages and note each trigger.
const lifecycle = [
  // { stage: "...", trigger: "..." },
];
`,
      hints: [
        "It starts in the wallet (sign) and ends at finalization (32 confirmations).",
        "RPC forwards to the leader BEFORE execution (Gulf Stream) — no mempool wait.",
        "Order: sign → RPC forward → TPU execute → Turbine propagate → Tower vote → finalize.",
      ],
      criteria: "Array lists all six stages in the correct order with a sensible trigger for each (sign, RPC forward to leader, TPU execution, Turbine shred propagation, Tower BFT votes, finalization at 32 votes).",
    },
    {
      id: "tl-confirm", kind: "code", difficulty: "medium",
      title: "Send and confirm with the right commitment",
      goal: "Write code that sends a transaction and waits for 'confirmed' commitment (not 'processed'), and explain in a comment why you wouldn't release funds on 'processed'.",
      starter: `import { Connection, clusterApiUrl } from "@solana/web3.js";
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const signedTx = null; // pretend this is a signed Transaction

// TODO: send raw tx, confirm at 'confirmed', comment on why not 'processed'
`,
      hints: [
        "connection.sendRawTransaction(signedTx.serialize()) returns a signature.",
        "connection.confirmTransaction(signature, 'confirmed') waits for the commitment.",
        "'processed' can still be rolled back (only the leader saw it); 'confirmed' = 2/3 stake voted.",
      ],
      criteria: "Sends the raw tx, confirms at 'confirmed' commitment, and the comment explains 'processed' is rollback-prone (leader-only) while 'confirmed' has supermajority stake.",
    },
  ],

  // ── 5. GULF STREAM ─────────────────────────────────────────────────────
  "gulf-stream": [
    {
      id: "gs-no-mempool", kind: "reasoning", difficulty: "medium",
      title: "Why no mempool?",
      goal: "Explain how Gulf Stream removes the need for a mempool, and the consequence for frontrunning compared to Ethereum.",
      starter: `// Ethereum has a public mempool where pending txs wait. Solana doesn't.
// TODO: explain how Gulf Stream replaces it, and the MEV consequence.
`,
      hints: [
        "RPC nodes forward transactions directly to the upcoming leaders (the schedule is deterministic, known in advance).",
        "Leaders cache txs for their slot before it begins — no public waiting pool to scan.",
        "No public mempool means classic mempool-frontrunning is impossible; MEV becomes leader-centric (Jito) instead.",
      ],
      criteria: "Explains RPCs forward txs to deterministic upcoming leaders (no public pool), and that this prevents mempool-based frontrunning, shifting MEV to a leader/bundle model.",
    },
    {
      id: "gs-forward", kind: "reasoning", difficulty: "hard",
      title: "Model leader forwarding",
      goal: "Given a leader schedule (slot → validator) and the current slot, write JS that returns the next N leaders an RPC would forward a transaction to, and explain why forwarding to several upcoming leaders (not just one) improves landing odds.",
      starter: `// RPCs forward txs to the next few upcoming leaders, not just one.
const schedule = { 100:"V1", 101:"V1", 102:"V2", 103:"V3", 104:"V2" };
const currentSlot = 100;
// TODO: return the next N distinct leaders to forward to + explain why several
`,
      hints: [
        "Walk slots forward from currentSlot, collecting the validators from the schedule.",
        "Forward to the next ~2-4 leaders so the tx is ready whoever's slot lands it first.",
        "If you forwarded to only the immediate leader and their slot got skipped, the tx could be dropped — redundancy across upcoming leaders fixes that.",
      ],
      criteria: "Code collects the next N leaders from the schedule starting at currentSlot, and explains forwarding to multiple upcoming leaders guards against skipped slots / improves landing probability.",
    },
  ],

  // ── 6. TURBINE ─────────────────────────────────────────────────────────
  turbine: [
    {
      id: "tb-shreds", kind: "reasoning", difficulty: "medium",
      title: "Why split blocks into shreds?",
      goal: "Explain why Turbine breaks a block into ~1228-byte erasure-coded shreds and fans them through a tree, instead of the leader sending the whole block to everyone.",
      starter: `// A leader can't send a full block to thousands of validators directly.
// TODO: explain the shred + tree approach and what erasure coding buys you.
`,
      hints: [
        "Direct send = leader bandwidth scales with validator count (O(n)) — impossible at scale.",
        "Tree fan-out makes propagation O(log n): each node forwards to a small neighborhood.",
        "Erasure coding (FEC) means you can reconstruct the block even if some shreds are lost — resilient to packet loss.",
      ],
      criteria: "Explains the tree gives logarithmic propagation vs linear leader load, and erasure coding allows block reconstruction from a subset of shreds (packet-loss tolerance).",
    },
    {
      id: "tb-tree", kind: "reasoning", difficulty: "hard",
      title: "Model stake-weighted fan-out",
      goal: "Model a simple stake-weighted Turbine tree in JS: given a list of validators with stake, show the high-stake ones sit closer to the root (get shreds first). Explain why.",
      starter: `// Turbine orders the propagation tree by stake.
const validators = [
  { id: "A", stake: 100 }, { id: "B", stake: 50 },
  { id: "C", stake: 10 }, { id: "D", stake: 5 },
];
// TODO: sort into tree levels by stake; comment on why high stake = closer to root.
`,
      hints: [
        "Sort validators by stake descending — highest stake near the root.",
        "Higher-stake nodes closer to root = critical stake gets data fastest and with fewest hops to fail.",
        "This minimizes the chance high-stake validators miss shreds, which matters most for consensus.",
      ],
      criteria: "Sorts/structures validators by descending stake into tree levels, and explains high-stake-near-root minimizes data loss risk for the stake that matters most to consensus.",
    },
  ],

  // ── 7. TOWER BFT ───────────────────────────────────────────────────────
  "tower-bft": [
    {
      id: "tw-lockout", kind: "reasoning", difficulty: "hard",
      title: "Model exponential lockouts",
      goal: "Write a JS function lockout(votes) that returns how many slots a validator is committed after N consecutive votes (doubles each vote, starting at 2). Explain why this makes flip-flopping between forks expensive.",
      starter: `// Each consecutive vote doubles the lockout time on that fork.
function lockout(votes) {
  // TODO: return slots locked after N consecutive votes (starts at 2, doubles)
}
`,
      hints: [
        "Lockout after n votes = 2^n slots (vote 1 → 2, vote 2 → 4, vote 3 → 8 ...).",
        "After 32 consecutive votes the lockout is so large the block is effectively final.",
        "Switching forks means forfeiting accumulated lockout — economically punishing, which secures consensus.",
      ],
      criteria: "Function returns 2^votes (or 2*2^(votes-1)) slots, and the comment explains doubling lockouts make fork-switching costly and that 32 votes ≈ finality.",
    },
    {
      id: "tw-finality", kind: "reasoning", difficulty: "medium",
      title: "Why 32 votes = finality",
      goal: "Explain what 'rooted' means and why 32 consecutive confirmations is the finality threshold. Tie it to the lockout math: how large is the lockout at 32 votes, and why does that make reversal practically impossible?",
      starter: `// A block is "finalized" / rooted after 32 consecutive votes. Why 32?
// TODO: explain rooted + tie it to the exponential lockout size at 32.
`,
      hints: [
        "At 32 votes the lockout is 2^32 slots — astronomically long, so validators can never practically switch away.",
        "'Rooted' means the block is buried deep enough that the supermajority is committed beyond any feasible reversal.",
        "Reversing would require a supermajority to abandon enormous lockouts simultaneously — economically impossible.",
      ],
      criteria: "Explains rooted/finalized = 32 consecutive votes, that the lockout at 32 is ~2^32 slots (practically irreversible), and that reversal would need a supermajority to forfeit massive lockouts.",
    },
  ],

  // ── 8. MEV ─────────────────────────────────────────────────────────────
  mev: [
    {
      id: "mev-slippage", kind: "code", difficulty: "medium",
      title: "Set protective slippage",
      goal: "Write minOut(expectedOut, slippageBps) returning the minimum acceptable output for a swap given slippage tolerance in basis points. Comment on how tight slippage kills a sandwich.",
      starter: `// Sandwiches harvest the gap between expected and executed price.
function minOut(expectedOut, slippageBps) {
  // TODO: reduce expectedOut by slippageBps (100 bps = 1%)
}
`,
      hints: [
        "factor = (10000 - slippageBps) / 10000.",
        "return Math.floor(expectedOut * factor) to stay integer-safe.",
        "If executed < minOut the swap reverts — making the attacker's bundle unprofitable.",
      ],
      criteria: "Returns expectedOut*(10000-slippageBps)/10000 treating bps correctly; comment explains revert-on-violation defeats the sandwich.",
    },
    {
      id: "mev-leader", kind: "reasoning", difficulty: "hard",
      title: "Why Solana MEV is leader-centric",
      goal: "Explain why Solana MEV differs from Ethereum's, and how Jito's bundle auction works (searchers, bundles, tips). No mempool — so where does the extraction happen?",
      starter: `// No mempool means no public-pool frontrunning. Yet MEV exists. How?
// TODO: explain leader-centric MEV + Jito bundles/tips/auction.
`,
      hints: [
        "Extraction happens at the leader: whoever builds the block controls ordering within the slot.",
        "Jito runs an off-chain block engine: searchers submit atomic bundles (1-5 txs, all-or-nothing).",
        "Bundles bid tips (to 8 known Jito accounts) in a Dutch-style auction; top validators now earn more from tips than inflation.",
      ],
      criteria: "Explains MEV is captured at the leader/block-builder, describes Jito bundles (atomic, all-or-nothing), tips to Jito accounts, and the off-chain auction. Bonus: tips can exceed inflation rewards.",
    },
  ],

  // ── 9. PRIORITY FEES ───────────────────────────────────────────────────
  "priority-fees": [
    {
      id: "pf-add", kind: "code", difficulty: "medium",
      title: "Add a priority fee correctly",
      goal: "Add BOTH a compute unit limit (300k) and a compute unit price (50,000 microLamports) to a transaction via ComputeBudgetProgram.",
      starter: `import { Transaction, ComputeBudgetProgram } from "@solana/web3.js";
const tx = new Transaction();
// TODO: add compute unit LIMIT and PRICE instructions
`,
      hints: [
        "Two instructions: setComputeUnitLimit({ units }) and setComputeUnitPrice({ microLamports }).",
        "Price without limit means you bid on the default 200k — set the limit too.",
        "tx.add() both ComputeBudgetProgram instructions.",
      ],
      criteria: "Calls setComputeUnitLimit with units≈300000 AND setComputeUnitPrice with microLamports≈50000, adding both. Fail if only one present.",
    },
    {
      id: "pf-estimate", kind: "reasoning", difficulty: "hard",
      title: "The simulate-then-price strategy",
      goal: "Describe the optimal priority-fee workflow: how do you pick a compute limit and price intelligently instead of guessing? Outline the steps in comments.",
      starter: `// Hardcoding fees wastes money or drops txs. There's a smarter loop.
// TODO: outline the simulate -> measure -> price strategy.
`,
      hints: [
        "Simulate the tx first (simulateTransaction) to measure actual compute units used.",
        "Set the limit to ~the measured CU (plus a small margin), not the default 200k.",
        "Query recent prioritization fees (getRecentPrioritizationFees) to set a competitive price for current congestion.",
      ],
      criteria: "Outlines: simulate to measure CU usage, set limit near measured usage with margin, and use recent prioritization fee data to set the price for current congestion.",
    },
  ],

  // ── 10. EPOCHS & VALIDATORS ────────────────────────────────────────────
  "epochs-validators": [
    {
      id: "ep-fetch", kind: "code", difficulty: "easy",
      title: "Read epoch progress",
      goal: "Fetch EpochInfo and log the current epoch plus how far through it we are as a percentage (slotIndex / slotsInEpoch).",
      starter: `import { Connection, clusterApiUrl } from "@solana/web3.js";
const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
// TODO: getEpochInfo(), log epoch number + % progress
`,
      hints: [
        "connection.getEpochInfo() returns { epoch, slotIndex, slotsInEpoch, ... }.",
        "Progress % = (slotIndex / slotsInEpoch) * 100.",
        "An epoch is ~2 days (432,000 slots) on mainnet.",
      ],
      criteria: "Calls getEpochInfo(), logs epoch and computes slotIndex/slotsInEpoch*100 as progress percent.",
    },
    {
      id: "ep-leader", kind: "reasoning", difficulty: "medium",
      title: "Why the leader schedule is precomputed",
      goal: "Explain why Solana computes the leader schedule for an entire epoch in advance, and how that enables Gulf Stream.",
      starter: `// The leader schedule for a whole epoch is known before the epoch starts.
// TODO: explain why precomputing it matters + the Gulf Stream link.
`,
      hints: [
        "It's derived deterministically from stake weights using a seeded RNG at epoch boundaries.",
        "Because everyone knows who leads which slot ahead of time, RPCs can forward txs to upcoming leaders.",
        "That deterministic foreknowledge is exactly what makes Gulf Stream's mempool-less forwarding possible.",
      ],
      criteria: "Explains the schedule is deterministically precomputed from stake at epoch start, and that known-in-advance leaders enable Gulf Stream to forward txs directly (no mempool).",
    },
  ],
  // ── 11. ACCOUNTS MODEL ─────────────────────────────────────────────────
  "accounts-model": [
    {
      id: "acct-owner", kind: "code", difficulty: "easy",
      title: "The owner check",
      goal: "Write isWritableByProgram(account, programId) returning true only if the account's owner equals the program. Comment on why only the owner can mutate data.",
      starter: `// Only an account's OWNER program may modify its data.
function isWritableByProgram(account, programId) {
  // TODO: compare account.owner to programId (PublicKey.equals)
}
`,
      hints: [
        "PublicKeys compare with .equals(): account.owner.equals(programId).",
        "Return that boolean directly.",
        "The runtime enforces owner-only writes even if the account is passed into another program.",
      ],
      criteria: "Returns account.owner.equals(programId); comment explains the runtime enforces owner-only mutation.",
    },
    {
      id: "acct-rent", kind: "reasoning", difficulty: "medium",
      title: "Rent exemption explained",
      goal: "Explain what 'rent-exempt' means, why accounts must hold a minimum lamport balance, and what happens to data accounts below that threshold.",
      starter: `// Accounts must be "rent-exempt" to persist. Why?
// TODO: explain rent exemption + the minimum-balance requirement.
`,
      hints: [
        "Storing data on-chain costs the network — rent is the mechanism to pay for that space.",
        "Holding ~2 years of rent as a balance makes an account 'rent-exempt' (the modern requirement).",
        "Accounts below the exemption threshold get purged/garbage-collected — they can't persist data.",
      ],
      criteria: "Explains rent pays for on-chain storage, rent-exemption = holding the minimum balance (~2 years), and sub-threshold accounts get purged.",
    },
    {
      id: "acct-program-data", kind: "reasoning", difficulty: "medium",
      title: "Programs are stateless",
      goal: "Explain why Solana programs are stateless 'executable' accounts and store all mutable state in separate data accounts they own. Contrast with Ethereum contracts holding their own storage.",
      starter: `// On Solana, code and state are SEPARATE accounts.
// TODO: explain stateless programs + separate data accounts vs Ethereum.
`,
      hints: [
        "A program account is marked executable and holds only bytecode — no mutable state.",
        "State lives in data accounts the program owns; the same program can serve many state accounts.",
        "Ethereum bundles code+storage per contract; Solana's separation enables parallelism (Sealevel).",
      ],
      criteria: "Explains programs are executable/stateless, state lives in owned data accounts, and contrasts with Ethereum's bundled storage. Bonus: ties separation to parallel execution.",
    },
  ],

  // ── 12. INSTRUCTIONS & CPIs ────────────────────────────────────────────
  "instructions-cpis": [
    {
      id: "cpi-depth", kind: "reasoning", difficulty: "medium",
      title: "Reason about CPI depth",
      goal: "State the maximum CPI depth on Solana, build a valid call chain A→B→C→D as an array, and one that exceeds the limit.",
      starter: `// CPIs let one program call another, but depth is capped.
// TODO: state the max depth, show a valid chain + an over-limit one.
const validChain = [];
`,
      hints: [
        "Max CPI depth is 4 levels.",
        "A→B→C→D is depth 4 (valid); adding E makes 5 (invalid).",
        "Represent as ['A','B','C','D'] and a 5-element over-limit array.",
      ],
      criteria: "States max CPI depth is 4, shows a 4-element valid chain and a 5-element chain marked as exceeding the limit.",
    },
    {
      id: "cpi-declare", kind: "reasoning", difficulty: "hard",
      title: "Why instructions declare accounts upfront",
      goal: "Explain why every instruction must declare all the accounts it will touch (read/write) before execution — and how this single rule unlocks Sealevel's parallelism.",
      starter: `// Every Solana instruction lists its accounts (and r/w flags) upfront.
// TODO: explain why, and how it enables parallel execution.
`,
      hints: [
        "The runtime needs to know account access BEFORE running to schedule safely.",
        "If two txs touch non-overlapping write sets, they can run on different threads simultaneously.",
        "Without upfront declaration, the runtime couldn't detect conflicts → no safe parallelism.",
      ],
      criteria: "Explains upfront account+access declaration lets the runtime detect non-overlapping txs and run them in parallel (Sealevel); without it, conflict detection (and parallelism) is impossible.",
    },
  ],

  // ── 13. SEALEVEL ───────────────────────────────────────────────────────
  sealevel: [
    {
      id: "sl-conflict", kind: "reasoning", difficulty: "hard",
      title: "Model parallel scheduling",
      goal: "Given several transactions with their write-account sets, write JS that groups them into batches where no two txs in a batch write the same account. Explain how this mirrors Sealevel.",
      starter: `// Sealevel runs non-conflicting txs in parallel.
const txs = [
  { id: "t1", writes: ["A","B"] },
  { id: "t2", writes: ["C"] },
  { id: "t3", writes: ["B"] },   // conflicts with t1 (B)
  { id: "t4", writes: ["D"] },
];
// TODO: group into parallel batches with no write-conflicts
`,
      hints: [
        "Two txs conflict if their write sets intersect.",
        "Greedily build a batch; a tx joins only if it shares no write account with anyone already in the batch.",
        "t1, t2, t4 can run together (A,B / C / D); t3 waits (needs B) — that's Sealevel's core idea.",
      ],
      criteria: "Code groups txs so no batch has overlapping write accounts (t1,t2,t4 together; t3 separate), and explains this mirrors Sealevel scheduling non-conflicting txs across threads.",
    },
    {
      id: "sl-readwrite", kind: "reasoning", difficulty: "medium",
      title: "Reads don't conflict",
      goal: "Explain why two transactions that only READ the same account can run in parallel, but two that WRITE it cannot. Extend it: can one reader and one writer of the same account run together? Why not?",
      starter: `// Sealevel cares about read vs write access, not just 'touches the account'.
// TODO: explain reads-parallel, writes-serialize, and reader+writer conflict.
`,
      hints: [
        "Multiple readers are safe — nobody mutates the data, so order doesn't matter.",
        "Two writers conflict — the final state depends on order, so they must serialize.",
        "A reader + a writer also conflict: the reader might see before-or-after state depending on order, so they can't run simultaneously.",
      ],
      criteria: "Explains read-read is parallel-safe, write-write must serialize (order-dependent), and read-write also conflicts (the reader's view depends on ordering).",
    },
    {
      id: "sl-why-declare", kind: "reasoning", difficulty: "hard",
      title: "The cost of upfront declaration",
      goal: "Sealevel's parallelism depends on transactions declaring accounts upfront. Explain the tradeoff this imposes on developers, and why Solana chose it over Ethereum's 'discover state access at runtime' model.",
      starter: `// Solana makes you list accounts upfront; Ethereum discovers them at runtime.
// TODO: explain the developer cost + why Solana accepts it for parallelism.
`,
      hints: [
        "Developer cost: you must know and pass every account an instruction (and its CPIs) will touch — more upfront work and a common source of errors.",
        "Ethereum discovers storage access as the EVM executes, so it can't safely parallelize without extra machinery.",
        "Solana trades developer convenience for a runtime that can schedule thousands of non-conflicting txs at once.",
      ],
      criteria: "Explains the developer burden of declaring all accounts upfront (incl. CPIs), contrasts with Ethereum's runtime discovery, and frames it as trading convenience for parallel scheduling.",
    },
  ],

  // ── 14. RPC & NODE INFRA ───────────────────────────────────────────────
  "rpc-infra": [
    {
      id: "rpc-call", kind: "code", difficulty: "easy",
      title: "Make a raw JSON-RPC call",
      goal: "Without the web3.js helpers, POST a raw getHealth JSON-RPC request to an RPC endpoint using fetch, and log the result.",
      starter: `const RPC = "https://api.mainnet-beta.solana.com";
// TODO: POST a JSON-RPC { method: "getHealth" } and log the response
`,
      hints: [
        "Body: { jsonrpc: '2.0', id: 1, method: 'getHealth' } as JSON.",
        "fetch(RPC, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(...) }).",
        "await res.json() — a healthy node returns result: 'ok'.",
      ],
      criteria: "Sends a POST with a valid JSON-RPC getHealth body and Content-Type header, parses the JSON response.",
    },
    {
      id: "rpc-commitment", kind: "reasoning", difficulty: "medium",
      title: "Why dedicated RPC matters",
      goal: "Explain why production apps use dedicated RPC providers (Helius/QuickNode/Triton) instead of the public endpoint, and what 'rate-limited' and 'stale read' problems they solve.",
      starter: `// Public RPC (api.mainnet-beta.solana.com) is fine for demos, risky for prod.
// TODO: explain why dedicated RPC + what problems it solves.
`,
      hints: [
        "The public endpoint is heavily rate-limited and not for production traffic.",
        "Dedicated providers offer higher limits, better uptime, and add-ons (webhooks, DAS API, gRPC streaming).",
        "Consistency/commitment + geographic latency matter for UX; a flaky RPC = stale reads and dropped txs.",
      ],
      criteria: "Explains public RPC is rate-limited/not production-grade, and dedicated providers give higher throughput, reliability, and enhanced APIs (e.g. webhooks/DAS/gRPC).",
    },
  ],

  // ── 15. PDAs ───────────────────────────────────────────────────────────
  pda: [
    {
      id: "pda-derive", kind: "code", difficulty: "medium",
      title: "Derive a vault PDA",
      goal: "Derive a Program Derived Address for a 'vault' owned by a user. Use seeds ['vault', user] and capture the bump.",
      starter: `import { PublicKey } from "@solana/web3.js";
const PROGRAM_ID = new PublicKey("33333333333333333333333333333333");
const user = new PublicKey("44444444444444444444444444444444");
// TODO: derive PDA + bump for seeds ["vault", user]
`,
      hints: [
        "PublicKey.findProgramAddressSync(seeds, programId).",
        "Seeds are Buffers: Buffer.from('vault'), user.toBuffer().",
        "Returns [pda, bump] — keep the bump for invoke_signed later.",
      ],
      criteria: "Calls findProgramAddressSync with [Buffer.from('vault'), user.toBuffer()] and PROGRAM_ID, destructures [pda, bump].",
    },
    {
      id: "pda-offcurve", kind: "reasoning", difficulty: "hard",
      title: "Why PDAs have no private key",
      goal: "Explain what 'off the ed25519 curve' means for a PDA, why that's essential, and how a program 'signs' for a PDA without a private key.",
      starter: `// A PDA has NO private key — it's off the ed25519 curve. Why does that matter?
// TODO: explain off-curve + how invoke_signed lets a program sign.
`,
      hints: [
        "A normal keypair address lies ON the ed25519 curve; a PDA is deliberately found OFF it (the bump nudges it off).",
        "Off-curve means no private key exists — so no external party can ever sign for it, only the owning program.",
        "The program 'signs' via invoke_signed, passing the seeds+bump; the runtime verifies the PDA derives from that program.",
      ],
      criteria: "Explains off-curve = no private key exists (so only the program controls it), the bump pushes the address off-curve, and invoke_signed lets the program authorize via seeds+bump verified by the runtime.",
    },
  ],

  // ── 16. VERSIONED TRANSACTIONS ─────────────────────────────────────────
  "versioned-tx": [
    {
      id: "v0-alt", kind: "code", difficulty: "hard",
      title: "Build a v0 transaction with an ALT",
      goal: "Build a VersionedTransaction (v0) using an Address Lookup Table. Compile a TransactionMessage to v0 with the lookup table account.",
      starter: `import { TransactionMessage, VersionedTransaction, PublicKey } from "@solana/web3.js";
const payer = new PublicKey("55555555555555555555555555555555");
const recentBlockhash = "11111111111111111111111111111111";
const instructions = [];
const lookupTableAccount = null;
// TODO: compile a v0 message using the ALT, wrap in VersionedTransaction
`,
      hints: [
        "new TransactionMessage({ payerKey, recentBlockhash, instructions }).",
        ".compileToV0Message([lookupTableAccount]) — pass ALT(s) in the array.",
        "new VersionedTransaction(message).",
      ],
      criteria: "Constructs a TransactionMessage, calls compileToV0Message passing the lookup table in an array, wraps in new VersionedTransaction. Fail if legacy Transaction.",
    },
    {
      id: "v0-why", kind: "reasoning", difficulty: "medium",
      title: "How ALTs beat the size limit",
      goal: "Explain how Address Lookup Tables let a transaction reference far more accounts than the old ~35 limit, in terms of bytes saved per account.",
      starter: `// ALTs expanded the account ceiling dramatically. By how much, and how?
// TODO: explain the byte math: 32-byte key vs 1-byte index.
`,
      hints: [
        "A full account key is 32 bytes; the 1232-byte tx limit caps you at ~35 inline accounts.",
        "An ALT stores up to 256 addresses on-chain; a tx references each by a 1-byte index.",
        "32 bytes → 1 byte per account means you fit far more accounts in the same packet.",
      ],
      criteria: "Explains ALTs replace 32-byte inline keys with 1-byte indices into an on-chain table (up to 256 entries), expanding the account count well beyond ~35 within the same size limit.",
    },
  ],

  // ── 17. FEE ECONOMICS ──────────────────────────────────────────────────
  "fee-economics": [
    {
      id: "fee-split", kind: "code", difficulty: "medium",
      title: "Model the 50/50 burn",
      goal: "Write feeSplit(signatures) that returns { total, burned, validator } for the base fee (5,000 lamports per signature, 50% burned, 50% to validator).",
      starter: `// Base fee = 5000 lamports per signature; 50% burned, 50% to validator.
function feeSplit(signatures) {
  // TODO: return { total, burned, validator }
}
`,
      hints: [
        "total = signatures * 5000.",
        "burned = total / 2; validator = total / 2.",
        "The burn is deflationary; priority fees are separate and go (mostly) to the validator.",
      ],
      criteria: "Returns total=signatures*5000, burned=total/2, validator=total/2. Bonus for noting burn is deflationary and priority fees are separate.",
    },
    {
      id: "fee-revenue", kind: "reasoning", difficulty: "hard",
      title: "How validator revenue shifted",
      goal: "Explain the three sources of validator revenue (inflation, base fees, MEV tips) and why MEV tips have changed the economics for top validators.",
      starter: `// Validator income = inflation + tx fees + MEV tips. The mix has shifted.
// TODO: explain the three sources + why MEV tips changed things.
`,
      hints: [
        "Inflation rewards scale with stake weight (started ~8%, disinflating ~15%/year).",
        "Base fees are small (5k lamports/sig, half burned); not a big earner alone.",
        "Jito MEV tips can now exceed inflation rewards for top validators — a structural shift.",
      ],
      criteria: "Names inflation (stake-weighted, disinflating), base fees (small, half burned), and MEV tips, and explains tips can now exceed inflation for top validators.",
    },
  ],

  // ── 18. SOLANA CLUSTERS ────────────────────────────────────────────────
  clusters: [
    {
      id: "cl-pick", kind: "reasoning", difficulty: "easy",
      title: "Pick the right cluster",
      goal: "Map each scenario to the right cluster (mainnet-beta / devnet / testnet / localhost) and justify: shipping to users, testing app logic with free SOL, validator stress-testing, rapid local iteration.",
      starter: `// TODO: map each scenario to a cluster + one-line justification.
const choices = {
  shippingToUsers: "",
  testingAppLogic: "",
  validatorStress: "",
  rapidLocalIteration: "",
};
`,
      hints: [
        "Real assets + users → mainnet-beta. Free airdrops for app logic → devnet.",
        "Validator performance/stress → testnet (unstable on purpose).",
        "Fastest loop, no network → localhost via solana-test-validator.",
      ],
      criteria: "Maps shipping→mainnet-beta, app logic→devnet (free airdrops), stress→testnet, local iteration→localhost, with sensible justifications.",
    },
    {
      id: "cl-airdrop", kind: "code", difficulty: "easy",
      title: "Request a devnet airdrop",
      goal: "Connect to devnet and request a 1 SOL airdrop to a public key, then confirm it.",
      starter: `import { Connection, clusterApiUrl, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const pubkey = new PublicKey("66666666666666666666666666666666");
// TODO: request a 1 SOL airdrop and confirm it
`,
      hints: [
        "connection.requestAirdrop(pubkey, 1 * LAMPORTS_PER_SOL) returns a signature.",
        "Await it, then connection.confirmTransaction(signature).",
        "Airdrops only work on devnet/testnet/localhost — never mainnet.",
      ],
      criteria: "Calls requestAirdrop with pubkey and 1*LAMPORTS_PER_SOL on devnet, then confirms the signature.",
    },
  ],

  // ── 19. SANDWICH ATTACKS ───────────────────────────────────────────────
  sandwich: [
    {
      id: "sw-detect", kind: "code", difficulty: "hard",
      title: "Detect a sandwich pattern",
      goal: "Given an array of swaps in a block (with trader, token, direction), write isSandwich(swaps, victimIndex) that detects the classic pattern: same attacker buys right before and sells right after the victim's swap on the same token.",
      starter: `// Classic sandwich: attacker BUY, victim swap, attacker SELL — same token, same attacker.
const swaps = [
  { trader: "bot", token: "X", dir: "buy" },
  { trader: "victim", token: "X", dir: "buy" },
  { trader: "bot", token: "X", dir: "sell" },
];
function isSandwich(swaps, victimIndex) {
  // TODO: check the swap before and after the victim
}
`,
      hints: [
        "Look at swaps[victimIndex-1] and swaps[victimIndex+1].",
        "Same trader on both, same token as the victim, and opposite directions (buy then sell).",
        "Return true only if all those conditions hold.",
      ],
      criteria: "Checks the swaps immediately before/after victimIndex share the same trader and token, with buy-before / sell-after directions. Returns true only when the full pattern matches.",
    },
    {
      id: "sw-defend", kind: "reasoning", difficulty: "medium",
      title: "Layered defenses",
      goal: "List the practical defenses a user/app has against sandwiches and explain the tradeoff of each: tight slippage, fresh quotes, private order flow (e.g. Jito), smaller trade sizes.",
      starter: `// Slippage isn't the only defense. What's the full toolkit + tradeoffs?
// TODO: list defenses and the cost of each.
`,
      hints: [
        "Tight slippage = reverts the sandwich, but risks failing in real volatility.",
        "Fresh quotes + short deadlines shrink the attack window.",
        "Private order flow (Jito bundles / RPC) hides the tx; splitting size reduces the impact worth harvesting.",
      ],
      criteria: "Lists at least three defenses (tight slippage, fresh quotes/short deadline, private order flow, smaller sizes) each with its tradeoff (e.g. slippage too tight → failed txs).",
    },
  ],

  // ── 20. VALIDATOR ECONOMICS ────────────────────────────────────────────
  "validator-economics": [
    {
      id: "ve-breakeven", kind: "code", difficulty: "hard",
      title: "Vote-cost breakeven",
      goal: "A validator pays ~2.16 SOL/epoch in vote transaction costs. Write breakeven(commissionRate, epochInflationPerStake) returning the minimum stake (in SOL) needed to cover vote costs from commission.",
      starter: `// Voting costs ~2.16 SOL/epoch. Commission on staking rewards must cover it.
function breakeven(commissionRate, epochInflationPerStake) {
  // commissionRate: 0..1 ; epochInflationPerStake: SOL earned per 1 SOL staked per epoch
  // TODO: return min stake so commission * inflation * stake >= 2.16
}
`,
      hints: [
        "Revenue from commission per epoch = stake * epochInflationPerStake * commissionRate.",
        "Set that ≥ 2.16 and solve for stake.",
        "stake = 2.16 / (epochInflationPerStake * commissionRate).",
      ],
      criteria: "Returns 2.16 / (epochInflationPerStake * commissionRate) (guarding divide-by-zero), correctly modeling commission revenue covering the ~2.16 SOL vote cost.",
    },
    {
      id: "ve-centralize", kind: "reasoning", difficulty: "medium",
      title: "The centralization pressure",
      goal: "Explain why fixed per-epoch vote costs create centralization pressure toward larger validators, and what mechanisms (e.g. stake delegation, MEV) push back or worsen it.",
      starter: `// Fixed ~2.16 SOL/epoch vote cost hits small validators hardest. Why?
// TODO: explain the centralization pressure + counter-forces.
`,
      hints: [
        "Vote cost is roughly fixed regardless of stake, so small validators spend a larger % of revenue just to vote.",
        "That favors large validators with more stake to amortize the cost → centralization pressure.",
        "MEV tips can widen the gap (big validators get more), while stake delegation programs / lower costs push back.",
      ],
      criteria: "Explains fixed vote cost is a larger revenue share for small validators (favoring large ones), and names at least one counter-force (delegation programs, cost reductions) or worsening factor (MEV concentration).",
    },
  ],

  // ── 21. FRONTIER / INFRA DEEP TASKS ────────────────────────────────────
  alpenglow: [
    {
      id: "ag-votor-rotor", kind: "reasoning", difficulty: "hard",
      title: "Separate Votor from Rotor",
      goal: "Explain Alpenglow as two scopes: Votor for consensus/finality and Rotor as a separate data-dissemination direction. State why mixing them leads to a bad mental model.",
      starter: `// Alpenglow is often explained as Votor + Rotor, but the first SIMD
// scopes the Votor consensus change separately from Rotor.
// TODO: explain Votor, Rotor, and why they should not be treated as one rollout.
`,
      hints: [
        "Votor is about validator votes becoming aggregated certificates.",
        "Rotor is about data dissemination / block propagation, not voting rules.",
        "The product impact of Votor is finality latency and vote overhead; Rotor is a networking/propagation path.",
      ],
      criteria: "Correctly distinguishes Votor from Rotor, ties Votor to off-chain vote aggregation/finality, ties Rotor to data dissemination, and warns against treating both as one activated feature.",
    },
    {
      id: "ag-client-commitment", kind: "reasoning", difficulty: "medium",
      title: "Future-proof commitment logic",
      goal: "Write comments explaining how a client should separate UX optimism from settlement safety so faster finality upgrades improve the app without a rewrite.",
      starter: `// A client should not hard-code today's finalized latency forever.
// TODO: outline commitment choices for optimistic UI vs settlement safety.
`,
      hints: [
        "processed is a weak signal; confirmed is useful for UX; finalized is settlement safety.",
        "Keep retry/expiry logic separate from finality display logic.",
        "If finalized gets faster, the app benefits when the code already has a finalized path.",
      ],
      criteria: "Explains processed/confirmed/finalized roles, keeps optimistic UI separate from settlement, and avoids hard-coding a fixed slot/time assumption for finality.",
    },
  ],

  "quic-swqos": [
    {
      id: "qs-ingress", kind: "reasoning", difficulty: "medium",
      title: "Why fees are not enough",
      goal: "Explain why a high priority fee cannot help a transaction that never reaches the leader, and how QUIC + SWQoS changes the ingress problem.",
      starter: `// Priority fees matter after a transaction reaches the leader.
// TODO: explain the earlier bottleneck: sender ingress under congestion.
`,
      hints: [
        "QUIC adds identity, flow control, and back-pressure at the network connection layer.",
        "SWQoS reserves leader ingest capacity for staked/trusted connections.",
        "A priority fee only competes inside scheduling once the leader has the packet.",
      ],
      criteria: "Explains packet ingress as a separate bottleneck from scheduling/block space, describes QUIC and SWQoS, and states why sender infrastructure affects landing rate.",
    },
  ],

  "svm-bytecode": [
    {
      id: "svm-boundary", kind: "reasoning", difficulty: "hard",
      title: "Draw the SVM boundary",
      goal: "In comments, define what belongs inside the SVM execution boundary and what belongs to validator stages around it.",
      starter: `// The SVM executes transactions, but it is not the whole validator.
// TODO: split these into SVM vs surrounding pipeline:
// QUIC ingest, scheduler, account ownership checks, CPI invoke context,
// compute metering, shreds, gossip, account write result.
`,
      hints: [
        "SVM/runtime: ownership checks, CPI/invoke context, compute metering, instruction execution, account write results.",
        "Surrounding validator pipeline: QUIC ingest, scheduler/banking, shreds/Turbine, gossip.",
        "The boundary matters because test engines can execute at the runtime layer without simulating the whole network.",
      ],
      criteria: "Correctly classifies runtime responsibilities vs networking/scheduling/propagation responsibilities and explains why the boundary matters for tools like LiteSVM.",
    },
  ],

  accountsdb: [
    {
      id: "adb-classify", kind: "reasoning", difficulty: "medium",
      title: "State, ledger, or snapshot?",
      goal: "Classify common validator data questions as AccountsDB, ledger/blockstore, snapshot, or indexer/archive, and explain the reason for each.",
      starter: `// Classify each question: AccountsDB, ledger/blockstore, snapshot, or archive/indexer.
const questions = [
  "What is this account balance right now?",
  "What did this account look like six months ago?",
  "How does a new validator avoid replaying from genesis?",
  "Where are shreds/entries stored after propagation?",
];
// TODO: fill classifications + explanations.
`,
      hints: [
        "Current account state is AccountsDB.",
        "Deep history usually needs archival ledger/indexer infrastructure.",
        "Snapshots are compressed recent AccountsDB state for bootstrapping.",
        "Blockstore/ledger stores shreds, entries, and blocks.",
      ],
      criteria: "Maps current balance to AccountsDB, old state to archive/indexer, validator bootstrap to snapshots, and shreds/entries to ledger/blockstore with concise explanations.",
    },
  ],

  "banking-stage": [
    {
      id: "bank-conflict-graph", kind: "reasoning", difficulty: "hard",
      title: "Build a conflict batch",
      goal: "Given transactions with read/write sets and priority scores, group a first parallel batch that maximizes useful work without write conflicts.",
      starter: `// Banking Stage can run non-conflicting transactions in parallel.
const txs = [
  { id: "swapA", writes: ["pool"], reads: ["oracle"], score: 90 },
  { id: "mintB", writes: ["userB"], reads: ["config"], score: 35 },
  { id: "swapC", writes: ["pool"], reads: ["oracle"], score: 70 },
  { id: "claimD", writes: ["userD"], reads: ["config"], score: 20 },
];
// TODO: choose the first parallel batch. Explain why swapA and swapC cannot both run.
`,
      hints: [
        "Sort by score, then greedily add txs that do not share writable accounts with the batch.",
        "swapA and swapC both write pool, so they conflict.",
        "mintB and claimD write separate user accounts, so they can run alongside one pool writer.",
      ],
      criteria: "Selects a non-conflicting batch such as swapA + mintB + claimD, excludes swapC due to pool write conflict, and explains the scheduler/account-lock reasoning.",
    },
  ],

  firedancer: [
    {
      id: "fd-matrix", kind: "reasoning", difficulty: "medium",
      title: "Client rollout matrix",
      goal: "Create a small matrix comparing Agave, Frankendancer, and full Firedancer by language/stack, production role, and risk reduced.",
      starter: `// TODO: fill a matrix for validator clients.
const clients = [
  { name: "Agave", stack: "", role: "", riskReduced: "" },
  { name: "Frankendancer", stack: "", role: "", riskReduced: "" },
  { name: "Full Firedancer", stack: "", role: "", riskReduced: "" },
];
`,
      hints: [
        "Agave is the Rust reference client maintained by Anza.",
        "Frankendancer is the bridge: Firedancer networking with Agave runtime/consensus.",
        "Full Firedancer is the independent pure-C validator path being hardened for broader rollout.",
      ],
      criteria: "Clearly distinguishes Agave, Frankendancer, and full Firedancer, and explains client diversity as reducing implementation monoculture risk rather than changing the chain.",
    },
  ],

};

export function tasksFor(conceptId: string): Task[] {
  return tasks[conceptId] ?? [];
}
export function taskById(conceptId: string, taskId: string): Task | undefined {
  return tasksFor(conceptId).find((t) => t.id === taskId);
}
