---
id: fee-economics
order: 17
title: Fee Economics
tag: Economics
level: intermediate
icon: BarChart3
diagramKey: null
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: current
exampleStatus: needs-expert-verification
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Transaction Fees Docs
    url: https://solana.com/docs/core/fees/fee-structure
    sourceKind: primary
  - label: Fee Market Deep Dive — Helius
    url: https://www.helius.dev/blog/solana-local-fee-markets
    sourceKind: secondary
  - label: getFeeForMessage RPC
    url: https://solana.com/docs/rpc/http/getfeeformessage
    sourceKind: primary
aiAssisted: unknown
codeLanguage: typescript
---

## Overview

Solana transaction fees have two parts. The base fee is currently 5,000 lamports per signature; half is burned and half goes to the block-producing validator. Legacy and v0 transactions can add a priority fee based on their requested compute limit; v1 sets a total priority fee in the message. The validator receives all of the priority fee. Fees are charged even if execution fails.

## Key facts
- Base fee: currently 5,000 lamports per transaction signature
- Multi-sig tx with 2 sigs = 10,000 lamports base fee
- 50% of the base fee is burned; 50% goes to the block-producing validator
- Legacy/v0 priority fee: price per CU × requested CU limit, converted from microlamports to lamports
- v1 priority fee: total amount in lamports set in the message config
- 100% of the priority fee goes to the block-producing validator
- Failed transactions still pay the fee
- 1 SOL = 1,000,000,000 lamports
- `getFeeForMessage` estimates the total network fee for a legacy or v0 message.
- The current RPC method does not accept v1 messages; use the SDK or service that supports v1.
- Account storage minimum depends on the account's exact data size; query it separately

## Why it matters

Fees matter when you estimate transaction cost and design onboarding. The base fee is not the whole cost: account storage balances, priority fees, and protocol-specific charges may also apply. Burning half the base fee does not by itself tell you whether SOL supply is inflating or deflating overall.

## Common mistakes
- Mixing the account storage balance with the transaction fee
- Applying the legacy/v0 CU price formula to a v1 transaction
- Treating a recent fee sample as a guarantee of inclusion
- Not accounting for the fact that failed transactions still pay fees

## Example

```typescript
import { Connection, Transaction, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "finalized");

// Build the transaction first, including any compute limit and priority price.
// Then ask the RPC for the total network fee. Do not add the priority fee
// again: this estimate already includes it for legacy and v0 messages.
async function inspectTransaction(transaction: Transaction): Promise<void> {
  const fee = await connection.getFeeForMessage(
    transaction.compileMessage(),
    "finalized",
  );

  if (fee.value === null) {
    throw new Error("The RPC could not estimate a fee for this message");
  }

  console.log("Estimated network fee:", fee.value, "lamports");

// Recent samples can help you choose a priority fee for accounts your
// transaction writes to. They describe recent observations, not a guarantee.
const hotAccount = transaction.feePayer;
if (hotAccount) {
  const samples = await connection.getRecentPrioritizationFees([hotAccount]);
  console.log("Recent priority-fee samples:", samples.slice(-5));
}

// Account storage is a separate balance. Query the current minimum for the
// exact account size instead of treating it as part of the transaction fee.
const accountDataSize = 165;
const storageMinimum = await connection.getMinimumBalanceForRentExemption(accountDataSize);
console.log("Storage minimum:", storageMinimum, "lamports");
}
```

## References
- [Solana fee structure](https://solana.com/docs/core/fees/fee-structure)
- [Solana compute budget](https://solana.com/docs/core/fees/compute-budget)
- [getFeeForMessage RPC](https://solana.com/docs/rpc/http/getfeeformessage)
- [getRecentPrioritizationFees RPC](https://solana.com/docs/rpc/http/getrecentprioritizationfees)
