---
id: proof-of-history
order: 3
title: Proof of History (PoH)
tag: Consensus
level: intermediate
icon: Hash
diagramKey: poh
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: unclassified
exampleStatus: needs-expert-verification
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: PoH Original Whitepaper
    url: https://solana.com/solana-whitepaper.pdf
    sourceKind: primary
  - label: Solana Architecture Blog Post
    url: https://solana.com/news/8-innovations-that-make-solana-the-first-web-scale-blockchain
    sourceKind: primary
  - label: Solana Foundation — Alpenglow changes to PoH and the Clock sysvar
    url: https://solana.com/upgrades/alpenglow
    sourceKind: primary
  - label: Clock Sysvar Docs
    url: https://solana.com/docs/core/accounts/account-types
    sourceKind: primary
aiAssisted: unknown
codeLanguage: typescript
---

## Overview

Proof of History (PoH) is a sequence of SHA-256 hashes where each result feeds the next. In the old Tower BFT design, validators used this sequence to help order ledger entries and estimate how much time had passed. Alpenglow replaced Tower with Votor, and PoH no longer paces mainnet block production.

## Key facts
- Each hash depends on the previous hash, so the sequence has a verifiable order.
- In the former Tower design, PoH helped pace ledger entries and provided timing context for votes.
- PoH did not decide which fork became final; Tower BFT did that.
- Alpenglow replaced Tower BFT with Votor on mainnet.
- PoH no longer paces block production, and the Clock sysvar timestamp has a new source.
- Mainnet's 200ms slot target is a separate network setting, not a PoH hash interval.
- Historical PoH hashes and entries were part of ledger data; PoH was not a program that apps called.

## Why it matters

PoH is useful background for understanding Solana's older Tower-based design. For current mainnet behavior, use the Alpenglow and Votor model. Applications should read current slots and timestamps from RPC or the Clock sysvar instead of trying to derive them from PoH.

## Common mistakes
- Confusing PoH with consensus; Votor is the live mainnet consensus protocol.
- Thinking PoH alone prevents conflicting transactions from becoming final.
- Assuming PoH still paces mainnet blocks or supplies the Clock sysvar timestamp.
- Assuming app programs can call PoH as an on-chain service.

## Example

```typescript
// PoH is internal validator machinery; applications cannot call it directly.
// Read current consensus data through RPC instead.
import { Connection, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("mainnet-beta"), "finalized");
const slot = await connection.getSlot("finalized");
console.log("Current finalized slot:", slot);

// Current block timestamps and transaction order are returned by RPC.
const block = await connection.getBlock(slot, {
  commitment: "finalized",
  transactionDetails: "signatures",
  // Pass 1 to read active v1 transactions. Use a recent SDK with v1 read support.
  maxSupportedTransactionVersion: 1,
});

if (block) {
  console.log("Transactions in this block:", block.signatures.length);
}
```

## References
- [PoH Original Whitepaper](https://solana.com/solana-whitepaper.pdf)
- [Solana Architecture Blog Post](https://solana.com/news/8-innovations-that-make-solana-the-first-web-scale-blockchain)
- [Solana Foundation — Alpenglow changes to PoH and the Clock sysvar](https://solana.com/upgrades/alpenglow)
- [Clock Sysvar Docs](https://solana.com/docs/core/accounts/sysvars)
