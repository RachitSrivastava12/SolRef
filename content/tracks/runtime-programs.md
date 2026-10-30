---
id: runtime-programs
sequence: 2
prerequisites:
  - core-foundations
title: Runtime & Program Side
domain: Accounts, Sealevel, SBF, CPI, PDAs
outcome: You can design programs that cooperate with Sealevel instead of
  fighting write locks and account limits.
conceptIds:
  - accounts-model
  - sealevel
  - svm-bytecode
  - memory-allocator
  - instructions-cpis
  - pda
  - signatures
  - compute-units
  - rent
  - lookup-tables
  - token-extensions
checkpoints:
  - Executable vs data accounts
  - Read/write declarations
  - Heap & stack limits
  - CPI call depth
  - PDA signing
  - Signature verification
sourceNotes:
  - The key distinction is SVM as the execution environment and Sealevel as the
    parallel execution strategy around declared account access.
  - Program design is performance design because writable account choices
    determine scheduler parallelism.
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: unclassified
aiAssisted: unknown
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
phase: 2
---

## Summary

Understand the account model and why Solana programs are passed every piece of state they touch.
