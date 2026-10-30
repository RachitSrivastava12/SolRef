---
id: sandwich
order: 19
title: Sandwich Attacks & Protection
tag: MEV
level: advanced
icon: Flame
diagramKey: null
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: current
exampleStatus: needs-expert-verification
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Jupiter — Solana Swap API
    url: https://dev.jup.ag/docs/swap
    sourceKind: primary
  - label: Jito — low-latency transaction send and bundles
    url: https://docs.jito.wtf/lowlatencytxnsend/
    sourceKind: primary
  - label: Solana — transaction fees
    url: https://solana.com/docs/core/fees/fee-structure
    sourceKind: primary
aiAssisted: unknown
codeLanguage: typescript
---

## Overview

A sandwich attack places one trade before a user's swap and another after it. The first trade moves the price against the user; the second attempts to profit after the user's trade. It can happen when an attacker can observe or infer a swap and influence the order in which transactions execute. Solana has no single public pending-transaction pool, but that does not make every transaction private.

## Key facts

- A sandwich tries to profit from the price impact of a user's swap.
- Thin liquidity and large trades can make price impact larger, but do not guarantee an attack.
- A slippage limit sets the worst output the user will accept. If the swap cannot meet it, the swap should fail.
- A tighter slippage limit can reduce the accepted price movement, but can also make a trade fail during normal price changes.
- Private transaction routes may reduce public exposure, but protections depend on the route and are not a guarantee.
- An atomic bundle controls the order of its own transactions if included; it cannot promise where unrelated transactions appear around it.

## Why it matters

Swap interfaces should show both the expected output and the minimum output the user accepts. Choose slippage based on the token, liquidity, and price movement. Avoid fixed values that claim to be safe for every market. If an app uses an aggregator or private route, explain what that service does and what it cannot guarantee.

## Common mistakes

- Treating one slippage setting as safe for every token and pool.
- Describing private routing as complete MEV protection.
- Assuming Jito bundles are required for a sandwich or that they can control unrelated transaction order.
- Reusing an old swap API endpoint without checking the provider's current documentation.

## Example

```typescript
// Amounts are integers in the token's smallest unit (for example, lamports
// for SOL). Choose slippageBps for your app and market; 100 bps = 1%.
function minimumOutput(quotedOutput: bigint, slippageBps: number): bigint {
  if (!Number.isInteger(slippageBps) || slippageBps < 0 || slippageBps > 10_000) {
    throw new Error("slippageBps must be an integer from 0 to 10,000");
  }

  return quotedOutput * BigInt(10_000 - slippageBps) / 10_000n;
}

const quote = 1_000_000n;
const minOut = minimumOutput(quote, 50); // Example only: accepts up to 0.5% less
console.log("Minimum output in token base units:", minOut.toString());
```

For a live swap, use a maintained API and follow its latest quote, signing, and execution steps. Jupiter's current Swap API uses the v2 `/order` and `/execute` or `/build` and `/submit` paths; the older v6 quote endpoint shown in past examples is no longer the current guide.

## References

- [Jupiter — Solana Swap API](https://dev.jup.ag/docs/swap)
- [Jupiter — order and execute](https://dev.jup.ag/docs/swap/order-and-execute)
- [Jito — low-latency transaction send and bundles](https://docs.jito.wtf/lowlatencytxnsend/)
- [Solana — transaction fee structure](https://solana.com/docs/core/fees/fee-structure)
