---
id: alpenglow
conceptId: alpenglow
thesis: Alpenglow is Solana's live mainnet consensus protocol. Votor replaced
  Tower BFT at slot 459,653,000 in epoch 1064 on October 21, 2026, removing vote
  transactions from blocks and targeting roughly 150ms finality. Rotor is a
  later, unscheduled phase that is planned to replace Turbine for block
  propagation.
stages:
  - Leader proposes a block
  - Validators exchange votes directly
  - BLS signatures aggregate into certificates off-chain
  - Votor finalizes in one or two voting rounds
  - Rotor is planned for a later release
sourceNotes:
  - Votor is live on mainnet; Rotor is planned for a later release and is not
    yet scheduled.
  - Votor's direct votes and aggregate BLS certificates replaced Tower's
    on-chain vote transactions.
  - Mainnet activation began in epoch 1064; Tower handed off after the migration
    window at slot 459,653,000.
  - PoH no longer paces block production, tick entries leave the shred stream,
    and the Clock sysvar timestamp has a new source.
  - For most app builders, transaction execution is unchanged; `confirmed` and
    `finalized` currently describe the same state; new code should prefer
    `finalized` because `confirmed` is planned for removal.
  - For the migration, validators needed Agave v4.3.2, Jito-Solana v4.3.2, or
    Harmonic Salsa v4.3.2, plus 0.8 SOL above vote-account rent for the VAT fee
    each epoch; Firedancer and Frankendancer were not supported.
  - Anza developed Alpenglow and implemented Votor in Agave; independent
    validators adopted and activated the upgrade.
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: mixed
aiAssisted: unknown
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
title: Alpenglow Consensus
---

## What Changes

### Votor replaces vote transactions with certificates

Under Tower, validators broadcast vote transactions that occupied block space and grew the ledger. Votor changed the mechanism: validators exchange votes directly, sign with BLS keys, and aggregate signatures into certificates outside the normal transaction stream. Tower's vote transactions are no longer included in mainnet blocks.

#### Key points

- BLS aggregation combines validator signatures into compact, verifiable certificates.
- Mainnet blocks no longer contain Tower vote transactions.
- A certificate records the validator agreement used to finalize a block.

## The Latency Math

### Finality in roughly 150ms

Alpenglow replaces Tower's 32-slot rooting path, which took about 12.8 seconds, with Votor's one or two voting rounds. The Solana Foundation gives roughly 150ms as the mainnet finality target. This is finality latency, not block time: mainnet slots separately moved from 400ms to 200ms in October 2026.

#### Key points

- The Foundation's target is roughly 150ms finality, down from about 12.8 seconds under Tower.
- Slot time is 200ms after a separate rollout; don't equate slot duration with finality latency.
- Votor tolerates 20% adversarial stake plus 20% offline stake.

## Rotor

### Rotor is planned for a later phase

Rotor is designed to replace Turbine's multi-hop, stake-weighted tree with a single relay layer for block data. It is not part of the live Votor rollout: the Solana Foundation says Rotor is planned for a later release and has no schedule yet.

#### Key points

- Rotor would replace Turbine's multi-hop tree with a single relay layer.
- Rotor is not live on mainnet and has no scheduled release.
- Turbine remains the active block propagation protocol while Votor is live.

## The Boundary

### Finality upgrade, not an execution rewrite

Alpenglow changes consensus and finality, not how SVM programs run, the scheduler resolves account conflicts, compute budgets are metered, or AccountsDB stores state. Programs and transactions continue to work as before. Infrastructure that consumes block and timestamp data does need to account for the new protocol behavior.

#### Key points

- Banking Stage, account locks, compute budgets, and AccountsDB are unchanged.
- Alpenglow targets finality latency; it is not a throughput upgrade.
- PoH no longer paces block production; tick entries leave the shred stream.
- The Clock sysvar timestamp has a new source under Alpenglow.

## Builder Impact

### Use finalized for new confirmation flows

On mainnet, `confirmed` and `finalized` currently report the same Alpenglow consensus state. `processed` remains provisional and can be rolled back. The Foundation's finality target is roughly 150ms, compared with about 12.8 seconds under Tower. Prefer `finalized` in new code because the Foundation lists `confirmed` for removal in a later release. Operators and indexers should also review the stream and clock changes.

#### Key points

- `processed` is provisional; `confirmed` and `finalized` currently describe the same state.
- New applications should prefer `finalized`; `confirmed` is planned for removal in a later release.
- Most app builders need no migration for transaction execution.
- Geyser consumers should use `bank_id`; a slot can contain more than one candidate bank.
- The migration required Agave v4.3.2, Jito-Solana v4.3.2, or Harmonic Salsa v4.3.2, and 0.8 SOL above vote-account rent for VAT.
