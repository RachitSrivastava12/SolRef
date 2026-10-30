---
id: blocks-slots
order: 2
title: Blocks & Slots
tag: Core Infra
level: intermediate
icon: Layers
diagramKey: null
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: unclassified
exampleStatus: needs-expert-verification
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Solana Docs — Slots
    url: https://solana.com/docs/references/terminology#slot
    sourceKind: primary
  - label: getBlock RPC reference
    url: https://solana.com/docs/rpc/http/getblock
    sourceKind: primary
aiAssisted: unknown
codeLanguage: typescript
---

## Overview

Slots target 200ms on mainnet after Solana's reduced-slot-time rollout completed in October 2026. A designated leader produces a block for its slot; under Alpenglow, a slot can carry multiple candidate banks. Offline or slow leaders can cause skipped slots. Alpenglow finality is a separate process and targets roughly 150ms.

## Key facts
- 200ms per slot on mainnet since October 2026
- About 5 slots per second at the current target
- Leader schedule is rotated every epoch
- Skipped slots ≠ lost data — tx just wasn't included
- Observed block interval varies with skipped slots; the slot target is 200ms
- Alpenglow slots can carry multiple candidate banks; Geyser consumers should track `bank_id`
- Block header includes parent slot hash
- Slot = position in the chain; blocks are candidate data produced for that slot
- Slot number is the primary time reference on Solana

## Why it matters

Slots are Solana's fundamental unit of time. Everything — from transaction expiry to leader schedules to staking rewards — is measured in slots. When your tx includes a blockhash from slot N, it's valid until slot N+150. If you use 'slot' as a timestamp in your program, you're working with the blockchain's native clock.

## Common mistakes
- Assuming every slot number maps to a real block (skipped slots have no block)
- Using wall-clock time instead of slot number for on-chain time tracking
- Not accounting for slot skips when estimating confirmation time

## Example

```typescript
import { Connection, clusterApiUrl } from "@solana/web3.js";
const connection = new Connection(clusterApiUrl("mainnet-beta"), "finalized");

// ── GET CURRENT SLOT ─────────────────────────────────────────────
const slot = await connection.getSlot("finalized");
console.log("Current finalized slot:", slot);

// `processed` is newer but provisional. On mainnet, `confirmed` currently
// matches `finalized`; new code should use `finalized`.
const processedSlot = await connection.getSlot("processed");
const finalizedSlot = await connection.getSlot("finalized");
console.log({ processedSlot, finalizedSlot });

// ── GET BLOCK DATA ───────────────────────────────────────────────
const block = await connection.getBlock(slot, {
  commitment: "finalized",
  // Pass 1 to read active v1 transactions. Use a recent SDK with v1 read support.
  maxSupportedTransactionVersion: 1,
  transactionDetails: "full",      // "full" | "accounts" | "signatures" | "none"
  rewards: true,                   // include validator rewards
});

if (block) {
  console.log("Block time (Unix):", block.blockTime);  // Unix timestamp
  console.log("Parent slot:",       block.parentSlot);
  console.log("Blockhash:",         block.blockhash);
  console.log("Tx count:",          block.transactions.length);
  console.log("Rewards:", block.rewards?.map(r => ({
    pubkey: r.pubkey,
    lamports: r.lamports,
    rewardType: r.rewardType, // "fee" | "rent" | "voting" | "staking"
  })));
} else {
  console.log("Slot was skipped — no block produced");
}

// ── LISTEN TO NEW SLOTS IN REAL-TIME ─────────────────────────────
const subId = connection.onSlotChange((slotInfo) => {
  console.log("New slot:",    slotInfo.slot);    // newly processed slot
  console.log("Parent slot:", slotInfo.parent);  // its parent
  console.log("Root slot:",   slotInfo.root);    // latest finalized slot
});

// Cleanup when done
connection.removeSlotChangeListener(subId);

// ── GET SLOT FOR A SPECIFIC TIMESTAMP ───────────────────────────
// Solana doesn't have a direct API for this, but you can estimate:
const epochInfo = await connection.getEpochInfo();
const slotsPerSecond = 5; // approximate at the 200ms mainnet target
const secsAgo = 3600; // 1 hour ago
const estimatedSlot = epochInfo.absoluteSlot - Math.floor(secsAgo * slotsPerSecond);
console.log("Approx slot 1hr ago:", estimatedSlot);
```

## References
- [Solana Docs — Slots](https://solana.com/docs/references/terminology#slot)
- [getBlock RPC reference](https://solana.com/docs/rpc/http/getblock)
