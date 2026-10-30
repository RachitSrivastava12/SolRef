---
id: async-execution
order: 24
title: Async Execution & Rising Block Limits
tag: Frontier
level: advanced
icon: Activity
diagramKey: null
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: mixed
exampleStatus: needs-expert-verification
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: SIMD-0256 — raise block limits to 60M
    url: https://github.com/solana-foundation/solana-improvement-documents/blob/main/proposals/0256-raise-block-limits-to-60M.md
    sourceKind: implementation
  - label: SIMD-0286 — raise block limits to 100M
    url: https://github.com/solana-foundation/solana-improvement-documents/blob/main/proposals/0286-raise-block-limits-to-100M.md
    sourceKind: implementation
  - label: Solana Docs — 100M CU Blocks (live status)
    url: https://solana.com/upgrades/100m-cu-blocks
    sourceKind: primary
aiAssisted: unknown
codeLanguage: typescript
---

## Overview

The current mainnet block limit is 100 million compute units (CU), raised from 60 million by SIMD-0286 on July 29, 2026. The limit for one writable account remains 12 million CU. Asynchronous Program Execution (APE) is a separate research direction: it would let validators agree on transaction order separately from calculating the resulting state. APE is not the current execution model.

## Key facts
- 100 million CU per block is live on mainnet; 60 million CU was the previous limit.
- One writable account can use up to 12 million CU in a block.
- A busy block has less room for new transactions; the limit is shared by all transactions in that block.
- The per-transaction CU limit remains at most 1.4 million CU.
- Raising the block limit does not remove account conflicts or guarantee more capacity for a hot account.
- APE and multiple concurrent leaders are research directions, separate from the live 100 million CU limit.

## Why it matters

The block limit matters when many transactions compete to run in the same block. Raising it creates more room overall, but a popular writable account can still hit its 12 million CU limit and force transactions that use it to compete. APE would change how validators order and execute work, but it is not a feature app developers can rely on today.

## Common mistakes
- Assuming the 100 million CU limit increases the per-transaction limit; that remains 1.4 million CU.
- Assuming a hot account gets the same proportional increase; its limit remains 12 million CU per block.
- Describing APE as live or assuming it has changed how programs execute.
- Forgetting that each validator must still process and verify block data.

## Example

```typescript
import { ComputeBudgetProgram, Transaction } from "@solana/web3.js";

// This example uses legacy/v0 Compute Budget instructions.
const tx = new Transaction().add(
  // Set a limit after simulating your actual instructions.
  ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }),
  // Optional: legacy/v0 priority fee = CU price × requested limit.
  ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 50_000 }),
  // ...your real instructions here
);

// Mainnet block limit: 100M CU. Per-writable-account limit: 12M CU.
// A priority fee can affect scheduling, but cannot guarantee inclusion.
```

## References
- [Solana Docs — 100M CU Blocks](https://solana.com/upgrades/100m-cu-blocks)
- [SIMD-0256 — raise block limits to 60M](https://github.com/solana-foundation/solana-improvement-documents/blob/main/proposals/0256-raise-block-limits-to-60M.md)
- [SIMD-0286 — raise block limits to 100M](https://github.com/solana-foundation/solana-improvement-documents/blob/main/proposals/0286-raise-block-limits-to-100M.md)
