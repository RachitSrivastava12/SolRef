---
id: banking-stage
order: 35
title: Banking Stage & The Scheduler
tag: System Design
level: advanced
icon: Activity
diagramKey: null
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: unclassified
exampleStatus: needs-expert-verification
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Anza — the central scheduler
    url: https://www.anza.xyz/blog/solana-transaction-scheduler
    sourceKind: primary
  - label: Helius — how Solana transactions land
    url: https://www.helius.dev/blog/how-to-land-transactions-on-solana
    sourceKind: secondary
aiAssisted: unknown
codeLanguage: typescript
---

## Overview

Inside the leader's TPU, the Banking Stage is where verified transactions actually execute and update state. Its scheduler decides which transactions run in parallel without conflicting on account writes — the practical realization of Sealevel. Modern scheduler paths can use conflict/dependency graphs and priority signals instead of blindly feeding thread-local queues.

## Key facts
- Banking Stage = the execution+packing phase of the leader's TPU pipeline
- Takes verified txs, groups non-conflicting ones, executes them across worker threads
- Inputs are split across non-vote, TPU vote, and gossip vote paths
- Conflict = two txs that write the same account; they must serialize
- Schedulers include conflict-graph/priority paths and simpler greedy paths
- The Bank lifecycle is open -> frozen -> rooted
- Frozen Bank hash is what validators vote on; rooted state is squashed into AccountsDB
- Better scheduling = more of the block's compute budget actually used productively
- Priority + compute estimates feed the scheduler's ordering decisions
- Vote isolation protects liveness when non-vote traffic is congested or adversarial

## Why it matters

Sealevel is the idea (parallel execution by declared account access); the Banking Stage scheduler is the implementation that makes or breaks it. The shift to a central scheduler meaningfully raised effective throughput and made inclusion fairer under load. For builders this is the missing link between 'I set a priority fee' and 'my tx landed': the scheduler ranks and packs transactions here, favoring well-specified, non-conflicting, properly-priced txs. It also explains write-lock contention — many txs fighting over one hot account serialize through this stage and bottleneck.

## Common mistakes
- Blaming the network when a hot, contended account is serializing all your txs in banking
- Assuming parallel execution is automatic — conflicting account writes still serialize
- Ignoring how priority + CU estimates influence scheduler ordering, then wondering why txs drop
- Thinking 'block had space' means your tx should have landed — the scheduler still has to pick it

## Example

```typescript
// Banking Stage is validator-internal — no direct API. But you optimize FOR it:
import { ComputeBudgetProgram, Transaction } from "@solana/web3.js";

// 1) Minimize write-lock contention. Spreading writes across many accounts
//    (e.g. per-user PDAs) lets the scheduler parallelize them. One global
//    counter account forces every tx to serialize through banking.

// 2) Give the scheduler accurate signals so it ranks you well:
const tx = new Transaction().add(
  ComputeBudgetProgram.setComputeUnitLimit({ units: 220_000 }),  // tight estimate
  ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 40_000 }), // real bid
  // ...your instructions, touching as few SHARED writable accounts as possible
);

// Design rule of thumb:
//   readable-shared accounts  → parallel-friendly (many readers OK)
//   writable-shared accounts  → contention point (serialize in banking)
// The fewer hot writable accounts you share, the more the scheduler can fan out.
```

## References
- [Anza — the central scheduler](https://www.anza.xyz/blog/solana-transaction-scheduler)
- [Helius — how Solana transactions land](https://www.helius.dev/blog/how-to-land-transactions-on-solana)
