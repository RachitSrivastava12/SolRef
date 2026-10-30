---
id: rent
order: 28
title: Rent & Rent Exemption
tag: Core Infra
level: beginner
icon: HardDrive
diagramKey: null
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: current
exampleStatus: needs-expert-verification
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Solana Docs — Account Structure and Storage Balance
    url: https://solana.com/docs/core/accounts/account-structure
    sourceKind: primary
  - label: Helius — Solana accounts & rent
    url: https://www.helius.dev/blog/solana-account-model
    sourceKind: secondary
aiAssisted: unknown
codeLanguage: typescript
---

## Overview

An account with data must hold a minimum balance based on its size. The runtime and RPC still call this the "rent-exempt minimum," but ongoing rent collection is disabled. Treat the balance as a refundable storage deposit: when an account can be closed, its remaining lamports can be recovered.

## Key facts
- Storage minimum formula: `(data size + 128) × current lamports-per-byte rate`
- The mainnet rate was 5,080 lamports per byte after the second SIMD-0437 step in September 2026; more reductions are planned. Check the live rate or query the RPC instead of hardcoding it.
- At 5,080 lamports per byte, a zero-data account needs 650,240 lamports; a 128-byte account needs 1,300,480 lamports. These examples change with the rate.
- The storage balance is not a transaction fee. Closing an account can return its balance.
- Ongoing rent collection is disabled; the account's `rent_epoch` field is deprecated.
- `getMinimumBalanceForRentExemption(size)` returns the current minimum for a given data size.
- The maximum account data size is 10 MiB; the required storage balance grows with data size.
- Account creation and closure may also require transaction fees and program-specific instructions.

## Why it matters

The minimum balance ties an account's storage size to a refundable amount of SOL. When creating an account, ask the RPC for the minimum for its exact data size instead of copying a number from an example. Close accounts only when your program's rules allow it, then return the remaining lamports to the right recipient.

## Common mistakes
- Guessing the minimum instead of querying it for the exact data size
- Treating the storage balance as a transaction fee; it is held by the account
- Assuming every account can be closed by any program; only its owner can debit its lamports

## Example

```typescript
import { Connection, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "finalized");

// Ask the RPC for the current minimum for the exact account data size.
const dataSizeBytes = 165;
const minimumLamports = await connection.getMinimumBalanceForRentExemption(dataSizeBytes);
console.log("Storage minimum:", minimumLamports, "lamports");
```

## References
- [Solana Docs — Reduced Rent upgrade status](https://solana.com/upgrades/reduced-rent)
- [Solana Docs — Account Structure](https://solana.com/docs/core/accounts/account-structure)
- [Helius — Solana accounts & rent](https://www.helius.dev/blog/solana-account-model)
