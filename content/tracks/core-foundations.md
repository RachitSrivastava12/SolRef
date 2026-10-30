---
id: core-foundations
sequence: 1
prerequisites: []
title: Core Foundations
domain: Transactions, accounts, instructions, clusters
outcome: You can describe how a transaction carries instructions and signatures,
  where account state lives, and what commitment tells an app.
conceptIds:
  - transactions
  - versioned-tx
  - blocks-slots
  - accounts-model
  - instructions-cpis
  - signatures
  - clusters
  - priority-fees
checkpoints:
  - Transaction vs instruction
  - Account owner vs account data
  - Signer and writable requirements
  - Cluster and commitment choices
sourceNotes:
  - Start with the data model and vocabulary before following validator
    internals.
  - Use the linked concept references to check limits, commitments, and account
    behavior against current documentation.
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: unclassified
aiAssisted: unknown
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
phase: 1
---

## Summary

Learn the objects and vocabulary every Solana infrastructure topic builds on.
