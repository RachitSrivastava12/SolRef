---
id: execution-hot-path
sequence: 3
prerequisites:
  - runtime-programs
title: Execution Hot Path
domain: TPU -> Banking -> SVM -> AccountsDB
outcome: You can explain why a transaction lands, drops, serializes on a hot
  account, or becomes visible through RPC.
conceptIds:
  - transactions
  - quic-swqos
  - gulf-stream
  - tx-lifecycle
  - banking-stage
  - svm-bytecode
  - accountsdb
  - turbine
checkpoints:
  - Where packets enter the leader
  - How conflicts are scheduled
  - Where state is mutated
  - Why confirmation is separate from send
sourceNotes:
  - "Engineering Solana frames this as the validator hot path: one transaction's
    journey from QUIC ingress to committed state."
  - The deepest learning value is the handoff between TPU, Banking Stage, SVM,
    Bank, and AccountsDB.
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

Follow one transaction from sender ingress through scheduling, execution, account writes, and block propagation.
