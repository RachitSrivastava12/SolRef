---
id: local-fee-markets
order: 37
title: Local Fee Markets
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
  - label: Solana — fee structure
    url: https://solana.com/docs/core/fees/fee-structure
    sourceKind: primary
  - label: Solana RPC — recent prioritization fee samples
    url: https://solana.com/docs/rpc/http/getrecentprioritizationfees
    sourceKind: primary
  - label: Helius — local fee markets
    url: https://www.helius.dev/blog/solana-local-fee-markets
    sourceKind: secondary
aiAssisted: unknown
codeLanguage: typescript
---

## Overview

Transactions list the accounts they read and write. When many transactions need the same writable account, such as one busy pool, they compete for access to it. Transactions that use unrelated accounts may face less of that account-level contention. This is one reason people describe Solana's fee market as local. The scheduler still weighs transaction reward and resource cost; there is no simple fixed fee charged to every transaction that touches one account.

## Key facts

- A writable account can be changed by only one transaction at a time.
- Transactions that only read the same account can run together.
- A popular writable account can limit parallel work that depends on it.
- Priority fees can help a transaction compete for scheduling, but do not guarantee inclusion.
- `getRecentPrioritizationFees` returns recent samples and can filter them to transactions that wrote every account in the supplied list.
- Recent samples are a guide, not a quote for a future transaction.

## Why it matters

Account layout affects parallel execution. A program that puts unrelated users' state in one writable account can create a shared bottleneck. Splitting state may allow more transactions to proceed independently, but it also changes program design and must preserve the program's security rules.

## Common mistakes

- Assuming every transaction touching one account pays a separate fixed account fee.
- Assuming fee samples guarantee that a transaction will be included.
- Querying samples without the writable accounts your transaction actually uses.
- Making an account writable when the instruction only needs to read it.

## Example

```typescript
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "finalized");

// Pass the writable accounts used by your transaction. The RPC returns recent
// samples for transactions that locked all of these addresses as writable.
async function readRecentSamples(writableAccounts: PublicKey[]) {
  const samples = await connection.getRecentPrioritizationFees(writableAccounts);
  console.log("Recent samples:", samples.slice(-5));
  // Review these together with transaction simulation and current fee guidance.
}
```

## References

- [Solana — fee structure](https://solana.com/docs/core/fees/fee-structure)
- [Solana RPC — getRecentPrioritizationFees](https://solana.com/docs/rpc/http/getrecentprioritizationfees)
- [Helius — local fee markets](https://www.helius.dev/blog/solana-local-fee-markets)
