---
id: lookup-tables
order: 32
title: Address Lookup Tables
tag: Data Flow
level: intermediate
icon: Hash
diagramKey: null
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: current
exampleStatus: needs-expert-verification
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Solana Docs — Address Lookup Tables
    url: https://solana.com/docs/advanced/lookup-tables
    sourceKind: primary
  - label: Solana — Versioned Transactions
    url: https://solana.com/docs/core/transactions/versioned-transactions
    sourceKind: primary
aiAssisted: unknown
codeLanguage: typescript
---

## Overview

A legacy transaction stores each account address directly in its message, so the 1,232-byte limit often becomes a constraint around 32 accounts. Address Lookup Tables (ALTs) are on-chain lists of addresses. A v0 transaction can refer to an ALT address with a 1-byte index instead of repeating its 32-byte key. An ALT can store 256 addresses, but the runtime currently limits a transaction to 64 accounts total. The v1 format has a 4,096-byte limit and does not support ALTs.

## Key facts
- Each inline public key is 32 bytes; a lookup index is 1 byte, plus the table references and other message data
- Create a table, extend it with addresses, then reference it in a v0 transaction
- A table can store up to 256 public keys; the runtime still allows at most 64 accounts in one transaction
- Wait until a later slot before using newly added addresses
- ALTs can be reused by later v0 transactions while they remain usable
- Only v0 supports ALTs; legacy and v1 do not
- Tables can be frozen (immutable) or kept extendable by an authority
- The fee payer and signers must appear directly in the transaction message

## Why it matters

ALTs reduce how many bytes v0 needs to describe its accounts. This can help a transaction fit under the 1,232-byte limit, but it does not increase the number of accounts the runtime can load. A v0 transaction that uses ALTs still has the same 64-account limit as other formats.

## Common mistakes
- Using an address in the same slot it was added to the table
- Trying to use ALTs with legacy transactions — they require v0 (versioned) txs
- Assuming 256 entries in a table means one transaction can load 256 accounts
- Forgetting that an ALT account and its references also take bytes in the message

## Example

```typescript
import {
  Connection, Keypair, PublicKey, TransactionMessage,
  VersionedTransaction, SystemProgram, clusterApiUrl,
} from "@solana/web3.js";

const conn = new Connection(clusterApiUrl("devnet"), "finalized");
const payer = Keypair.generate();

// Set this to an existing devnet lookup table that includes the recipient.
// Fund the new payer before submitting a transaction.
const configuredAddress = process.env.LOOKUP_TABLE_ADDRESS;
if (!configuredAddress) throw new Error("Set LOOKUP_TABLE_ADDRESS to an existing devnet table");
const tableAddress = new PublicKey(configuredAddress);
const lookupTable = (await conn.getAddressLookupTable(tableAddress)).value;
if (!lookupTable) throw new Error("Lookup table was not found");
const currentSlot = await conn.getSlot("finalized");
if (currentSlot <= lookupTable.state.lastExtendedSlot) {
  throw new Error("Wait for a later slot before using this table");
}
const recipient = lookupTable.state.addresses[0];
if (!recipient) throw new Error("Add an address to the table first");

// Build a v0 transaction that references the existing table.
const message = new TransactionMessage({
  payerKey: payer.publicKey,
  recentBlockhash: (await conn.getLatestBlockhash("finalized")).blockhash,
  instructions: [SystemProgram.transfer({
    fromPubkey: payer.publicKey,
    toPubkey: recipient,
    lamports: 1_000,
  })],
}).compileToV0Message([lookupTable]);
const vtx = new VersionedTransaction(message);
vtx.sign([payer]);
```

## References
- [Solana Docs — Address Lookup Tables](https://solana.com/docs/advanced/lookup-tables)
- [Solana — Versioned Transactions](https://solana.com/docs/core/transactions/versioned-transactions)
