---
id: tower-bft
order: 7
title: Tower BFT
tag: Consensus
level: advanced
icon: RefreshCw
diagramKey: null
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: historical
exampleStatus: needs-expert-verification
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Tower BFT Implemented Proposal
    url: https://docs.anza.xyz/implemented-proposals/tower-bft
    sourceKind: primary
  - label: Solana — Alpenglow and current consensus
    url: https://solana.com/upgrades/alpenglow
    sourceKind: primary
aiAssisted: unknown
codeLanguage: typescript
---

## Overview

Tower BFT was Solana's consensus protocol before Alpenglow activated on mainnet in October 2026. Validators voted for the block they believed belonged to the correct fork. Each vote created a lockout, measured in slots, during which the validator could not vote for a competing fork. Later votes for descendants could extend earlier lockouts. Votor has replaced Tower on mainnet, so this page describes the historical mechanism.

## Key facts
- Built on Practical Byzantine Fault Tolerance (PBFT)
- Historically, validators voted on blocks as part of the Tower consensus process.
- Lockouts were measured in slots, not seconds; later votes for descendants could double earlier lockouts.
- Tower votes appeared as on-chain transactions; Votor uses direct votes and certificates instead.
- Tower's timing and lockout rules do not describe current mainnet finality.
- Tower's vote lockouts are historical; Alpenglow now uses Votor on mainnet.

## Why it matters

Tower helps explain Solana's former consensus design. Finality under Tower typically took around 12.8 seconds; Votor now targets roughly 150ms. These are approximate protocol timings, not promises for every transaction.

## Common mistakes
- Treating Tower lockouts as the current Alpenglow finality rule
- Assuming Tower vote transactions still appear in mainnet blocks
- Applying Tower's old lockout rules to current mainnet transactions.

## Example

```typescript
// Tower BFT is historical. This calculation shows how its vote lockout grew;
// it is a simplified illustration, not the full vote-stack algorithm or the
// confirmation rule used by current mainnet consensus.
function towerLockoutSlots(consecutiveVotes: number): number {
  if (!Number.isInteger(consecutiveVotes) || consecutiveVotes < 1) {
    throw new Error("consecutiveVotes must be a positive integer");
  }
  return 2 ** consecutiveVotes;
}

console.log("After 1 consecutive vote:", towerLockoutSlots(1), "slots");
console.log("After 5 consecutive votes:", towerLockoutSlots(5), "slots");
```

## References
- [Tower BFT Implemented Proposal](https://docs.anza.xyz/implemented-proposals/tower-bft)
- [Vote Program Source](https://github.com/solana-labs/solana/tree/master/programs/vote)
