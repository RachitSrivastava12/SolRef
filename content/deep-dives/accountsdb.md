---
id: accountsdb
conceptId: accountsdb
thesis: AccountsDB is the live state engine, not the historical ledger. It makes
  current account reads fast and validator bootstrapping possible through
  snapshots.
stages:
  - Bank account writes
  - Accounts cache
  - AppendVec storage
  - Accounts index
  - Snapshot
sourceNotes:
  - "Engineering Solana frames AccountsDB as three cooperating layers:
    persistent storage, in-memory index, and caches."
  - AppendVec favors sequential writes instead of in-place mutation, which fits
    Solana's high write pressure.
  - Shrinking uses a careful two-map/guard pattern so background compaction does
    not break hot transaction reads.
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: unclassified
aiAssisted: unknown
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Anza — AccountsDB
    url: https://www.anza.xyz/blog
    sourceKind: primary
  - label: Solana Docs — validator architecture
    url: https://docs.anza.xyz/validator/anatomy
    sourceKind: primary
title: AccountsDB, Snapshots & Ledger
---

## Storage Split

### Current state and history are different products

A normal validator optimizes for replaying the recent chain and serving current state. Old ledger history, indexed history, and analytics are usually externalized to archive nodes or data products.

#### Key points

- The ledger/blockstore records shreds and entries.
- AccountsDB answers what an account looks like now.
- Snapshots let a new validator start from a recent state root instead of replaying from genesis.

## Internals

### Append-only files plus an index

AccountsDB writes account versions into append-only storage and keeps an index to find the latest version. Cleanup, shrinking, and caching are essential because hot accounts update frequently.

#### Key points

- AppendVec-style storage favors fast sequential writes.
- The account index maps pubkeys to the latest storage location.
- Caches smooth the hot path before flush/shrink work compacts storage.

## Compaction

### Shrinking must not pause the hot path

AccountsDB cannot let background cleanup expose inconsistent storage to transaction workers. During shrink, readers may need to find either the old sparse store or the new compacted store.

#### Key points

- The main storage map remains available for the old store while shrinking begins.
- A temporary shrink-in-progress map exposes the new store during the transition.
- When the guard drops, the compacted store swaps into the main map cleanly.
