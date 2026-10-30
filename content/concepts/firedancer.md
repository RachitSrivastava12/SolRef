---
id: firedancer
order: 22
title: Firedancer & Validator Clients
tag: Frontier
level: advanced
icon: Flame
diagramKey: null
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: mixed
exampleStatus: needs-expert-verification
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Firedancer source code and releases
    url: https://github.com/firedancer-io/firedancer
    sourceKind: implementation
  - label: Solana Foundation — Alpenglow compatibility guidance
    url: https://solana.com/upgrades/alpenglow
    sourceKind: primary
aiAssisted: unknown
codeLanguage: typescript
---

## Overview

Firedancer is an independently built Solana validator client from Jump Crypto, written in C. Frankendancer combines Firedancer components with parts of the Agave client. The Firedancer repository publishes mainnet-ready releases, but Solana Foundation's Alpenglow migration guidance says Firedancer and Frankendancer were not supported for that migration. A release label alone does not confirm compatibility with every live protocol change; operators should check current guidance before running a client.

## Key facts
- Agave is Anza's Rust validator client.
- Frankendancer is a hybrid; it is different from the full Firedancer client.
- Firedancer uses a tile-based design and its own networking implementation.
- Independent implementations can reduce shared-software risk, but do not guarantee that bugs cannot disrupt the network.
- The network still requires every supported client to follow the same protocol rules.
- Check current compatibility and release notes before choosing a client.

## Why it matters

Client diversity matters because a bug shared by every client can affect the whole network. A second implementation gives operators another codebase, but clients still need to agree on the protocol. Performance depends on hardware, configuration, workload, and whether the client supports the network's current upgrades.

## Common mistakes
- Thinking Firedancer is a new blockchain or token; it is validator software for Solana.
- Treating a mainnet-ready release as proof of support for every current consensus upgrade.
- Confusing the Frankendancer hybrid with the full Firedancer client.
- Assuming client diversity removes the need for compatible protocol implementations.

## Example

```typescript
// Apps do not call Firedancer; validator operators run client software.
// RPC can show node versions, but this response is not a complete measure of
// client adoption or a compatibility check.
import { Connection } from "@solana/web3.js";
const conn = new Connection("https://api.mainnet.solana.com");

const nodes = await conn.getClusterNodes();
console.log("Total gossip nodes:", nodes.length);

// Group by the version string each responding node reports.
const byVersion: Record<string, number> = {};
for (const n of nodes) {
  const v = n.version ?? "unknown";
  byVersion[v] = (byVersion[v] ?? 0) + 1;
}
console.table(byVersion);
// Some nodes may not report a version, and this RPC result does not prove
// which client a given amount of stake is running.
```

## References
- [Firedancer source code and releases](https://github.com/firedancer-io/firedancer/releases)
- [Solana Foundation — Alpenglow compatibility guidance](https://solana.com/upgrades/alpenglow)
