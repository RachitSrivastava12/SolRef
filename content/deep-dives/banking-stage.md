---
id: banking-stage
conceptId: banking-stage
thesis: "Banking Stage is where Sealevel becomes real: the scheduler turns
  declared account access into parallel batches, then commits successful writes
  into a Bank."
stages:
  - Verified queue
  - Conflict scheduler
  - Worker execution
  - Bank commit
  - PoH record
sourceNotes:
  - Engineering Solana describes Banking Stage as a pipelined process inside the
    larger TPU pipeline.
  - The Bank lifecycle is open -> frozen -> rooted; rooted state is squashed
    into AccountsDB after consensus.
  - Vote and non-vote transactions are intentionally separated to protect
    liveness under load.
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: unclassified
aiAssisted: unknown
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Anza — the central scheduler
    url: https://www.anza.xyz/blog/solana-transaction-scheduler
    sourceKind: primary
  - label: Helius — how Solana transactions land
    url: https://www.helius.dev/blog/how-to-land-transactions-on-solana
    sourceKind: secondary
title: Banking Stage & The Scheduler
---

## Hot Path

### The scheduler decides usable throughput

Solana can only parallelize transactions whose account access does not conflict. A sophisticated scheduler can fill more of the block with useful work by choosing compatible transactions and respecting priority signals.

#### Key points

- Two writable accesses to the same account serialize.
- Read-only shared accounts are cheap; writable global accounts are bottlenecks.
- Tight compute estimates help the scheduler pack the block without over-reserving budget.

## Bank Lifecycle

### Open, frozen, rooted

A Bank is the slot-local state snapshot the leader mutates while producing a block. When the slot closes, the Bank freezes, computes its final hash, and can later become rooted after consensus.

#### Key points

- Open banks can process transactions and collect state deltas.
- Frozen banks no longer accept writes and expose the hash validators vote on.
- Rooted banks make state permanent and allow older fork data to be cleaned.

## Liveness

### Votes are not just another transaction class

The dedicated vote paths are a protocol-safety decision. A unified queue might look cleaner, but it risks user traffic delaying the votes needed for the chain to keep moving.

#### Key points

- Non-vote transactions need conflict-aware scheduling.
- Vote transactions are consensus-critical and have a different processing profile.
- Alpenglow changes this area by moving finality votes away from the normal transaction hot path.

## Program Design

### Your account layout is performance engineering

A protocol with one giant mutable state account can sabotage Solana's parallel runtime. Splitting state into per-user, per-market, or per-position accounts gives the Banking Stage more independent work.

#### Key points

- Prefer many small writable state accounts over one global mutable account.
- Keep shared config accounts read-only inside hot instructions.
- Use local fee market behavior as a signal that a state shard is too hot.
