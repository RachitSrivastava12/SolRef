---
id: priority-fees
order: 9
title: Priority Fees
tag: MEV
level: beginner
icon: Zap
diagramKey: null
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: current
exampleStatus: needs-expert-verification
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Solana Docs — Fee Structure
    url: https://solana.com/docs/core/fees/fee-structure
    sourceKind: primary
  - label: Solana Docs — Compute Budget
    url: https://solana.com/docs/core/fees/compute-budget
    sourceKind: primary
  - label: Solana RPC — Recent Priority Fee Samples
    url: https://solana.com/docs/rpc/http/getrecentprioritizationfees
    sourceKind: primary
aiAssisted: unknown
codeLanguage: typescript
---

## Overview

A priority fee is an optional extra fee that can help a transaction get scheduled sooner when block space is busy. For legacy and v0 transactions, set a CU limit and a price for each CU with the Compute Budget program. The fee uses the requested limit, not the work actually used. v1 transactions set one total priority fee in the message.

## Key facts
- The base fee is currently 5,000 lamports per transaction signature.
- Legacy/v0 priority fee = `ceil(CU price × requested CU limit ÷ 1,000,000)` lamports.
- A v1 message sets the total priority fee in lamports; it does not use the legacy/v0 formula.
- Recent fee samples can be filtered by the writable accounts a transaction locks.
- The scheduler also considers resource use and account contention. A fee does not guarantee inclusion.
- A transaction still pays its fee if execution fails.
- Half the base fee is burned; all of the priority fee goes to the block-producing validator.

## Why it matters

When many transactions compete for space, a priority fee can improve scheduling priority. It cannot make a transaction reach a leader, and it cannot guarantee that the leader includes it. Simulate first to estimate compute use, then check recent fee samples for the accounts your transaction writes.

## Common mistakes
- Assuming every legacy/v0 transaction gets the same default CU limit; it depends on instruction types.
- Setting a much higher CU limit than needed, which can raise the priority fee.
- Treating recent fee samples as a guarantee or as one price for the whole network.
- Using Compute Budget instructions to configure v1; v1 uses fields in its message.
- Assuming priority fees are burned; the validator receives them.

## Example

```typescript
import { ComputeBudgetProgram, Transaction, TransactionInstruction } from "@solana/web3.js";

// The instructions are the work your app wants the transaction to perform.
function buildLegacyOrV0Transaction(
  instructions: TransactionInstruction[],
  requestedUnits: number,
  microLamportsPerUnit: number,
) {
  const transaction = new Transaction().add(
    ComputeBudgetProgram.setComputeUnitLimit({ units: requestedUnits }),
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: microLamportsPerUnit }),
    ...instructions,
  );

  // This is the priority fee in lamports. The base signature fee is separate.
  const priorityFeeLamports = Math.ceil(
    (microLamportsPerUnit * requestedUnits) / 1_000_000,
  );
  return { transaction, priorityFeeLamports };
}

// These instructions are for legacy/v0. A v1 transaction uses message config fields.
```

## References
- [Solana Docs — Fee Structure](https://solana.com/docs/core/fees/fee-structure)
- [Solana Docs — Compute Budget](https://solana.com/docs/core/fees/compute-budget)
- [Solana RPC — getRecentPrioritizationFees](https://solana.com/docs/rpc/http/getrecentprioritizationfees)
