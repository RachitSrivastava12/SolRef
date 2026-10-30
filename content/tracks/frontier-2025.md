---
id: frontier-2025
sequence: 8
prerequisites:
  - consensus-finality
title: Frontier · 2025–26
domain: Alpenglow, Firedancer, DoubleZero, async execution
outcome: You can explain what Alpenglow, Firedancer, and DoubleZero change, and
  how finality, client diversity, and propagation affect different parts of the
  network.
conceptIds:
  - alpenglow
  - firedancer
  - doublezero
  - async-execution
checkpoints:
  - Votor vs Tower voting
  - Why client diversity matters
  - Dedicated fiber vs the public internet
  - Ordering decoupled from execution
sourceNotes:
  - "These are independent levers: Alpenglow is latency, Firedancer is
    resilience + throughput headroom, DoubleZero is propagation, async execution
    is the scaling re-architecture."
  - Alpenglow replaced Tower BFT's voting and finality path; it did not replace
    the SVM runtime.
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: unclassified
aiAssisted: unknown
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
phase: 5
---

## Summary

Recent protocol and infrastructure work: live Alpenglow consensus, validator client diversity, a dedicated network layer, and asynchronous execution research.
