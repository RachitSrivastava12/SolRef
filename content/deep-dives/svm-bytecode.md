---
id: svm-bytecode
conceptId: svm-bytecode
thesis: The SVM is not just a VM instruction set. It is the runtime boundary
  that meters compute, enforces account ownership, manages invocation context,
  and isolates programs.
stages:
  - SBF bytecode
  - Transaction processor
  - Invoke context
  - Account borrow rules
  - Metered result
sourceNotes:
  - Engineering Solana separates the SVM execution environment from Sealevel's
    parallel scheduling idea.
  - "The InvokeContext is intentionally ephemeral: programs do not get direct
    access to ledger state."
  - Runtime callbacks let the transaction processor ask the Bank for state while
    preserving a clean execution boundary.
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: unclassified
aiAssisted: unknown
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Anza — rBPF VM (GitHub)
    url: https://github.com/anza-xyz/sbpf
    sourceKind: implementation
  - label: Solana Docs — programs & deployment
    url: https://solana.com/docs/core/programs
    sourceKind: primary
title: SVM Bytecode (rBPF / SBF)
---

## Runtime

### Execution is constrained by account metadata

Programs can only touch accounts declared by the transaction and can only mutate data they own. CPI extends the call graph, but the runtime still meters compute and tracks account borrows across calls.

#### Key points

- SBF is the bytecode target; Solana programs are loaded and executed under runtime rules.
- InvokeContext carries the nested call state for CPIs.
- Compute metering prevents one instruction from monopolizing a slot.

## Low Level

### SVM APIs make the runtime portable

A clean runtime interface lets test engines and clients execute Solana transactions without needing the entire validator pipeline. That is why tools like LiteSVM can be fast while still teaching the right execution model.

#### Key points

- The runtime consumes transactions plus account state, then emits account changes and logs.
- Validator stages around it handle networking, scheduling, banking, and propagation.
- Testing at the SVM boundary catches account/compute mistakes earlier than full-cluster tests.
