


import { useState } from "react";
import {
  ArrowRight, Zap, Box, Layers, GitBranch, Shield, Activity, Clock,
  Database, Network, ChevronRight, X, ExternalLink, Copy, Check,
  Cpu, Globe, Lock, Server, Code2, Flame, BarChart3, HardDrive,
  RefreshCw, Wifi, Eye, ChevronDown, BookOpen, Terminal, Hash,
  AlertTriangle, Info, Lightbulb, CheckCircle
} from "lucide-react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const categories = ["All", "Core Infra", "Data Flow", "MEV", "System Design", "Consensus", "Programs", "Economics"];

const concepts = [
  {
    icon: <Box className="w-5 h-5" />,
    tag: "Core Infra",
    title: "Transactions",
    desc: "A Solana transaction bundles one or more instructions into a single atomic unit. Either ALL instructions succeed, or ALL fail — there's no partial execution. Every tx includes a recent blockhash (acts as a nonce + expiry), a fee payer, and at least one signature.",
    details: [
      "Max 1232 bytes per tx (hard limit)",
      "Recent blockhash expires in ~150 slots (~60s)",
      "Fee paid in lamports (1 SOL = 10⁹ lamports)",
      "Versioned (v0) & legacy formats supported",
      "Up to 64 unique accounts per legacy tx",
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
    icon: <Layers className="w-5 h-5" />,
    tag: "Core Infra",
    title: "Blocks & Slots",
    desc: "Slots are fixed ~400ms time windows during which a designated leader validator produces a block. Not every slot produces a block — if the leader is offline or slow, the slot is 'skipped'. A block is an ordered, confirmed set of transactions anchored to a specific slot number.",
    details: [
      "~400ms per slot (network target)",
      "~2.5 slots created per second on average",
      "Leader schedule is rotated every epoch",
      "Skipped slots ≠ lost data — tx just wasn't included",
      "~800ms actual average block time in practice",
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
    icon: <Hash className="w-5 h-5" />,
    tag: "Consensus",
    title: "Proof of History (PoH)",
    desc: "PoH is NOT a consensus mechanism — it's a cryptographic clock. It's a Verifiable Delay Function (VDF) based on SHA-256 hash chaining that proves time has passed between events. The leader runs PoH continuously, embedding transactions into the hash sequence. This creates a verifiable, tamper-proof timeline BEFORE blocks even reach consensus.",
    details: [
      "SHA-256 hash chain: output N feeds into input N+1",
      "Each hash proves ~400ms of real time passed",
      "Validators can verify the entire chain in parallel",
      "Enables parallel tx processing by ordering txs first",
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
    icon: <Activity className="w-5 h-5" />,
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
    icon: <Wifi className="w-5 h-5" />,
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
    icon: <Network className="w-5 h-5" />,
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
    icon: <RefreshCw className="w-5 h-5" />,
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
      "Not distinguishing between the 2 commitment levels in your app logic",
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
    icon: <Shield className="w-5 h-5" />,
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
    icon: <Zap className="w-5 h-5" />,
    tag: "MEV",
    title: "Priority Fees",
    desc: "Priority fees are extra per-compute-unit payments that make the leader prioritize your transaction. They're set via the ComputeBudget program using two instructions: setComputeUnitLimit (caps your CU usage) and setComputeUnitPrice (sets microlamports per CU). ALWAYS set both. Not setting the CU limit wastes fees on unused compute.",
    details: [
      "ComputeBudgetProgram: native on-chain system program",
      "setComputeUnitPrice: microlamports per compute unit",
      "setComputeUnitLimit: max CUs this tx can use",
      "Base fee = 5000 lamports per signature (flat)",
      "Priority fee = microLamports × actualCUsUsed / 1,000,000",
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
    icon: <Clock className="w-5 h-5" />,
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
    icon: <Database className="w-5 h-5" />,
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
    icon: <Code2 className="w-5 h-5" />,
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
    icon: <Cpu className="w-5 h-5" />,
    tag: "Programs",
    title: "Sealevel Runtime",
    desc: "Sealevel is Solana's parallel smart contract execution runtime. Unlike Ethereum's EVM which runs one transaction at a time, Sealevel identifies transactions that don't share accounts and executes them simultaneously across multiple CPU threads. The key insight: every instruction declares which accounts it needs upfront, enabling static analysis before execution.",
    details: [
      "Parallel execution of non-overlapping account sets",
      "Read-only accounts: multiple txs can share access",
      "Writable accounts: exclusive lock per tx",
      "Default compute limit: 200,000 CUs per instruction",
      "Max per tx: 1,400,000 CUs (with setComputeUnitLimit)",
      "SBF (Solana BPF) bytecode — compiled from Rust, C, C++",
      "BPF JIT compiled for near-native performance",
      "Stack frames max 4KB, heap max 32KB"
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
    icon: <GitBranch className="w-5 h-5" />,
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
    icon: <Lock className="w-5 h-5" />,
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
    icon: <HardDrive className="w-5 h-5" />,
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
    icon: <BarChart3 className="w-5 h-5" />,
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
    icon: <Globe className="w-5 h-5" />,
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
// solana-test-validator \
//   --clone-upgradeable-program JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4 \ (Jupiter)
//   --clone-upgradeable-program whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc \ (Whirlpools)
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
    icon: <Flame className="w-5 h-5" />,
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
    icon: <Server className="w-5 h-5" />,
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
];

const tagColors: Record<string, string> = {
  "Core Infra":    "bg-green text-background",
  "Data Flow":     "border border-border text-muted-foreground",
  "MEV":           "bg-secondary text-foreground border border-destructive/30",
  "System Design": "border border-green/40 text-green",
  "Consensus":     "border border-primary/40 text-primary",
  "Programs":      "bg-secondary text-foreground",
  "Economics":     "border border-muted-foreground/40 text-muted-foreground",
};

const flowSteps = [
  { step: "01", label: "Client", desc: "Sign & send tx", detail: "Your app creates a transaction, adds instructions, sets the recent blockhash (critical for expiry), and signs it with the required keypairs. The serialized tx (max 1232 bytes) is then sent to your RPC node. This is where preflight simulation happens — the RPC simulates the tx before broadcasting to catch obvious errors." },
  { step: "02", label: "RPC Node", desc: "Validate & forward", detail: "The RPC node validates the transaction format, optionally runs preflight simulation (executes in a sandbox to detect errors before committing), then forwards it to the current and upcoming leaders via Gulf Stream. The RPC may retry forwarding a few times but doesn't guarantee delivery. This is fire-and-forget — always implement your own confirmation polling." },
  { step: "03", label: "Leader", desc: "Execute in slot", detail: "The current slot's designated leader receives your tx (pre-cached via Gulf Stream), executes it in Sealevel's parallel runtime, and packs it into their block. The leader can order transactions within their block freely — this is where MEV extraction happens. Sealevel runs non-conflicting txs in parallel across CPU threads using the declared account access lists." },
  { step: "04", label: "Turbine", desc: "Block propagated", detail: "The leader doesn't send the full block to every validator (that would require massive bandwidth). Instead, Turbine breaks the block into ~1228-byte erasure-coded shreds and distributes them through a stake-weighted tree. Each tier of validators forwards shreds to a subset of the next tier — like BitTorrent. Forward Error Correction means validators can reconstruct the block even with missing shreds." },
  { step: "05", label: "Validators", desc: "Vote & confirm", detail: "Validators receive shreds via Turbine, reconstruct the full block, replay all transactions to verify correctness, then submit vote transactions to Tower BFT. 'Confirmed' status is reached when validators representing 2/3+ of total staked SOL have voted on the block. This usually takes 1-2 seconds (2-4 slots). Validators who vote incorrectly or on competing forks face increasing lockout penalties." },
  { step: "06", label: "Finalized", desc: "2/3 supermajority", detail: "Once a block has accumulated 32 consecutive confirmations (the Tower BFT lockout threshold), it becomes 'rooted' and finalized. At this point, mathematically reversing this block would require a supermajority of validators to sacrifice their entire staked SOL (the lockout means they'd have to wait 2^31 slots to vote on a competing fork). Finalization typically takes 13-26 seconds (32-64 slots) on mainnet." },
];

const stats = [
  { val: "~400ms", label: "Slot time", sub: "target" },
  { val: "65,000", label: "TPS theoretical", sub: "peak" },
  { val: "1,232",  label: "Bytes max tx",    sub: "limit" },
  { val: "432k",   label: "Slots per epoch", sub: "~2.5 days" },
  { val: "~0.00001", label: "SOL avg fee",   sub: "mainnet" },
  { val: "1,700+", label: "Active validators",sub: "mainnet-beta" },
  { val: "~8%",    label: "Staking APY",     sub: "current" },
  { val: "50%",    label: "Base fees burned", sub: "deflationary" },
];

const navLinks = [
  { href: "#concepts",  label: "Concepts"   },
  { href: "#flow",      label: "Lifecycle"  },
  { href: "#mev",       label: "MEV"        },
  { href: "#consensus", label: "Consensus"  },
];

// ─── MODAL ────────────────────────────────────────────────────────────────────

function ConceptModal({ concept, onClose }: { concept: typeof concepts[0]; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview"|"code"|"resources">("overview");

  const copy = () => {
    navigator.clipboard.writeText(concept.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
      style={{ animation: "fadeIn 0.15s ease-out" }}
      onClick={onClose}
    >
      <div
        className="relative bg-card border border-border rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto"
        style={{ animation: "scaleIn 0.15s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-green">
              {concept.icon}
            </div>
            <div>
              <h2 className="font-bold text-lg">{concept.title}</h2>
              <span className={`text-xs font-semibold rounded px-2 py-0.5 ${tagColors[concept.tag]}`}>{concept.tag}</span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-6">
          {(["overview", "code", "resources"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-semibold capitalize border-b-2 transition-colors -mb-px ${
                activeTab === tab
                  ? "border-green text-green"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-6">
          {activeTab === "overview" && (
            <>
              {/* Description */}
              <p className="text-muted-foreground leading-relaxed text-sm">{concept.desc}</p>

              {/* Why it matters */}
              {concept.whyItMatters && (
                <div className="bg-green/5 border border-green/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-green" />
                    <span className="text-xs font-mono text-green uppercase tracking-widest">Why It Matters</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{concept.whyItMatters}</p>
                </div>
              )}

              {/* Details */}
              <div>
                <h3 className="text-xs font-mono text-green uppercase tracking-widest mb-3">Key Facts</h3>
                <ul className="grid grid-cols-2 gap-2">
                  {concept.details.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-xs font-mono bg-secondary rounded-lg px-3 py-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green flex-shrink-0 mt-1" />
                      <span className="text-muted-foreground">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Common Mistakes */}
              {concept.commonMistakes && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <h3 className="text-xs font-mono text-yellow-500 uppercase tracking-widest">Common Mistakes</h3>
                  </div>
                  <ul className="space-y-2">
                    {concept.commonMistakes.map((m) => (
                      <li key={m} className="flex items-start gap-2 text-xs bg-yellow-500/5 border border-yellow-500/20 rounded-lg px-3 py-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 flex-shrink-0 mt-1.5" />
                        <span className="text-muted-foreground">{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {activeTab === "code" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-mono text-green uppercase tracking-widest">Code Example</h3>
                <button
                  onClick={copy}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-secondary"
                >
                  {copied ? <Check className="w-3 h-3 text-green" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="bg-background rounded-xl border border-border p-4 overflow-x-auto">
                <pre className="text-xs font-mono text-foreground leading-relaxed whitespace-pre">{concept.code}</pre>
              </div>
            </div>
          )}

          {activeTab === "resources" && (
            <div>
              <h3 className="text-xs font-mono text-green uppercase tracking-widest mb-3">Resources & Docs</h3>
              <div className="space-y-2">
                {concept.links.map((l) => (
                  <a
                    key={l.url}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary hover:border-green/30 border border-border hover:bg-secondary/80 transition-all group"
                  >
                    <span className="text-sm font-medium group-hover:text-green transition-colors">{l.label}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-green transition-colors flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── FLOW STEP MODAL ─────────────────────────────────────────────────────────

function FlowModal({ step, onClose }: { step: typeof flowSteps[0]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black font-mono text-green">{step.step}</span>
            <h2 className="font-bold text-xl">{step.label}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground font-semibold mb-3 text-green">{step.desc}</p>
        <p className="text-muted-foreground leading-relaxed text-sm">{step.detail}</p>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedConcept, setSelectedConcept] = useState<typeof concepts[0] | null>(null);
  const [selectedStep, setSelectedStep] = useState<typeof flowSteps[0] | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMev, setExpandedMev] = useState<string | null>(null);

  const filtered = activeCategory === "All"
    ? concepts
    : concepts.filter((c) => c.tag === activeCategory);

  const mevItems = [
    {
      id: "no-mempool",
      title: "No Mempool",
      desc: "Txs are forwarded directly to leaders via Gulf Stream — no public pending pool means traditional frontrunning is much harder than Ethereum.",
      extra: "Ethereum MEV works because bots can monitor the public mempool — a pool of pending transactions — and insert their own txs before/after profitable targets. Solana has no mempool: your tx goes directly from your RPC to the leader. This means bots can't scan a 'pending' pool. However, if you're the leader, you see all incoming txs before including them. Jito solves this with an off-chain auction where searchers bid for bundle ordering.",
    },
    {
      id: "jito-block-engine",
      title: "Jito Block Engine",
      desc: "Searchers submit bundles to Jito's off-chain block engine. Validators running Jito-patched clients can include these bundles and collect tips.",
      extra: "Jito runs ~65-80% of mainnet stake (2024-2025). The block engine is a separate service: searchers connect to it via gRPC or REST, submit ordered bundles, and bid for inclusion. The block engine runs an auction: highest tip wins the right to have their bundle included by Jito-running validators. The validator's modified Solana client checks the block engine for pending bundles each slot and includes the best ones alongside regular transactions.",
    },
    {
      id: "tips",
      title: "MEV Tips & Revenue",
      desc: "MEV tips are paid on-chain to 8 known Jito tip accounts. Validators receive these tips proportional to their Jito participation.",
      extra: "In 2024-2025, Jito tips grew to represent $500M+ annually in Real Economic Value (REV) — surpassing inflation rewards for top validators. Tips are distributed every epoch from tip distribution accounts to vote accounts. This is visible on-chain: you can watch tip account balances grow in real-time. The 8 tip accounts rotate to reduce contention. The growing dominance of MEV over inflation as validator revenue has major implications for network economics and decentralization.",
    },
    {
      id: "bundle-atomicity",
      title: "Bundle Atomicity",
      desc: "All txs in a Jito bundle succeed or all revert — enabling atomic arbitrage, liquidations, and complex multi-step MEV strategies.",
      extra: "A Jito bundle can contain 1-5 transactions that execute as a unit: either all succeed or all fail. The tip transaction (paying the validator) is usually the last tx in the bundle — if the arb fails, the validator doesn't get the tip, so they have no incentive to include a losing bundle. This atomic guarantee is essential for arbitrage: 'buy on DEX A, sell on DEX B, pay validator tip' — if step 1 or 2 fails, step 3 (the tip) also fails.",
    },
    {
      id: "sandwich-protection",
      title: "Sandwich Attack Mechanics",
      desc: "A sandwicher places a buy tx before your swap and a sell tx after, profiting from your price impact. Requires controlling tx ordering.",
      extra: "The math: if your $100k SOL→USDC swap creates 2% price impact, the sandwicher buys $50k of USDC just before you (paying 1% slippage), waits for your tx to push the price up 2%, then sells their USDC at the new higher price for ~1% profit = $500. Your tx executes at a 2% worse price. Defense: tight slippage tolerance (0.5% max) ensures your tx reverts if the price moves too much, making the sandwich unprofitable.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.96) } to { opacity: 1; transform: scale(1) } }
        .dot-grid {
          background-image: radial-gradient(circle, rgba(20, 241, 149, 0.15) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .green-label { color: #14F195; }
        .card-hover { transition: all 0.2s ease; }
        .card-hover:hover { border-color: rgba(20, 241, 149, 0.3); transform: translateY(-1px); }
        :root {
          --background: #0a0a0a;
          --foreground: #f0f0f0;
          --card: #111111;
          --card-foreground: #f0f0f0;
          --muted-foreground: #888;
          --border: #222;
          --secondary: #1a1a1a;
          --green: #14F195;
          --primary: #9945FF;
          --destructive: #ef4444;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--background); color: var(--foreground); font-family: system-ui, -apple-system, sans-serif; }
        .bg-background { background-color: var(--background); }
        .bg-card { background-color: var(--card); }
        .bg-secondary { background-color: var(--secondary); }
        .bg-green { background-color: var(--green); }
        .text-foreground { color: var(--foreground); }
        .text-muted-foreground { color: var(--muted-foreground); }
        .text-green { color: var(--green); }
        .text-background { color: var(--background); }
        .text-primary { color: var(--primary); }
        .border-border { border-color: var(--border); }
        .border-green { border-color: var(--green); }
        .border-destructive { border-color: var(--destructive); }
        .border-primary { border-color: var(--primary); }
        pre { white-space: pre; overflow-x: auto; }
      `}</style>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-40 bg-background/90 backdrop-blur-sm" style={{ borderBottom: '1px solid var(--border)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3">
        
          <span className="font-bold text-lg tracking-tight">SolRef</span>
         
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-foreground transition-colors hover:text-green">{l.label}</a>
          ))}
          <a href="https://docs.solana.com" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-green text-background px-4 py-1.5 rounded font-semibold text-sm hover:opacity-90 transition-opacity">
            Docs <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <button className="md:hidden flex items-center gap-2 text-muted-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <ChevronDown className={`w-4 h-4 transition-transform ${mobileMenuOpen ? "rotate-180" : ""}`} />
          Menu
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden bg-card px-6 py-4 space-y-3" style={{ borderBottom: '1px solid var(--border)' }}>
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="block text-sm text-muted-foreground hover:text-foreground py-1" onClick={() => setMobileMenuOpen(false)}>{l.label}</a>
          ))}
        </div>
      )}

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-60" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent, transparent, var(--background))' }} />
        <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-0">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground border border-border rounded px-3 py-1.5 mb-6" style={{ border: '1px solid var(--border)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green" style={{ animation: 'pulse 2s infinite', backgroundColor: 'var(--green)' }} />
                Solana Mainnet-Beta · Comprehensive Dev Reference
              </div>
              <h1 className="text-5xl md:text-6xl font-black leading-tight mb-4">
                <span className="green-label">Solana</span>
                <br />Developer
                <br />Reference
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-md">
                Every confusing concept — PoH, Gulf Stream, Turbine, Tower BFT, Sealevel, MEV, PDAs, CPIs — explained deeply with production-ready code, gotchas, and real-world examples.
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <a href="#concepts" className="flex items-center gap-2 bg-green text-background px-6 py-3 rounded font-bold text-sm hover:opacity-90 transition-all">
                  Explore All Concepts <ArrowRight className="w-4 h-4" />
                </a>
                <a href="#flow" className="flex items-center gap-2 text-foreground px-6 py-3 rounded font-semibold text-sm hover:border-green/50 transition-colors" style={{ border: '1px solid var(--border)' }}>
                  View Tx Lifecycle <ChevronRight className="w-4 h-4" />
                </a>
                <a href="https://docs.solana.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground px-6 py-3 rounded font-semibold text-sm hover:text-foreground transition-colors" style={{ border: '1px solid var(--border)' }}>
                  <BookOpen className="w-4 h-4" />Official Docs
                </a>
              </div>
            </div>
            {/* Right side: quick stat cards instead of image */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <Zap className="w-5 h-5" />, title: "No Mempool", desc: "Gulf Stream forwards txs directly to leaders. Traditional frontrunning is impossible." },
                { icon: <Cpu className="w-5 h-5" />, title: "Parallel Execution", desc: "Sealevel runs non-conflicting txs simultaneously on multiple CPU threads." },
                { icon: <Hash className="w-5 h-5" />, title: "Cryptographic Clock", desc: "PoH creates a verifiable timeline via SHA-256 hash chaining — no time consensus needed." },
                { icon: <Lock className="w-5 h-5" />, title: "PDAs = Trustless", desc: "Program-owned accounts with no private key enable fully non-custodial protocols." },
              ].map(c => (
                <div key={c.title} className="bg-card rounded-xl p-4 card-hover" style={{ border: '1px solid var(--border)' }}>
                  <div className="w-9 h-9 rounded-lg mb-3 flex items-center justify-center text-green" style={{ background: 'var(--secondary)' }}>{c.icon}</div>
                  <div className="font-bold text-sm mb-1">{c.title}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ───────────────────────────────────────────────────── */}
      {/* ── 8 INNOVATIONS ────────────────────────────────────────────────── */}
      <section id="consensus" className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-8">
          <span className="text-xs font-mono text-green uppercase tracking-widest">Architecture</span>
          <h2 className="text-3xl font-black mt-2">Solana's 8 Core Innovations</h2>
          <p className="text-muted-foreground mt-2">The layered tech stack that makes Solana fast — click each for the official deep-dive</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: "Proof of History", desc: "SHA-256 hash chain = cryptographic clock. Orders events without time consensus.", icon: <Clock className="w-4 h-4" />, url: "https://solana.com/solana-whitepaper.pdf" },
            { name: "Tower BFT",        desc: "PBFT with exponential lockout. 2/3 stake = confirmed. 32 votes = finalized.", icon: <RefreshCw className="w-4 h-4" />, url: "https://docs.solana.com/implemented-proposals/tower-bft" },
            { name: "Turbine",          desc: "BitTorrent-style block propagation via erasure-coded shreds. O(n log n) bandwidth.", icon: <Network className="w-4 h-4" />, url: "https://solana.com/news/turbine---solana-s-block-propagation-protocol-solves-the-scalability-trilemma" },
            { name: "Gulf Stream",      desc: "Mempool-less tx forwarding. Leaders pre-cache txs before their slot begins.", icon: <Wifi className="w-4 h-4" />, url: "https://solana.com/news/gulf-stream--solana-s-mempool-less-transaction-forwarding-protocol" },
            { name: "Sealevel",         desc: "Parallel smart contract runtime. Non-overlapping accounts = simultaneous execution.", icon: <Cpu className="w-4 h-4" />, url: "https://medium.com/solana-labs/sealevel-parallel-processing-thousands-of-smart-contracts-d814b378192" },
            { name: "Pipelining",       desc: "Transaction Processing Unit (TPU) pipelines fetch/verify/bank/write stages.", icon: <Layers className="w-4 h-4" />, url: "https://docs.solana.com/validator/tpu" },
            { name: "Cloudbreak",       desc: "Horizontally-scaled accounts DB using memory-mapped files for O(1) account lookup.", icon: <Database className="w-4 h-4" />, url: "https://solana.com/news/cloudbreak---solana-s-horizontally-scaled-state-architecture" },
            { name: "Archivers",        desc: "Distributed ledger storage via Proof of Replication — offloads historical data.", icon: <HardDrive className="w-4 h-4" />, url: "https://solana.com/news/archivers---solana-s-solution-to-petabytes-of-blockchain-data-storage " },
          ].map((item) => (
            <a key={item.name} href={item.url} target="_blank" rel="noopener noreferrer"
              className="bg-card rounded-xl p-4 card-hover group cursor-pointer flex flex-col gap-2" style={{ border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md flex items-center justify-center text-green transition-colors" style={{ background: 'var(--secondary)' }}>
                  {item.icon}
                </div>
                <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <div className="font-bold text-sm">{item.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── TX LIFECYCLE ────────────────────────────────────────────────── */}
      <section id="flow" style={{ borderTop: '1px solid var(--border)', background: 'var(--card)' }}>
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="mb-10">
            <span className="text-xs font-mono text-green uppercase tracking-widest">Data Flow</span>
            <h2 className="text-3xl font-black mt-2">Transaction Lifecycle</h2>
            <p className="text-muted-foreground mt-2">Click each step for a detailed explanation — understanding this is essential for debugging dropped txs</p>
          </div>
          <div className="flex flex-wrap gap-0 items-center">
            {flowSteps.map((s, i) => (
              <div key={s.step} className="flex items-center">
                <button
                  onClick={() => setSelectedStep(s)}
                  className="flex flex-col items-center bg-background rounded-xl px-5 py-4 w-32 card-hover cursor-pointer group transition-all"
                  style={{ border: '1px solid var(--border)' }}>
                  <span className="text-xs font-mono mb-1 group-hover:scale-110 transition-transform" style={{ color: 'var(--green)' }}>{s.step}</span>
                  <span className="font-bold text-sm text-foreground">{s.label}</span>
                  <span className="text-xs text-muted-foreground text-center mt-1">{s.desc}</span>
                </button>
                {i < flowSteps.length - 1 && (
                  <div className="flex items-center px-1">
                    <div className="w-6 h-px" style={{ background: 'rgba(20,241,149,0.4)' }} />
                    <ArrowRight className="w-3 h-3" style={{ color: 'rgba(20,241,149,0.4)' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-10 grid md:grid-cols-3 gap-4">
            {[
              { level: "Processed",   desc: "Leader received and processed the tx. Not yet voted on by validators. Can still be dropped or roll back. Use for real-time UI feedback only.", style: { border: '1px solid rgba(136,136,136,0.3)', color: 'var(--muted-foreground)' } },
              { level: "Confirmed",   desc: "2/3+ of stake voted on the block. Extremely unlikely to roll back — safe for most UX purposes (NFT mints, token swaps, game actions).", style: { border: '1px solid rgba(20,241,149,0.4)', color: 'var(--green)' } },
              { level: "Finalized",   desc: "Block has been rooted (32 consecutive votes). Mathematically irreversible. Use for large value transfers, cross-chain bridges, irreversible actions.", style: { background: 'var(--green)', color: 'var(--background)' } },
            ].map((c) => (
              <div key={c.level} className="bg-background rounded-xl p-4" style={{ border: '1px solid var(--border)' }}>
                <div className="inline-flex text-xs font-bold px-2 py-0.5 rounded mb-2" style={c.style}>{c.level}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONCEPTS GRID ───────────────────────────────────────────────── */}
      <section id="concepts" className="max-w-7xl mx-auto px-6 py-20">
        <div className="mb-10">
          <span className="text-xs font-mono text-green uppercase tracking-widest">Reference</span>
          <h2 className="text-3xl font-black mt-2">Core Concepts</h2>
          <p className="text-muted-foreground mt-2">Click any card for deep-dives with production code, common mistakes, and resources</p>
        </div>
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
              style={{
                background: activeCategory === cat ? 'var(--green)' : 'transparent',
                color: activeCategory === cat ? 'var(--background)' : 'var(--muted-foreground)',
                border: `1px solid ${activeCategory === cat ? 'var(--green)' : 'var(--border)'}`,
              }}>
              {cat}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <button key={c.title} onClick={() => setSelectedConcept(c)}
              className="bg-card rounded-xl p-5 card-hover cursor-pointer text-left group w-full"
              style={{ border: '1px solid var(--border)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-green transition-colors" style={{ background: 'var(--secondary)' }}>
                  {c.icon}
                </div>
                <span className={`text-xs font-semibold rounded px-2 py-0.5 ${tagColors[c.tag]}`}>{c.tag}</span>
              </div>
              <h3 className="font-bold text-base mb-2 group-hover:text-green transition-colors">{c.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">{c.desc}</p>
              <ul className="space-y-1.5">
                {c.details.slice(0, 3).map((d) => (
                  <li key={d} className="flex items-center gap-2 text-xs font-mono">
                    <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--green)' }} />
                    <span className="text-muted-foreground">{d}</span>
                  </li>
                ))}
              </ul>
              {c.commonMistakes && (
                <div className="mt-3 flex items-center gap-1.5 text-xs" style={{ color: 'rgba(234,179,8,0.7)' }}>
                  <AlertTriangle className="w-3 h-3" />
                  <span>{c.commonMistakes.length} common mistakes covered</span>
                </div>
              )}
              <div className="mt-3 flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--green)' }}>
                <Terminal className="w-3 h-3" /> Deep dive: code + mistakes + resources
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── MEV SECTION ─────────────────────────────────────────────────── */}
      <section id="mev" style={{ borderTop: '1px solid var(--border)', background: 'var(--card)' }}>
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="mb-10">
            <span className="text-xs font-mono text-green uppercase tracking-widest">MEV Deep Dive</span>
            <h2 className="text-3xl font-black mt-2">How MEV Works on Solana</h2>
            <p className="text-muted-foreground mt-2">From no-mempool fundamentals to Jito bundles and sandwich attack mechanics</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-muted-foreground leading-relaxed mb-6 text-sm">
                Solana has no mempool — transactions go directly to the current leader via Gulf Stream. This makes traditional frontrunning harder, but Jito Labs built a parallel block engine that enables MEV bundles. By 2024-2025, Jito tips exceeded $500M/year — dwarfing inflation rewards for top validators. Click each item to expand.
              </p>
              <div className="space-y-2">
                {mevItems.map((item) => (
                  <div key={item.id} className="rounded-xl overflow-hidden" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
                    <button
                      onClick={() => setExpandedMev(expandedMev === item.id ? null : item.id)}
                      className="w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-opacity-80">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--green)' }} />
                      <div className="flex-1">
                        <span className="font-semibold text-sm">{item.title}</span>
                        <span className="text-muted-foreground text-sm"> — {item.desc}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedMev === item.id ? "rotate-180" : ""}`} />
                    </button>
                    {expandedMev === item.id && (
                      <div className="px-4 pb-4 pt-0 text-sm text-muted-foreground leading-relaxed" style={{ borderTop: '1px solid var(--border)' }}>
                        {item.extra}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <a href="https://jito-labs.gitbook.io/mev/searcher-resources/getting-started" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green text-background px-4 py-2.5 rounded font-semibold text-sm hover:opacity-90">
                  Jito Docs <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a href="" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-foreground px-4 py-2.5 rounded font-semibold text-sm hover:border-green/50 transition-colors"
                  style={{ border: '1px solid var(--border)' }}>
                  MEV Guide <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-background rounded-xl p-5" style={{ border: '1px solid var(--border)' }}>
                <div className="text-xs font-mono mb-1" style={{ color: 'var(--green)' }}>// Optimal Priority Fee Strategy</div>
                <div className="text-xs text-muted-foreground mb-3">Simulate → Get market rate → Set both limit + price</div>
                <pre className="text-xs font-mono text-foreground leading-relaxed overflow-x-auto">{`// 1. Simulate to get exact CU usage
const sim = await connection.simulateTransaction(tx);
const cuUsed = sim.value.unitsConsumed!;
const cuLimit = Math.ceil(cuUsed * 1.1); // +10% buffer

// 2. Get current market fee rate
const fees = await connection.getRecentPrioritizationFees([
  myHotAccount  // fees for accounts YOUR tx touches
]);
const p75 = fees.sort((a,b)=>a.prioritizationFee-b.prioritizationFee)
  [Math.floor(fees.length * 0.75)].prioritizationFee;

// 3. Build tx with BOTH instructions (order matters!)
const tx = new Transaction().add(
  ComputeBudgetProgram.setComputeUnitLimit({ units: cuLimit }),
  ComputeBudgetProgram.setComputeUnitPrice({ microLamports: p75 }),
  yourInstruction
);`}</pre>
              </div>
              <div className="bg-background rounded-xl p-5" style={{ border: '1px solid var(--border)' }}>
                <div className="text-xs font-mono mb-1" style={{ color: 'var(--green)' }}>// Jito Bundle (Atomic MEV)</div>
                <div className="text-xs text-muted-foreground mb-3">All txs succeed or all fail — enables trustless arb</div>
                <pre className="text-xs font-mono text-foreground leading-relaxed overflow-x-auto">{`// Bundle = [arbTx, tipTx]
// If arb fails → tip tx also fails → validator earns nothing
// This ensures validators only include profitable bundles

const tipAccount = randomJitoTipAccount();
const tipTx = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: searcher.publicKey,
    toPubkey: tipAccount,
    lamports: 50_000, // your bid (0.00005 SOL)
  })
);

// Bundle: arbTx must execute before tipTx
const bundle = new Bundle([arbTx, tipTx], 5);
const bundleId = await jitoClient.sendBundle(bundle);
console.log("Submitted bundle:", bundleId);`}</pre>
              </div>
              <div className="bg-background rounded-xl p-5" style={{ border: '1px solid var(--border)' }}>
                <div className="text-xs font-mono mb-1" style={{ color: 'var(--green)' }}>// Anti-Sandwich: Tight Slippage</div>
                <div className="text-xs text-muted-foreground mb-3">0.5% slippage = sandwich unprofitable for most bots</div>
                <pre className="text-xs font-mono text-foreground leading-relaxed overflow-x-auto">{`// Jupiter swap with MEV protection
const swapResp = await fetch("https://quote-api.jup.ag/v6/swap", {
  method: "POST",
  body: JSON.stringify({
    quoteResponse,
    userPublicKey: wallet.publicKey.toBase58(),
    slippageBps: 50, // 0.5% — tight = sandwich unprofitable
    // Jupiter uses Jito for ordering protection:
    prioritizationFeeLamports: {
      jitoTipLamports: 10_000
    },
  })
});`}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── QUICK LINKS ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-8">
          <span className="text-xs font-mono text-green uppercase tracking-widest">Resources</span>
          <h2 className="text-3xl font-black mt-2">Essential Links</h2>
          <p className="text-muted-foreground mt-2">The best resources for each area of Solana development</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { label: "Solana Docs",          url: "https://docs.solana.com",                           icon: <BookOpen className="w-4 h-4" />,  desc: "Official reference" },
            { label: "Solana Cookbook",      url: "https://solanacookbook.com",                        icon: <Code2 className="w-4 h-4" />,     desc: "Practical recipes" },
            { label: "Helius Blog",          url: "https://www.helius.dev/blog",                        icon: <Eye className="w-4 h-4" />,       desc: "Deep technical posts" },
            { label: "QuickNode Guides",     url: "https://www.quicknode.com/guides/solana-development",icon: <Zap className="w-4 h-4" />,       desc: "Dev tutorials" },
            { label: "Jito Labs Docs",       url: "https://docs.jito.wtf/",                  icon: <Flame className="w-4 h-4" />,     desc: "MEV infrastructure" },
            { label: "Anchor Docs",          url: "https://www.anchor-lang.com/docs",                  icon: <Lock className="w-4 h-4" />,      desc: "Program framework" },
            { label: "Solana Playground",    url: "https://beta.solpg.io",                             icon: <Terminal className="w-4 h-4" />,  desc: "Browser IDE" },
            { label: "Solscan Explorer",     url: "https://solscan.io",                                icon: <Database className="w-4 h-4" />,  desc: "Tx & account explorer" },
            { label: "web3.js Docs",         url: "https://www.helius.dev/blog/how-to-start-building-with-the-solana-web3-js-2-0-sdk",     icon: <Server className="w-4 h-4" />,    desc: "JS client SDK" },
            { label: "Solana FM",            url: "https://solana.fm",                                 icon: <Globe className="w-4 h-4" />,     desc: "Developer explorer" },
            { label: "Yellowstone gRPC",     url: "https://docs.helius.dev/data-streaming/yellowstone-grpc", icon: <Activity className="w-4 h-4" />, desc: "High-perf streaming" },
            { label: "Stakewiz Validators",  url: "https://stakewiz.com",                              icon: <Shield className="w-4 h-4" />,    desc: "Validator analytics" },
          ].map((link) => (
            <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-card rounded-xl card-hover group" style={{ border: '1px solid var(--border)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-green flex-shrink-0 transition-colors" style={{ background: 'var(--secondary)' }}>
                {link.icon}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium group-hover:text-green transition-colors truncate">{link.label}</div>
                <div className="text-xs text-muted-foreground">{link.desc}</div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </a>
          ))}
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--border)' }} className="px-6 py-8">
  <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
    
    <div className="flex items-center gap-2">
      <span className="font-bold text-sm">SolRef</span>
    </div>

    <p className="text-xs text-muted-foreground text-center">
      {concepts.length} concepts · {flowSteps.length} lifecycle steps · Production code examples · Built for Solana devs
    </p>

    <div className="flex items-center gap-3">
      
      <a
        href="https://docs.solana.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-muted-foreground hover:text-green transition-colors"
      >
        Solana Docs
      </a>

      {/* X Logo */}
      <a
        href="https://x.com/Rachit_twts"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:opacity-80 transition-opacity"
      >
        <img
          src="https://img.freepik.com/free-vector/new-twitter-logo-x-icon-black-background_1017-45427.jpg?semt=ais_rp_progressive&w=740&q=80"
          alt="X"
          className="w-4 h-4"
        />
      </a>

    </div>
  </div>
</footer>

      {/* ── MODALS ──────────────────────────────────────────────────────── */}
      {selectedConcept && <ConceptModal concept={selectedConcept} onClose={() => setSelectedConcept(null)} />}
      {selectedStep    && <FlowModal    step={selectedStep}       onClose={() => setSelectedStep(null)}    />}
    </div>
  );
};

export default Index;
