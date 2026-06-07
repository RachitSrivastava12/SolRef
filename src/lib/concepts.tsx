import {
  ArrowRight, Zap, Box, Layers, GitBranch, Shield, Activity, Clock,
  Database, Network, Cpu, Globe, Lock, Server, Code2, Flame, BarChart3,
  HardDrive, RefreshCw, Wifi, Eye, BookOpen, Terminal, Hash,
} from "lucide-react";
import type { ReactNode } from "react";

// Icon registry — data references icons by name, we render real lucide nodes.
const ICONS: Record<string, ReactNode> = {
  ArrowRight: <ArrowRight className="w-5 h-5" />, Zap: <Zap className="w-5 h-5" />,
  Box: <Box className="w-5 h-5" />, Layers: <Layers className="w-5 h-5" />,
  GitBranch: <GitBranch className="w-5 h-5" />, Shield: <Shield className="w-5 h-5" />,
  Activity: <Activity className="w-5 h-5" />, Clock: <Clock className="w-5 h-5" />,
  Database: <Database className="w-5 h-5" />, Network: <Network className="w-5 h-5" />,
  Cpu: <Cpu className="w-5 h-5" />, Globe: <Globe className="w-5 h-5" />,
  Lock: <Lock className="w-5 h-5" />, Server: <Server className="w-5 h-5" />,
  Code2: <Code2 className="w-5 h-5" />, Flame: <Flame className="w-5 h-5" />,
  BarChart3: <BarChart3 className="w-5 h-5" />, HardDrive: <HardDrive className="w-5 h-5" />,
  RefreshCw: <RefreshCw className="w-5 h-5" />, Wifi: <Wifi className="w-5 h-5" />,
  Eye: <Eye className="w-5 h-5" />, BookOpen: <BookOpen className="w-5 h-5" />,
  Terminal: <Terminal className="w-5 h-5" />, Hash: <Hash className="w-5 h-5" />,
};
export function iconFor(name: string): ReactNode { return ICONS[name] ?? <Box className="w-5 h-5" />; }

export interface Concept {
  icon: string; tag: string; title: string; desc: string;
  details: string[]; whyItMatters: string; commonMistakes: string[];
  code: string; links?: { label: string; url: string }[];
}

export const categories = ["All", "Frontier", "Core Infra", "Consensus", "Networking", "Data Flow", "Programs", "System Design", "MEV", "Economics"];

