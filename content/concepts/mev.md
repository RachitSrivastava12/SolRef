---
id: mev
order: 8
title: MEV on Solana
tag: MEV
level: advanced
icon: Shield
diagramKey: null
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: current
exampleStatus: needs-expert-verification
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Jito — low-latency transaction send and bundles
    url: https://docs.jito.wtf/lowlatencytxnsend/
    sourceKind: primary
  - label: Solana — transaction fees
    url: https://solana.com/docs/core/fees/fee-structure
    sourceKind: primary
  - label: Helius — MEV on Solana
    url: https://www.helius.dev/docs/sending-transactions/backrun-rebates#what-is-mev
    sourceKind: secondary
aiAssisted: unknown
codeLanguage: typescript
---

## Overview

Maximal Extractable Value (MEV) is value gained by choosing which transactions to include and in what order. Examples include arbitrage, liquidations, back-running, and sandwich attacks. Solana does not have one shared public pending-transaction pool, but transactions can travel through RPCs, private relays, and validator queues before they land.

## Key facts

- Transaction order can change the result of a trade or liquidation.
- Some MEV, such as arbitrage that corrects a price gap, can help markets; other strategies can harm users.
- Jito is one optional transaction-routing and bundle system used by some searchers and validators.
- Jito bundles contain up to five signed transactions and execute in order, atomically, in one slot if included.
- A bundle tip and a Solana priority fee are separate payments.
- Tips and priority fees can affect an auction or scheduling, but neither guarantees inclusion.

## Why it matters

If your app submits swaps or liquidations, users need clear limits on the price or amount they will accept. Review transaction routing, fee behavior, and failure handling. A private route or bundle can change who sees an order and how it is submitted, but it cannot promise a particular result in every slot.

## Common mistakes

- Assuming that no public pending pool means nobody can observe order flow.
- Treating all MEV as a sandwich attack or assuming every arbitrage harms users.
- Assuming a Jito tip guarantees a bundle will land.
- Confusing a Solana priority fee with a Jito bundle tip.

## Example

```typescript
import { VersionedTransaction } from "@solana/web3.js";

// Provide signed transactions in the order they should run. Include a
// transaction that pays a tip to a current Jito tip account, as required by
// Jito's bundle rules. Build and sign these transactions before submitting.
async function submitBundle(signedTransactions: VersionedTransaction[]) {
  if (signedTransactions.length === 0 || signedTransactions.length > 5) {
    throw new Error("A Jito bundle can contain up to five transactions");
  }

  const encoded = signedTransactions.map((transaction) =>
    Buffer.from(transaction.serialize()).toString("base64"),
  );

  const response = await fetch("https://mainnet.block-engine.jito.wtf/api/v1/bundles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "sendBundle",
      params: [encoded, { encoding: "base64" }],
    }),
  });

  if (!response.ok) throw new Error(`Jito request failed: ${response.status}`);
  const result = await response.json();
  if (result.error) throw new Error(result.error.message);

  // A bundle ID means the Block Engine accepted the request. Check its status
  // separately; acceptance does not mean the bundle was included.
  return result.result as string;
}
```

## References

- [Jito — low-latency transaction send and bundles](https://docs.jito.wtf/lowlatencytxnsend/)
- [Solana — transaction fee structure](https://solana.com/docs/core/fees/fee-structure)
- [Helius — MEV on Solana](https://www.helius.dev/docs/sending-transactions/backrun-rebates#what-is-mev)
