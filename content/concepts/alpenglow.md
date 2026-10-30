---
id: alpenglow
order: 21
title: Alpenglow Consensus
tag: Frontier
level: advanced
icon: Zap
diagramKey: null
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: current
exampleStatus: needs-expert-verification
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Solana Foundation — Alpenglow status and technical details
    url: https://solana.com/upgrades/alpenglow
    sourceKind: primary
  - label: Solana Foundation — BLS pubkeys and Validator Admission Ticket
    url: https://solana.com/upgrades/bls-pubkey-vat
    sourceKind: primary
  - label: Anza — Alpenglow is live on mainnet
    url: https://www.prnewswire.com/news-releases/alpenglow-is-live-on-solana-the-worlds-fastest-finality-on-a-global-network-302915579.html
    sourceKind: secondary
  - label: SIMD-0326 — Alpenglow consensus
    url: https://github.com/solana-foundation/solana-improvement-documents/blob/main/proposals/0326-alpenglow.md
    sourceKind: implementation
  - label: Anza — original Alpenglow design
    url: https://www.anza.xyz/blog/alpenglow-a-new-consensus-for-solana
    sourceKind: primary
aiAssisted: unknown
codeLanguage: typescript
---

## Overview

Alpenglow is Solana's live mainnet consensus protocol. Votor replaced Tower BFT at epoch 1064 on October 21, 2026: validators exchange votes directly and aggregate BLS signatures into certificates instead of putting vote transactions in blocks. Votor targets roughly 150ms finality. Rotor, the planned replacement for Turbine's block propagation, is a later phase and is not yet scheduled.

## Key facts
- Live on mainnet since epoch 1064, October 21, 2026; shipped in Agave 4.3
- Votor replaces Tower BFT with direct validator votes and aggregate BLS certificates
- Vote transactions are no longer included in blocks
- Votor targets roughly 150ms finality and tolerates 20% adversarial plus 20% offline stake
- Rotor is planned for a later release; it is not live or scheduled and would replace Turbine
- The Foundation's current migration guide lists Agave-based clients for Alpenglow and says Firedancer and Frankendancer are not supported for that migration; check the guide for changes.
- Validators need a registered BLS key and 0.8 SOL VAT per epoch; an unpaid fee stops voting and block production the next epoch
- Mainnet slot time is 200ms after a separate rollout; finality time and slot time are different
- Execution is unchanged: SVM programs, transactions, and fees work as before
- On mainnet, `confirmed` and `finalized` currently describe the same state; new code should prefer `finalized` because `confirmed` is planned for removal.
- A slot can contain multiple candidate banks; Geyser tags each event with `bank_id`

## Why it matters

Alpenglow has replaced Tower BFT on mainnet, so validator voting no longer adds vote transactions to blocks. The Foundation targets finality in roughly 150ms, down from about 12.8 seconds. For app builders, execution and transaction formats stay the same, but `confirmed` and `finalized` now report the same consensus state. Infrastructure that consumes blocks, Geyser streams, vote data, or timestamps needs to account for the protocol changes.

## Common mistakes
- Assuming Rotor is already live — Votor is live; Rotor is a later, unscheduled phase
- Confusing roughly 150ms finality with the separate 200ms mainnet slot time
- Expecting Alpenglow to change SVM execution, program code, or transaction formats
- Treating `confirmed` and `finalized` as different levels of consensus on mainnet today.
- Building new code around `confirmed` without accounting for its planned removal.
- Attributing throughput gains to Alpenglow — it changes consensus and finality latency

## Example

```typescript
// Alpenglow is a validator protocol change; apps still read transaction
// status through RPC. Use `finalized` for new confirmation flows.
import { Connection, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("mainnet-beta"), "finalized");
const signature = process.env.SIGNATURE!; // Base58 signature from your app
const status = await connection.getSignatureStatus(signature, {
  searchTransactionHistory: true,
});

console.log("Status:", status.value?.confirmationStatus ?? "not found by this RPC");
// On mainnet, `confirmed` and `finalized` currently describe the same state.
// `processed` is provisional and may be rolled back.

// Indexers and stream consumers should review the upgrade notes for bank_id,
// multiple candidate banks per slot, vote transactions, and Clock timestamps.
```

## References
- [Solana Foundation — Alpenglow status and technical details](https://solana.com/upgrades/alpenglow)
- [Solana Foundation — BLS pubkeys and Validator Admission Ticket](https://solana.com/upgrades/bls-pubkey-vat)
- [Anza — Alpenglow is live on mainnet](https://www.prnewswire.com/news-releases/alpenglow-is-live-on-solana-the-worlds-fastest-finality-on-a-global-network-302915579.html)
- [SIMD-0326 — Alpenglow consensus](https://github.com/solana-foundation/solana-improvement-documents/blob/main/proposals/0326-alpenglow.md)
- [Anza — original Alpenglow design](https://www.anza.xyz/blog/alpenglow-a-new-consensus-for-solana)
