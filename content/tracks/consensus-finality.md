---
id: consensus-finality
sequence: 6
prerequisites:
  - core-foundations
title: Consensus & Finality
domain: PoH, Tower BFT, voting, Alpenglow
outcome: You can distinguish the retired Tower model from live Votor consensus
  and explain what changed for apps and infrastructure.
conceptIds:
  - blocks-slots
  - proof-of-history
  - tower-bft
  - epochs-validators
  - alpenglow
checkpoints:
  - Slot vs block
  - PoH in the Tower era
  - Tower lockouts
  - Votor certificates
  - Current commitment semantics
sourceNotes:
  - Under Tower, PoH supplied the ledger-encoded clock used for vote lockouts;
    PoH no longer paces block production under Alpenglow.
  - Votor replaced Tower on mainnet in epoch 1064; Rotor remains planned for a
    later, unscheduled phase.
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

Trace PoH's former role, Tower's lockouts, Votor certificates, current commitment levels, and the Alpenglow migration.
