---
id: state-data
sequence: 5
prerequisites:
  - network-propagation
title: State, Data & Observability
domain: AccountsDB, ledger, snapshots, Geyser
outcome: "You can choose the correct read path: direct RPC, archival RPC, Geyser
  stream, DAS, or indexer."
conceptIds:
  - accountsdb
  - geyser
  - state-compression
  - rpc-infra
  - clusters
checkpoints:
  - Current state vs history
  - Snapshot bootstrapping
  - Streaming writes
  - DAS reads
  - RPC limits
sourceNotes:
  - AccountsDB is the live state engine, not an archive of every historical
    interaction.
  - Append-only account files plus a sharded index are the center of the
    performance story.
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: unclassified
aiAssisted: unknown
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
phase: 3
---

## Summary

Distinguish live state, historical ledger data, snapshots, streaming, and compressed state.
