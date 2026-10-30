---
id: transactions
order: 1
title: Transactions
tag: Core Infra
level: beginner
icon: Box
diagramKey: null
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: current
exampleStatus: needs-expert-verification
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Solana Docs — Transactions
    url: https://solana.com/docs/core/transactions
    sourceKind: primary
  - label: Solana Docs — Versioned Transactions
    url: https://solana.com/docs/core/transactions/versioned-transactions
    sourceKind: primary
aiAssisted: unknown
codeLanguage: typescript
---

## Overview

A Solana transaction carries one or more instructions, the accounts they use, a recent blockhash, and the required signatures. The network runs its instructions in order as one unit: if one fails, their state changes are rolled back. The fee is still charged.

## Key facts
- Legacy and v0 transactions: up to 1,232 bytes. Active v1 transactions: up to 4,096 bytes.
- A recent blockhash stays valid for 150 slots. At the current 200ms slot target, that is about 30 seconds, but actual time varies.
- Fee paid in lamports (1 SOL = 10⁹ lamports)
- The three formats are legacy, v0, and v1. Only v0 supports Address Lookup Tables (ALTs).
- Current account limit: 64 accounts per transaction. An ALT can store 256 addresses, but that does not raise the transaction limit.
- Transaction signers use 64-byte Ed25519 signatures. Secp256k1 and other signatures are verified by separate instructions.
- A transaction can require more than one signer.
- A failed transaction rolls back state changes, but still pays its fee.
- When reading blocks or transactions, set `maxSupportedTransactionVersion: 1` and use an SDK that can decode v1. Without that opt-in, an RPC response can fail on a v1 transaction.

## Why it matters

Understanding the format helps you pick the right tools. Legacy and v0 messages have a 1,232-byte limit. v1 allows more bytes, while v0 can shorten account addresses with ALTs. All formats still have a 64-account limit today. If your app reads blocks, make sure its RPC request and SDK support v1 as well as v0.

## Common mistakes
- Reusing a blockhash after its 150-slot lifetime — the transaction will be rejected
- Checking a v1 transaction against the legacy/v0 byte limit, or assuming an ALT raises the 64-account limit
- Sending the same tx multiple times without idempotency protection
- Forgetting that a failed transaction still charges its fee, even though its state changes are rolled back

## Example

```typescript
import {
  Connection, Transaction, SystemProgram,
  sendAndConfirmTransaction, Keypair, LAMPORTS_PER_SOL,
  clusterApiUrl
} from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "finalized");

// ── BASIC: Transfer SOL ─────────────────────────────────────────
const sender = Keypair.generate();
const receiver = Keypair.generate();

// Fund the new sender on devnet before trying to pay a transaction fee.
const airdrop = await connection.requestAirdrop(sender.publicKey, LAMPORTS_PER_SOL);
await connection.confirmTransaction(airdrop, "finalized");

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
  preflightCommitment: "finalized",
});

const confirmation = await connection.confirmTransaction({
  signature: sig,
  blockhash,
  lastValidBlockHeight,     // tx expires if not confirmed by this height
}, "finalized");

if (confirmation.value.err) {
  console.error("Tx failed:", confirmation.value.err);
} else {
  console.log("Confirmed tx:", sig);
  console.log("Explorer:", `https://solscan.io/tx/${sig}?cluster=devnet`);
}

// ── MULTI-INSTRUCTION TX ─────────────────────────────────────────
// If any instruction fails, all state changes in this transaction are reverted.
// The transaction fee is still charged.
const alice = Keypair.generate().publicKey;
const bob = Keypair.generate().publicKey;
const carol = Keypair.generate().publicKey;
const multiTx = new Transaction().add(
  SystemProgram.transfer({ fromPubkey: sender.publicKey, toPubkey: alice, lamports: 1000 }),
  SystemProgram.transfer({ fromPubkey: sender.publicKey, toPubkey: bob,   lamports: 2000 }),
  SystemProgram.transfer({ fromPubkey: sender.publicKey, toPubkey: carol, lamports: 3000 }),
);
multiTx.feePayer = sender.publicKey;
multiTx.recentBlockhash = blockhash;
multiTx.sign(sender);

// ── CHECK TX SIZE ────────────────────────────────────────────────
// Serialize to check byte count before sending
const serialized = tx.serialize({ requireAllSignatures: false });
console.log(`Legacy tx size: ${serialized.length} / 1232 bytes`);
if (serialized.length > 1232) throw new Error("Legacy transaction is too large");
```

## References
- [Solana Docs — Transactions](https://solana.com/docs/core/transactions)
- [Solana Docs — Versioned Transactions](https://solana.com/docs/core/transactions/versioned-transactions)
