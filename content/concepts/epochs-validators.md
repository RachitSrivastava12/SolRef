---
id: epochs-validators
order: 10
title: Epochs & Validators
tag: System Design
level: intermediate
icon: Clock
diagramKey: null
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: mixed
exampleStatus: needs-expert-verification
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Solana — Epoch Schedule
    url: https://solana.com/docs/rpc/http/getepochinfo
    sourceKind: primary
  - label: Validator Economics Deep Dive
    url: https://solana.com/staking
    sourceKind: secondary
  - label: Staking Guide
    url: https://solana.com/staking
    sourceKind: primary
aiAssisted: unknown
codeLanguage: typescript
---

## Overview

An epoch is a range of slots used for staking and validator schedules. Mainnet epochs currently have about 432,000 slots. At the 200ms slot target, that is roughly one day, although skipped slots and protocol changes affect elapsed time. Stake activation, deactivation, and rewards follow epoch rules.

## Key facts
- Mainnet epochs currently contain about 432,000 slots, roughly one day at the 200ms target.
- Slot counts are fixed by the epoch schedule; actual elapsed time can vary.
- The leader schedule is calculated ahead of time from the validator set and stake.
- Stake activation and deactivation follow epoch rules and can take more than one epoch.
- Mainnet voting validators currently pay a 0.8 SOL Validator Admission Ticket (VAT) per epoch.
- Inflation, validator participation, stake, and rewards change over time; query current data.

## Why it matters

Epochs are used for stake changes, leader schedules, and rewards. Use the slot and epoch values returned by RPC rather than assuming an epoch always lasts exactly one day. Validator costs and reward rates are time-sensitive, so check current network data.

## Common mistakes
- Treating an epoch as an exact number of hours.
- Assuming stake activation or deactivation always completes after exactly one epoch.
- Treating an inflation rate or validator reward estimate as permanent.

## Example

```typescript
import { Connection, clusterApiUrl } from "@solana/web3.js";
const connection = new Connection(clusterApiUrl("mainnet-beta"), "finalized");

// ── GET CURRENT EPOCH INFO ────────────────────────────────────────
const epochInfo = await connection.getEpochInfo("finalized");
console.log("Current epoch:", epochInfo.epoch);
console.log("Slot in epoch:", epochInfo.slotIndex, "of", epochInfo.slotsInEpoch);

// Read the current schedule. Warmup epochs mean not every historical epoch
// can be calculated by dividing the slot number by slotsPerEpoch.
const epochSchedule = await connection.getEpochSchedule();
console.log("Slots per normal epoch:", epochSchedule.slotsPerEpoch);
console.log("Leader schedule offset:", epochSchedule.leaderScheduleSlotOffset);

// Inflation rates are live network values, not a fixed APY promise.
const inflation = await connection.getInflationRate();
console.log("Total inflation rate:", inflation.total);
console.log("Validator rate:", inflation.validator);
```

## References
- [getEpochInfo RPC](https://solana.com/docs/rpc/http/getepochinfo)
- [getEpochSchedule RPC](https://solana.com/docs/rpc/http/getepochschedule)
- [Alpenglow and Validator Admission Ticket](https://solana.com/upgrades/alpenglow)
- [Staking Guide](https://solana.com/staking)
