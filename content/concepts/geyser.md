---
id: geyser
order: 33
title: Geyser & Data Streaming
tag: Data Flow
level: intermediate
icon: Eye
diagramKey: null
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: current
exampleStatus: needs-expert-verification
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Yellowstone gRPC (Geyser)
    url: https://github.com/rpcpool/yellowstone-grpc
    sourceKind: secondary
  - label: Solana Docs — Geyser plugins
    url: https://docs.anza.xyz/validator/geyser
    sourceKind: primary
aiAssisted: unknown
codeLanguage: typescript
---

## Overview

Polling RPC (such as `getAccountInfo`) is simple but may add delay and load. Geyser is a validator plugin interface that sends account, transaction, slot, and block updates to a consumer. Services such as Yellowstone gRPC let clients subscribe to filtered streams. A stream is a live connection, so consumers need to handle disconnects, duplicate events, and catch-up.

## Key facts
- A validator operator runs the plugin; an app usually connects to a streaming service.
- Available updates depend on the plugin, validator client, provider, and subscription type.
- Yellowstone gRPC is one open-source Geyser plugin and service interface.
- Filters can reduce the amount of data sent to a client.
- A stream connection can disconnect or miss data during downtime; reconnect and use the provider's replay/backfill features when available.
- Streams can include provisional updates; track slots and commitment status before treating data as final.
- Indexers may use Geyser streams, RPC polling, block data, or a combination of sources.

## Why it matters

If your app needs updates quickly, a stream can reduce the delay of repeated RPC polling. It does not remove the need to store a checkpoint, recover after a disconnect, or decide which commitment level is safe for your use case. For complete historical data, use a provider that offers replay or combine the stream with RPC/backfill queries.

## Common mistakes
- Polling getProgramAccounts in a tight loop instead of subscribing to a stream
- Assuming any stream is complete during a network or provider outage
- Not filtering the stream server-side, then drowning in irrelevant updates
- Treating webhooks/Geyser as exactly-once — design consumers to be idempotent

## Example

```typescript
// Consuming a Yellowstone gRPC (Geyser) stream — subscribe to account writes
// for a specific program. Reconnect and backfill if the stream disconnects.
import Client from "@triton-one/yellowstone-grpc";

const client = new Client("https://your-grpc-endpoint:443", "TOKEN", {});
const stream = await client.subscribe();

stream.on("data", (update) => {
  if (update.account) {
    const a = update.account.account;
    console.log("account changed:", a.pubkey, "lamports:", a.lamports);
    // ...decode and act: update a cache, trigger a liquidation check, etc.
  }
});

// Server-side filter: only stream accounts owned by one program.
stream.write({
  accounts: {
    myFilter: { owner: ["TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"] },
  },
  commitment: 2, // finalized
});
// Store a checkpoint and use the provider's replay/backfill API after reconnecting.
```

## References
- [Yellowstone gRPC (Geyser)](https://github.com/rpcpool/yellowstone-grpc)
- [Solana Docs — Geyser plugins](https://docs.anza.xyz/validator/geyser)
