---
id: tx-lifecycle
order: 4
title: Transaction Lifecycle
tag: Data Flow
level: beginner
icon: Activity
diagramKey: lifecycle
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: current
exampleStatus: needs-expert-verification
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: "Helius: How Solana Transactions Work"
    url: https://www.helius.dev/blog/how-to-land-transactions-on-solana
    sourceKind: secondary
  - label: Solana Commitment Levels Docs
    url: https://solana.com/docs/rpc
    sourceKind: primary
  - label: "QuickNode: Guide to Optimizing Solana Transactions"
    url: https://www.quicknode.com/guides/solana-development/transactions/how-to-optimize-solana-transactions
    sourceKind: secondary
aiAssisted: unknown
codeLanguage: typescript
---

## Overview

A transaction goes through several steps: a client signs and sends it, an RPC forwards it, a leader processes it, and validators reach consensus. On mainnet after Alpenglow, `confirmed` and `finalized` currently describe the same state; `processed` remains provisional. Use `finalized` in new code because `confirmed` is planned for removal in a later release.

## Key facts
- Processed: an RPC node has seen a provisional result; it may still be rolled back.
- Confirmed and finalized now describe the same Alpenglow consensus state
- Votor finalizes with off-chain validator votes and aggregate certificates, rather than 32 Tower lockouts
- Blockhash expiry creates an implicit tx timeout (~30 seconds at the 200ms mainnet slot target)
- RPC preflight can simulate a transaction before forwarding it.
- sendTransaction ≠ confirmed — you must poll separately
- Transactions can drop at RPC, network, or leader layer
- Use lastValidBlockHeight for reliable expiry detection

## Why it matters

Solana has no single shared public pending-transaction pool, but RPC providers and validators may queue transactions. Sending a transaction does not confirm it. Check its status, and if its blockhash expires, build and sign a new transaction before trying again. On mainnet, `processed` is provisional while `confirmed` and `finalized` currently describe the same consensus state.

## Common mistakes
- Treating the signature returned by `sendTransaction` as confirmation.
- Retrying a transaction that executed and failed; the fee was still charged.
- Reusing a transaction after its blockhash expires instead of signing a fresh one.
- Treating `processed` as final; it is provisional.

## Example

```typescript
import { Connection, Keypair, Transaction, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "finalized");

// Build the transaction's instructions first. The payer must have enough SOL
// for the transfer, any account setup, and the network fee.
async function sendAndConfirm(transaction: Transaction, payer: Keypair) {
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("finalized");

  transaction.feePayer = payer.publicKey;
  transaction.recentBlockhash = blockhash;
  transaction.sign(payer);

  const signature = await connection.sendRawTransaction(transaction.serialize(), {
    skipPreflight: false,
    preflightCommitment: "finalized",
  });

  const result = await connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    "finalized",
  );

  if (result.value.err) {
    // State changes rolled back, but the transaction fee was charged.
    throw new Error(`Transaction failed: ${JSON.stringify(result.value.err)}`);
  }

  return signature;
}

// If the blockhash expires before the transaction lands, fetch a new one,
// rebuild/re-sign the transaction, and then submit it again. Do not blindly
// retry a transaction that already executed and returned an instruction error.
```

## References
- [Helius: How Solana Transactions Work](https://www.helius.dev/blog/how-to-land-transactions-on-solana)
- [Solana commitment levels](https://solana.com/docs/rpc)
- [QuickNode: Guide to Optimizing Solana Transactions](https://www.quicknode.com/guides/solana-development/transactions/how-to-optimize-solana-transactions)
