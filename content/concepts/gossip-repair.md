---
id: gossip-repair
order: 26
title: Gossip & Repair
tag: Networking
level: advanced
icon: RefreshCw
diagramKey: null
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: mixed
exampleStatus: needs-expert-verification
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Solana Docs — Gossip Service
    url: https://docs.anza.xyz/validator/gossip
    sourceKind: primary
  - label: Helius — Turbine, Gossip & Repair
    url: https://www.helius.dev/blog/turbine-block-propagation-on-solana
    sourceKind: secondary
aiAssisted: unknown
codeLanguage: typescript
---

## Overview

Gossip helps validators discover peers and share network information such as contact details and software versions. Repair is a separate recovery process: when a validator is missing block data, it can ask peers for the pieces it needs. Applications usually interact with RPC rather than with either validator protocol directly.

## Key facts
- Gossip shares peer and cluster metadata; it does not carry transaction block data.
- Repair requests missing block-data pieces from peers.
- Coding shreds can help validators recover data when some pieces are missing.
- Validators use gossip information to find peers when joining or reconnecting.
- Gossip, Repair, block propagation, and transaction forwarding are separate network paths.

## Why it matters

Networks lose packets and validators can disconnect. Gossip helps a validator find peers, while Repair can request missing data. Coding shreds also help recover data. These protocols improve recovery, but do not guarantee that every validator receives every update at the same time.

## Common mistakes
- Thinking gossip itself carries full blocks.
- Assuming a validator receives every shred in the same order or at the same time.
- Confusing validator-to-validator networking with an application's RPC connection.
- Treating a public cluster-node list as a complete view of network health.

## Example

```typescript
// Gossip data is observable: getClusterNodes() returns the gossip CRDS view.
import { Connection } from "@solana/web3.js";
const conn = new Connection("https://api.mainnet.solana.com");

const nodes = await conn.getClusterNodes();
// Each entry is a peer's gossiped contact info:
for (const n of nodes.slice(0, 3)) {
  console.log({
    pubkey: n.pubkey,
    gossip: n.gossip,   // gossip ip:port
    tpu:    n.tpu,      // where to send transactions
    rpc:    n.rpc,      // public RPC, if any
    version: n.version, // client version (also gossiped)
  });
}

// You can't query Repair directly from an app — it's validator-internal —
// but its existence is why a node that briefly drops offline rejoins and
// backfills the slots it missed rather than forking off on its own.
```

## References
- [Solana Docs — Gossip Service](https://docs.anza.xyz/validator/gossip)
- [Helius — Turbine, Gossip & Repair](https://www.helius.dev/blog/turbine-block-propagation-on-solana)
