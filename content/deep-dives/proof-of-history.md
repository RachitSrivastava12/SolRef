---
id: proof-of-history
conceptId: proof-of-history
thesis: >
  Proof of History is a sequential SHA-256 hash chain that helped order
  ledger entries in the former Tower design. It is historical context on
  mainnet now: Votor replaced Tower, and PoH no longer paces block production.
stages:
  - Tower-era leader ran SHA-256(prev) on one core
  - Transactions were recorded as entries in the stream
  - PoH entries paced slots in the former Tower design
  - Validators checked the recorded chain during replay
  - Tower voted on forks identified by the PoH ledger
sourceNotes:
  - Under Tower, PoH supplied timing context used with vote lockouts; it did
    not replace consensus.
  - SHA-256 is deterministic and collision-resistant, so validators can check
    that the recorded hash sequence follows the same inputs.
  - The Tower-era leader generated hashes in sequence; validators checked the
    recorded sequence during ledger replay.
  - Mainnet now targets 200ms slots through a separate slot-time setting.
  - "Boundary to hold onto: PoH is part of the historical Tower model; Votor now
    handles mainnet consensus, and PoH no longer paces block production."
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: unclassified
aiAssisted: unknown
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
title: Proof of History (PoH)
---

## First Principles

### A sequential hash chain

Each output of the hash becomes the next input: h(n+1) = sha256(h(n)). The next value depends on the previous one, so the sequence can be checked in order. In the former Tower design, validators used the chain as timing and ordering context. Hash count alone is not a universal measurement of real-world seconds: hardware and protocol settings matter, and PoH no longer paces current mainnet blocks.

#### Key points

- Each hash depends on the previous result, which makes the sequence's order easy to verify.
- SHA-256 is deterministic, so the same input produces the same output.
- Under Tower, hash counts gave validators a shared timing reference; they were not a standalone wall clock.

## The Asymmetry

### Sequential generation, independent checks

In the Tower-era design, a leader generated the PoH sequence in order. Other validators checked the recorded sequence as part of replaying ledger data. This was part of the old timing design; PoH no longer paces current mainnet block production.

#### Key points

- Each new hash used the previous hash as its input.
- Validators checked the recorded sequence while replaying the ledger.
- The hash sequence provided historical timing context; it did not by itself finalize a block.

## Recording

### Tower-era transactions were stamped into the stream

Under Tower, the leader interleaved transaction hashes into the PoH sequence, creating entries — chunks of ordered transactions anchored to a point in the hash chain. That position fixed the transaction's order in the old ledger model. Alpenglow changed block production: PoH no longer paces it, and tick entries have left the shred stream.

#### Key points

- A transaction hash was mixed into the Tower-era chain, anchoring its place in that history.
- Entries were the unit Turbine broke into shreds and propagated.
- Ticks advanced the old clock between entries; they no longer appear in the shred stream.

## Why It Matters

### It gave Tower shared timing context

In Solana's Tower era, PoH supplied a ledger-based clock. Tower used that agreed history to express vote lockouts without a separate time-agreement round. Alpenglow changed that model: Votor now handles consensus, PoH no longer paces block production, and tick entries have left the shred stream.

#### Key points

- This describes the previous Tower BFT design, not current Votor consensus.
- Tower vote lockouts (2, 4, 8, … slots) were tied to the PoH-paced ledger.
- The Clock sysvar timestamp has a new source under Alpenglow; do not assume the old derivation.

## The Boundary

### PoH orders; it does not finalize

PoH is not consensus. It formed part of the Tower-era timing and ledger model, while Tower votes determined which fork became canonical. Alpenglow has replaced Tower BFT with Votor. The Foundation says PoH no longer paces block production, so older descriptions of its ordering and clock role should be read as historical context.

#### Key points

- Tower BFT was the previous consensus; Votor is live on mainnet.
- PoH no longer paces block production under Alpenglow.
- The Clock sysvar timestamp now has a different source.
- Confusing 'ordered' with 'final' leads to releasing funds on `processed` — a rollback-prone state.

## Failure Mode

### Ordered does not mean included

Solana does not have one shared public pending-transaction pool. A transaction can be signed, forwarded by an RPC, or visible to a service without being included in a block. Private routes and provider queues may exist. PoH does not tell an app whether its transaction landed, so clients should check transaction status separately.

#### Key points

- A recent blockhash bounds the window (~150 slots) in which a transaction can still be recorded.
- `processed` is provisional; on mainnet, `confirmed` and `finalized` now describe the same consensus state.
- A dropped transaction is a networking/scheduling outcome, not a contradiction of PoH.
