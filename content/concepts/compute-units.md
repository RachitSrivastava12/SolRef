---
id: compute-units
order: 27
title: Compute Units & Budget
tag: Core Infra
level: intermediate
icon: Cpu
diagramKey: null
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: current
exampleStatus: needs-expert-verification
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Solana Docs — Compute Budget
    url: https://solana.com/docs/core/fees/compute-budget
    sourceKind: primary
  - label: Solana Docs — 100M CU Blocks
    url: https://solana.com/upgrades/100m-cu-blocks
    sourceKind: primary
aiAssisted: unknown
codeLanguage: typescript
---

## Overview

Compute Units (CU) measure the work a transaction does. In legacy and v0 transactions, each non-built-in program instruction gets a default budget of 200,000 CU; most built-in instructions get 3,000 CU. The transaction total is capped at 1.4 million CU. A `SetComputeUnitLimit` instruction can change that limit. If execution uses more than the limit, the transaction fails and its fee is still charged.

## Key facts
- Legacy/v0 default: 200,000 CU per non-built-in program instruction and usually 3,000 CU per built-in instruction; total cap is 1.4 million CU
- v1 does not use Compute Budget instructions for its limits. Set its compute limit and loaded-account-data limit in the message.
- Mainnet block limit: 100 million CU. The limit for one writable account stays at 12 million CU.
- Priority fee for legacy/v0 uses the requested CU limit, not the amount actually used.
- Simulate the transaction first, then leave a reasonable margin above the measured work.
- In legacy/v0, Compute Budget instructions each use an instruction slot and 150 CU.
- A higher limit does not guarantee a transaction will be included sooner.

## Why it matters

The CU limit sets how much work the transaction may do. Too small and it can fail before finishing. For legacy/v0, setting a much larger limit than needed can also increase the priority fee because that fee uses the requested limit. A simulation gives you a useful estimate, but network conditions and account contention still affect whether a transaction lands.

## Common mistakes
- Assuming the 200,000 CU default applies to every transaction the same way; it is calculated from instruction types
- Setting the limit too low and exhausting the budget
- Setting the maximum without measuring; this can raise legacy/v0 priority fees without helping execution
- Using legacy/v0 Compute Budget instructions to configure a v1 transaction

## Example

```typescript
import {
  ComputeBudgetProgram, Connection, PublicKey, Transaction,
  TransactionInstruction, clusterApiUrl,
} from "@solana/web3.js";

const conn = new Connection(clusterApiUrl("devnet"), "finalized");

// This example configures a legacy/v0 transaction. `instructions` should
// contain the program instructions your app needs to run.
async function buildTransaction(
  payer: PublicKey,
  instructions: TransactionInstruction[],
) {
  const { blockhash } = await conn.getLatestBlockhash("finalized");
  const probe = new Transaction({ feePayer: payer, recentBlockhash: blockhash }).add(
    ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 }),
    ...instructions,
  );

  const simulation = await conn.simulateTransaction(probe, {
    sigVerify: false,
    replaceRecentBlockhash: true,
  });
  if (simulation.value.err) throw new Error("Simulation failed; check the program logs");
  const used = simulation.value.unitsConsumed;
  if (used == null) throw new Error("The RPC did not return compute usage");
  const limit = Math.min(1_400_000, Math.ceil(used * 1.1));

  return new Transaction({ feePayer: payer, recentBlockhash: blockhash }).add(
    ComputeBudgetProgram.setComputeUnitLimit({ units: limit }),
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1_000 }),
    ...instructions,
  );
}
// Legacy/v0 priority fee in lamports is rounded up from:
// microLamports per CU × requested CU limit ÷ 1,000,000.
// Check recent fee samples when choosing a CU price. This does not guarantee inclusion.
```

## References
- [Solana Docs — Compute Budget](https://solana.com/docs/core/fees/compute-budget)
- [Solana Docs — 100M CU Blocks](https://solana.com/upgrades/100m-cu-blocks)
