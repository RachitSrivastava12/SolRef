---
id: rpc-infra
order: 14
title: RPC & Node Infra
tag: System Design
level: beginner
icon: GitBranch
diagramKey: null
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: mixed
exampleStatus: needs-expert-verification
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Helius RPC Docs
    url: https://docs.helius.dev
    sourceKind: secondary
  - label: QuickNode Solana Guides
    url: https://www.quicknode.com/guides/solana-development
    sourceKind: secondary
  - label: Yellowstone gRPC Docs
    url: https://docs.helius.dev/data-streaming/yellowstone-grpc
    sourceKind: secondary
  - label: JSON RPC API Reference
    url: https://solana.com/docs/rpc
    sourceKind: primary
aiAssisted: unknown
codeLanguage: typescript
---

## Overview

An RPC node is how an application reads Solana data, sends transactions, and subscribes to updates. An RPC response tells you what that service observed; it does not guarantee that a transaction will land or that every provider has the same history. Shared public endpoints are useful for development, but are rate-limited and are not intended for production traffic.

## Key facts
- Shared public endpoints may return rate-limit or access errors; their limits can change.
- RPC providers differ in capacity, supported methods, history, and transaction delivery features.
- WebSocket subscriptions can report account, slot, and log updates, but connections can drop.
- History retention depends on the node and provider. Check the oldest slot and test the methods your app needs.
- gRPC streams such as Yellowstone are provider services; reconnect and backfill behavior varies.
- Direct TPU submission is validator infrastructure work, not a normal browser-app replacement for RPC.

## Why it matters

Choose an RPC service that supports the methods, history, throughput, and delivery behavior your app needs. Reuse connections where practical. If you stream updates, plan for reconnects and backfills. Check transaction status separately from the result of sending it.

## Common mistakes
- Assuming a public endpoint has a production capacity or availability guarantee.
- Assuming every provider retains the same amount of transaction history.
- Treating a successful `sendTransaction` response as confirmation.
- Relying on a live subscription without handling disconnects or missing updates.

## Example

```typescript
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

// Use Devnet while learning. In production, put your provider URL in a
// server-side environment variable and follow that provider's API-key rules.
const rpcUrl = process.env.SOLANA_RPC_URL ?? clusterApiUrl("devnet");
const connection = new Connection(rpcUrl, "finalized");

const slot = await connection.getSlot("finalized");
console.log("Latest finalized slot:", slot);

// Replace this environment value with the public key of an account you own.
const accountToWatch = new PublicKey(process.env.ACCOUNT_TO_WATCH!);
const subscriptionId = connection.onAccountChange(
  accountToWatch,
  (account, context) => {
    console.log("Account update at slot:", context.slot);
    console.log("Lamports:", account.lamports);
  },
  "finalized",
);

// When this listener is no longer needed:
await connection.removeAccountChangeListener(subscriptionId);

// A subscription is a live feed, not a permanent event log. If a connection
// drops, reconnect and use the provider's RPC/history tools to catch up.
```

## References
- [Solana RPC overview](https://solana.com/docs/rpc)
- [Choosing an RPC provider](https://solana.com/docs/rpc/providers)
- [Solana WebSocket methods](https://solana.com/docs/rpc/websocket)
- [Helius Yellowstone gRPC docs](https://docs.helius.dev/data-streaming/yellowstone-grpc)