export const concepts: Concept[] = [
  {
    icon: "Box",
    tag: "Core Infra",
    title: "Transactions",
    desc: "A Solana transaction bundles one or more instructions into a single atomic unit. Either ALL instructions succeed, or ALL fail — there's no partial execution. Every tx includes a recent blockhash (acts as a nonce + expiry), a fee payer, and at least one signature.",
    details: [
      "Max 1232 bytes per tx (hard limit)",
      "Recent blockhash expires in ~150 slots (~60s)",
      "Fee paid in lamports (1 SOL = 10⁹ lamports)",
      "Versioned (v0) & legacy formats supported",
      "Legacy tx fits ~35 accounts; v0 + ALTs reach 256",
      "Ed25519 or Secp256k1 signature verification",
      "Multi-sig: multiple signers on one tx",
      "Atomic: all-or-nothing execution guarantee"
    ],
    whyItMatters: "Understanding transaction structure is critical because the 1232-byte limit is a hard wall. If you're building DeFi protocols that touch many accounts, you'll hit it. This forces you to use versioned transactions with Address Lookup Tables (ALTs), or split logic across multiple transactions.",
    commonMistakes: [
      "Not refreshing the blockhash before sending — stale blockhash = tx rejected",
      "Ignoring the size limit until you hit it in prod",
      "Sending the same tx multiple times without idempotency protection",
      "Not handling partial failures in multi-instruction txs"
    ],
    code: `import {
  Connection, Transaction, SystemProgram,
  sendAndConfirmTransaction, Keypair, LAMPORTS_PER_SOL,
  clusterApiUrl
} from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// ── BASIC: Transfer SOL ─────────────────────────────────────────
const sender = Keypair.generate();
const receiver = Keypair.generate();

// Always fetch a fresh blockhash right before building the tx
// Stale blockhashes = immediate rejection by the leader
const { blockhash, lastValidBlockHeight } =
  await connection.getLatestBlockhash("finalized");

const tx = new Transaction({
  recentBlockhash: blockhash,
  feePayer: sender.publicKey,          // who pays the tx fee
}).add(
  SystemProgram.transfer({
    fromPubkey: sender.publicKey,
    toPubkey: receiver.publicKey,
    lamports: 0.01 * LAMPORTS_PER_SOL, // 0.01 SOL
  })
);

// Sign with sender's keypair
tx.sign(sender);

// Send + wait for confirmation with expiry context
const sig = await connection.sendRawTransaction(tx.serialize(), {
  skipPreflight: false,     // run simulation first (recommended)
  preflightCommitment: "confirmed",
});

const confirmation = await connection.confirmTransaction({
  signature: sig,
  blockhash,
  lastValidBlockHeight,     // tx expires if not confirmed by this height
}, "confirmed");

if (confirmation.value.err) {
  console.error("Tx failed:", confirmation.value.err);
} else {
  console.log("Confirmed tx:", sig);
  console.log("Explorer:", \`https://solscan.io/tx/\${sig}?cluster=devnet\`);
}

// ── MULTI-INSTRUCTION TX ─────────────────────────────────────────
// All instructions execute atomically — if any fails, ALL fail
const multiTx = new Transaction().add(
  SystemProgram.transfer({ fromPubkey: payer.publicKey, toPubkey: alice.publicKey, lamports: 1000 }),
  SystemProgram.transfer({ fromPubkey: payer.publicKey, toPubkey: bob.publicKey,   lamports: 2000 }),
  SystemProgram.transfer({ fromPubkey: payer.publicKey, toPubkey: carol.publicKey, lamports: 3000 }),
);
// If alice transfer fails, bob and carol don't get paid either

// ── CHECK TX SIZE ────────────────────────────────────────────────
// Serialize to check byte count before sending
const serialized = tx.serialize({ requireAllSignatures: false });
console.log(\`Tx size: \${serialized.length} / 1232 bytes\`);
if (serialized.length > 1232) throw new Error("Tx too large!");`,
    links: [
      { label: "Solana Docs — Transactions", url: "https://docs.solana.com/developing/programming-model/transactions" },
      { label: "Helius — Transaction Deep Dive", url: "https://www.helius.dev/blog/solana-transactions" },
    ],
  },
  {
    icon: "Layers",
    tag: "Core Infra",
    title: "Blocks & Slots",
    desc: "Slots are fixed ~400ms time windows during which a designated leader validator produces a block. Not every slot produces a block — if the leader is offline or slow, the slot is 'skipped'. A block is an ordered, confirmed set of transactions anchored to a specific slot number.",
    details: [
      "~400ms per slot (network target)",
      "~2.5 slots created per second on average",
      "Leader schedule is rotated every epoch",
      "Skipped slots ≠ lost data — tx just wasn't included",
      "~400–460ms actual average block time on mainnet",
      "Block header includes parent slot hash",
      "Slot = position in the chain; Block = data at that slot",
      "Slot number is the primary time reference on Solana"
    ],
    whyItMatters: "Slots are Solana's fundamental unit of time. Everything — from transaction expiry to leader schedules to staking rewards — is measured in slots. When your tx includes a blockhash from slot N, it's valid until slot N+150. If you use 'slot' as a timestamp in your program, you're working with the blockchain's native clock.",
    commonMistakes: [
      "Assuming every slot number maps to a real block (skipped slots have no block)",
      "Using wall-clock time instead of slot number for on-chain time tracking",
      "Not accounting for slot skips when estimating confirmation time"
    ],
    code: `import { Connection, clusterApiUrl } from "@solana/web3.js";
const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

// ── GET CURRENT SLOT ─────────────────────────────────────────────
const slot = await connection.getSlot("finalized");
console.log("Current finalized slot:", slot);

// Different commitment levels return different slots:
const processedSlot  = await connection.getSlot("processed");  // latest seen
const confirmedSlot  = await connection.getSlot("confirmed");  // 2/3 voted
const finalizedSlot  = await connection.getSlot("finalized");  // rooted (irreversible)
// processedSlot >= confirmedSlot >= finalizedSlot (always)

// ── GET BLOCK DATA ───────────────────────────────────────────────
const block = await connection.getBlock(slot, {
  commitment: "confirmed",
  maxSupportedTransactionVersion: 0,
  transactionDetails: "full",      // "full" | "accounts" | "signatures" | "none"
  rewards: true,                   // include validator rewards
});

if (block) {
  console.log("Block time (Unix):", block.blockTime);  // Unix timestamp
  console.log("Parent slot:",       block.parentSlot);
  console.log("Blockhash:",         block.blockhash);
  console.log("Tx count:",          block.transactions.length);
  console.log("Rewards:", block.rewards?.map(r => ({
    pubkey: r.pubkey,
    lamports: r.lamports,
    rewardType: r.rewardType, // "fee" | "rent" | "voting" | "staking"
  })));
} else {
  console.log("Slot was skipped — no block produced");
}

// ── LISTEN TO NEW SLOTS IN REAL-TIME ─────────────────────────────
const subId = connection.onSlotChange((slotInfo) => {
  console.log("New slot:",    slotInfo.slot);    // newly processed slot
  console.log("Parent slot:", slotInfo.parent);  // its parent
  console.log("Root slot:",   slotInfo.root);    // latest finalized slot
});

// Cleanup when done
connection.removeSlotChangeListener(subId);

// ── GET SLOT FOR A SPECIFIC TIMESTAMP ───────────────────────────
// Solana doesn't have a direct API for this, but you can estimate:
const epochInfo = await connection.getEpochInfo();
const slotsPerSecond = 2.5; // approximate
const secsAgo = 3600; // 1 hour ago
const estimatedSlot = epochInfo.absoluteSlot - Math.floor(secsAgo * slotsPerSecond);
console.log("Approx slot 1hr ago:", estimatedSlot);`,
    links: [
      { label: "Solana Docs — Slots", url: "https://solana.com/docs/references/terminology#slot" },
       { label: "getBlock RPC reference", url: "https://solana.com/docs/rpc/http/getblock" },
    ],
  },
  {
    icon: "Hash",
    tag: "Consensus",
    title: "Proof of History (PoH)",
    desc: "PoH is NOT a consensus mechanism — it's a cryptographic clock. It's a Verifiable Delay Function (VDF) based on SHA-256 hash chaining that proves time has passed between events. The leader runs PoH continuously, embedding transactions into the hash sequence. This creates a verifiable, tamper-proof timeline BEFORE blocks even reach consensus.",
    details: [
      "SHA-256 hash chain: output N feeds into input N+1",
      "Slots are the ~400ms window; PoH provides ordered hashes/entries inside the slot machinery",
      "The leader produces the sequence sequentially; validators can verify recorded hashes in parallel",
      "Gives Tower a ledger-encoded clock for timeouts and vote lockouts",
      "PoH runs inside the leader's CPU — not on-chain storage",
      "NOT a consensus mechanism — Tower BFT handles consensus",
      "Allows Solana to skip round-trip messaging for time agreement",
      "Sequence counter provides total ordering of all events"
    ],
    whyItMatters: "Traditional blockchains (like Ethereum) need validators to agree on time via messaging rounds. Solana's PoH removes this bottleneck. The leader timestamps every transaction into the hash chain, so validators can verify order without communicating. This is why Solana can achieve sub-second block times — there's no waiting for 'what time is it?' consensus.",
    commonMistakes: [
      "Confusing PoH with consensus — PoH is just timestamping, Tower BFT is consensus",
      "Thinking PoH prevents double-spends — it doesn't, consensus does",
      "Assuming PoH is stored on-chain — it's ephemeral, only the block hashes persist"
    ],
    code: `// PoH runs inside validators — you can't call it directly.
// But you can OBSERVE its effects and use it intelligently:

import { Connection } from "@solana/web3.js";
const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");

// ── OBSERVE PoH VIA PERFORMANCE SAMPLES ──────────────────────────
// PoH produces the slot timing — monitor it here:
const perfSamples = await connection.getRecentPerformanceSamples(60);

perfSamples.forEach(s => {
  const tps        = s.numTransactions / s.samplePeriodSecs;
  const nonVoteTps = s.numNonVoteTransactions / s.samplePeriodSecs;
  const msPerSlot  = (s.samplePeriodSecs / s.numSlots) * 1000;
  console.log([
    \`Slot \${s.slot}:\`,
    \`  Total TPS:    \${tps.toFixed(0)}\`,
    \`  Non-vote TPS: \${nonVoteTps.toFixed(0)}\`,
    \`  ms/slot:      \${msPerSlot.toFixed(0)}ms\`,
    \`  Num slots:    \${s.numSlots}\`,
  ].join("\\n"));
});

// ── USE THE ON-CHAIN CLOCK SYSVAR ────────────────────────────────
// In Anchor programs, PoH's slot counter is accessible via Clock:
/*
use anchor_lang::prelude::*;

#[program]
pub mod my_program {
    pub fn use_clock(ctx: Context<UseClock>) -> Result<()> {
        let clock = Clock::get()?;

        // Slot from PoH — total slots since genesis
        msg!("Current slot: {}", clock.slot);

        // Unix timestamp (derived from PoH + known genesis time)
        msg!("Unix timestamp: {}", clock.unix_timestamp);

        // Epoch number (each epoch = ~432,000 slots)
        msg!("Epoch: {}", clock.epoch);

        // Slot within the current epoch
        msg!("Epoch slot: {}", clock.epoch_start_slot);

        // Leader schedule slot (used for leader selection)
        msg!("Leader schedule slot: {}", clock.leader_schedule_epoch);

        Ok(())
    }
}
*/

// ── VERIFY TRANSACTION ORDER ─────────────────────────────────────
// PoH gives every tx a position in the global sequence
// You can verify ordering via slot + tx index within block:
const block = await connection.getBlock(slot, {
  maxSupportedTransactionVersion: 0,
  transactionDetails: "signatures",
});

// Txs within a block are in PoH-determined order
block?.signatures.forEach((sig, index) => {
  console.log(\`Position \${index} in slot \${slot}: \${sig}\`);
});`,
    links: [
      { label: "PoH Original Whitepaper", url: "https://solana.com/solana-whitepaper.pdf" },
      { label: "Solana Architecture Blog Post", url: "https://solana.com/news/8-innovations-that-make-solana-the-first-web-scale-blockchain" },
      { label: "Clock Sysvar Docs", url: "https://docs.solana.com/developing/runtime-facilities/sysvars#clock" },
    ],
  },
  {
    icon: "Activity",
    tag: "Data Flow",
    title: "Transaction Lifecycle",
    desc: "A transaction goes through distinct states: Client signs & sends tx → RPC validates & forwards to leader via Gulf Stream → leader executes in slot → block propagated via Turbine → validators vote via Tower BFT → finality at 2/3 supermajority stake. Understanding each stage helps you build robust retry logic and avoid 'my tx disappeared' bugs.",
    details: [
      "Processed: leader received it (no guarantee of inclusion)",
      "Confirmed: 2/3 stake voted on the block (fast finality for UX)",
      "Finalized: rooted after 32 confirmations (irreversible forever)",
      "Blockhash expiry creates implicit tx timeout (~60 seconds)",
      "RPC preflight simulates tx before broadcasting",
      "sendTransaction ≠ confirmed — you must poll separately",
      "Transactions can drop at RPC, network, or leader layer",
      "Use lastValidBlockHeight for reliable expiry detection"
    ],
    whyItMatters: "90% of 'my transaction is stuck/dropped' bugs come from not understanding this lifecycle. The most critical insight: Solana has NO mempool — if the leader drops your tx, it's gone. You must implement retry logic yourself. The blockhash expiry window is your friend: if not confirmed within ~60s, it's safe to retry.",
    commonMistakes: [
      "Calling sendAndConfirmTransaction with no timeout — it can hang forever",
      "Not tracking lastValidBlockHeight — you won't know when to stop retrying",
      "Retrying a tx after its blockhash expires (it will never confirm)",
      "Assuming 'processed' means confirmed — it absolutely does not"
    ],
    code: `import {
  Connection, Transaction, sendAndConfirmTransaction,
  VersionedTransaction
} from "@solana/web3.js";

const connection = new Connection(
  "https://mainnet.helius-rpc.com/?api-key=YOUR_KEY",
  { commitment: "confirmed", confirmTransactionInitialTimeout: 60_000 }
);

// ── ROBUST SEND WITH PROPER EXPIRY TRACKING ──────────────────────
async function sendWithRetry(
  tx: Transaction,
  signers: Keypair[],
  maxRetries = 3
): Promise<string> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Always get fresh blockhash for each attempt
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("confirmed");

    tx.recentBlockhash = blockhash;
    tx.sign(...signers);

    const rawTx = tx.serialize();
    const sig   = await connection.sendRawTransaction(rawTx, {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });

    console.log(\`Attempt \${attempt + 1}: \${sig}\`);

    // confirmTransaction uses lastValidBlockHeight to know when to give up
    try {
      const result = await connection.confirmTransaction(
        { signature: sig, blockhash, lastValidBlockHeight },
        "confirmed"
      );

      if (result.value.err) {
        throw new Error(\`Tx failed: \${JSON.stringify(result.value.err)}\`);
      }

      console.log("✅ Confirmed:", sig);
      return sig;
    } catch (e) {
      if (attempt === maxRetries - 1) throw e;
      console.log(\`Retrying... (attempt \${attempt + 1} failed)\`);
    }
  }
  throw new Error("Max retries exceeded");
}

// ── CHECK COMMITMENT LEVELS ──────────────────────────────────────
async function checkTxStatus(sig: string) {
  const status = await connection.getSignatureStatus(sig, {
    searchTransactionHistory: true, // search beyond recent slots
  });

  console.log("Slot:", status.value?.slot);
  console.log("Confirmations:", status.value?.confirmations); // null = finalized
  console.log("Status:", status.value?.confirmationStatus);
  // "processed" | "confirmed" | "finalized"

  if (status.value?.err) {
    console.error("Tx FAILED:", status.value.err);
    // err object contains the specific InstructionError
  }
}

// ── POLL WITH TIMEOUT (PRODUCTION PATTERN) ───────────────────────
async function pollConfirmation(sig: string, timeoutMs = 60_000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const status = await connection.getSignatureStatus(sig);
    const cs = status.value?.confirmationStatus;
    if (cs === "confirmed" || cs === "finalized") return true;
    if (status.value?.err) throw new Error(\`Tx failed: \${JSON.stringify(status.value.err)}\`);
    await new Promise(r => setTimeout(r, 1500)); // poll every 1.5s
  }
  return false; // timed out — tx may still confirm later!
}`,
    links: [
      { label: "Helius: How Solana Transactions Work", url: "https://www.helius.dev/blog/how-to-land-transactions-on-solana" },
      { label: "Solana Commitment Levels Docs", url: "https://docs.solana.com/developing/clients/jsonrpc-api#commitment" },
      { label: "QuickNode: Guide to Optimizing Solana Transactions", url: "https://www.quicknode.com/guides/solana-development/transactions/how-to-optimize-solana-transactions" },
    ],
  },
  {
    icon: "Wifi",
    tag: "Data Flow",
    title: "Gulf Stream",
    desc: "Solana has NO mempool. Instead, Gulf Stream is a protocol where the current leader and upcoming leaders receive transactions before their slot begins. Your RPC node determines who the next leaders are (publicly scheduled) and forwards txs directly to them. This eliminates the public pending tx pool that Ethereum-style chains have.",
    details: [
      "Zero public pending transaction pool",
      "Current leader forwards txs to next ~4 leaders",
      "Leader pre-caches txs in memory before their slot",
      "Stale txs (expired blockhash) are silently dropped",
      "Gossip network propagates leader schedule changes",
      "Reduces confirmation latency vs. mempool-based chains",
      "No frontrunning via mempool scanning (unlike Ethereum)",
      "Tx forwarding is fire-and-forget — no delivery guarantee"
    ],
    whyItMatters: "Gulf Stream is why Solana doesn't have a gas war mempool. But it creates different failure modes: your tx can silently drop if the leader was offline when it arrived. This is why robust retry logic is essential on Solana. It's also why MEV on Solana is different — bots can't see a 'mempool' of pending txs to sandwich.",
    commonMistakes: [
      "Thinking a sent tx is safe — it can drop at any forwarding step",
      "Not implementing retry with fresh blockhash on failure",
      "Sending to a slow/public RPC that doesn't forward efficiently"
    ],
    code: `// Gulf Stream is transparent to developers but affects how you handle txs.
// Here's what you need to understand operationally:

import { Connection, clusterApiUrl } from "@solana/web3.js";

// ── UNDERSTAND LEADER SCHEDULE ───────────────────────────────────
// The leader schedule is public and deterministic.
// Your RPC knows who the next leaders are and forwards txs to them.

const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

// Get the full leader schedule for the current epoch
const leaderSchedule = await connection.getLeaderSchedule();
// Returns: Map<validatorPubkey, slotIndices[]>
// This is what Gulf Stream uses to forward your txs

// ── GET THE CURRENT AND UPCOMING LEADERS ─────────────────────────
const currentSlot = await connection.getSlot("processed");

// Gulf Stream forwards to leaders ~4 slots ahead
const slotsToCheck = [currentSlot, currentSlot+1, currentSlot+2, currentSlot+3, currentSlot+4];
const leaderSlots  = await connection.getSlotLeaders(currentSlot, 5);
leaderSlots.forEach((leader, i) => {
  console.log(\`Slot \${currentSlot + i}: Leader = \${leader.toBase58()}\`);
});
// Your tx is forwarded to all of these nodes simultaneously

// ── MONITOR TX FORWARDING BEHAVIOR ──────────────────────────────
// Use sendRawTransaction with these options to control forwarding:
const sig = await connection.sendRawTransaction(rawTx, {
  skipPreflight: false,          // simulate first — STRONGLY recommended
  preflightCommitment: "confirmed",
  maxRetries: 0,                 // 0 = let YOUR code handle retries
                                 // Default retries can mask errors
  minContextSlot: currentSlot,   // only process if still in context
});

// ── VERIFY TX NOT DROPPED (POLL APPROACH) ───────────────────────
// Gulf Stream doesn't guarantee delivery — always verify
async function verifyNotDropped(sig: string): Promise<boolean> {
  // Wait a few seconds for propagation
  await new Promise(r => setTimeout(r, 3000));

  const status = await connection.getSignatureStatus(sig);
  if (!status.value) {
    console.log("Tx not found — likely dropped by Gulf Stream");
    console.log("Safe to retry with a fresh blockhash");
    return false;
  }
  return true;
}

// ── BLOCKHASH FRESHNESS IS CRITICAL ──────────────────────────────
// A stale blockhash means the tx will NEVER be accepted
// Fetch blockhash immediately before signing and sending:
const { blockhash, lastValidBlockHeight } =
  await connection.getLatestBlockhash("confirmed");

const currentHeight = await connection.getBlockHeight("confirmed");
console.log(\`Blockhash valid for \${lastValidBlockHeight - currentHeight} more blocks\`);
// If this is < 50, get a fresh blockhash before proceeding`,
    links: [
      { label: "Gulf Stream Explained — Solana.com", url: "https://solana.com/news/gulf-stream--solana-s-mempool-less-transaction-forwarding-protocol" },
      { label: "getLeaderSchedule RPC", url: "https://solana.com/docs/rpc/http/getleaderschedule" },
    ],
  },
  {
    icon: "Network",
    tag: "Data Flow",
    title: "Turbine Block Propagation",
    desc: "Turbine is Solana's block propagation protocol inspired by BitTorrent. The leader doesn't send the full block to every validator (that would be O(n²) bandwidth). Instead, it breaks the block into small erasure-coded 'shreds' (~1228 bytes each), then distributes them through a stake-weighted tree of validators who each forward to a small subset.",
    details: [
      "~1228 byte shreds (erasure-coded fragments)",
      "Two types: data shreds & coding shreds (FEC)",
      "Forward Error Correction: reconstruct with ⅔ of shreds",
      "Validators organized in stake-weighted tiers",
      "Tier 1 (Turbine root layer): ~200 validators from leader",
      "Each tier forwards to ~200 sub-validators",
      "Reduces bandwidth from O(n²) to O(n log n)",
      "Validators buffer shreds and reconstruct full blocks"
    ],
    whyItMatters: "Turbine is why Solana can have 1,700+ validators without the leader being overwhelmed. Without it, the leader would need to send 1MB blocks to 1,700 validators = 1.7GB/s of upload. With Turbine, the leader only sends to ~200 nodes, and the network fans out from there. FEC means missing shreds don't break things.",
    commonMistakes: [
      "Assuming block latency is uniform — your validator's position in the Turbine tree affects when you see blocks",
      "Not accounting for Turbine delays when building time-sensitive bots"
    ],
    code: `// Turbine is entirely internal to validators — as a developer,
// you interact with its EFFECTS: block propagation timing.

import { Connection } from "@solana/web3.js";
const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");

// ── OBSERVE TURBINE PROPAGATION LATENCY ──────────────────────────
// The difference between "processed" and "confirmed" slots
// reflects Turbine propagation + Tower BFT voting time

async function measurePropagationLatency() {
  const processed  = await connection.getSlot("processed");  // leader just made it
  const confirmed  = await connection.getSlot("confirmed");  // 2/3 stake voted
  const finalized  = await connection.getSlot("finalized");  // rooted

  console.log(\`Slot gap processed→confirmed: \${processed - confirmed} slots\`);
  console.log(\`Slot gap confirmed→finalized: \${confirmed - finalized} slots\`);
  // Healthy network: processed-confirmed ~2-4 slots (~1-2 seconds)
}

// ── CHECK IF A BLOCK WAS FULLY PROPAGATED ────────────────────────
async function checkBlockAvailability(slot: number) {
  try {
    const block = await connection.getBlock(slot, {
      commitment: "confirmed",
      transactionDetails: "none",  // lightweight check
      maxSupportedTransactionVersion: 0,
    });

    if (!block) {
      console.log(\`Slot \${slot}: SKIPPED (no block produced)\`);
      return "skipped";
    }

    console.log(\`Slot \${slot}: ✅ Available\`);
    console.log(\`  Transactions: \${block.transactions?.length ?? 0}\`);
    console.log(\`  Block time: \${new Date(block.blockTime! * 1000).toISOString()}\`);
    return "available";
  } catch (e) {
    console.log(\`Slot \${slot}: NOT YET PROPAGATED\`);
    return "pending";
  }
}

// ── SHRED RECONSTRUCTION MONITORING ─────────────────────────────
// If you run a validator, you can monitor shred receive rates.
// As a dev using RPC, you just need to handle reorgs/skipped blocks:

async function robustBlockFetch(slot: number, maxWaitMs = 5000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const block = await connection.getBlock(slot, {
      maxSupportedTransactionVersion: 0
    }).catch(() => null);

    if (block) return block;

    // Block might still be propagating via Turbine
    await new Promise(r => setTimeout(r, 500));
  }
  return null; // slot was likely skipped
}

// ── TURBINE METRICS (RPC) ─────────────────────────────────────────
// Monitor validator node health (proxy for Turbine health):
const clusterNodes = await connection.getClusterNodes();
console.log(\`Active nodes: \${clusterNodes.length}\`);
clusterNodes.slice(0, 5).forEach(node => {
  console.log(\`\${node.pubkey}: gossip=\${node.gossip} tpu=\${node.tpu}\`);
});`,
    links: [
      { label: "Turbine: Solana's Block Propagation Protocol", url: "https://solana.com/news/turbine-solana-s-block-propagation-protocol" },
      { label: "Shred Architecture Deep Dive", url: "https://docs.solanalabs.com/consensus/shreds" },
    ],
  },
  {
    icon: "RefreshCw",
    tag: "Consensus",
    title: "Tower BFT",
    desc: "Tower BFT is Solana's PBFT-derived consensus algorithm that uses PoH as a cryptographic clock to reduce messaging overhead. Validators vote on forks by submitting vote transactions. Each consecutive vote on the same fork exponentially increases the validator's 'lockout' — the period they cannot switch forks. This makes attacking consensus exponentially expensive.",
    details: [
      "Built on Practical Byzantine Fault Tolerance (PBFT)",
      "Validators vote on blocks every slot (~400ms)",
      "First lockout: 2 slots. Doubles on each consecutive vote",
      "Max lockout: 2^31 slots (~27 years of real time)",
      "32 confirmations = finalized (rooted) block",
      "Votes are submitted as on-chain transactions (~5000 lamports each)",
      "Requires 2/3+ of stake to reach 'confirmed' status",
      "Slashing for equivocation exists but not fully implemented yet"
    ],
    whyItMatters: "Tower BFT is why Solana can finalize blocks in ~13 seconds (32 slots). The lockout mechanism means that once 2/3 of stake has voted on a fork, any validator who tries to vote on a competing fork would have to wait out their lockout period — making reversals practically impossible and mathematically extremely expensive.",
    commonMistakes: [
      "Treating 'confirmed' as final — it's safe for UX but technically reversible",
      "Not distinguishing processed, confirmed, and finalized commitment in your app logic",
      "Ignoring vote account health when choosing validators to delegate to"
    ],
    code: `import { Connection, clusterApiUrl, VoteAccountStatus } from "@solana/web3.js";
const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

// ── MONITOR VOTE ACCOUNT HEALTH ──────────────────────────────────
// Vote accounts reveal Tower BFT participation in real-time

const voteAccounts = await connection.getVoteAccounts("confirmed");

console.log(\`Active validators: \${voteAccounts.current.length}\`);
console.log(\`Delinquent validators: \${voteAccounts.delinquent.length}\`);

// Analyze top validators by stake
const sorted = voteAccounts.current
  .sort((a, b) => b.activatedStake - a.activatedStake);

sorted.slice(0, 5).forEach(v => {
  const stakeSOL = v.activatedStake / 1e9;
  const epochVotesBehind = v.epochVoteAccount ? 0 : "behind";
  console.log([
    \`Validator: \${v.nodePubkey}\`,
    \`  Vote acct:       \${v.votePubkey}\`,
    \`  Stake:           \${stakeSOL.toFixed(0)} SOL\`,
    \`  Commission:      \${v.commission}%\`,
    \`  Last vote slot:  \${v.lastVote}\`,
    \`  Root slot:       \${v.rootSlot}\`,    // highest confirmed slot for this validator
    \`  Epoch credits:   \${v.epochCredits?.[0]?.[1] ?? "n/a"}\`, // voting participation
  ].join("\\n"));
});

// ── UNDERSTAND CONFIRMATION STAGES ──────────────────────────────
// Check a specific tx through all confirmation stages:

async function trackConfirmationStages(txSig: string) {
  const statuses = ["processed", "confirmed", "finalized"] as const;

  for (const commitment of statuses) {
    const status = await connection.getSignatureStatus(txSig);
    const cs = status.value?.confirmationStatus;
    const confirmations = status.value?.confirmations;

    console.log(\`[\${commitment.toUpperCase()}]\`);
    console.log(\`  Current status: \${cs}\`);
    console.log(\`  Confirmations:  \${confirmations ?? "MAX (finalized)"}\`);
    // confirmations = null when finalized (rooted, max votes)
  }
}

// ── WATCH REAL-TIME VOTING ACTIVITY ─────────────────────────────
// Vote txs dominate Solana's transaction volume (~80-90% of all txs)
// They are visible as regular transactions to the Vote program:

const voteProgram = "Vote111111111111111111111111111111111111111";

// Subscribe to vote program logs (WARNING: very high volume)
const subId = connection.onLogs(
  new PublicKey(voteProgram),
  (logs) => {
    // Each log here is a validator casting their Tower BFT vote
    console.log("Vote cast by:", logs.signature);
  },
  "processed"
);

// ── DELINQUENT VALIDATOR DETECTION ──────────────────────────────
// A validator is delinquent if it hasn't voted in too many slots
const { delinquent } = await connection.getVoteAccounts("finalized");
if (delinquent.length > 5) {
  console.warn(\`⚠️ \${delinquent.length} validators are delinquent!\`);
  console.warn("This could indicate network stress or large-scale outages");
}`,
    links: [
      { label: "Tower BFT Implemented Proposal", url: "https://docs.solana.com/implemented-proposals/tower-bft" },
      { label: "Vote Program Source", url: "https://github.com/solana-labs/solana/tree/master/programs/vote" },
    ],
  },
  {
    icon: "Shield",
    tag: "MEV",
    title: "MEV on Solana",
    desc: "No mempool = no traditional frontrunning. MEV on Solana is leader-centric. The validator who is the current leader can order transactions however they want within their block. Jito Labs built a parallel off-chain block engine where searchers submit 'bundles' (ordered atomic tx sets) and pay tips to validators. ~65%+ of validators run Jito, making it the dominant MEV infrastructure.",
    details: [
      "Jito MEV bundles: 1-5 atomic ordered transactions",
      "Tips paid to validators via 8 known tip accounts",
      "Block engine = off-chain Dutch auction (highest tip wins)",
      "~65-80% of validators run Jito client (2024-2025)",
      "Searchers compete via tip amounts (0 base, pure auction)",
      "Sandwich attacks possible via Jito bundles",
      "Arbitrage between DEXes is primary MEV type",
      "Liquidations on lending protocols = MEV opportunity"
    ],
    whyItMatters: "MEV on Solana hit $500M+ in tips in 2024. If you're building DeFi, you need to understand that bots are watching your protocol's state and will extract value from price dislocations, large swaps, and undercollateralized positions. Setting tight slippage and understanding Jito's architecture is essential for both builders and traders.",
    commonMistakes: [
      "Setting 100% slippage on swaps and getting sandwiched",
      "Not accounting for MEV bots in your liquidation incentive design",
      "Using public RPCs for time-sensitive arb — you'll always lose to colocated searchers"
    ],
    code: `// ── JITO BUNDLE SUBMISSION ───────────────────────────────────────
import {
  searcherClient,
} from "jito-ts/dist/sdk/block-engine/searcher";
import { Bundle } from "jito-ts/dist/sdk/block-engine/types";
import {
  SystemProgram, Transaction, Connection,
  PublicKey, Keypair, LAMPORTS_PER_SOL
} from "@solana/web3.js";

const JITO_BLOCK_ENGINE = "mainnet.block-engine.jito.wtf:443";
const client = searcherClient(JITO_BLOCK_ENGINE);

// Jito tip accounts (use a random one to avoid contention)
const TIP_ACCOUNTS = [
  "96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5",
  "HFqU5x63VTqvB8eLJVmDQ7PH8sWbKEBzFSm6P5Gm5h7",
  "Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY",
  "ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt",
].map(a => new PublicKey(a));

// ── BUILD AN ARBITRAGE BUNDLE ─────────────────────────────────────
// Example: buy token on DEX A, sell on DEX B for profit

async function submitArbBundle(
  arbTx: Transaction,      // your profitable trade
  payer: Keypair,
  tipLamports: number      // your bid for the slot
) {
  const connection = new Connection("https://api.mainnet-beta.solana.com");
  const { blockhash } = await connection.getLatestBlockhash("confirmed");

  // The tip transaction — pays the validator for bundle inclusion
  const tipAccount = TIP_ACCOUNTS[Math.floor(Math.random() * TIP_ACCOUNTS.length)];
  const tipTx = new Transaction({
    recentBlockhash: blockhash,
    feePayer: payer.publicKey
  }).add(
    SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: tipAccount,
      lamports: tipLamports, // Your bid — higher = more likely to be included
    })
  );
  tipTx.sign(payer);
  arbTx.recentBlockhash = blockhash;
  arbTx.sign(payer);

  // Bundle: max 5 transactions, all must succeed or all fail
  const bundle = new Bundle([arbTx, tipTx], 5);

  // Submit to Jito block engine
  try {
    const bundleId = await client.sendBundle(bundle);
    console.log("Bundle submitted:", bundleId);

    // Wait for bundle confirmation
    const result = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Bundle timeout")), 30_000);
      client.onBundleResult(
        (bundleResult) => {
          if (bundleResult.bundleId === bundleId) {
            clearTimeout(timeout);
            resolve(bundleResult);
          }
        },
        (e) => reject(e)
      );
    });
    return result;
  } catch (e) {
    console.error("Bundle rejected:", e);
    throw e;
  }
}

// ── ESTIMATE COMPETITIVE TIP ──────────────────────────────────────
async function getCompetitiveTip(connection: Connection): Promise<number> {
  // Get recent priority fees as a proxy for MEV tip competition
  const fees = await connection.getRecentPrioritizationFees();
  const sorted = fees.map(f => f.prioritizationFee).sort((a,b)=>a-b);
  const p90 = sorted[Math.floor(sorted.length * 0.9)];
  // Tips are in lamports; typically 0.001–0.1 SOL for competitive arb
  const minTip = 1_000;         // 0.000001 SOL minimum
  const suggestedTip = Math.max(minTip, p90 * 200); // scale by CUs
  console.log(\`Suggested tip: \${suggestedTip / LAMPORTS_PER_SOL} SOL\`);
  return suggestedTip;
}`,
    links: [
      { label: "Helius — Solana MEV Guide", url: "https://www.helius.dev/docs/sending-transactions/backrun-rebates#what-is-mev" },
      { label: "Jito-TS SDK", url: "https://github.com/jito-labs/jito-ts" },
      { label: "Jito REV Dashboard", url: "https://jito.wtf" },
    ],
  },
  {
    icon: "Zap",
    tag: "MEV",
    title: "Priority Fees",
    desc: "Priority fees are extra per-compute-unit payments that make the leader prioritize your transaction. They're set via the ComputeBudget program using two instructions: setComputeUnitLimit (caps your CU usage) and setComputeUnitPrice (sets microlamports per CU). ALWAYS set both. Not setting the CU limit wastes fees on unused compute.",
    details: [
      "ComputeBudgetProgram: native on-chain system program",
      "setComputeUnitPrice: microlamports per compute unit",
      "setComputeUnitLimit: max CUs this tx can use",
      "Base fee = 5000 lamports per signature (flat)",
      "Priority fee = microLamports × requested CU limit / 1,000,000",
      "Leader orders txs by fee-per-CU (highest first)",
      "Simulate first to get exact CU usage, add 10% buffer",
      "getRecentPrioritizationFees for market rate data"
    ],
    whyItMatters: "During congestion, txs without priority fees simply don't get included. The leader is incentivized to pack the most value into their block, so they pick highest fee-per-CU txs first. Overpaying burns your SOL. Underpaying = dropped tx. The sweet spot: simulate to get exact CUs, query the fee market for current rates.",
    commonMistakes: [
      "Not setting setComputeUnitLimit — defaults to 200k even if you use 5k, wasting money",
      "Setting a static microlamports value that's too low during congestion",
      "Not simulating before setting CU limit — guessing wastes fees",
      "Forgetting to put ComputeBudget instructions FIRST in the transaction"
    ],
    code: `import {
  Connection, Transaction, ComputeBudgetProgram,
  PublicKey, clusterApiUrl
} from "@solana/web3.js";

const connection = new Connection(
  "https://mainnet.helius-rpc.com/?api-key=YOUR_KEY", "confirmed"
);

// ── STEP 1: SIMULATE TO GET EXACT CU USAGE ───────────────────────
async function getOptimalCULimit(
  tx: Transaction,
  payer: PublicKey
): Promise<number> {
  // Add a dummy CU limit for simulation (use max so sim doesn't fail)
  const simTx = new Transaction().add(
    ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 }),
    ...tx.instructions
  );
  simTx.feePayer = payer;
  simTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const sim = await connection.simulateTransaction(simTx, {
    sigVerify: false,
    replaceRecentBlockhash: true,
  });

  if (sim.value.err) {
    console.error("Simulation failed:", sim.value.err);
    console.error("Logs:", sim.value.logs);
    throw new Error("Transaction will fail");
  }

  const cuUsed = sim.value.unitsConsumed!;
  const cuLimit = Math.ceil(cuUsed * 1.1); // 10% safety buffer
  console.log(\`CUs used in sim: \${cuUsed} → Setting limit: \${cuLimit}\`);
  return cuLimit;
}

// ── STEP 2: GET CURRENT FEE MARKET RATES ─────────────────────────
async function getOptimalPriorityFee(
  accountKeys: PublicKey[],  // accounts your tx touches
  percentile = 75            // p75 = competitive without overpaying
): Promise<number> {
  const fees = await connection.getRecentPrioritizationFees(accountKeys);

  if (fees.length === 0) return 1_000; // fallback minimum

  const sorted = fees
    .map(f => f.prioritizationFee)
    .sort((a, b) => a - b);

  const p50 = sorted[Math.floor(sorted.length * 0.5)];
  const p75 = sorted[Math.floor(sorted.length * 0.75)];
  const p90 = sorted[Math.floor(sorted.length * 0.9)];

  console.log(\`Fee market — P50: \${p50} | P75: \${p75} | P90: \${p90} microlamports/CU\`);

  return sorted[Math.floor(sorted.length * (percentile / 100))] || 1_000;
}

// ── STEP 3: BUILD OPTIMAL TRANSACTION ────────────────────────────
async function buildOptimalTx(
  instructions: TransactionInstruction[],
  payer: PublicKey,
  accountsForFeeEstimate?: PublicKey[]
): Promise<Transaction> {
  // Get CU limit from simulation
  const baseTx = new Transaction().add(...instructions);
  baseTx.feePayer = payer;
  const cuLimit = await getOptimalCULimit(baseTx, payer);

  // Get priority fee from market
  const microLamports = await getOptimalPriorityFee(
    accountsForFeeEstimate ?? [], 75
  );

  // Build final transaction with optimal fees
  // CRITICAL: ComputeBudget instructions MUST come first
  const finalTx = new Transaction().add(
    ComputeBudgetProgram.setComputeUnitLimit({ units: cuLimit }),
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports }),
    ...instructions
  );

  // Calculate total fee for transparency
  const priorityFeeLamports = Math.ceil(microLamports * cuLimit / 1_000_000);
  const baseFee = 5_000; // per signature
  console.log(\`Base fee: \${baseFee} lamports (\${baseFee/1e9} SOL)\`);
  console.log(\`Priority fee: \${priorityFeeLamports} lamports (\${priorityFeeLamports/1e9} SOL)\`);
  console.log(\`Total estimated: \${baseFee + priorityFeeLamports} lamports\`);

  return finalTx;
}`,
    links: [
      { label: "Priority Fees Guide — Helius", url: "https://www.helius.dev/blog/priority-fees-understanding-solanas-transaction-fee-mechanics" },
      { label: "ComputeBudget Program Docs", url: "https://solana.com/docs/core/fees/compute-budget" },
      { label: "getRecentPrioritizationFees RPC", url: "https://solana.com/docs/rpc/http/getrecentprioritizationfees" },
    ],
  },
  {
    icon: "Clock",
    tag: "System Design",
    title: "Epochs & Validators",
    desc: "An epoch is ~432,000 slots (~2.5 days). It's the fundamental unit for staking, validator rewards, and leader schedules. At each epoch boundary: stake activations/deactivations take effect, new leader schedules are computed, inflation rewards are distributed, and vote credits are tallied. Validators must vote on nearly every slot to maximize earnings.",
    details: [
      "~432,000 slots per epoch (~2.5 days on mainnet)",
      "Leader schedule: deterministic, published each epoch",
      "Vote tx cost: ~5,000 lamports each × 432k slots = ~2.16 SOL/epoch",
      "Validators earn: inflation rewards + tx fees + MEV tips",
      "~8% initial inflation, decreasing 15% per year",
      "Inflation rewards are proportional to stake, not flat",
      "~1,700+ active validators; ~500+ delinquent at any time",
      "Stake activation/deactivation is delayed by 1 epoch boundary"
    ],
    whyItMatters: "Epochs matter for protocol design when you need time-based mechanics. Staking programs, governance systems, and vesting contracts all use epochs as their time unit. Validator economics also matter for network health — a validator spending 2.16 SOL/epoch in vote costs needs enough stake to earn that back via inflation.",
    commonMistakes: [
      "Using wall-clock time for on-chain time logic instead of slot/epoch",
      "Not accounting for the 1-epoch delay on stake activation/deactivation in protocol design",
      "Assuming validator APY is fixed — it decreases 15% per year by design"
    ],
    code: `import { Connection, clusterApiUrl, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

// ── GET CURRENT EPOCH INFO ────────────────────────────────────────
const epochInfo = await connection.getEpochInfo("confirmed");
console.log("Current epoch:      ", epochInfo.epoch);
console.log("Slot in epoch:      ", epochInfo.slotIndex);
console.log("Total epoch slots:  ", epochInfo.slotsInEpoch);   // ~432,000
console.log("Absolute slot:      ", epochInfo.absoluteSlot);

const progress = (epochInfo.slotIndex / epochInfo.slotsInEpoch) * 100;
console.log(\`Epoch progress:     \${progress.toFixed(2)}%\`);

const slotsRemaining = epochInfo.slotsInEpoch - epochInfo.slotIndex;
const secsRemaining  = slotsRemaining * 0.4; // ~400ms per slot
const hrsRemaining   = secsRemaining / 3600;
console.log(\`Time until epoch end: \${hrsRemaining.toFixed(1)} hours\`);

// ── EPOCH SCHEDULE ───────────────────────────────────────────────
const epochSchedule = await connection.getEpochSchedule();
console.log("Slots per epoch:      ", epochSchedule.slotsPerEpoch);     // 432,000
console.log("Leader schedule offset:", epochSchedule.leaderScheduleSlotOffset);
// The leader schedule for epoch N is computed epochSchedule.leaderScheduleSlotOffset
// slots before epoch N begins

// Convert between epoch and slot:
const getEpochForSlot = (slot: number) =>
  Math.floor(slot / epochSchedule.slotsPerEpoch);
const getFirstSlotOfEpoch = (epoch: number) =>
  epoch * epochSchedule.slotsPerEpoch;

// ── INFLATION RATES ──────────────────────────────────────────────
const inflation = await connection.getInflationRate();
console.log("Total inflation:   ", (inflation.total * 100).toFixed(2) + "%");
console.log("Validator share:   ", (inflation.validator * 100).toFixed(2) + "%");
console.log("Foundation share:  ", (inflation.foundation * 100).toFixed(2) + "%");

// Estimate validator APY (simplified)
const totalStakeSOL = 400_000_000; // approximate total staked SOL
const yourStakeSOL  = 100_000;     // example
const commission    = 0.07;        // 7% commission
const aprForStakers = inflation.validator * (1 - commission);
console.log(\`Estimated staker APY: \${(aprForStakers * 100).toFixed(2)}%\`);

// ── EPOCH CREDITS — VALIDATOR PARTICIPATION ──────────────────────
// Vote accounts track epoch credits — earned by voting correctly
const { current: validators } = await connection.getVoteAccounts("finalized");

// epochCredits: [[epoch, credits, previousCredits], ...]
// More credits = more epochs participated = better validator
validators.slice(0, 3).forEach(v => {
  const recentCredits = v.epochCredits.slice(-3); // last 3 epochs
  console.log(\`\${v.nodePubkey.slice(0,8)}... recent credits:\`, recentCredits);
});

// ── STAKE ACTIVATION STATUS ──────────────────────────────────────
// Check when your stake becomes active (1-epoch delay)
const stakeAccount = new PublicKey("YOUR_STAKE_ACCOUNT");
const activation   = await connection.getStakeActivation(stakeAccount);
console.log("Stake status:    ", activation.state); // "active"|"inactive"|"activating"|"deactivating"
console.log("Active stake:    ", activation.active   / LAMPORTS_PER_SOL, "SOL");
console.log("Inactive stake:  ", activation.inactive / LAMPORTS_PER_SOL, "SOL");`,
    links: [
      { label: "Epoch Schedule Docs", url: "https://docs.solana.com/terminology#epoch" },
      { label: "Validator Economics Deep Dive", url: "https://docs.solanalabs.com/implemented-proposals/ed_overview/ed_validation_client_economics/ed_vce_state_validation_protocol_based_rewards" },
      { label: "Staking Guide", url: "https://solana.com/staking" },
    ],
  },
  {
    icon: "Database",
    tag: "System Design",
    title: "Accounts Model",
    desc: "On Solana, EVERYTHING is an account. There are no 'smart contracts' in the Ethereum sense — there are programs (executable accounts) and data accounts (owned by programs). Your wallet is an account. A token balance is an account. A program is an account. State lives in data accounts separate from program logic. Programs are stateless — all state is in accounts they own.",
    details: [
      "Owner field: program that controls write access",
      "Lamport balance: SOL stored in the account",
      "Data: arbitrary byte array (serialized state)",
      "Executable: true = program account",
      "Rent exempt: pay ~0.00204 SOL per 128 bytes upfront",
      "System program owns all uninitialized wallets",
      "Programs can only write to accounts they own",
      "Account size is fixed at creation (can resize with realloc)"
    ],
    whyItMatters: "The accounts model is fundamentally different from Ethereum's storage model. In Ethereum, a contract stores its own state. In Solana, the program is separate from the data. This enables parallel execution (different users = different accounts = no conflicts). But it means more accounts = more transactions when composing complex operations.",
    commonMistakes: [
      "Forgetting to create a rent-exempt balance when initializing accounts",
      "Trying to write to an account your program doesn't own",
      "Not closing accounts and recovering rent when they're no longer needed",
      "Making accounts too small at creation (resizing is possible but adds complexity)"
    ],
    code: `import {
  Connection, PublicKey, LAMPORTS_PER_SOL, SystemProgram,
  Transaction, clusterApiUrl, Keypair
} from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// ── READ RAW ACCOUNT DATA ─────────────────────────────────────────
const pubkey = new PublicKey("So11111111111111111111111111111111111111112"); // Wrapped SOL

const accountInfo = await connection.getAccountInfo(pubkey);
if (accountInfo) {
  console.log("Owner:",      accountInfo.owner.toBase58());  // which program owns it
  console.log("Lamports:",   accountInfo.lamports);          // SOL balance × 1e9
  console.log("Data bytes:", accountInfo.data.length);       // serialized state
  console.log("Executable:", accountInfo.executable);        // is it a program?
  console.log("Rent epoch:", accountInfo.rentEpoch);         // deprecated in newer versions
  console.log("SOL balance:", accountInfo.lamports / LAMPORTS_PER_SOL, "SOL");
}

// ── RENT-EXEMPT MINIMUM ───────────────────────────────────────────
// You MUST deposit enough SOL to make an account rent-exempt
// Otherwise it gets garbage-collected eventually

async function getRentExemptBalance(dataSizeBytes: number): Promise<number> {
  const minBalance = await connection.getMinimumBalanceForRentExemption(dataSizeBytes);
  console.log(\`\${dataSizeBytes} bytes → \${minBalance} lamports (\${minBalance / LAMPORTS_PER_SOL} SOL) required\`);
  return minBalance;
}

// Common data sizes and their costs:
await getRentExemptBalance(0);     // wallet account: ~890,880 lamports
await getRentExemptBalance(165);   // token account: ~2,039,280 lamports
await getRentExemptBalance(1_000); // ~8,049,280 lamports
await getRentExemptBalance(10_000);// ~71,760,000 lamports

// ── CREATE A NEW DATA ACCOUNT ─────────────────────────────────────
const payer      = Keypair.generate();
const newAccount = Keypair.generate();
const dataSize   = 256; // bytes for your program's state

const lamports = await connection.getMinimumBalanceForRentExemption(dataSize);

const createAccountTx = new Transaction().add(
  SystemProgram.createAccount({
    fromPubkey:  payer.publicKey,
    newAccountPubkey: newAccount.publicKey,
    lamports,          // rent-exempt balance
    space: dataSize,   // how many bytes to allocate
    programId: YOUR_PROGRAM_ID, // which program will own this account
  })
);

// ── QUERY MULTIPLE ACCOUNTS EFFICIENTLY ──────────────────────────
// getMultipleAccountsInfo is much faster than individual getAccountInfo calls
const pubkeys = [
  new PublicKey("wallet1..."),
  new PublicKey("wallet2..."),
  new PublicKey("tokenAccount..."),
];
const accounts = await connection.getMultipleAccountsInfo(pubkeys);
accounts.forEach((acc, i) => {
  if (acc) console.log(\`Account \${i}: \${acc.lamports / LAMPORTS_PER_SOL} SOL\`);
  else console.log(\`Account \${i}: does not exist (uninitialized)\`);
});

// ── FILTER ACCOUNTS BY PROGRAM & DATA ─────────────────────────────
// Get all token accounts owned by a wallet:
const SPL_TOKEN_PROGRAM = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
  wallet.publicKey,
  { programId: SPL_TOKEN_PROGRAM }
);

tokenAccounts.value.forEach(({ account, pubkey }) => {
  const parsed = account.data.parsed.info;
  console.log(\`Token: \${parsed.mint}\`);
  console.log(\`Amount: \${parsed.tokenAmount.uiAmount}\`);
  console.log(\`Account: \${pubkey.toBase58()}\`);
});`,
    links: [
      { label: "Solana Accounts Model", url: "https://docs.solana.com/developing/programming-model/accounts" },
      { label: "Rent & Storage Fees", url: "https://docs.solana.com/developing/intro/rent" },
      { label: "Account Compression (cNFTs)", url: "https://docs.solana.com/developing/guides/compressed-nfts" },
    ],
  },
  {
    icon: "Code2",
    tag: "Programs",
    title: "Instructions & CPIs",
    desc: "Instructions are the atomic units of work on Solana. Each instruction specifies: the program to call, the accounts it needs (with read/write permissions), and a data payload. Cross-Program Invocations (CPIs) let programs call other programs — this is how composability works. PDAs let programs create accounts and sign for them without a private key.",
    details: [
      "Max CPI depth = 4 levels (program A calls B calls C calls D)",
      "CPI inherits caller's account privileges",
      "invoke() for calling with existing signer authority",
      "invoke_signed() for calling with PDA authority",
      "Account ordering in instruction is critical",
      "Sysvar accounts: Clock, Rent, StakeHistory, etc.",
      "Program-to-program calls are synchronous (no async)",
      "Reentrancy protection: a program can't call itself via CPI"
    ],
    whyItMatters: "CPIs are the backbone of DeFi composability. When you call Jupiter to swap, Jupiter does CPIs to Raydium, Orca, and other DEXes. Your token vault program does CPIs to the SPL Token program. Understanding CPI depth limits (4 levels) is critical — if your composable protocol needs A→B→C→D→E, the E call will fail.",
    commonMistakes: [
      "Exceeding CPI depth of 4 — will cause a runtime error",
      "Not passing the correct sysvar accounts in CPIs",
      "Forgetting that accounts must be writable if the callee modifies them",
      "Not understanding that CPI failures propagate up and revert the entire tx"
    ],
    code: `// Anchor-based examples (industry standard for Solana programs)

use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("YourProgramId11111111111111111111111111111111");

#[program]
pub mod my_defi_program {
    use super::*;

    // ── BASIC CPI: Transfer SPL Tokens ────────────────────────────
    pub fn transfer_tokens(ctx: Context<TransferTokens>, amount: u64) -> Result<()> {
        // Build the CPI context
        let cpi_accounts = Transfer {
            from:      ctx.accounts.from_token_account.to_account_info(),
            to:        ctx.accounts.to_token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(), // user must sign
        };
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts
        );

        // Execute the CPI — this calls the SPL Token program
        token::transfer(cpi_ctx, amount)?;
        msg!("Transferred {} tokens", amount);
        Ok(())
    }

    // ── PDA-SIGNED CPI: Vault releases tokens ────────────────────
    // PDAs have no private key — programs sign for them via invoke_signed
    pub fn vault_withdraw(ctx: Context<VaultWithdraw>, amount: u64) -> Result<()> {
        let vault_bump = ctx.bumps.vault_authority;

        // Seeds that derive the PDA — must match exactly
        let seeds = &[
            b"vault-authority",
            ctx.accounts.user.key.as_ref(),
            &[vault_bump],
        ];
        let signer_seeds = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from:      ctx.accounts.vault_token_account.to_account_info(),
            to:        ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.vault_authority.to_account_info(), // PDA signs!
        };

        // CpiContext::new_with_signer tells the runtime this PDA is signing
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            signer_seeds // PDA signs with these seeds
        );

        token::transfer(cpi_ctx, amount)?;
        Ok(())
    }

    // ── READING SYSVARS IN INSTRUCTIONS ──────────────────────────
    pub fn time_locked_action(ctx: Context<TimeLocked>) -> Result<()> {
        let clock = Clock::get()?;

        require!(
            clock.unix_timestamp >= ctx.accounts.config.unlock_time,
            MyError::NotYetUnlocked
        );
        require!(
            clock.slot >= ctx.accounts.config.min_slot,
            MyError::TooEarlyBySlot
        );

        msg!("Action executed at slot {} ({})", clock.slot, clock.unix_timestamp);
        Ok(())
    }
}

// ── ACCOUNT STRUCT DEFINITIONS ────────────────────────────────────
#[derive(Accounts)]
pub struct TransferTokens<'info> {
    #[account(mut)]
    pub user: Signer<'info>,                        // must sign tx

    #[account(mut, constraint = from_token_account.owner == user.key())]
    pub from_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub to_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,       // SPL Token program
}

#[derive(Accounts)]
pub struct VaultWithdraw<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    /// CHECK: PDA derived from ["vault-authority", user.key]
    #[account(
        seeds = [b"vault-authority", user.key.as_ref()],
        bump,
    )]
    pub vault_authority: UncheckedAccount<'info>,

    #[account(mut, token::authority = vault_authority)]
    pub vault_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}`,
    links: [
      { label: "CPI Documentation", url: "https://docs.solana.com/developing/programming-model/calling-between-programs" },
      { label: "Anchor CPI Guide", url: "https://www.anchor-lang.com/docs/cross-program-invocations" },
      { label: "PDA Guide — Solana Cookbook", url: "https://solanacookbook.com/core-concepts/pdas.html" },
      { label: "Sysvar Reference", url: "https://docs.solana.com/developing/runtime-facilities/sysvars" },
    ],
  },
  {
    icon: "Cpu",
    tag: "Programs",
    title: "Sealevel Runtime",
    desc: "Sealevel is Solana's parallel smart contract execution runtime. Unlike Ethereum's EVM which runs one transaction at a time, Sealevel identifies transactions that don't share accounts and executes them simultaneously across multiple CPU threads. The key insight: every instruction declares which accounts it needs upfront, enabling static analysis before execution.",
    details: [
      "Parallel execution of non-overlapping account sets",
      "SVM is the execution environment; Sealevel is the parallel scheduling model around it",
      "Read-only accounts: multiple txs can share access",
      "Writable accounts: exclusive lock per tx",
      "Every instruction's declared read/write set is the scheduler's source of truth",
      "Default compute limit: 200,000 CUs per instruction",
      "Max per tx: 1,400,000 CUs (with setComputeUnitLimit)",
      "SBF (Solana BPF) bytecode — compiled from Rust, C, C++",
      "Hot writable accounts erase parallelism even when the validator has spare cores"
    ],
    whyItMatters: "Sealevel is why Solana can do 50,000+ TPS theoretically. If Alice is swapping tokens and Bob is minting an NFT, they use completely different accounts — Sealevel runs both simultaneously. But if Alice and Bob both trade the same SOL/USDC pool, those txs serialize. This is why popular pools have bottlenecks during high volume.",
    commonMistakes: [
      "Declaring accounts as writable when they're only read (wastes parallelism opportunity)",
      "Not understanding that hot accounts (like popular AMM pools) create bottlenecks",
      "Exceeding compute limits — tx fails with 'exceeded CU limit' error"
    ],
    code: `// ── ANCHOR ACCOUNT CONSTRAINTS & PARALLELISM ────────────────────
// Declaring accounts correctly enables maximum parallelism

use anchor_lang::prelude::*;

// ❌ BAD: Everything marked mutable (prevents parallelism)
#[derive(Accounts)]
pub struct BadExample<'info> {
    #[account(mut)] pub config: Account<'info, Config>,  // read-only but marked mutable!
    #[account(mut)] pub price_oracle: Account<'info, Oracle>, // same
    #[account(mut)] pub user: Account<'info, UserState>,
}

// ✅ GOOD: Only mark accounts mutable if you write to them
#[derive(Accounts)]
pub struct GoodExample<'info> {
    // Read-only: multiple txs can share this simultaneously
    pub config: Account<'info, Config>,
    pub price_oracle: Account<'info, Oracle>,

    // Writable: only this tx has exclusive access
    #[account(mut)]
    pub user: Account<'info, UserState>,

    pub signer: Signer<'info>,
}

// ── COMPUTE UNIT BUDGET MANAGEMENT ──────────────────────────────
// Programs can log CU consumption to help you optimize:
#[program]
pub mod compute_aware {
    pub fn expensive_operation(ctx: Context<...>) -> Result<()> {
        let cu_before = solana_program::log::sol_log_compute_units();
        // ... your logic ...
        msg!("CUs used so far: (see logs)");
        Ok(())
    }
}

// ── CLIENT: SIMULATE AND CHECK CU USAGE ──────────────────────────
import { Connection, Transaction, ComputeBudgetProgram } from "@solana/web3.js";

async function analyzeComputeUsage(
  tx: Transaction,
  connection: Connection
): Promise<{ cuUsed: number; logs: string[]; failed: boolean }> {
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;

  const sim = await connection.simulateTransaction(tx, {
    sigVerify: false,
    replaceRecentBlockhash: true,
  });

  if (sim.value.err) {
    console.error("Simulation FAILED:", sim.value.err);
    sim.value.logs?.forEach(log => {
      if (log.includes("exceeded") || log.includes("error")) {
        console.error("  ►", log);
      }
    });
    return { cuUsed: 0, logs: sim.value.logs ?? [], failed: true };
  }

  const cuUsed = sim.value.unitsConsumed ?? 0;
  console.log(\`CUs consumed: \${cuUsed.toLocaleString()} / 1,400,000\`);
  console.log(\`CU budget remaining: \${(1_400_000 - cuUsed).toLocaleString()}\`);
  console.log(\`Efficiency: \${((cuUsed / 1_400_000) * 100).toFixed(1)}%\`);

  return { cuUsed, logs: sim.value.logs ?? [], failed: false };
}

// ── COMPUTE-HEAVY OPERATIONS TO AVOID ───────────────────────────
// Operations with high CU costs (approximate):
// - Secp256k1 verify: ~15,000 CU
// - Ed25519 verify: ~3,000 CU
// - SHA256 (per byte): ~1 CU
// - keccak256 (per byte): ~1 CU
// - Secp256r1 verify: ~3,000 CU
// - Logging (per character): ~1 CU
// - BPF instruction: ~0.5 CU
// - Account deserialization: ~200 CU per account`,
    links: [
      { label: "Sealevel Parallel Processing Blog", url: "https://medium.com/solana-labs/sealevel-parallel-processing-thousands-of-smart-contracts-d814b378192" },
      { label: "Runtime Compute Budget Docs", url: "https://docs.solana.com/developing/programming-model/runtime" },
      { label: "Program Optimization Tips", url: "https://docs.solanalabs.com/validator/runtime" },
    ],
  },
  {
    icon: "GitBranch",
    tag: "System Design",
    title: "RPC & Node Infra",
    desc: "RPC nodes are your window into Solana. They index chain state, serve queries, and forward your transactions. Every Solana API call you make goes through an RPC node. The difference between a free public RPC and a dedicated high-performance RPC is the difference between dropped transactions and reliable confirmations — especially under load.",
    details: [
      "Public RPCs: highly rate-limited, shared bandwidth",
      "Dedicated RPCs: dedicated resources, better reliability",
      "WebSocket subscriptions: real-time account/log changes",
      "Commitment levels apply to all RPC queries",
      "Archive nodes: full transaction history (expensive)",
      "Regular nodes: recent history only (~2-3 days)",
      "gRPC / Yellowstone: high-throughput streaming API",
      "TPU direct: bypass RPC, send txs directly to leaders"
    ],
    whyItMatters: "Using a free public RPC for a production app is like using a shared dial-up connection for a streaming service. You'll hit rate limits, get stale data, and lose transactions. For any serious project: use a dedicated RPC (Helius, QuickNode, Triton), WebSocket for real-time data, and consider gRPC/Yellowstone for high-frequency monitoring.",
    commonMistakes: [
      "Using api.mainnet-beta.solana.com in production — it's rate-limited and will fail under load",
      "Creating a new Connection object on every request (expensive — reuse a singleton)",
      "Not handling WebSocket disconnections with automatic reconnect logic",
      "Polling with getAccountInfo in a loop instead of using onAccountChange WebSocket"
    ],
    code: `import {
  Connection, PublicKey, clusterApiUrl,
  LAMPORTS_PER_SOL
} from "@solana/web3.js";

// ── CONNECTION BEST PRACTICES ─────────────────────────────────────
// ❌ DON'T: Public RPC in production
const badConnection = new Connection("https://api.mainnet-beta.solana.com");

// ✅ DO: Dedicated RPC with proper config
const connection = new Connection(
  "https://mainnet.helius-rpc.com/?api-key=YOUR_KEY",
  {
    commitment: "confirmed",        // default for all queries
    wsEndpoint: "wss://mainnet.helius-rpc.com/?api-key=YOUR_KEY",
    confirmTransactionInitialTimeout: 60_000, // 60s timeout
    disableRetryOnRateLimit: false, // auto-retry on 429
    httpHeaders: { "x-custom-header": "my-app" }, // for tracking
  }
);

// ❌ DON'T: New connection per request
app.get("/balance", async (req, res) => {
  const conn = new Connection(rpcUrl); // creates new HTTP client every time!
  const balance = await conn.getBalance(pubkey);
  res.json({ balance });
});

// ✅ DO: Singleton connection (create once, reuse)
// connection.ts
export const solanaConnection = new Connection(
  process.env.RPC_URL!,
  { commitment: "confirmed" }
);
// Use solanaConnection everywhere

// ── WEBSOCKET SUBSCRIPTIONS ───────────────────────────────────────
// Real-time account monitoring — much better than polling

const wallet = new PublicKey("YourWalletAddress...");

// Monitor SOL balance changes
const balanceSubId = connection.onAccountChange(
  wallet,
  (accountInfo, context) => {
    console.log("Balance changed at slot:", context.slot);
    console.log("New balance:", accountInfo.lamports / LAMPORTS_PER_SOL, "SOL");
  },
  "confirmed"
);

// Monitor program logs in real-time
const logsSubId = connection.onLogs(
  new PublicKey("YourProgramId..."),
  (logs, context) => {
    if (logs.err) {
      console.error("Program error at slot", context.slot, ":", logs.err);
    } else {
      console.log("Program logs:", logs.logs);
    }
  },
  "confirmed"
);

// Subscribe to slot changes for heartbeat monitoring
const slotSubId = connection.onSlotChange((slotInfo) => {
  // Called ~2.5x per second when healthy
  if (Date.now() - lastHeartbeat > 5000) {
    console.warn("⚠️ Possible RPC issue — no slot updates for 5s");
  }
  lastHeartbeat = Date.now();
});

// Always clean up subscriptions to prevent memory leaks
process.on("SIGINT", async () => {
  await connection.removeAccountChangeListener(balanceSubId);
  await connection.removeOnLogsListener(logsSubId);
  await connection.removeSlotChangeListener(slotSubId);
  process.exit(0);
});

// ── YELLOWSTONE gRPC (HIGH PERFORMANCE STREAMING) ────────────────
// For bots and high-frequency apps, gRPC is 10x faster than WebSocket
// Install: npm install @triton-one/yellowstone-grpc

import Client, { CommitmentLevel } from "@triton-one/yellowstone-grpc";

const grpcClient = new Client(
  "https://grpc.helius-rpc.com",
  "YOUR_API_KEY",
  { "grpc.max_receive_message_length": 64 * 1024 * 1024 }
);

// Stream all transactions for a specific program
const stream = await grpcClient.subscribe();
stream.write({
  transactions: {
    myFilter: {
      accountInclude: ["YourProgramId..."],
      vote: false,
      failed: false,
    }
  },
  commitment: CommitmentLevel.CONFIRMED,
});

stream.on("data", (data) => {
  if (data.transaction) {
    const sig = data.transaction.signature;
    console.log("New tx:", Buffer.from(sig).toString("base64"));
  }
});`,
    links: [
      { label: "Helius RPC Docs", url: "https://docs.helius.dev" },
      { label: "QuickNode Solana Guides", url: "https://www.quicknode.com/guides/solana-development" },
      { label: "Yellowstone gRPC Docs", url: "https://docs.helius.dev/data-streaming/yellowstone-grpc" },
      { label: "JSON RPC API Reference", url: "https://docs.solana.com/api/http" },
    ],
  },
  {
    icon: "Lock",
    tag: "Programs",
    title: "Program Derived Addresses",
    desc: "PDAs are deterministic accounts derived from seeds + a program ID, with no private key. Because they're off the Ed25519 elliptic curve, no one can have a private key for them. Only the program that 'owns' them can sign for them via invoke_signed. This makes PDAs the foundation for vaults, escrows, program-controlled mints, and any use case where code (not humans) controls assets.",
    details: [
      "Derived via: SHA256(seeds + program_id + 'ProgramDerivedAddress')",
      "Must be off the ed25519 curve (that's what findProgramAddressSync checks)",
      "Bump: 0-255 offset to find an off-curve point",
      "Seeds can be: strings, pubkeys, numbers, any bytes",
      "Max 16 seeds, each max 32 bytes",
      "Same seeds + same program = same PDA forever",
      "Programs sign for PDAs in CPIs via invoke_signed",
      "PDAs can hold SOL, own token accounts, store data"
    ],
    whyItMatters: "PDAs are what makes Solana programs actually trustless. Instead of 'trust the admin wallet', you have 'trust the math'. A DEX's liquidity vault is a PDA — the program can only release funds according to its code. A staking program's reward pool is a PDA. Understanding PDAs means understanding why Solana DeFi can be non-custodial.",
    commonMistakes: [
      "Using createProgramAddress instead of findProgramAddressSync — the former can fail if the point is on the curve",
      "Not storing the bump seed in your account data — you need it for CPIs",
      "Using non-deterministic seeds (like timestamps) — PDAs should be reproducible",
      "Confusing the derivation program ID — PDAs are unique per program"
    ],
    code: `import { PublicKey, Connection, clusterApiUrl } from "@solana/web3.js";

// ── DERIVE A PDA (CLIENT SIDE) ────────────────────────────────────
const PROGRAM_ID = new PublicKey("YourProgramId11111111111111111111111111111111");

// Simple PDA: program-global config account
const [configPDA, configBump] = PublicKey.findProgramAddressSync(
  [Buffer.from("config")], // single seed
  PROGRAM_ID
);
console.log("Config PDA:", configPDA.toBase58());

// User-specific PDA: unique per user
const userWallet = new PublicKey("UserWalletAddress...");
const [userStatePDA, userBump] = PublicKey.findProgramAddressSync(
  [
    Buffer.from("user-state"),  // string seed
    userWallet.toBuffer(),       // pubkey seed (32 bytes)
  ],
  PROGRAM_ID
);
console.log("User state PDA:", userStatePDA.toBase58());

// Market PDA: unique per token pair
const baseToken  = new PublicKey("TokenMintA...");
const quoteToken = new PublicKey("TokenMintB...");
const [marketPDA, marketBump] = PublicKey.findProgramAddressSync(
  [
    Buffer.from("market"),
    baseToken.toBuffer(),
    quoteToken.toBuffer(),
  ],
  PROGRAM_ID
);

// ── VERIFY A PDA ──────────────────────────────────────────────────
// Check that an address is a valid PDA for given seeds
function isPDA(address: PublicKey, seeds: Buffer[], programId: PublicKey): boolean {
  try {
    const [derived] = PublicKey.findProgramAddressSync(seeds, programId);
    return derived.equals(address);
  } catch {
    return false;
  }
}

// ── ANCHOR: INITIALIZING A PDA ACCOUNT ───────────────────────────
/*
use anchor_lang::prelude::*;

#[program]
pub mod pda_examples {
    // Create a user's vault PDA and store metadata
    pub fn init_user_vault(ctx: Context<InitVault>, bump: u8) -> Result<()> {
        let vault = &mut ctx.accounts.user_vault;
        vault.owner       = ctx.accounts.user.key();
        vault.bump        = ctx.bumps.user_vault; // store bump for later CPIs!
        vault.total_deposited = 0;
        vault.created_at  = Clock::get()?.unix_timestamp;
        Ok(())
    }

    // Withdraw from vault — PDA signs via invoke_signed
    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        let vault = &ctx.accounts.user_vault;

        require!(
            ctx.accounts.user.key() == vault.owner,
            VaultError::Unauthorized
        );
        require!(amount <= vault.total_deposited, VaultError::InsufficientFunds);

        // Transfer SOL out of the PDA vault
        // PDAs can hold and send SOL directly
        let vault_lamports = ctx.accounts.user_vault.to_account_info().lamports();
        **ctx.accounts.user_vault.to_account_info().lamports.borrow_mut() -= amount;
        **ctx.accounts.user.to_account_info().lamports.borrow_mut() += amount;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitVault<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,                              // create account
        payer = user,                      // who pays rent
        space = 8 + UserVault::INIT_SPACE, // discriminator + data
        seeds = [b"user-vault", user.key.as_ref()],
        bump,                              // Anchor finds canonical bump
    )]
    pub user_vault: Account<'info, UserVault>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct UserVault {
    pub owner:            Pubkey,    // 32 bytes
    pub bump:             u8,        // 1 byte — ALWAYS STORE THE BUMP
    pub total_deposited:  u64,       // 8 bytes
    pub created_at:       i64,       // 8 bytes
}
*/`,
    links: [
      { label: "PDAs Deep Dive — Solana Cookbook", url: "https://solanacookbook.com/core-concepts/pdas.html" },
      { label: "Anchor PDA Constraints", url: "https://www.anchor-lang.com/docs/pdas" },
    ],
  },
  {
    icon: "HardDrive",
    tag: "Core Infra",
    title: "Versioned Transactions",
    desc: "Legacy transactions support ~35 accounts max (due to the 1232-byte limit with all signatures, headers, and instruction data). Versioned transactions (v0) introduced Address Lookup Tables (ALTs) — on-chain indices that let you reference accounts by a 1-byte index instead of a 32-byte pubkey. This expands the limit to 256 accounts per transaction.",
    details: [
      "Legacy tx: max ~35 unique accounts (practical limit)",
      "v0 tx + ALT: up to 256 accounts per transaction",
      "ALT stores up to 256 pubkeys on-chain",
      "Account referenced by 1-byte index (vs 32-byte pubkey)",
      "Must extend ALT before using it in transactions",
      "ALT creation requires multiple transactions",
      "Wallet adapters must support v0 for compatibility",
      "Each ALT account costs ~100,000 lamports to create"
    ],
    whyItMatters: "Complex DeFi interactions — routing through 3+ DEXes, multi-hop swaps, complex yield strategies — easily exceed 35 accounts. Jupiter (Solana's leading DEX aggregator) uses ALTs extensively to route through many pools in a single transaction. Without versioned transactions, many complex DeFi operations would require multiple transactions (not atomic).",
    commonMistakes: [
      "Not extending the ALT in a separate tx before using it (new accounts need 1+ slot to activate)",
      "Using wallets that don't support v0 — will fail silently for some users",
      "Creating a new ALT for every user session — create once, reuse"
    ],
    code: `import {
  Connection, PublicKey, Keypair, LAMPORTS_PER_SOL,
  VersionedTransaction, TransactionMessage,
  AddressLookupTableProgram, AddressLookupTableAccount,
  clusterApiUrl, SystemProgram
} from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const payer = Keypair.generate();

// ── STEP 1: CREATE AN ADDRESS LOOKUP TABLE ───────────────────────
// ALTs take 1+ slots to become active after creation
async function createALT(): Promise<PublicKey> {
  const slot = await connection.getSlot("finalized");

  const [createIx, altAddress] =
    AddressLookupTableProgram.createLookupTable({
      authority: payer.publicKey,
      payer: payer.publicKey,
      recentSlot: slot - 1, // slightly behind to ensure finalized
    });

  const { blockhash } = await connection.getLatestBlockhash();
  const createTx = new VersionedTransaction(
    new TransactionMessage({
      payerKey: payer.publicKey,
      recentBlockhash: blockhash,
      instructions: [createIx],
    }).compileToV0Message()
  );
  createTx.sign([payer]);

  const sig = await connection.sendAndConfirmTransaction(createTx);
  console.log("ALT created:", altAddress.toBase58());
  console.log("Wait 1 slot before extending...");
  await new Promise(r => setTimeout(r, 500)); // wait for activation
  return altAddress;
}

// ── STEP 2: EXTEND ALT WITH YOUR ACCOUNTS ───────────────────────
async function extendALT(altAddress: PublicKey, accounts: PublicKey[]) {
  const extendIx = AddressLookupTableProgram.extendLookupTable({
    payer: payer.publicKey,
    authority: payer.publicKey,
    lookupTable: altAddress,
    addresses: accounts, // add up to 20 accounts at a time
  });

  const { blockhash } = await connection.getLatestBlockhash();
  const extendTx = new VersionedTransaction(
    new TransactionMessage({
      payerKey: payer.publicKey,
      recentBlockhash: blockhash,
      instructions: [extendIx],
    }).compileToV0Message()
  );
  extendTx.sign([payer]);
  await connection.sendAndConfirmTransaction(extendTx);
  console.log(\`Added \${accounts.length} accounts to ALT\`);
}

// ── STEP 3: USE ALT IN A v0 TRANSACTION ─────────────────────────
async function sendV0Transaction(
  instructions: TransactionInstruction[],
  altAddress: PublicKey
) {
  // Fetch the ALT account data so the tx can reference it
  const altAccount = await connection
    .getAddressLookupTable(altAddress)
    .then(r => r.value!);

  const { blockhash } = await connection.getLatestBlockhash();

  // Compile to v0 message with the lookup table
  const message = new TransactionMessage({
    payerKey: payer.publicKey,
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message([altAccount]); // <-- this is the v0 magic

  const tx = new VersionedTransaction(message);
  tx.sign([payer]);

  // Check size — v0 should be under 1232 bytes
  console.log(\`v0 tx size: \${tx.serialize().length} bytes\`);

  return await connection.sendAndConfirmTransaction(tx);
}

// ── FULL EXAMPLE: 20 transfers in one tx ─────────────────────────
// This would exceed 35 accounts in legacy tx
const recipients = Array.from({ length: 20 }, () => Keypair.generate().publicKey);

const altAddr = await createALT();
await extendALT(altAddr, recipients); // store all recipients in ALT
await new Promise(r => setTimeout(r, 500)); // wait 1 slot

const transfers = recipients.map(recipient =>
  SystemProgram.transfer({
    fromPubkey: payer.publicKey,
    toPubkey: recipient,
    lamports: 1000,
  })
);

const sig = await sendV0Transaction(transfers, altAddr);
console.log("20 transfers in one tx:", sig);`,
    links: [
      { label: "Versioned Transactions Docs", url: "https://docs.solana.com/developing/versioned-transactions" },
      { label: "Address Lookup Tables Docs", url: "https://docs.solana.com/developing/lookup-tables" },
    ],
  },
  {
    icon: "BarChart3",
    tag: "Economics",
    title: "Fee Economics",
    desc: "Solana fees have two components: (1) a flat base fee of 5,000 lamports per signature (non-negotiable), split 50% burn / 50% validator reward; and (2) an optional priority fee of microlamports × compute units, which goes 100% to the current leader. Average tx cost is ~$0.0001-0.01 depending on priority fees set.",
    details: [
      "Base fee: 5,000 lamports per signature (flat, fixed)",
      "Multi-sig tx with 2 sigs = 10,000 lamports base fee",
      "50% of base fees burned (deflationary pressure)",
      "50% of base fees go to the current leader",
      "Priority fee: 100% to the current leader (no burn)",
      "1 SOL = 1,000,000,000 lamports",
      "Fee estimator: getFeeForMessage() RPC call",
      "Account creation costs: ~0.00204 SOL per 128 bytes"
    ],
    whyItMatters: "Fee design matters for your protocol's UX and economics. If your program requires users to create many accounts (expensive due to rent), that's a UX barrier. On the other hand, low Solana fees mean protocols don't need fee extraction that Ethereum DeFi relies on. The 50% fee burn creates some deflationary pressure, but it's small compared to inflation.",
    commonMistakes: [
      "Not including account creation rent costs in your fee estimates shown to users",
      "Hardcoding microlamports values instead of querying the fee market",
      "Not accounting for the fact that failed transactions still pay fees"
    ],
    code: `import {
  Connection, Transaction, SystemProgram, ComputeBudgetProgram,
  PublicKey, LAMPORTS_PER_SOL, clusterApiUrl
} from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

// ── CALCULATE EXACT TX FEE BEFORE SENDING ────────────────────────
async function estimateTotalFee(
  tx: Transaction,
  computeUnitLimit: number,
  microLamports: number
): Promise<{ baseFee: number; priorityFee: number; total: number }> {
  // Get base fee from RPC (accounts for multi-sig, etc.)
  const feeCalc = await connection.getFeeForMessage(
    tx.compileMessage(),
    "confirmed"
  );
  const baseFee = feeCalc.value ?? 5_000; // fallback to 5000

  // Calculate priority fee
  const priorityFee = Math.ceil(microLamports * computeUnitLimit / 1_000_000);

  const total = baseFee + priorityFee;

  console.log("── Fee Breakdown ──────────────────────────────");
  console.log(\`Base fee:          \${baseFee.toLocaleString()} lamports (\${(baseFee/LAMPORTS_PER_SOL).toFixed(8)} SOL)\`);
  console.log(\`Priority fee:      \${priorityFee.toLocaleString()} lamports (\${(priorityFee/LAMPORTS_PER_SOL).toFixed(8)} SOL)\`);
  console.log(\`Total fee:         \${total.toLocaleString()} lamports (\${(total/LAMPORTS_PER_SOL).toFixed(8)} SOL)\`);

  // Estimate USD cost (assuming $150 SOL price)
  const solPrice = 150;
  const usdCost  = (total / LAMPORTS_PER_SOL) * solPrice;
  console.log(\`~\${usdCost.toFixed(6)} USD at $\${solPrice}/SOL\`);

  return { baseFee, priorityFee, total };
}

// ── FEE MARKET ANALYSIS ───────────────────────────────────────────
async function analyzeCurrentFeeMarket(
  hotAccounts?: PublicKey[]
): Promise<void> {
  // Get priority fees for specific accounts (much more accurate than global)
  const fees = await connection.getRecentPrioritizationFees(hotAccounts);

  if (fees.length === 0) {
    console.log("No recent priority fees — market is calm");
    return;
  }

  const feeValues = fees.map(f => f.prioritizationFee).sort((a, b) => a - b);
  const avg = feeValues.reduce((a, b) => a + b, 0) / feeValues.length;
  const p25 = feeValues[Math.floor(feeValues.length * 0.25)];
  const p50 = feeValues[Math.floor(feeValues.length * 0.50)];
  const p75 = feeValues[Math.floor(feeValues.length * 0.75)];
  const p90 = feeValues[Math.floor(feeValues.length * 0.90)];
  const max = feeValues[feeValues.length - 1];

  console.log("── Priority Fee Market (microlamports/CU) ─────");
  console.log(\`P25 (conservative): \${p25.toLocaleString()}\`);
  console.log(\`P50 (median):       \${p50.toLocaleString()}\`);
  console.log(\`P75 (competitive):  \${p75.toLocaleString()}\`);
  console.log(\`P90 (urgent):       \${p90.toLocaleString()}\`);
  console.log(\`Max (saw):          \${max.toLocaleString()}\`);
  console.log(\`Avg:                \${avg.toFixed(0)}\`);
}

// ── ACCOUNT CREATION COSTS ────────────────────────────────────────
// Often overlooked: creating accounts for users adds to their fee
async function showCommonRentCosts() {
  const costs = [
    { name: "Wallet (0 bytes)",        bytes: 0   },
    { name: "Token Account (165 bytes)", bytes: 165 },
    { name: "Mint (82 bytes)",         bytes: 82  },
    { name: "User profile (1KB)",      bytes: 1024 },
    { name: "Game state (10KB)",       bytes: 10240 },
  ];

  for (const { name, bytes } of costs) {
    const lamports = await connection.getMinimumBalanceForRentExemption(bytes);
    const sol = lamports / LAMPORTS_PER_SOL;
    console.log(\`\${name}: \${lamports.toLocaleString()} lamports (\${sol.toFixed(6)} SOL)\`);
  }
}

// ── FAILED TX FEES ─────────────────────────────────────────────────
// IMPORTANT: Failed transactions still pay base fee!
// This is a common gotcha — if your tx fails 10 times retrying,
// you pay 10 × 5,000 lamports in base fees

// Best practice: simulate before sending
const sim = await connection.simulateTransaction(tx);
if (sim.value.err) {
  console.log("Tx would fail — NOT sending (saves fee)");
  console.log("Error:", sim.value.err);
  sim.value.logs?.filter(l => l.includes("Error")).forEach(l => console.log(l));
}`,
    links: [
      { label: "Transaction Fees Docs", url: "https://docs.solana.com/transaction_fees" },
      { label: "Fee Market Deep Dive — Helius", url: "https://www.helius.dev/blog/solana-local-fee-markets" },
      { label: "getFeeForMessage RPC", url: "https://solana.com/docs/rpc/http/getfeeformessage" },
    ],
  },
  {
    icon: "Globe",
    tag: "System Design",
    title: "Solana Clusters",
    desc: "Solana has three public clusters: Mainnet-Beta (real assets), Devnet (free test SOL via airdrop, reset occasionally), and Testnet (validator stress testing, unstable). For local development, solana-test-validator spins up a local cluster on your machine with instant confirmation. Each cluster has completely separate state.",
    details: [
      "Mainnet-Beta: real money, real users, real consequences",
      "Devnet: free SOL airdrops (2 SOL per request)",
      "Testnet: for validator testing — unstable, avoid for app dev",
      "Localnet: solana-test-validator for instant local testing",
      "Different program IDs across clusters (don't hardcode!)",
      "Devnet resets periodically — don't rely on devnet state",
      "Validator set is different on each cluster",
      "Token faucets exist for devnet SPL tokens"
    ],
    whyItMatters: "The cluster system means you can develop and test without risking real money. But devnet ≠ mainnet in important ways: different validator set (different performance), different congestion, and programs may behave differently if they interact with other on-chain programs that have different addresses. Always test on mainnet with tiny amounts before full launch.",
    commonMistakes: [
      "Hardcoding program IDs that are devnet-only — they don't exist on mainnet",
      "Testing on devnet and being surprised by different behavior on mainnet",
      "Forgetting that devnet airdrops are rate-limited (1-2 SOL per 24h per IP)"
    ],
    code: `import {
  Connection, Keypair, LAMPORTS_PER_SOL,
  clusterApiUrl, PublicKey
} from "@solana/web3.js";

// ── CLUSTER URLS AND CONFIGS ──────────────────────────────────────
const CLUSTERS = {
  mainnet:  "https://api.mainnet-beta.solana.com",
  devnet:   "https://api.devnet.solana.com",
  testnet:  "https://api.testnet.solana.com",
  localnet: "http://127.0.0.1:8899",

  // Production alternatives (use these instead of public endpoints):
  helius_mainnet: "https://mainnet.helius-rpc.com/?api-key=YOUR_KEY",
  quicknode:      "https://YOUR_ENDPOINT.quiknode.pro/YOUR_KEY/",
};

// Programmatic cluster detection from ENV
function getConnection(): Connection {
  const rpcUrl = process.env.SOLANA_RPC_URL;
  const cluster = process.env.SOLANA_CLUSTER ?? "devnet";

  if (rpcUrl) {
    return new Connection(rpcUrl, "confirmed");
  }

  const url = clusterApiUrl(cluster as "mainnet-beta" | "devnet" | "testnet");
  return new Connection(url, "confirmed");
}

// ── AIRDROP ON DEVNET ─────────────────────────────────────────────
// Only works on devnet/testnet/localnet — NOT mainnet
async function airdropDevnet(
  wallet: PublicKey,
  solAmount = 2
): Promise<void> {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const before = await connection.getBalance(wallet);
  console.log(\`Balance before: \${before / LAMPORTS_PER_SOL} SOL\`);

  // Max airdrop per request: 2 SOL on devnet
  const sig = await connection.requestAirdrop(
    wallet,
    solAmount * LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(sig);

  const after = await connection.getBalance(wallet);
  console.log(\`Balance after: \${after / LAMPORTS_PER_SOL} SOL\`);
  console.log(\`Received: \${(after - before) / LAMPORTS_PER_SOL} SOL\`);
}

// ── LOCAL VALIDATOR SETUP ─────────────────────────────────────────
// Run in terminal: solana-test-validator
// Then connect to it:
const localConnection = new Connection("http://127.0.0.1:8899", "confirmed");

// Clone mainnet programs to local validator:
// solana-test-validator \\
//   --clone-upgradeable-program JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4 \\ (Jupiter)
//   --clone-upgradeable-program whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc \\ (Whirlpools)
//   --url mainnet-beta

// ── PROGRAM IDs DIFFER BY CLUSTER ────────────────────────────────
// Always use environment variables for program IDs:
const PROGRAM_IDS = {
  // System programs are the SAME across all clusters:
  systemProgram:    "11111111111111111111111111111111",
  splToken:         "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  associatedToken:  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe1Cg",
  computeBudget:    "ComputeBudget111111111111111111111111111111",

  // Your custom programs — use env vars per cluster:
  yourProgram: process.env.PROGRAM_ID ?? "Devnet11111111111111111111111111111",
};`,
    links: [
      { label: "Solana Clusters Docs", url: "https://docs.solana.com/clusters" },
      { label: "Devnet Faucet", url: "https://faucet.solana.com" },
      { label: "solana-test-validator Docs", url: "https://docs.solana.com/developing/test-validator" },
      { label: "Solana CLI Reference", url: "https://docs.solana.com/cli" },
    ],
  },
  {
    icon: "Flame",
    tag: "MEV",
    title: "Sandwich Attacks & Protection",
    desc: "A sandwich attack: a bot spots your large swap tx, places a buy tx immediately before it (front-run) and a sell tx immediately after (back-run). The bot profits from the price impact your trade creates. On Solana, this requires controlling tx ordering — either by being the leader, or using Jito bundles for atomicity. The fix: tight slippage + private tx submission.",
    details: [
      "Front-run: buy before target tx increases the price",
      "Back-run: sell immediately after for instant profit",
      "Requires atomic ordering — possible via Jito bundles",
      "Your price impact = attacker's profit opportunity",
      "Larger trades = larger price impact = more attractive target",
      "Slippage tolerance is your primary defense",
      "Private RPCs can bypass Jito ordering for protection",
      "DEX aggregators like Jupiter add MEV protection layers"
    ],
    whyItMatters: "If you're building a DEX, DEX aggregator, or any protocol with swaps, MEV protection is a UX feature. Users who get sandwiched blame your protocol. Jupiter's anti-MEV mode (via private Jito bundles submitted as a competing sandwich defense) is a competitive feature. For users: setting 0.5% slippage vs 5% slippage can be the difference between a clean swap and a sandwiched one.",
    commonMistakes: [
      "Defaulting to 5% slippage tolerance in your UI — it's an open invitation",
      "Not informing users about price impact on large swaps",
      "Building a swap UI without MEV protection when competitors have it"
    ],
    code: `// ── UNDERSTANDING THE ATTACK ─────────────────────────────────────
// Attacker's bundle (submitted to Jito block engine):
// [1] Buy 100 SOL worth of TOKEN (pushes price up 2%)
// [2] YOUR swap tx: you buy TOKEN at 2% higher price
// [3] Attacker sells TOKEN at ~2% higher → profit

// ── DEFENSE #1: TIGHT SLIPPAGE ───────────────────────────────────
// Using Jupiter API with strict slippage:
async function swapWithProtection(
  inputMint: string,
  outputMint: string,
  amount: number,
  slippageBps = 50  // 0.5% — tight slippage
) {
  // First, get a quote
  const quoteResponse = await fetch(
    \`https://quote-api.jup.ag/v6/quote?\` +
    \`inputMint=\${inputMint}\` +
    \`&outputMint=\${outputMint}\` +
    \`&amount=\${amount}\` +
    \`&slippageBps=\${slippageBps}\`
  ).then(r => r.json());

  // Price impact warning
  const priceImpact = parseFloat(quoteResponse.priceImpactPct);
  if (priceImpact > 1.0) {
    console.warn(\`⚠️ High price impact: \${priceImpact.toFixed(2)}%\`);
    console.warn("Consider splitting into smaller trades");
  }

  // Get swap transaction WITH MEV protection
  const swapResponse = await fetch("https://quote-api.jup.ag/v6/swap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      quoteResponse,
      userPublicKey: wallet.publicKey.toBase58(),
      slippageBps,
      // Jupiter's built-in MEV protection via Jito:
      prioritizationFeeLamports: {
        jitoTipLamports: 10_000 // tip Jito validators for protection
      },
      dynamicComputeUnitLimit: true,
      dynamicSlippage: {         // auto-adjust slippage based on volatility
        minBps: 50,
        maxBps: 300,
      },
    })
  }).then(r => r.json());

  return swapResponse.swapTransaction;
}

// ── DEFENSE #2: CALCULATE YOUR MAX ACCEPTABLE PRICE ──────────────
function calculateMinAmountOut(
  expectedOut: bigint,
  slippageBps: number
): bigint {
  const bps = BigInt(slippageBps);
  return expectedOut * (10_000n - bps) / 10_000n;
}

// ── DEFENSE #3: CHECK IF YOU WERE SANDWICHED ─────────────────────
// After a swap confirms, compare execution price to expected price:
async function detectSandwich(
  txSig: string,
  expectedPriceRatio: number
): Promise<boolean> {
  const connection = new Connection("https://api.mainnet-beta.solana.com");
  const tx = await connection.getParsedTransaction(txSig, {
    maxSupportedTransactionVersion: 0,
    commitment: "confirmed",
  });

  // Parse token balance changes to calculate actual execution price
  const preBalances  = tx?.meta?.preTokenBalances ?? [];
  const postBalances = tx?.meta?.postTokenBalances ?? [];

  // ... (parse to get actual input/output amounts)
  // Compare actualPriceRatio to expectedPriceRatio
  // If actualPriceRatio > expectedPriceRatio * 1.005, you likely got sandwiched

  return false; // placeholder
}

// ── DEFENSE #4: SPLIT LARGE ORDERS ───────────────────────────────
// Large orders attract sandwichers. Split into smaller chunks:
async function splitAndSwap(
  totalAmount: number,
  chunks = 5,
  delayMs = 2000 // wait 2s between chunks
) {
  const chunkSize = Math.floor(totalAmount / chunks);

  for (let i = 0; i < chunks; i++) {
    console.log(\`Chunk \${i+1}/\${chunks}: swapping \${chunkSize}\`);
    // ... perform swap for chunkSize
    if (i < chunks - 1) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
}`,
    links: [
      { label: "Jupiter Anti-MEV Docs", url: "https://dev.jup.ag/docs/ultra" },
      { label: "Jito MEV Protection", url: "https://jito-labs.gitbook.io/mev/searcher-resources/bundles" },
    ],
  },
  {
    icon: "Server",
    tag: "Economics",
    title: "Validator Economics",
    desc: "Validators earn from three sources: (1) inflation rewards proportional to their stake weight, (2) transaction fees (50% of base + 100% of priority fees), and (3) MEV tips via Jito. Vote costs (~2.16 SOL/epoch) must be covered by earnings. Top validators earn more from MEV tips than from inflation — fundamentally changing the incentive structure.",
    details: [
      "Vote costs: ~5000 lamports × 432k slots = ~2.16 SOL/epoch",
      "Initial inflation: ~8%, decreasing 15% per year",
      "Commission: 0–100% cut of staking rewards (typically 5-10%)",
      "MEV tips: growing — exceeded inflation revenue for top validators in 2024",
      "Minimum hardware: 512GB RAM, 12-core CPU, NVMe SSD, 1Gb/s internet",
      "Full validator node cost: $2,000-10,000+/month in cloud/colocation",
      "~1,700+ active validators on mainnet-beta",
      "Nakamoto coefficient: ~19 (number of validators for 33% of stake)"
    ],
    whyItMatters: "Validator economics drive network security. If running a validator isn't profitable, validators quit, reducing decentralization. The shift to MEV-driven revenues (via Jito) means validators are increasingly motivated to run MEV-extracting software — creating a feedback loop where MEV infrastructure becomes critical to network operation.",
    commonMistakes: [
      "Choosing a validator purely by lowest commission — high commission validators may provide better uptime",
      "Not checking epoch credits — a validator with 0% commission but poor uptime earns you less"
    ],
    code: `import { Connection, clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";
const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

// ── VALIDATOR PROFITABILITY ANALYSIS ─────────────────────────────
async function analyzeValidatorEconomics() {
  const { current: validators } = await connection.getVoteAccounts("finalized");
  const totalStake = validators.reduce((sum, v) => sum + v.activatedStake, 0);

  // Current inflation (fetch live)
  const inflation = await connection.getInflationRate();
  console.log(\`Current validator inflation rate: \${(inflation.validator * 100).toFixed(2)}%\`);

  // Epoch info for timing
  const epochInfo = await connection.getEpochInfo();
  const slotsPerEpoch = epochInfo.slotsInEpoch; // ~432,000

  // Per-validator economics
  validators
    .sort((a, b) => b.activatedStake - a.activatedStake)
    .slice(0, 10)
    .forEach((v, i) => {
      const stakeSOL      = v.activatedStake / LAMPORTS_PER_SOL;
      const stakeShare    = v.activatedStake / totalStake;
      const commission    = v.commission / 100;

      // Inflation earnings per epoch (simplified):
      const totalSOL      = (await connection.getSupply()).value.total / LAMPORTS_PER_SOL;
      const annualRewards = totalSOL * inflation.validator;
      const epochRewards  = annualRewards / (365.25 * 24 * 3600 / (slotsPerEpoch * 0.4));
      const validatorCut  = epochRewards * stakeShare * commission;
      const stakerCut     = epochRewards * stakeShare * (1 - commission);

      // Vote costs per epoch
      const voteCostSOL   = (5_000 * slotsPerEpoch) / LAMPORTS_PER_SOL;

      // Estimate profitability (very simplified — doesn't include MEV)
      const netReward     = validatorCut - voteCostSOL;

      console.log(\`[\${i+1}] \${v.nodePubkey.slice(0,8)}...\`);
      console.log(\`  Stake:      \${stakeSOL.toLocaleString()} SOL (\${(stakeShare*100).toFixed(2)}%)\`);
      console.log(\`  Commission: \${v.commission}%\`);
      console.log(\`  Last vote:  \${v.lastVote} (root: \${v.rootSlot})\`);
      console.log(\`  Vote gap:   \${epochInfo.absoluteSlot - v.lastVote} slots behind\`);
      console.log(\`  Est inflation revenue/epoch: \${validatorCut.toFixed(2)} SOL\`);
      console.log(\`  Vote costs/epoch:            \${voteCostSOL.toFixed(2)} SOL\`);
      console.log(\`  Est net (before MEV):        \${netReward.toFixed(2)} SOL\`);
      console.log(\`  Est staker APY:              \${(inflation.validator * (1-commission) * 100).toFixed(2)}%\`);
    });
}

// ── CHOOSING A GOOD VALIDATOR FOR STAKING ────────────────────────
async function findBestValidators() {
  const { current: validators } = await connection.getVoteAccounts("finalized");
  const currentSlot = await connection.getSlot("finalized");

  // Score validators by: uptime, commission, delinquency risk
  const scored = validators
    .filter(v => v.commission <= 10)      // max 10% commission
    .filter(v => currentSlot - v.lastVote < 100) // voted recently
    .filter(v => v.activatedStake > 0)    // has actual stake
    .map(v => {
      const slotsBehind = currentSlot - v.lastVote;
      const score = (1 - slotsBehind/100) * (1 - v.commission/10);
      return { ...v, slotsBehind, score };
    })
    .sort((a, b) => b.score - a.score);

  console.log("Top validators for staking:");
  scored.slice(0, 5).forEach((v, i) => {
    console.log(\`[\${i+1}] \${v.nodePubkey}\`);
    console.log(\`  Commission: \${v.commission}% | Slots behind: \${v.slotsBehind}\`);
    console.log(\`  Stake: \${(v.activatedStake / LAMPORTS_PER_SOL).toLocaleString()} SOL\`);
  });
}`,
    links: [
      { label: "Validator Economics Docs", url: "https://docs.solanalabs.com/implemented-proposals/ed_overview/ed_validation_client_economics/ed_vce_state_validation_protocol_based_rewards" },
      { label: "Choose a Validator — Stakewiz", url: "https://stakewiz.com" },
      { label: "Top Validators", url: "https://topvalidators.app/" },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  //  FRONTIER — the 2024-2025 breakthroughs reshaping Solana's architecture
  // ─────────────────────────────────────────────────────────────────────────
  {
    icon: "Zap",
    tag: "Frontier",
    title: "Alpenglow Consensus",
    desc: "Alpenglow is Solana's proposed consensus/finality redesign. Its first protocol change is Votor: validators vote off-chain and aggregate BLS signatures into certificates, replacing today's Tower BFT-style on-chain vote transaction path. The broader Alpenglow research also describes Rotor for data dissemination, but the active SIMD scopes Rotor separately from the first Votor rollout.",
    details: [
      "Votor: validators sign votes and aggregate them into off-chain BLS certificates",
      "Vote transactions leave the normal transaction hot path, reducing ledger and bandwidth overhead",
      "One voting round can finalize when enough stake responds quickly",
      "A second round handles lower online participation while preserving safety",
      "Rotor is a separate data-dissemination proposal in the broader Alpenglow design",
      "'20+20' resilience: tolerates 20% Byzantine + 20% offline stake simultaneously",
      "Targets latency and vote overhead first; throughput depends on clients, scheduling, and block limits",
      "Activation details remain protocol-version dependent while the SIMD path evolves",
    ],
    whyItMatters: "The point is not just a faster headline number. Today's finality path is tied to repeated validator votes that are themselves transactions. Moving vote aggregation out of the normal transaction stream can reduce ledger bloat, free blockspace, and make stronger settlement practical for apps that currently rely on optimistic confirmed states. It also forces builders to stop hard-coding today's commitment timing as if it were permanent.",
    commonMistakes: [
      "Treating Rotor as part of the first Votor SIMD rollout — the proposal scopes it separately",
      "Assuming all Alpenglow details are live on mainnet today — follow the active SIMD/feature activation state",
      "Confusing finality latency with block time and execution throughput",
      "Believing faster finality means higher TPS — Alpenglow targets latency; throughput comes from Firedancer + block-limit raises",
    ],
    code: `// Alpenglow is a validator-level protocol change — there is no app SDK call.
// But your client-side commitment logic is what benefits. Today:
import { Connection } from "@solana/web3.js";
const conn = new Connection("https://api.mainnet-beta.solana.com");

// Pre-Alpenglow you trade safety for latency by choosing a commitment:
//   processed  ~0.4s   (can be dropped)
//   confirmed  ~1-2s   (2/3 stake voted)
//   finalized  ~13s    (32-deep rooted, irreversible)
const sig = "...";
await conn.confirmTransaction(sig, "finalized"); // slow today

// Post-Alpenglow, finalized commitment is expected to be much faster because
// Votor finalizes with aggregated vote certificates instead of on-chain vote
// transactions accumulating through many slots.
// Forward-looking apps should already prefer "confirmed" for UX and
// reserve "finalized" for settlement. Keep the code paths separate so
// protocol upgrades can improve safety latency without a client rewrite.

// What changes: vote aggregation moves out of normal transaction execution,
// reducing vote transaction overhead and ledger growth pressure.`,
    links: [
      { label: "SIMD-0326 — Alpenglow consensus", url: "https://github.com/solana-foundation/solana-improvement-documents/blob/main/proposals/0326-alpenglow.md" },
      { label: "Anza — Alpenglow overview", url: "https://www.anza.xyz/blog/alpenglow-a-new-consensus-for-solana" },
    ],
  },
  {
    icon: "Flame",
    tag: "Frontier",
    title: "Firedancer & Validator Clients",
    desc: "Firedancer is Jump Crypto's independent Solana validator client project, written in C. Frankendancer is the production bridge: Firedancer's high-performance networking path paired with the Agave runtime and consensus. Full Firedancer is still being hardened separately, which is exactly why this page treats client diversity, performance, and rollout status as different topics.",
    details: [
      "Agave (Rust): the reference client, formerly 'solana-labs', now maintained by Anza",
      "Frankendancer: Firedancer's networking stack with Agave runtime/consensus integration",
      "Full Firedancer: pure C validator path, still separate from broad production rollout",
      "Client diversity removes a single-point-of-failure: a bug in one client can't stop the network",
      "Kernel-bypass networking (AF_XDP), tile-based architecture, hand-tuned for line-rate",
      "Other clients exist/are emerging (e.g. Sig by Syndica, a Zig read-path client)",
      "Operators should distinguish available Frankendancer releases from full Firedancer readiness",
      "Same protocol, different implementations — they must agree bit-for-bit on state",
    ],
    whyItMatters: "A second independently-engineered client changes Solana's risk profile. If one implementation has a consensus or networking bug, the network has a path away from monoculture. For builders, the performance angle matters too: higher block limits and lower latency are only safe when validators can ingest, replay, and vote without falling behind. Firedancer is part of the headroom needed for the throughput roadmap.",
    commonMistakes: [
      "Thinking Firedancer is a new blockchain or token — it's a validator client for the same Solana network",
      "Equating Frankendancer availability with full Firedancer being broadly production-ready",
      "Confusing Frankendancer (hybrid) with full Firedancer (pure C, all stages rewritten)",
      "Believing more clients fragments the network — they all run identical consensus rules",
    ],
    code: `// You don't call Firedancer from an app — it's the software validators run.
// But you CAN see client diversity on-chain via the cluster's node versions:
import { Connection } from "@solana/web3.js";
const conn = new Connection("https://api.mainnet-beta.solana.com");

const nodes = await conn.getClusterNodes();
console.log("Total gossip nodes:", nodes.length);

// Group by reported version string (Firedancer reports a distinct version)
const byVersion: Record<string, number> = {};
for (const n of nodes) {
  const v = n.version ?? "unknown";
  byVersion[v] = (byVersion[v] ?? 0) + 1;
}
console.table(byVersion);

// Validator operators choose a client in their startup command, e.g.:
//   agave-validator      ...   (Rust / Anza)
//   fdctl  configure / run ...  (Firedancer / Jump)
// The network only stays healthy if no single client holds >33% of stake.`,
    links: [
      { label: "Firedancer (GitHub)", url: "https://github.com/firedancer-io/firedancer" },
      { label: "Frankendancer release notes", url: "https://github.com/firedancer-io/firedancer/releases" },
    ],
  },
  {
    icon: "Globe",
    tag: "Frontier",
    title: "DoubleZero",
    desc: "DoubleZero is a dedicated physical fiber network for blockchain validators — a 'Network Layer 1' (N1) that bypasses the public internet for consensus traffic. Validators connect through contributed dark-fiber links and FPGA filtering hardware, cutting propagation latency by up to ~50% and using multicast so a leader broadcasts a block to all validators at once instead of relaying hop-by-hop.",
    details: [
      "Two concentric rings: an outer public-facing ring filters/dedups, an inner ring carries clean consensus traffic",
      "FPGAs do signature verification + deduplication at line rate (100+ Gbps)",
      "Multicast: one-to-many broadcast replaces sequential per-validator forwarding",
      "150+ high-performance fiber links across dozens of global sites",
      "Validators can opt into dedicated validator-to-validator connectivity",
      "Powered by the 2Z SPL token, which rewards bandwidth/link contributors",
      "Latency cuts directly shrink the time budget for block propagation and voting",
      "Complements faster-finality research by lowering validator-to-validator latency",
    ],
    whyItMatters: "Solana's performance is ultimately bounded by physics: how fast can a block reach 2/3 of stake across the planet. The public internet routes packets through congested, adversarial paths. DoubleZero gives consensus its own road — lower latency, less jitter, and hardware-level filtering of spam before it ever touches a validator's CPU. Alongside faster consensus and stronger clients, dedicated networking makes lower-latency block production more realistic under load.",
    commonMistakes: [
      "Thinking DoubleZero is a Solana-only product — it's a general 'internet layer' for distributed systems",
      "Assuming it replaces the public internet for users — it's for validator-to-validator consensus traffic",
      "Confusing the 2Z token with SOL — 2Z incentivizes physical network contributors",
      "Believing it's mandatory — it's opt-in infra that validators choose to connect through",
    ],
    code: `// DoubleZero is infrastructure validators connect to at the network layer;
// there's no application API. Conceptually it changes the propagation path:
//
//   Public internet (today):
//     leader → ISP → IXP → ISP → validator   (variable latency, jitter, spam)
//
//   DoubleZero inner ring:
//     leader → [FPGA filter] → multicast → ALL validators simultaneously
//
// Operators run a doublezero client/tunnel alongside their validator and
// announce their inner-ring address. Consensus shreds + votes travel the
// private fiber; the public ring still handles untrusted ingress (user txs).
//
// For app builders the takeaway is indirect but real: lower, more predictable
// propagation latency tightens the window between "sent" and "confirmed",
// which is the latency users actually feel.`,
    links: [
      { label: "DoubleZero — Figment first look", url: "https://www.figment.io/insights/doublezero-first-look-the-internet-layer-for-solana-and-beyond/" },
      { label: "Kiln — the internet layer for validators", url: "https://www.kiln.fi/post/doublezero-on-solana-a-dive-into-the-internet-layer-for-validators" },
    ],
  },
  {
    icon: "Activity",
    tag: "Frontier",
    title: "Async Execution & Rising Block Limits",
    desc: "Solana's throughput roadmap is a steady raising of per-block compute limits plus a re-architecture that decouples block production from execution. SIMD-0256 moves the block limit from 50M to 60M compute units; SIMD-0286 proposes 100M. Asynchronous Program Execution (APE) separates 'agreeing on transaction order' from 'computing the resulting state', so leaders can pack blocks faster than nodes execute them.",
    details: [
      "Per-block limit path: 48M → 50M → 60M via SIMD-0256, with 100M proposed in SIMD-0286",
      "Limits gate parallelizable, non-vote work: DeFi swaps, mints, DePIN bursts",
      "Per-account write limit (~12M CU) prevents one hot account from eating the block",
      "Async execution: consensus orders txs first; state computation follows, off the critical path",
      "Decoupling lets block production scale with bandwidth, not single-thread execution speed",
      "Higher limits are only safe once clients (Firedancer/Agave) can replay them in time",
      "Multiple concurrent leaders (MCL) is a related research direction for parallel block production",
      "Raises are governed by SIMDs and activated by validator supermajority",
    ],
    whyItMatters: "Block limits are the real ceiling most builders hit before TPS — during a hot mint or liquidation cascade, blocks fill and your transaction gets dropped or repriced. Every limit raise is more room for parallel app activity. Async execution is the deeper unlock: today a node must execute a block before it can vote, so execution speed bounds the whole pipeline. Separating ordering from execution means the network can ingest and order far more than any single core can compute synchronously — the architectural path to 1M+ TPS.",
    commonMistakes: [
      "Optimizing for raw TPS when your real constraint is the per-account write limit on a hot account",
      "Assuming block-limit raises are free — they raise hardware requirements for every validator",
      "Thinking async execution weakens safety — ordering is still consensus-final; only state computation moves off the hot path",
      "Ignoring compute budgeting because 'blocks are bigger now' — you still pay per CU and compete for space",
    ],
    code: `import { ComputeBudgetProgram, Transaction } from "@solana/web3.js";

// Bigger block limits don't remove YOUR per-tx compute cap — set it explicitly.
const tx = new Transaction().add(
  // Request exactly what you need (default cap is 200k CU/tx, max 1.4M)
  ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }),
  // Bid for inclusion: priority fee = price-per-CU × units (micro-lamports)
  ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 50_000 }),
  // ...your real instructions here
);

// Why it matters even with 60M/100M block limits:
//   - The block is shared; a popular slot still fills up.
//   - Touching a hot account counts against the ~12M per-account write cap.
//   - Right-sizing the CU limit = cheaper fees AND better landing odds,
//     because the scheduler packs tight, well-estimated txs first.`,
    links: [
      { label: "SIMD-0256 — raise block limits to 60M", url: "https://github.com/solana-foundation/solana-improvement-documents/blob/main/proposals/0256-raise-block-limits-to-60M.md" },
      { label: "SIMD-0286 — raise block limits to 100M", url: "https://github.com/solana-foundation/solana-improvement-documents/blob/main/proposals/0286-raise-block-limits-to-100M.md" },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  //  NETWORKING — how packets actually move
  // ─────────────────────────────────────────────────────────────────────────
  {
    icon: "Wifi",
    tag: "Networking",
    title: "QUIC & Stake-Weighted QoS",
    desc: "Solana validators ingest transactions over QUIC (the UDP-based protocol behind HTTP/3), not plain UDP or TCP. QUIC adds connection identity, flow control, and back-pressure so a leader can throttle abusive senders. Stake-Weighted Quality of Service (SWQoS) layers on top: connections from high-stake validators get a guaranteed share of the leader's ingest capacity, so spam from anonymous senders can't crowd out real traffic.",
    details: [
      "QUIC replaced raw UDP ingest in 2022 to stop the 'fire a million packets' spam vector",
      "Fetch Stage reads serialized transaction bytes from QUIC streams into packet batches",
      "Connections are rate-limited per source IP and per identity",
      "SWQoS reserves up to ~80% of leader ingest for stake-weighted peers, ~20% for unstaked",
      "TPU paths separate standard txs, validator votes, and forwarded txs",
      "An RPC with stake (or partnered with a staked validator) lands transactions more reliably",
      "Back-pressure: the leader can signal senders to slow down instead of silently dropping",
      "No global mempool does not mean no queues — TPU stages still buffer batches in memory",
      "Transactions still must also win on priority fee to be included once ingested",
    ],
    whyItMatters: "During congestion, the bottleneck isn't just block space — it's whether your transaction even reaches the leader. With plain UDP, anyone could drown the ingest port. QUIC + SWQoS turns ingest into a metered, identity-aware pipe where stake buys reliability. This is the hidden reason a transaction sent through a high-quality staked sender lands when the same tx via a public RPC silently disappears. If you run a latency-sensitive app, understanding SWQoS explains why you pay for a premium sender.",
    commonMistakes: [
      "Blaming 'low TPS' when your real problem is ingest contention via an unstaked RPC",
      "Assuming a higher priority fee alone guarantees landing — it has to reach the leader first",
      "Thinking QUIC adds meaningful latency — the handshake is amortized over the connection",
      "Ignoring SWQoS when choosing an RPC provider for high-frequency sending",
    ],
    code: `// You don't speak QUIC directly — your RPC's sender does. But the choice of
// sender determines whether you ride a stake-weighted lane. Practical pattern:
import { Connection, VersionedTransaction } from "@solana/web3.js";

// A premium/staked sender endpoint vs a public one changes landing rates,
// especially under load. Same tx, different ingest priority.
const stakedSender = new Connection(process.env.STAKED_RPC_URL!, "confirmed");

async function sendReliably(tx: VersionedTransaction) {
  const raw = tx.serialize();
  // Re-broadcast a few times; senders forward to current + upcoming leaders.
  for (let i = 0; i < 5; i++) {
    await stakedSender.sendRawTransaction(raw, {
      skipPreflight: true,        // already simulated; save round-trips
      maxRetries: 0,              // we control retry cadence ourselves
    });
    await new Promise((r) => setTimeout(r, 400)); // ~1 slot between tries
  }
}
// The staked connection is what gives these packets a reserved ingest lane.`,
    links: [
      { label: "Helius — Stake-Weighted QoS", url: "https://www.helius.dev/blog/stake-weighted-quality-of-service-everything-you-need-to-know" },
      { label: "Anza — QUIC & transaction ingest", url: "https://www.anza.xyz/blog" },
    ],
  },
  {
    icon: "RefreshCw",
    tag: "Networking",
    title: "Gossip & Repair",
    desc: "Gossip is Solana's peer-discovery and metadata protocol — a constantly-churning epidemic broadcast where every validator shares a small Cluster Replicated Data Store (CRDS): contact info, versions, ledger tips, and votes. Repair is the companion recovery protocol: when a validator misses shreds from Turbine, it asks peers for the specific missing pieces so it can reconstruct the block.",
    details: [
      "Gossip uses a push/pull epidemic model — info spreads in O(log n) rounds",
      "CRDS holds: node identities, IP/port tables, shred versions, epoch slots, vote state",
      "Runs on its own port, separate from Turbine (shreds) and TPU (tx ingest)",
      "Repair fills gaps: a node requests missing shred indices from peers that have them",
      "Erasure coding (from Turbine) means a node only needs ENOUGH shreds, not all of them",
      "New/restarting validators bootstrap their view of the cluster via gossip entrypoints",
      "Gossip is metadata-only — actual block data moves via Turbine/Repair, not gossip",
      "Malformed/spoofed gossip is a known attack surface, hence signature checks on CRDS",
    ],
    whyItMatters: "Turbine gets blocks out fast but assumes good network conditions; reality has packet loss, restarts, and laggards. Repair is the safety net that lets a validator that fell behind catch up shred-by-shred instead of re-downloading whole blocks. Gossip is how the cluster even knows who its members are and where to send data. Together they're the connective tissue: without gossip there's no leader schedule awareness or peer table; without repair, a single dropped shred could stall a validator. Understanding them demystifies how a 1,500-node network stays in sync.",
    commonMistakes: [
      "Thinking blocks propagate over gossip — gossip carries metadata, Turbine/Repair carry block data",
      "Assuming a validator must receive 100% of shreds — erasure coding + repair fill the gaps",
      "Confusing the gossip port with the TPU/RPC ports when configuring firewalls",
      "Believing repair is rare — under real network conditions it runs constantly",
    ],
    code: `// Gossip data is observable: getClusterNodes() returns the gossip CRDS view.
import { Connection } from "@solana/web3.js";
const conn = new Connection("https://api.mainnet-beta.solana.com");

const nodes = await conn.getClusterNodes();
// Each entry is a peer's gossiped contact info:
for (const n of nodes.slice(0, 3)) {
  console.log({
    pubkey: n.pubkey,
    gossip: n.gossip,   // gossip ip:port
    tpu:    n.tpu,      // where to send transactions
    rpc:    n.rpc,      // public RPC, if any
    version: n.version, // client version (also gossiped)
  });
}

// You can't query Repair directly from an app — it's validator-internal —
// but its existence is why a node that briefly drops offline rejoins and
// backfills the slots it missed rather than forking off on its own.`,
    links: [
      { label: "Solana Docs — Gossip Service", url: "https://docs.anza.xyz/validator/gossip" },
      { label: "Helius — Turbine, Gossip & Repair", url: "https://www.helius.dev/blog/turbine-block-propagation-on-solana" },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  //  CORE INFRA additions
  // ─────────────────────────────────────────────────────────────────────────
  {
    icon: "Cpu",
    tag: "Core Infra",
    title: "Compute Units & Budget",
    desc: "Every instruction consumes Compute Units (CU) — Solana's gas-equivalent metering of work (hashes, syscalls, account loads, byte copies). A transaction defaults to a 200k CU cap and may request up to 1.4M. The Compute Budget program lets you both set that ceiling and attach a price-per-CU (the priority fee). Exceed your requested limit and the whole transaction fails with an exhaustion error.",
    details: [
      "Default: 200,000 CU per instruction-bearing tx; max 1,400,000 CU per tx",
      "Per-block limit (~60M CU) and per-account write limit (~12M CU) bound the whole block",
      "setComputeUnitLimit(units): your hard ceiling — under-request and you'll abort mid-run",
      "setComputeUnitPrice(microLamports): priority bid = price × units actually used",
      "Common costs: CPI ~1000 CU base, ed25519 verify is cheap, log/serialize can be pricey",
      "Simulate first to measure real CU usage, then set the limit ~10-20% above it",
      "Right-sizing both saves fees AND improves landing — schedulers favor tight, predictable txs",
      "Compute Budget instructions are themselves nearly free and must come before your logic",
    ],
    whyItMatters: "Compute budgeting is the single highest-leverage knob for transaction reliability and cost. Request too little and your tx fails on a hot path; request the 1.4M max blindly and you overpay on priority and crowd the block. The priority-fee market is denominated per-CU, so an over-sized limit inflates your bid for no benefit. Getting this right — measure with simulation, set a snug limit, price competitively — is the difference between transactions that land in one slot and ones that silently drop during congestion.",
    commonMistakes: [
      "Leaving the default 200k limit on a heavy tx → 'exceeded CUs' failure",
      "Setting the limit to 1.4M 'just in case' → overpaying priority fee and worse scheduling",
      "Pricing CU without measuring units, so the effective bid is wrong",
      "Forgetting Compute Budget instructions must precede the instructions they govern",
    ],
    code: `import {
  ComputeBudgetProgram, Connection, Transaction, VersionedTransaction,
} from "@solana/web3.js";

const conn = new Connection("https://api.mainnet-beta.solana.com");

// 1) Simulate to learn the REAL compute cost before committing to a limit.
async function rightSize(buildIxs: () => any[]) {
  const probe = new Transaction().add(...buildIxs());
  const sim = await conn.simulateTransaction(probe as any);
  const used = sim.value.unitsConsumed ?? 200_000;
  const limit = Math.ceil(used * 1.15); // ~15% headroom

  return new Transaction().add(
    ComputeBudgetProgram.setComputeUnitLimit({ units: limit }),
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 25_000 }),
    ...buildIxs(),
  );
}
// Fee paid for priority = microLamports * limit / 1e6  (in lamports).
// Tight 'limit' = lower fee for the same per-CU bid.`,
    links: [
      { label: "Solana Docs — Compute Budget", url: "https://solana.com/docs/core/fees#compute-budget" },
      { label: "Helius — priority fees & compute", url: "https://www.helius.dev/blog/priority-fees-understanding-solanas-transaction-fee-mechanics" },
    ],
  },
  {
    icon: "HardDrive",
    tag: "Core Infra",
    title: "Rent & Rent Exemption",
    desc: "On Solana, storage isn't free — every account must hold a minimum lamport balance proportional to its byte size to stay alive. This deposit is 'rent exemption'. Accounts at or above the threshold live indefinitely; the deposit is fully refundable when you close the account. Accounts below it are garbage-collected. In practice every account you create is made rent-exempt up front.",
    details: [
      "Rent-exempt minimum ≈ size_in_bytes × a fixed lamports-per-byte-year × ~2 years",
      "A bare 0-data account needs ~0.00089 SOL; larger accounts cost proportionally more",
      "The deposit is locked, not spent — closing the account returns every lamport",
      "Periodic rent collection on non-exempt accounts was deprecated; exemption is effectively mandatory",
      "getMinimumBalanceForRentExemption(size) tells you exactly how much to fund",
      "Bigger data = more SOL locked: a 10MB account locks ~70 SOL",
      "Closing an account reclaims rent — always close temporary accounts to recover funds",
      "This is why state compression exists: avoid paying rent for millions of small accounts",
    ],
    whyItMatters: "Rent is the economic backstop that keeps Solana's state from growing unbounded — validators must hold all accounts in fast memory, so storage has a real cost. For builders, it means account creation has a non-trivial SOL cost you must fund, and it's recoverable: closing accounts (token accounts, PDAs, temp state) returns the rent. Forgetting to reclaim rent leaves SOL stranded across thousands of dead accounts. And the rent cost of one-account-per-item is exactly what makes compressed NFTs and state compression economically dramatic.",
    commonMistakes: [
      "Creating accounts without funding the rent-exempt minimum → 'insufficient funds for rent' failures",
      "Hardcoding a rent amount instead of querying getMinimumBalanceForRentExemption for the size",
      "Never closing temporary accounts, stranding recoverable SOL",
      "Assuming rent is an ongoing fee — exempt accounts pay once and the deposit is refundable",
    ],
    code: `import {
  Connection, SystemProgram, Transaction, Keypair,
} from "@solana/web3.js";

const conn = new Connection("https://api.mainnet-beta.solana.com");

// Always compute the exact rent-exempt minimum for the account size you need.
const SPACE = 165; // e.g. an SPL token account is 165 bytes
const lamports = await conn.getMinimumBalanceForRentExemption(SPACE);
console.log("Rent-exempt minimum:", lamports, "lamports");

const payer = Keypair.generate();
const newAccount = Keypair.generate();

const createIx = SystemProgram.createAccount({
  fromPubkey: payer.publicKey,
  newAccountPubkey: newAccount.publicKey,
  lamports,          // fund exactly the rent-exempt minimum (refundable)
  space: SPACE,
  programId: SystemProgram.programId,
});

// Later, closing the account sends those lamports back to the payer:
// closeAccount() / CloseAccount instruction reclaims the full rent deposit.`,
    links: [
      { label: "Solana Docs — Rent", url: "https://solana.com/docs/core/accounts#rent" },
      { label: "Helius — Solana accounts & rent", url: "https://www.helius.dev/blog/solana-account-model" },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  //  PROGRAMS additions
  // ─────────────────────────────────────────────────────────────────────────
  {
    icon: "Code2",
    tag: "Programs",
    title: "SVM Bytecode (rBPF / SBF)",
    desc: "Solana programs don't run native code — they compile to SBF (Solana Bytecode Format), a Solana-flavored variant of eBPF, and execute inside rBPF, a sandboxed register-based virtual machine. The VM meters every operation in compute units, restricts syscalls, and isolates programs from each other and the host. This is the actual execution engine beneath Sealevel's parallelism.",
    details: [
      "SBF = Solana's fork of eBPF; programs in Rust/C compile to SBF ELF binaries",
      "rBPF is the Rust-based interpreter/JIT that runs SBF with strict sandboxing",
      "Register VM (not stack-based): 11 registers, bounded stack, no arbitrary syscalls",
      "Every opcode has a CU cost — the VM halts a program that exceeds its compute budget",
      "Verifier rejects programs with unbounded loops, bad jumps, or illegal memory access",
      "Programs are deployed as immutable-by-default bytecode in executable accounts",
      "A loader (BPF Loader / Loader-v4) validates and runs the bytecode",
      "Runtime v2 and loader-v4 modernize deployment, upgrades, and execution",
    ],
    whyItMatters: "Understanding the VM explains Solana's guarantees and limits: why programs must declare account access (the VM can't discover it at runtime), why deep recursion and huge stacks fail, why compute units exist (they meter VM opcodes), and why a buggy program can't corrupt others (sandbox isolation). When you hit 'access violation', 'computational budget exceeded', or memory errors, you're hitting rBPF's guardrails. It's also why Solana can run the same SVM in rollups and other contexts — the VM is a portable, well-defined execution target.",
    commonMistakes: [
      "Assuming programs run native machine code — they run sandboxed SBF bytecode with metered ops",
      "Writing deeply recursive logic that blows the VM's bounded stack",
      "Forgetting the verifier rejects unbounded loops — compute metering is the only allowed limiter",
      "Confusing the SVM (execution engine) with Sealevel (the parallel scheduler around it)",
    ],
    code: `// You author in Rust; the toolchain emits SBF bytecode the VM executes.
// A minimal native program entrypoint (no Anchor):
use solana_program::{
    account_info::AccountInfo, entrypoint, entrypoint::ProgramResult,
    pubkey::Pubkey, msg,
};

entrypoint!(process_instruction);

pub fn process_instruction(
    _program_id: &Pubkey,
    _accounts: &[AccountInfo],
    _data: &[u8],
) -> ProgramResult {
    // This msg! call is a syscall — it costs compute units in the VM.
    msg!("hello from SBF bytecode");
    Ok(())
}

// cargo build-sbf  →  target/deploy/your_program.so  (the SBF ELF)
// solana program deploy your_program.so  → the rBPF VM runs this bytecode,
// metering every opcode and enforcing the sandbox on each invocation.`,
    links: [
      { label: "Anza — rBPF VM (GitHub)", url: "https://github.com/anza-xyz/sbpf" },
      { label: "Solana Docs — programs & deployment", url: "https://solana.com/docs/core/programs" },
    ],
  },
  {
    icon: "Layers",
    tag: "Programs",
    title: "Token Extensions (Token-2022)",
    desc: "Token-2022 is a second, superset SPL token program that adds native 'extensions' — opt-in features baked into the mint or token account rather than bolted on with custom programs. Transfer fees, confidential (encrypted) balances, transfer hooks, non-transferable 'soulbound' tokens, interest-bearing balances, metadata pointers, and permanent delegates all become first-class without a separate contract.",
    details: [
      "Lives at a different program id than the original SPL Token program — they coexist",
      "Extensions are configured at mint creation and stored in the account's TLV data",
      "Transfer Fee: protocol-level fee withheld on every transfer, claimable by the authority",
      "Confidential Transfer: ElGamal-encrypted balances + ZK proofs hide amounts on-chain",
      "Transfer Hook: invoke a custom program on every transfer (allowlists, royalties, KYC)",
      "Non-Transferable: soulbound tokens for credentials/identity",
      "Interest-Bearing + Metadata Pointer + Permanent Delegate + Default Account State",
      "Wallets/dapps must support the new program id — not every integration does yet",
    ],
    whyItMatters: "Before Token-2022, things like transfer fees, royalties, or compliance gating required wrapping tokens in bespoke programs — fragile, non-composable, and easy to get wrong. Token Extensions make these features native and standardized, so wallets and DEXes can support them uniformly. For stablecoins and RWAs, confidential transfers and transfer hooks are the unlock for on-chain compliance. The catch: extensions live in a separate program, so you must explicitly target Token-2022 and confirm downstream tooling supports the specific extensions you use.",
    commonMistakes: [
      "Sending Token-2022 tokens to integrations that only know the legacy SPL Token program id",
      "Forgetting transfer-hook tokens require extra accounts on every transfer instruction",
      "Assuming all wallets render confidential or fee-bearing tokens correctly today",
      "Mixing up the two program ids — accounts are not interchangeable between them",
    ],
    code: `import {
  createMint, TOKEN_2022_PROGRAM_ID, ExtensionType,
  getMintLen, createInitializeTransferFeeConfigInstruction,
} from "@solana/spl-token";
import { Connection, Keypair, SystemProgram, Transaction } from "@solana/web3.js";

const conn = new Connection("https://api.devnet.solana.com");
const payer = Keypair.generate();
const mint = Keypair.generate();

// A mint with the Transfer Fee extension (1% fee, capped) — Token-2022 only.
const extensions = [ExtensionType.TransferFeeConfig];
const mintLen = getMintLen(extensions);
const lamports = await conn.getMinimumBalanceForRentExemption(mintLen);

const tx = new Transaction().add(
  SystemProgram.createAccount({
    fromPubkey: payer.publicKey, newAccountPubkey: mint.publicKey,
    space: mintLen, lamports, programId: TOKEN_2022_PROGRAM_ID,
  }),
  createInitializeTransferFeeConfigInstruction(
    mint.publicKey, payer.publicKey, payer.publicKey,
    100 /* basis points = 1% */, BigInt(5_000_000) /* max fee */,
    TOKEN_2022_PROGRAM_ID,
  ),
  // ...then InitializeMint2 with TOKEN_2022_PROGRAM_ID
);
// Note: every transfer now withholds the fee automatically, on-chain.`,
    links: [
      { label: "Solana — Token Extensions", url: "https://solana.com/solutions/token-extensions" },
      { label: "SPL Token-2022 docs", url: "https://www.solana-program.com/docs/token-2022" },
    ],
  },
  {
    icon: "Database",
    tag: "Programs",
    title: "State & ZK Compression",
    desc: "Storing one account per item (e.g. an NFT) means paying rent per item — fine for thousands, ruinous for millions. State compression stores data in a concurrent Merkle tree where only the tiny root lives on-chain; the actual leaves live in cheap ledger/off-chain storage, validated by proofs. Compressed NFTs cut minting cost by orders of magnitude. ZK Compression (Light Protocol) extends the idea to general program state.",
    details: [
      "Concurrent Merkle tree: on-chain account holds only the root + a changelog buffer",
      "Leaf data lives off the account model; validity is proven against the on-chain root",
      "cNFTs: mint millions of NFTs for a fraction of the per-account rent cost",
      "Reads/indexing rely on RPC providers that store and serve the leaves + proofs (DAS API)",
      "ZK Compression generalizes this to fungible state with validity proofs (Light Protocol)",
      "Trade-off: cheap writes, but updates need a proof and a supporting indexer",
      "Great for airdrops, tickets, loyalty points, large collections — anything high-cardinality",
      "Not for hot, frequently-mutated state where proof overhead dominates",
    ],
    whyItMatters: "Rent makes 'an account per user/item' economically impossible at internet scale — a 10M-item airdrop as real accounts could cost thousands of SOL just in rent. Compression collapses that to the cost of a single tree plus per-mint fees, making mass distribution viable. It's the reason Solana can do million-item NFT drops and large-scale loyalty programs cheaply. The cost is architectural: you depend on indexers (the DAS API) to reconstruct state and supply Merkle proofs, so reads are no longer a simple getAccountInfo.",
    commonMistakes: [
      "Reaching for compression on hot, frequently-updated state where proof overhead kills you",
      "Forgetting compressed assets need a DAS-API RPC to read — they aren't normal accounts",
      "Under-sizing the Merkle tree's max depth/buffer for the collection size you'll mint",
      "Assuming a wallet shows cNFTs automatically — it must support the DAS read path",
    ],
    code: `// Reading compressed NFTs uses the DAS (Digital Asset Standard) API, not
// getAccountInfo — the asset isn't a normal on-chain account.
const RPC = "https://mainnet.helius-rpc.com/?api-key=YOUR_KEY";

async function getCompressedAsset(assetId: string) {
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0", id: "1", method: "getAsset",
      params: { id: assetId },
    }),
  });
  const { result } = await res.json();
  console.log("compressed:", result.compression?.compressed);
  console.log("tree:", result.compression?.tree);     // the Merkle tree account
  return result;
}

// Transferring a cNFT requires a Merkle proof fetched via getAssetProof,
// passed into the Bubblegum transfer instruction — the program verifies the
// leaf against the on-chain root. One tree root represents millions of leaves.`,
    links: [
      { label: "Solana — State Compression", url: "https://solana.com/developers/guides/javascript/compressed-nfts" },
      { label: "Light Protocol — ZK Compression", url: "https://www.zkcompression.com/" },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  //  DATA FLOW additions
  // ─────────────────────────────────────────────────────────────────────────
  {
    icon: "Hash",
    tag: "Data Flow",
    title: "Address Lookup Tables",
    desc: "A legacy transaction can reference at most ~35 accounts before it busts the 1232-byte size limit — each address is 32 bytes. Address Lookup Tables (ALTs) are on-chain accounts that store lists of addresses; a versioned (v0) transaction then references them by a 1-byte index instead of the full 32-byte key. This lets a single transaction touch up to 256 accounts — essential for complex DeFi routes.",
    details: [
      "Each pubkey costs 32 bytes inline; an ALT reference costs ~1 byte (an index)",
      "Create a table, extend it with addresses, then reference it in a v0 transaction",
      "Raises the practical account ceiling from ~35 to 256 per transaction",
      "Tables must be 'warmed' — addresses are usable ~1 slot after being added",
      "ALTs are reusable across many transactions — create once, reference forever",
      "Critical for aggregators (Jupiter) routing swaps across many pools in one tx",
      "Tables can be frozen (immutable) or kept extendable by an authority",
      "Only works with versioned (v0) transactions, not legacy ones",
    ],
    whyItMatters: "The 1232-byte transaction limit is a hard wall, and accounts are the biggest contributor to size. Without ALTs, a multi-hop swap or a transaction touching many PDAs simply won't fit — you'd have to split it, breaking atomicity. ALTs are what make Solana's most powerful composability possible: a single atomic transaction that routes liquidity across a dozen pools or settles a complex position. If you're building anything that touches more than a handful of accounts, ALTs aren't optional — they're the mechanism that keeps your transaction under the wire.",
    commonMistakes: [
      "Using a freshly-extended ALT in the same slot before its addresses are active",
      "Trying to use ALTs with legacy transactions — they require v0 (versioned) txs",
      "Recreating a new table per transaction instead of reusing a warmed, shared one",
      "Forgetting that the ALT account itself must be loaded, adding to (but net-reducing) size",
    ],
    code: `import {
  Connection, Keypair, PublicKey, TransactionMessage,
  VersionedTransaction, AddressLookupTableProgram,
} from "@solana/web3.js";

const conn = new Connection("https://api.mainnet-beta.solana.com");
const payer = Keypair.generate();

// 1) Create + extend a lookup table with the addresses you reuse often.
const slot = await conn.getSlot();
const [createIx, tableAddress] = AddressLookupTableProgram.createLookupTable({
  authority: payer.publicKey, payer: payer.publicKey, recentSlot: slot,
});
const extendIx = AddressLookupTableProgram.extendLookupTable({
  lookupTable: tableAddress, authority: payer.publicKey, payer: payer.publicKey,
  addresses: [/* many PublicKeys you touch repeatedly */],
});
// ...send createIx + extendIx, then wait a slot for warm-up.

// 2) Build a v0 tx that references the table (accounts become 1-byte indices).
const lut = (await conn.getAddressLookupTable(tableAddress)).value!;
const message = new TransactionMessage({
  payerKey: payer.publicKey,
  recentBlockhash: (await conn.getLatestBlockhash()).blockhash,
  instructions: [/* your many-account instructions */],
}).compileToV0Message([lut]);          // <- the table compresses the addresses
const vtx = new VersionedTransaction(message);`,
    links: [
      { label: "Solana Docs — Address Lookup Tables", url: "https://solana.com/docs/advanced/lookup-tables" },
      { label: "Solana — Versioned Transactions", url: "https://solana.com/docs/advanced/versions" },
    ],
  },
  {
    icon: "Eye",
    tag: "Data Flow",
    title: "Geyser & Data Streaming",
    desc: "Polling RPC (getAccountInfo, getSignaturesForAddress) is fine for small apps but can't keep up with high-throughput indexing. Geyser is a validator plugin interface that streams account writes, transactions, slots, and blocks out of the validator in real time — straight into Kafka, gRPC, Postgres, or a custom sink. It's how indexers, explorers, and trading systems get low-latency, complete data without hammering RPC.",
    details: [
      "Geyser plugins hook directly into the validator's write path (no polling)",
      "Streams: account updates, transactions, slot status, block metadata, entries",
      "Yellowstone gRPC is the popular open-source Geyser plugin for streaming",
      "Sub-second latency vs polling RPC, and you never miss an update between polls",
      "Powers indexers, the DAS API, real-time dashboards, liquidation bots, MEV searchers",
      "Runs on (or beside) a validator — you consume the stream, you don't run the plugin yourself",
      "Filter server-side by account owner, program, or signature to cut bandwidth",
      "Webhooks (Helius) are a managed abstraction over the same firehose for simpler use cases",
    ],
    whyItMatters: "If your app needs to react to on-chain events — a new trade, a liquidation threshold, an account balance change — polling introduces latency and gaps, and at scale it gets rate-limited or expensive. Geyser flips the model: the validator pushes every relevant change to you the instant it happens. Every serious Solana data product (explorers, the DAS read path for compression, trading infra) is built on a Geyser stream, not RPC polling. Knowing this is the difference between an app that feels real-time and one that's always a few seconds behind.",
    commonMistakes: [
      "Polling getProgramAccounts in a tight loop instead of subscribing to a stream",
      "Assuming WebSocket logsSubscribe is as complete/reliable as Geyser for indexing",
      "Not filtering the stream server-side, then drowning in irrelevant updates",
      "Treating webhooks/Geyser as exactly-once — design consumers to be idempotent",
    ],
    code: `// Consuming a Yellowstone gRPC (Geyser) stream — subscribe to account writes
// for a specific program and react in real time, no polling.
import Client from "@triton-one/yellowstone-grpc";

const client = new Client("https://your-grpc-endpoint:443", "TOKEN", {});
const stream = await client.subscribe();

stream.on("data", (update) => {
  if (update.account) {
    const a = update.account.account;
    console.log("account changed:", a.pubkey, "lamports:", a.lamports);
    // ...decode and act: update a cache, trigger a liquidation check, etc.
  }
});

// Server-side filter: only stream accounts owned by one program.
stream.write({
  accounts: {
    myFilter: { owner: ["TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"] },
  },
  commitment: 1, // confirmed
});
// This is push-based and gapless — the validator emits every write as it lands.`,
    links: [
      { label: "Yellowstone gRPC (Geyser)", url: "https://github.com/rpcpool/yellowstone-grpc" },
      { label: "Solana Docs — Geyser plugins", url: "https://docs.anza.xyz/validator/geyser" },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  //  SYSTEM DESIGN additions
  // ─────────────────────────────────────────────────────────────────────────
  {
    icon: "Server",
    tag: "System Design",
    title: "AccountsDB, Snapshots & Ledger",
    desc: "A validator keeps three distinct stores: the Ledger (the append-only history of entries/blocks), AccountsDB (the live, mutable state of every account, held largely in memory + memory-mapped files), and Snapshots (periodic compressed dumps of AccountsDB used to bootstrap new nodes fast). Understanding the split explains why state queries are instant but historical lookups need an archive.",
    details: [
      "Ledger (blockstore): immutable record of shreds/entries/blocks; grows forever",
      "AccountsDB: current state only — what every account holds right now",
      "AccountsDB layers persistent account files, a sharded in-memory index, and caches",
      "AppendVec-style account files favor sequential appends over random in-place updates",
      "AccountsIndex answers: where is the latest version of this pubkey?",
      "Snapshots: full + incremental compressed state dumps, taken every N slots",
      "A new validator downloads a recent snapshot to join in minutes, not by replaying genesis",
      "Most validators prune old ledger — full history lives on archival/warehouse nodes + BigTable",
      "Shrink/cleanup compacts old account versions without blocking hot transaction reads",
    ],
    whyItMatters: "This architecture is why 'what's the balance now?' is a fast in-memory read while 'what was this account 6 months ago?' may not be answerable from a normal RPC — most nodes don't keep that history. It explains snapshot-based fast bootstrapping, why getProgramAccounts can be heavy (it scans AccountsDB), and why you need an archival/indexer provider for deep history. When you reason about RPC behavior, rate limits, and which queries are cheap vs expensive, you're really reasoning about which store they hit.",
    commonMistakes: [
      "Expecting a default RPC to serve months-old historical state — most prune the ledger",
      "Running unfiltered getProgramAccounts over a huge program and timing out (it scans AccountsDB)",
      "Confusing the ledger (history) with AccountsDB (current state) when reasoning about queries",
      "Assuming all nodes have all history — use archival/warehouse providers for the past",
    ],
    code: `import { Connection, PublicKey } from "@solana/web3.js";
const conn = new Connection("https://api.mainnet-beta.solana.com");

// CURRENT STATE (AccountsDB) — fast, in-memory:
const acc = await conn.getAccountInfo(new PublicKey("So111...11112"));
console.log("lives in AccountsDB, instant:", acc?.lamports);

// FILTERED STATE SCAN — hits the account index; can be heavy. Always filter.
const owned = await conn.getProgramAccounts(
  new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
  { filters: [{ dataSize: 165 }, { memcmp: { offset: 32, bytes: "OWNER_PUBKEY" } }] },
);
console.log("matched accounts:", owned.length);

// DEEP HISTORY (old ledger) — a normal node may return null; you need an
// archival RPC. Snapshots are how a fresh validator skips replaying genesis:
// it downloads a recent AccountsDB snapshot and starts from there.`,
    links: [
      { label: "Anza — AccountsDB", url: "https://www.anza.xyz/blog" },
      { label: "Solana Docs — validator architecture", url: "https://docs.anza.xyz/validator/anatomy" },
    ],
  },
  {
    icon: "Activity",
    tag: "System Design",
    title: "Banking Stage & The Scheduler",
    desc: "Inside the leader's TPU, the Banking Stage is where verified transactions actually execute and update state. Its scheduler decides which transactions run in parallel without conflicting on account writes — the practical realization of Sealevel. Modern scheduler paths can use conflict/dependency graphs and priority signals instead of blindly feeding thread-local queues.",
    details: [
      "Banking Stage = the execution+packing phase of the leader's TPU pipeline",
      "Takes verified txs, groups non-conflicting ones, executes them across worker threads",
      "Inputs are split across non-vote, TPU vote, and gossip vote paths",
      "Conflict = two txs that write the same account; they must serialize",
      "Schedulers include conflict-graph/priority paths and simpler greedy paths",
      "The Bank lifecycle is open -> frozen -> rooted",
      "Frozen Bank hash is what validators vote on; rooted state is squashed into AccountsDB",
      "Better scheduling = more of the block's compute budget actually used productively",
      "Priority + compute estimates feed the scheduler's ordering decisions",
      "Vote isolation protects liveness when non-vote traffic is congested or adversarial",
    ],
    whyItMatters: "Sealevel is the idea (parallel execution by declared account access); the Banking Stage scheduler is the implementation that makes or breaks it. The shift to a central scheduler meaningfully raised effective throughput and made inclusion fairer under load. For builders this is the missing link between 'I set a priority fee' and 'my tx landed': the scheduler ranks and packs transactions here, favoring well-specified, non-conflicting, properly-priced txs. It also explains write-lock contention — many txs fighting over one hot account serialize through this stage and bottleneck.",
    commonMistakes: [
      "Blaming the network when a hot, contended account is serializing all your txs in banking",
      "Assuming parallel execution is automatic — conflicting account writes still serialize",
      "Ignoring how priority + CU estimates influence scheduler ordering, then wondering why txs drop",
      "Thinking 'block had space' means your tx should have landed — the scheduler still has to pick it",
    ],
    code: `// Banking Stage is validator-internal — no direct API. But you optimize FOR it:
import { ComputeBudgetProgram, Transaction } from "@solana/web3.js";

// 1) Minimize write-lock contention. Spreading writes across many accounts
//    (e.g. per-user PDAs) lets the scheduler parallelize them. One global
//    counter account forces every tx to serialize through banking.

// 2) Give the scheduler accurate signals so it ranks you well:
const tx = new Transaction().add(
  ComputeBudgetProgram.setComputeUnitLimit({ units: 220_000 }),  // tight estimate
  ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 40_000 }), // real bid
  // ...your instructions, touching as few SHARED writable accounts as possible
);

// Design rule of thumb:
//   readable-shared accounts  → parallel-friendly (many readers OK)
//   writable-shared accounts  → contention point (serialize in banking)
// The fewer hot writable accounts you share, the more the scheduler can fan out.`,
    links: [
      { label: "Anza — the central scheduler", url: "https://www.anza.xyz/blog/solana-transaction-scheduler" },
      { label: "Helius — how Solana transactions land", url: "https://www.helius.dev/blog/how-to-land-transactions-on-solana" },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  //  MEV addition
  // ─────────────────────────────────────────────────────────────────────────
  {
    icon: "GitBranch",
    tag: "MEV",
    title: "Jito: Bundles & Block Engine",
    desc: "Jito is the dominant MEV infrastructure on Solana. Its block engine runs an off-chain auction where searchers submit 'bundles' — ordered groups of transactions that execute atomically and sequentially — and bid 'tips' for priority placement. Validators running the Jito-Solana client include the highest-value bundles. This gives Solana a controlled, out-of-protocol MEV market instead of a chaotic public mempool free-for-all.",
    details: [
      "Bundle: up to 5 txs that execute atomically, in order, all-or-nothing",
      "Searchers bid 'tips' (paid to a tip account) to win placement in the block",
      "Block Engine runs the auction off-chain and forwards winning bundles to the leader",
      "Solana has no public mempool — Jito's relay/auction fills that ordering role",
      "Validators get tip revenue; a share flows to stakers (boosting effective APY)",
      "Atomicity makes risk-free arbitrage and liquidations expressible as one unit",
      "Bundles can guarantee a tx lands BEFORE or AFTER another — key for backruns",
      "Jito also runs liquid staking (JitoSOL) capturing MEV for stakers",
    ],
    whyItMatters: "Without a mempool, Solana's MEV doesn't look like Ethereum's — there's no public pending-tx queue to snipe. Jito created the actual market structure: a sealed off-chain auction where ordering is bought with tips and expressed as atomic bundles. This matters whether you're extracting MEV (you submit bundles to win arbitrage/liquidations atomically) or defending against it (your protocol design and the bundle mechanics determine sandwich exposure). It also reshapes validator economics — tip revenue is now a major income stream and a reason stakers pick Jito-enabled validators.",
    commonMistakes: [
      "Expecting an Ethereum-style public mempool to frontrun — Solana ordering happens via Jito's sealed auction",
      "Submitting a bundle without enough tip to win the auction, then assuming it 'failed'",
      "Forgetting bundles are atomic — if one tx in the bundle fails, the whole bundle is dropped",
      "Confusing priority fees (per-tx, protocol-level) with Jito tips (per-bundle, auction-level)",
    ],
    code: `// Searchers submit bundles to the Jito Block Engine. Sketch of the flow:
import { Connection, VersionedTransaction } from "@solana/web3.js";

// A bundle is an ordered array of fully-signed txs that land atomically.
// One of them transfers a TIP to a Jito tip account — that's your auction bid.
async function sendBundle(txs: VersionedTransaction[]) {
  const encoded = txs.map((t) => Buffer.from(t.serialize()).toString("base64"));
  const res = await fetch("https://mainnet.block-engine.jito.wtf/api/v1/bundles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0", id: 1, method: "sendBundle",
      params: [encoded, { encoding: "base64" }],
    }),
  });
  return (await res.json()).result; // bundle id
}

// Ordering guarantees you can express:
//   [victimSwap, yourBackrun]  → you run strictly AFTER the target (backrun)
//   all-or-nothing             → no partial fills, no failed-arb gas bleed
// The higher your tip, the better your placement in the sealed auction.`,
    links: [
      { label: "Jito Labs Docs", url: "https://docs.jito.wtf" },
      { label: "Helius — MEV on Solana & Jito", url: "https://www.helius.dev/blog/solana-mev-an-introduction" },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  //  ECONOMICS addition
  // ─────────────────────────────────────────────────────────────────────────
  {
    icon: "BarChart3",
    tag: "Economics",
    title: "Local Fee Markets",
    desc: "Solana's fee market is local, not global. Congestion on one hot account (a popular mint, a single DEX pool) only raises priority fees for transactions that touch that account — it doesn't tax the rest of the network. This is a deliberate consequence of declaring account access up front: the scheduler knows exactly which accounts each tx contends for, so it can price contention per-account instead of per-block.",
    details: [
      "Fees spike only for txs writing the contended account(s), not the whole chain",
      "Built on the same up-front account-access declaration that powers parallelism",
      "Per-account write limit (~12M CU/block) caps how much one account can hog",
      "During a hot mint, unrelated swaps elsewhere stay cheap — no global gas auction",
      "You bid priority (micro-lamports/CU) only against others touching the same accounts",
      "Estimate fees per-account: getRecentPrioritizationFees is keyed to the accounts you pass",
      "Contrasts with Ethereum's single global base fee that rises for everyone at once",
      "Design implication: spreading state across accounts spreads (and lowers) fee pressure",
    ],
    whyItMatters: "On a global fee market, one viral NFT mint makes every transaction on the chain expensive. Solana's local fee markets contain that blast radius — the mint's contenders pay up, everyone else is unaffected. For fee estimation this is critical: you must price priority against the specific accounts your transaction writes, not against some network-wide average. For protocol design it's a direct incentive to avoid single hot accounts (sharding state into per-user PDAs), because concentrated writes both serialize execution and concentrate fee pressure.",
    commonMistakes: [
      "Estimating priority fees globally instead of for the specific accounts your tx writes",
      "Designing around one hot global account, then paying a self-inflicted local fee spike",
      "Assuming network-wide congestion when only your target account is contended",
      "Ignoring the per-account write cap, so a single account bottlenecks your throughput",
    ],
    code: `import { Connection, PublicKey } from "@solana/web3.js";
const conn = new Connection("https://api.mainnet-beta.solana.com");

// Fees are LOCAL — estimate against the exact accounts your tx will write.
const hotAccounts = [
  new PublicKey("HOT_POOL_OR_MINT_ADDRESS"),
  new PublicKey("YOUR_WRITABLE_PDA"),
];

const samples = await conn.getRecentPrioritizationFees({
  lockedWritableAccounts: hotAccounts,   // <- per-account, not network-wide
});

// Pick a competitive percentile of recent fees FOR THESE ACCOUNTS.
const fees = samples.map((s) => s.prioritizationFee).sort((a, b) => a - b);
const p75 = fees[Math.floor(fees.length * 0.75)] ?? 0;
console.log("suggested micro-lamports/CU for these accounts:", p75);

// Touching an uncontended account? p75 is often 0 — you pay base fee only,
// even while a mint elsewhere is in a bidding war. That's local fee markets.`,
    links: [
      { label: "Solana Docs — fees & prioritization", url: "https://solana.com/docs/core/fees" },
      { label: "Helius — local fee markets", url: "https://www.helius.dev/blog/solana-local-fee-markets" },
    ],
  },
];

export const tagColors: Record<string, string> = {
  "Core Infra":    "bg-green text-background",
  "Data Flow":     "border border-border text-muted-foreground",
  "MEV":           "bg-secondary text-foreground border border-destructive/30",
  "System Design": "border border-green/40 text-green",
  "Consensus":     "border border-primary/40 text-primary",
  "Programs":      "bg-secondary text-foreground",
  "Economics":     "border border-muted-foreground/40 text-muted-foreground",
};

export const flowSteps = [
  { step: "01", label: "Client", desc: "Sign & send tx", detail: "Your app creates a transaction, adds instructions, sets the recent blockhash (critical for expiry), and signs it with the required keypairs. The serialized tx (max 1232 bytes) is then sent to your RPC node. This is where preflight simulation happens — the RPC simulates the tx before broadcasting to catch obvious errors." },
  { step: "02", label: "RPC Node", desc: "Validate & forward", detail: "The RPC node validates the transaction format, optionally runs preflight simulation (executes in a sandbox to detect errors before committing), then forwards it to the current and upcoming leaders via Gulf Stream. The RPC may retry forwarding a few times but doesn't guarantee delivery. This is fire-and-forget — always implement your own confirmation polling." },
  { step: "03", label: "Leader", desc: "Execute in slot", detail: "The current slot's designated leader receives your tx (pre-cached via Gulf Stream), executes it in Sealevel's parallel runtime, and packs it into their block. The leader can order transactions within their block freely — this is where MEV extraction happens. Sealevel runs non-conflicting txs in parallel across CPU threads using the declared account access lists." },
  { step: "04", label: "Turbine", desc: "Block propagated", detail: "The leader doesn't send the full block to every validator (that would require massive bandwidth). Instead, Turbine breaks the block into ~1228-byte erasure-coded shreds and distributes them through a stake-weighted tree. Each tier of validators forwards shreds to a subset of the next tier — like BitTorrent. Forward Error Correction means validators can reconstruct the block even with missing shreds." },
  { step: "05", label: "Validators", desc: "Vote & confirm", detail: "Validators receive shreds via Turbine, reconstruct the full block, replay all transactions to verify correctness, then submit vote transactions to Tower BFT. 'Confirmed' status is reached when validators representing 2/3+ of total staked SOL have voted on the block. This usually takes 1-2 seconds (2-4 slots). Validators who vote incorrectly or on competing forks face increasing lockout penalties." },
  { step: "06", label: "Finalized", desc: "2/3 supermajority", detail: "Once a block has accumulated 32 consecutive confirmations (the Tower BFT lockout threshold), it becomes 'rooted' and finalized. At this point, mathematically reversing this block would require a supermajority of validators to sacrifice their entire staked SOL (the lockout means they'd have to wait 2^31 slots to vote on a competing fork). Finalization typically takes 13-26 seconds (32-64 slots) on mainnet." },
];

export const stats = [
  { val: "~400ms", label: "Slot time", sub: "target" },
  { val: "65,000", label: "TPS theoretical", sub: "peak" },
  { val: "1,232",  label: "Bytes max tx",    sub: "limit" },
  { val: "432k",   label: "Slots per epoch", sub: "~2.5 days" },
  { val: "~0.00001", label: "SOL avg fee",   sub: "mainnet" },
  { val: "1,700+", label: "Active validators",sub: "mainnet-beta" },
  { val: "~8%",    label: "Staking APY",     sub: "current" },
  { val: "50%",    label: "Base fees burned", sub: "deflationary" },
];

// ─── METADATA (keyed by title) — ids for URLs, difficulty, diagram keys ──────
export type Level = "beginner" | "intermediate" | "advanced";
export interface Meta { id: string; level: Level; diagramKey?: string; }

export const META: Record<string, Meta> = {
  "Transactions": { id: "transactions", level: "beginner" },
  "Blocks & Slots": { id: "blocks-slots", level: "intermediate" },
  "Proof of History (PoH)": { id: "proof-of-history", level: "intermediate", diagramKey: "poh" },
  "Transaction Lifecycle": { id: "tx-lifecycle", level: "beginner", diagramKey: "lifecycle" },
  "Gulf Stream": { id: "gulf-stream", level: "intermediate", diagramKey: "gulfstream" },
  "Turbine Block Propagation": { id: "turbine", level: "intermediate", diagramKey: "turbine" },
  "Tower BFT": { id: "tower-bft", level: "advanced" },
  "MEV on Solana": { id: "mev", level: "advanced" },
  "Priority Fees": { id: "priority-fees", level: "beginner" },
  "Epochs & Validators": { id: "epochs-validators", level: "intermediate" },
  "Accounts Model": { id: "accounts-model", level: "beginner", diagramKey: "accounts" },
  "Instructions & CPIs": { id: "instructions-cpis", level: "intermediate" },
  "Sealevel Runtime": { id: "sealevel", level: "advanced", diagramKey: "sealevel" },
  "RPC & Node Infra": { id: "rpc-infra", level: "beginner" },
  "Program Derived Addresses": { id: "pda", level: "intermediate", diagramKey: "pda" },
  "Versioned Transactions": { id: "versioned-tx", level: "intermediate" },
  "Fee Economics": { id: "fee-economics", level: "intermediate" },
  "Solana Clusters": { id: "clusters", level: "beginner" },
  "Sandwich Attacks & Protection": { id: "sandwich", level: "advanced" },
  "Validator Economics": { id: "validator-economics", level: "advanced" },
  "Alpenglow Consensus": { id: "alpenglow", level: "advanced" },
  "Firedancer & Validator Clients": { id: "firedancer", level: "advanced" },
  "DoubleZero": { id: "doublezero", level: "advanced" },
  "Async Execution & Rising Block Limits": { id: "async-execution", level: "advanced" },
  "QUIC & Stake-Weighted QoS": { id: "quic-swqos", level: "intermediate" },
  "Gossip & Repair": { id: "gossip-repair", level: "advanced" },
  "Compute Units & Budget": { id: "compute-units", level: "intermediate" },
  "Rent & Rent Exemption": { id: "rent", level: "beginner" },
  "SVM Bytecode (rBPF / SBF)": { id: "svm-bytecode", level: "advanced" },
  "Token Extensions (Token-2022)": { id: "token-extensions", level: "intermediate" },
  "State & ZK Compression": { id: "state-compression", level: "advanced" },
  "Address Lookup Tables": { id: "lookup-tables", level: "intermediate" },
  "Geyser & Data Streaming": { id: "geyser", level: "intermediate" },
  "AccountsDB, Snapshots & Ledger": { id: "accountsdb", level: "advanced" },
  "Banking Stage & The Scheduler": { id: "banking-stage", level: "advanced" },
  "Jito: Bundles & Block Engine": { id: "jito", level: "advanced" },
  "Local Fee Markets": { id: "local-fee-markets", level: "intermediate" },
};
export const levelMeta: Record<Level, { label: string; color: string }> = {
  beginner: { label: "Beginner", color: "var(--sol-green)" },
  intermediate: { label: "Intermediate", color: "var(--text-mid)" },
  advanced: { label: "Advanced", color: "var(--text)" },
};
export const levelOrder: Level[] = ["beginner", "intermediate", "advanced"];

export function metaFor(title: string): Meta {
  return META[title] ?? { id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"), level: "intermediate" };
}
export function conceptById(id: string): Concept | undefined {
  return concepts.find((c) => metaFor(c.title).id === id);
}
export function conceptsByLevel(level: Level): Concept[] {
  return concepts.filter((c) => metaFor(c.title).level === level);
}
