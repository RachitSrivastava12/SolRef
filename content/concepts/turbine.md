---
id: turbine
order: 6
title: Turbine Block Propagation
tag: Data Flow
level: intermediate
icon: Network
diagramKey: turbine
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: mixed
exampleStatus: needs-expert-verification
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: "Turbine: Solana's Block Propagation Protocol"
    url: https://solana.com/news/turbine-solana-s-block-propagation-protocol
    sourceKind: primary
  - label: Shred Architecture Deep Dive
    url: https://docs.solanalabs.com/consensus/shreds
    sourceKind: secondary
aiAssisted: unknown
codeLanguage: typescript
---

## Overview

Turbine is Solana's current block-data propagation system. The leader divides block data into smaller pieces called shreds. Validators forward shreds through a stake-weighted tree, and coding shreds help peers recover data they missed. Exact sizes and routing can change with software versions. Rotor is planned as a later replacement, but it is not live.

## Key facts
- Data shreds carry block data; coding shreds provide recovery information.
- Validators forward shreds through a tree whose structure uses stake information.
- A validator can recover missing pieces when it receives enough useful shreds.
- Turbine spreads data without requiring the leader to send every piece directly to every validator.
- Rotor is a planned future design, not part of the live Turbine path.

## Why it matters

Turbine spreads block data across validators instead of making the leader send every piece directly to every validator. Coding shreds can help a validator recover missing data, but propagation depends on network conditions and the validator's place in the tree. It does not make every validator receive a block at the same time.

## Common mistakes
- Assuming every validator sees a block at the same time.
- Treating an RPC block response as proof that every validator received the same shreds.
- Confusing planned Rotor work with the current Turbine system.

## Example

```typescript
import { Connection, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "finalized");

// RPC lets an application read a block. It does not report whether every
// validator has received that block's shreds.
const slot = await connection.getSlot("finalized");
const block = await connection.getBlock(slot, {
  commitment: "finalized",
  transactionDetails: "signatures",
  // Pass 1 to read active v1 transactions. Use a recent SDK with v1 read support.
  maxSupportedTransactionVersion: 1,
});

if (block) {
  console.log(`Block in slot ${slot}: ${block.signatures.length} transactions`);
} else {
  console.log(`No finalized block data returned for slot ${slot}`);
}
```

## References
- [Turbine: Solana's Block Propagation Protocol](https://solana.com/news/turbine-solana-s-block-propagation-protocol)
- [Shred Architecture Deep Dive](https://docs.solanalabs.com/consensus/shreds)
