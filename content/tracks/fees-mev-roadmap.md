---
id: fees-mev-roadmap
sequence: 7
prerequisites:
  - execution-hot-path
  - consensus-finality
title: Fees, MEV & Roadmap
domain: Scheduler economics, Jito, Firedancer, APE
outcome: You can reason about priority fees, local fee markets, MEV ordering,
  and why client performance gates block limit raises.
conceptIds:
  - priority-fees
  - fee-economics
  - local-fee-markets
  - mev
  - jito
  - sandwich
  - firedancer
  - async-execution
  - validator-economics
checkpoints:
  - CU price vs CU limit
  - Hot-account local fees
  - Bundle auctions
  - Client diversity
  - Async execution
sourceNotes:
  - Performance work only matters when it preserves deterministic execution and
    validator replay safety.
  - Firedancer/Frankendancer should be read as validator-client architecture and
    resilience, not an app-facing feature.
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: unclassified
aiAssisted: unknown
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
phase: 4
---

## Summary

Connect inclusion economics with validator clients and the performance upgrades that change the ceiling.
