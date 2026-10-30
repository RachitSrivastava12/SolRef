---
id: quic-swqos
order: 25
title: QUIC & Stake-Weighted QoS
tag: Networking
level: intermediate
icon: Wifi
diagramKey: null
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: current
exampleStatus: needs-expert-verification
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Helius — Stake-Weighted QoS
    url: https://www.helius.dev/blog/stake-weighted-quality-of-service-everything-you-need-to-know
    sourceKind: secondary
  - label: Anza — QUIC & transaction ingest
    url: https://www.anza.xyz/blog
    sourceKind: primary
aiAssisted: unknown
codeLanguage: typescript
---

## Overview

Solana validators receive transactions through QUIC connections. QUIC provides connection management and flow control. Stake-Weighted Quality of Service (SWQoS) can reserve part of a leader's transaction intake for peers whose stake is delegated to that validator. This can help a transaction reach the leader; it does not guarantee execution or confirmation.

## Key facts
- Validator clients use QUIC for transaction ingest; specific limits depend on client configuration.
- SWQoS reserves capacity for stake-weighted peers; the available share and route depend on the validator and RPC provider.
- A staked RPC or validator connection may improve the chance that a transaction reaches a leader under load.
- The network can still drop or delay traffic, and the transaction may still fail or not be selected for a block.
- A priority fee can improve scheduling when block space is contested, but does not replace successful delivery.
- Solana has no single public transaction pool, but RPC providers and validator stages can queue transactions.

## Why it matters

During congestion, a transaction must first reach a leader and then be selected for execution. QUIC manages the connection; SWQoS can give stake-weighted peers reserved intake capacity. These affect delivery probability, not finality, and an RPC's performance depends on its implementation and configuration.

## Common mistakes
- Assuming stake-weighted intake guarantees inclusion or confirmation
- Assuming all RPC providers use the same QUIC and SWQoS configuration
- Assuming a higher priority fee helps if the transaction never reaches a leader
- Re-broadcasting indefinitely without tracking the signature and blockhash expiry

## Example

```typescript
// You don't speak QUIC directly — your RPC's sender does. But the choice of
// sender determines whether you ride a stake-weighted lane. Practical pattern:
import { Connection, VersionedTransaction } from "@solana/web3.js";

// A stake-weighted RPC may have reserved intake capacity. It still cannot
// guarantee that a leader includes or confirms the transaction.
const stakedSender = new Connection(process.env.STAKED_RPC_URL!, "finalized");

async function sendOnce(tx: VersionedTransaction) {
  const signature = await stakedSender.sendRawTransaction(tx.serialize(), {
    skipPreflight: false,
    preflightCommitment: "finalized",
    maxRetries: 3,
  });
  const status = await stakedSender.getSignatureStatus(signature);
  return { signature, status: status.value?.confirmationStatus ?? "pending" };
}
// Keep checking the signature. If the blockhash expires, build and sign a new transaction.
```

## References
- [Helius — Stake-Weighted QoS](https://www.helius.dev/blog/stake-weighted-quality-of-service-everything-you-need-to-know)
- [Anza — QUIC & transaction ingest](https://www.anza.xyz/blog)
