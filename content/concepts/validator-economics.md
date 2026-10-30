---
id: validator-economics
order: 20
title: Validator Economics
tag: Economics
level: advanced
icon: Server
diagramKey: null
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: current
exampleStatus: needs-expert-verification
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Solana — staking
    url: https://solana.com/staking
    sourceKind: primary
  - label: Choose a Validator — Stakewiz
    url: https://stakewiz.com
    sourceKind: secondary
  - label: Top Validators
    url: https://topvalidators.app/
    sourceKind: secondary
aiAssisted: unknown
codeLanguage: typescript
---

## Overview

Validators may receive stake-weighted inflation rewards, a share of transaction fees, and tips from some transaction systems. Mainnet voting validators also pay a 0.8 SOL Validator Admission Ticket (VAT) from the vote account each epoch. Validator income, commission, and operating costs change over time.

## Key facts
- Alpenglow Validator Admission Ticket: 0.8 SOL per epoch from the vote account, above its storage minimum
- Inflation follows a declining schedule; read the current rate from the network.
- Commission is the validator's configured share of staking rewards.
- MEV tips may add to validator revenue, but amounts vary by validator and epoch
- Hardware, bandwidth, electricity, data-center, and voting costs vary by operator
- Validator count, stake concentration, commission, and operating costs change over time; check current network data before comparing operators

## Why it matters

Validator income and operating costs affect whether operators can keep running and how much stake they attract. Compare current performance, commission, stake, and operating needs instead of relying on old validator counts or cost estimates.

## Common mistakes
- Choosing only by commission; uptime, stake, and operator practices also matter.
- Treating vote-account data as a complete measure of profitability.

## Example

```typescript
import { Connection, clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";
const connection = new Connection(clusterApiUrl("mainnet-beta"), "finalized");

// Read live network data. This is not a complete profit calculation: costs,
// off-chain tips, and provider data are not all available through this call.
async function compareCurrentVoteAccounts() {
  const { current: validators } = await connection.getVoteAccounts("finalized");
  const inflation = await connection.getInflationRate();
  const epochInfo = await connection.getEpochInfo();
  console.log("Current validator inflation rate:", inflation.validator);
  console.log("Current epoch:", epochInfo.epoch);

  validators.slice(0, 5).forEach((validator) => {
    console.log({
      voteAccount: validator.votePubkey,
      stakeSol: validator.activatedStake / LAMPORTS_PER_SOL,
      commissionPercent: validator.commission,
      recentCredits: validator.epochCredits.slice(-1),
    });
  });
}
```

## References
- [Solana Foundation — Alpenglow upgrade and validator changes](https://solana.com/upgrades/alpenglow)
- [Solana — Validator Admission Ticket](https://solana.com/upgrades/alpenglow)
- [Choose a Validator — Stakewiz](https://stakewiz.com)
- [Top Validators](https://topvalidators.app/)
