---
id: jito
order: 36
title: "Jito: Bundles & Block Engine"
tag: MEV
level: advanced
icon: GitBranch
diagramKey: null
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: current
exampleStatus: needs-expert-verification
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Jito Labs Docs
    url: https://docs.jito.wtf/lowlatencytxnsend/
    sourceKind: primary
  - label: Helius — MEV on Solana & Jito
    url: https://www.helius.dev/blog/solana-mev-an-introduction
    sourceKind: secondary
aiAssisted: unknown
codeLanguage: typescript
---

## Overview

Jito provides transaction and MEV infrastructure for Solana validators and searchers. Its Block Engine accepts ordered bundles of up to five signed transactions, runs auctions, and forwards selected bundles to participating leaders. A bundle executes in order and all-or-nothing within one slot. Tips compete for scarce block space, but do not guarantee inclusion.

## Key facts
- A bundle contains up to 5 transactions and runs them in order, atomically, within one slot.
- A bundle needs a tip transfer to one of Jito's designated tip accounts to be considered by the auction.
- The Block Engine runs off-chain auctions and forwards selected bundles to participating leaders.
- A bundle only guarantees ordering among its own transactions if the bundle lands; it cannot guarantee placement around an unrelated user's transaction.
- If a bundle lands, its transactions execute in order and all-or-nothing in the same slot. A submission response alone does not mean it landed.
- Protocol priority fees and Jito bundle tips are separate payments with different roles.
- Jito also operates JitoSOL, a liquid staking product; it is separate from bundle mechanics.

## Why it matters

Solana does not have one global public pending-transaction pool, but providers, validators, and private relays can handle transactions before they land. Jito bundles provide one way to bid for ordered, atomic execution. Builders should consider their users' slippage, transaction routing, and trust assumptions rather than assuming bundles eliminate all MEV.

## Common mistakes
- Assuming every Solana transaction goes through Jito or a public pending pool
- Assuming a tip guarantees the bundle will land
- Assuming a bundle can control its position relative to unrelated transactions
- Confusing protocol priority fees with bundle tips

## Example

```typescript
// Searchers submit signed transactions to Jito's Block Engine.
import { VersionedTransaction } from "@solana/web3.js";

// A bundle has up to five signed transactions. If it lands, they execute
// in this order and all succeed together. Add a tip using a current tip account.
async function sendBundle(txs: VersionedTransaction[]) {
  if (txs.length === 0 || txs.length > 5) {
    throw new Error("A bundle must contain between 1 and 5 transactions");
  }
  const encoded = txs.map((t) => Buffer.from(t.serialize()).toString("base64"));
  const res = await fetch("https://mainnet.block-engine.jito.wtf/api/v1/bundles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0", id: 1, method: "sendBundle",
      params: [encoded, { encoding: "base64" }],
    }),
  });
  if (!res.ok) throw new Error(`Jito request failed: ${res.status}`);
  const result = await res.json();
  if (result.error) throw new Error(result.error.message);
  if (!result.result) throw new Error("Jito did not return a bundle ID");
  return result.result as string; // Check this ID with getBundleStatuses.
}

async function getBundleStatus(bundleId: string) {
  const res = await fetch("https://mainnet.block-engine.jito.wtf/api/v1/bundles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0", id: 1, method: "getBundleStatuses",
      params: [[bundleId]],
    }),
  });
  if (!res.ok) throw new Error(`Jito request failed: ${res.status}`);
  const result = await res.json();
  if (result.error) throw new Error(result.error.message);
  return result.result?.value?.[0] ?? null;
}

// Bundle transactions are ordered relative to one another only.
// A tip may improve an auction result, but cannot guarantee inclusion.
```

This helper submits already signed transactions; it does not build the tip transfer. Include a transfer to a current Jito tip account in one of the bundle transactions, then check the returned bundle ID with `getBundleStatuses` to see whether it landed.

## References
- [Jito Labs Docs](https://docs.jito.wtf/lowlatencytxnsend/)
- [Jito Docs — Low Latency Transaction Send and Bundles](https://docs.jito.wtf/lowlatencytxnsend/)
- [Helius — MEV on Solana & Jito](https://www.helius.dev/blog/solana-mev-an-introduction)
