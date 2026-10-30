---
id: gulf-stream
order: 5
title: Gulf Stream
tag: Data Flow
level: intermediate
icon: Wifi
diagramKey: gulfstream
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: mixed
exampleStatus: needs-expert-verification
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Gulf Stream Explained — Solana.com
    url: https://solana.com/news/gulf-stream--solana-s-mempool-less-transaction-forwarding-protocol
    sourceKind: primary
  - label: getLeaderSchedule RPC
    url: https://solana.com/docs/rpc/http/getleaderschedule
    sourceKind: primary
aiAssisted: unknown
codeLanguage: typescript
---

## Overview

Gulf Stream describes Solana's leader-ahead transaction forwarding design. RPCs can use the public leader schedule to forward transactions to current and upcoming leaders. This does not mean transactions never sit in queues: RPC providers, relays, and validator stages can all buffer them.

## Key facts
- The leader schedule lets senders identify current and upcoming leaders.
- RPC and relay forwarding behavior depends on the service and validator client.
- Validators and providers can queue transactions internally even though Solana has no single public pending-transaction pool.
- A recent blockhash expires after 150 slots; a transaction that is not included before expiry cannot be confirmed.
- Sending a transaction returns a signature; check its status to learn whether it was processed or finalized.
- Forwarding does not guarantee that a leader receives or includes the transaction.
- Private order flow and leader-side queues mean the absence of one public pool does not prevent all forms of MEV.

## Why it matters

The forwarding design helps transactions reach a leader before its slot, but your app still needs to check confirmation and expiry. Do not assume a returned signature means the transaction reached a leader or that no one else could see it.

## Common mistakes
- Treating the RPC's returned signature as confirmation
- Retrying with an expired blockhash instead of signing a fresh transaction
- Assuming every RPC or relay forwards transactions in the same way

## Example

```typescript
// Transaction forwarding is handled by the RPC. Your app still checks status
// and blockhash expiry so it can decide whether to retry.

import {
  Connection, Keypair, LAMPORTS_PER_SOL, SystemProgram,
  Transaction, clusterApiUrl,
} from "@solana/web3.js";

// ── UNDERSTAND LEADER SCHEDULE ───────────────────────────────────
// The schedule is available through RPC. Most apps let their RPC provider
// forward transactions instead of sending directly to a leader.

const connection = new Connection(clusterApiUrl("devnet"), "finalized");

// Get the full leader schedule for the current epoch
const leaderSchedule = await connection.getLeaderSchedule();
// Returns: Map<validatorPubkey, slotIndices[]>
// RPC providers can use leader schedule information when forwarding transactions.

// ── GET THE CURRENT AND UPCOMING LEADERS ─────────────────────────
const currentSlot = await connection.getSlot("finalized");

const leaderSlots = await connection.getSlotLeaders(currentSlot, 5);
leaderSlots.forEach((leader, i) => {
  console.log(`Slot ${currentSlot + i}: Leader = ${leader.toBase58()}`);
});

const payer = Keypair.generate();
const receiver = Keypair.generate().publicKey;

// Fund this Devnet payer before sending. Airdrops can be rate-limited.
const airdrop = await connection.requestAirdrop(payer.publicKey, LAMPORTS_PER_SOL);
await connection.confirmTransaction(airdrop, "finalized");

// Fetch a recent blockhash immediately before signing and sending.
const { blockhash, lastValidBlockHeight } =
  await connection.getLatestBlockhash("finalized");
const transaction = new Transaction({
  feePayer: payer.publicKey,
  recentBlockhash: blockhash,
}).add(SystemProgram.transfer({
  fromPubkey: payer.publicKey,
  toPubkey: receiver,
  lamports: 1,
}));
transaction.sign(payer);

// Sending returns a signature; wait for the transaction separately.
const sig = await connection.sendRawTransaction(transaction.serialize(), {
  skipPreflight: false,
  preflightCommitment: "finalized",
  maxRetries: 3,
});
const confirmation = await connection.confirmTransaction({
  signature: sig,
  blockhash,
  lastValidBlockHeight,
}, "finalized");
if (confirmation.value.err) throw new Error("Transaction failed");

// If the blockhash expires before it lands, fetch a new one and sign a new tx.
```

## References
- [Gulf Stream Explained — Solana.com](https://solana.com/news/gulf-stream--solana-s-mempool-less-transaction-forwarding-protocol)
- [getLeaderSchedule RPC](https://solana.com/docs/rpc/http/getleaderschedule)
