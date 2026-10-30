---
id: accountsdb
order: 34
title: AccountsDB, Snapshots & Ledger
tag: System Design
level: advanced
icon: Server
diagramKey: null
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: unclassified
exampleStatus: needs-expert-verification
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Anza — AccountsDB
    url: https://www.anza.xyz/blog
    sourceKind: primary
  - label: Solana Docs — validator architecture
    url: https://docs.anza.xyz/validator/anatomy
    sourceKind: primary
aiAssisted: unknown
codeLanguage: typescript
---

## Overview

Validators keep block history and current account state for different jobs. The ledger records block data according to the node's retention settings. AccountsDB stores the latest state for accounts, using files, indexes, and caches. Snapshots package a recent account state so a validator can start from it and replay newer ledger data.

## Key facts
- The ledger stores block and transaction history; a node may delete older ledger data.
- AccountsDB stores the latest state for accounts, with account files, indexes, and caches.
- A snapshot is a saved copy of account state from a particular slot.
- A validator loads a snapshot and replays newer ledger data to catch up.
- Historical data availability depends on the RPC provider and the methods it supports.
- Large account scans can be slow or restricted, depending on the query and provider.

## Why it matters

This split explains why a current account read and a query about old transactions are different requests. A provider may serve current state without retaining every old block. Check history support before relying on it, and use filters or an indexer when searching large account sets.

## Common mistakes
- Assuming every RPC provider retains the same amount of old transaction data.
- Assuming a snapshot contains the full transaction history; it contains account state.
- Requesting a very large account set without checking provider limits or adding filters.
- Confusing the latest account state with the transactions that produced it.

## Example

```typescript
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "finalized");
const account = new PublicKey("11111111111111111111111111111111");

// Read the account's current state.
const currentState = await connection.getAccountInfo(account);
console.log("Current account data bytes:", currentState?.data.length ?? 0);

// Old block and transaction history depends on the RPC provider's retention.
// Check the provider's history range before building an app around it.
```

## References
- [Anza — AccountsDB](https://www.anza.xyz/blog)
- [Solana Docs — validator architecture](https://docs.anza.xyz/validator/anatomy)
