---
id: sealevel
conceptId: sealevel
thesis: "Sealevel is the scheduling idea that makes Solana horizontal inside one
  validator: transactions declare account access, so non-conflicting work can
  run at the same time."
stages:
  - Declare accounts
  - Lock read/write sets
  - Batch non-conflicts
  - Execute in SVM
  - Commit account writes
sourceNotes:
  - "Engineering Solana calls out the common confusion: SVM is the VM/execution
    environment; Sealevel is the parallel execution strategy."
  - The developer pays complexity upfront by declaring accounts, and the
    validator earns that back as scheduler parallelism.
  - Hot writable accounts collapse parallelism, no matter how many CPU cores the
    validator has.
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: unclassified
aiAssisted: unknown
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Sealevel Parallel Processing Blog
    url: https://medium.com/solana-labs/sealevel-parallel-processing-thousands-of-smart-contracts-d814b378192
    sourceKind: secondary
  - label: Runtime Compute Budget Docs
    url: https://solana.com/docs/core/programs/program-execution
    sourceKind: primary
  - label: Program Optimization Tips
    url: https://solana.com/docs/core/fees/compute-budget
    sourceKind: secondary
title: Sealevel Runtime
---

## Distinction

### Sealevel is not the whole SVM

The SVM runs instructions under runtime rules. Sealevel is the reason the runtime can feed independent transactions to worker threads without discovering conflicts only after execution begins.

#### Key points

- Every instruction declares the accounts it will read or write.
- Writable overlap forces serialization.
- Read-only program and config accounts can be shared across many transactions.

## Program Design

### Account topology is throughput topology

A protocol's state layout tells the scheduler how much parallelism is possible. Splitting state into independent shards lets the runtime use more of the validator's hardware.

#### Key points

- Per-user, per-position, or per-market accounts usually scale better than one global mutable account.
- Compute units measure work; account locks decide whether that work can run beside other work.
- Local fee markets expose which writable accounts are becoming bottlenecks.
