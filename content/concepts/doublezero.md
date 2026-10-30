---
id: doublezero
order: 23
title: DoubleZero
tag: Frontier
level: advanced
icon: Globe
diagramKey: null
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: unclassified
exampleStatus: needs-expert-verification
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: DoubleZero — Figment first look
    url: https://docs.malbeclabs.com/
    sourceKind: primary
  - label: Kiln — the internet layer for validators
    url: https://docs.malbeclabs.com/architecture/
    sourceKind: primary
aiAssisted: unknown
codeLanguage: typescript
---

## Overview

DoubleZero is a network protocol that connects participating systems over contributed private fiber links and network devices. Its first deployments support blockchain validators and infrastructure such as RPC and MEV services. Features include multicast and filtering at network edges. It is an optional network path; its coverage and performance depend on where it is deployed and how an operator configures it.

## Key facts
- Contributors supply private links and network devices to the shared network.
- Multicast can deliver one stream to multiple subscribers.
- Edge devices can filter traffic before forwarding it into a connected system.
- Validators, RPC services, and other infrastructure can choose to connect.
- The network does not replace the public internet for ordinary app users.
- Latency changes vary by route, region, and deployment; do not assume a fixed improvement.

## Why it matters

For an application developer, DoubleZero is usually infrastructure behind the RPC or validator service. If a provider uses it, the route may affect how quickly data reaches participating systems. It does not change transaction instructions, guarantee faster confirmation, or change what a wallet user needs to do.

## Common mistakes
- Assuming every validator or RPC provider uses DoubleZero.
- Treating a private route as a guarantee of faster transaction confirmation.
- Assuming the network replaces public internet access for wallets and app users.
- Assuming network coverage and performance are identical in every region.

## Example

```typescript
// DoubleZero is network infrastructure, not an application SDK.
// A validator or RPC operator can connect through a route supported by the
// network. Follow the current operator documentation for setup and coverage.
//
// An app still uses its RPC provider to read state and submit transactions.
// Whether a provider uses DoubleZero is an infrastructure choice and does not
// guarantee a specific confirmation time for an individual transaction.
```

## References
- [DoubleZero documentation](https://docs.malbeclabs.com/)
- [DoubleZero architecture](https://docs.malbeclabs.com/architecture/)
