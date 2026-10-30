---
id: versioned-tx
order: 16
title: Versioned Transactions
tag: Core Infra
level: intermediate
icon: HardDrive
diagramKey: null
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: current
exampleStatus: needs-expert-verification
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Solana Docs — Versioned Transactions
    url: https://solana.com/docs/core/transactions/versioned-transactions
    sourceKind: primary
  - label: Solana Docs — Address Lookup Tables
    url: https://solana.com/docs/core/transactions/versioned-transactions
    sourceKind: primary
aiAssisted: unknown
codeLanguage: typescript
---

## Overview

Solana currently has three transaction formats. Legacy and v0 transactions are limited to 1,232 bytes. v0 adds Address Lookup Tables (ALTs), which replace some 32-byte addresses with 1-byte indexes. An ALT can store up to 256 addresses, but a transaction can still use at most 64 accounts. The newer v1 format allows up to 4,096 bytes, uses inline addresses, and does not support ALTs.

## Key facts
- Legacy: 1,232-byte transaction limit; around 32 accounts often fit, depending on signatures and instruction data
- v0: 1,232-byte limit and support for ALTs
- The current runtime limit is 64 accounts per transaction, including addresses loaded from ALTs
- An ALT stores up to 256 addresses; each referenced address uses a 1-byte index in the message
- The fee payer and all signers must stay in the message; they cannot be loaded from an ALT
- An address added to an ALT cannot be used in the same slot; wait until a later slot
- v1: active format, 4,096-byte limit, inline addresses, and message-based resource settings; no ALT support
- SIMD-0596 proposes raising the v1 account limit to 96; that change is not active
- To read v1 with `getBlock` or `getTransaction`, set `maxSupportedTransactionVersion: 1` and use an SDK that supports it. Legacy web3.js needs version 1.99 or newer to read v1; it cannot build or send v1 transactions.
- Wallets, RPC clients, and other tools must support the format your app sends or reads

## Why it matters

ALTs help v0 transactions fit more account addresses into the same 1,232-byte limit. They do not raise the runtime account limit or change which accounts a program can access. v1 is useful when a message needs more than 1,232 bytes, but it has no ALT support and currently remains limited to 64 accounts. Apps that read blocks must also opt in to v1, or an RPC request can fail when it encounters one.

## Common mistakes
- Trying to use an address during the same slot it was added to the ALT
- Assuming an ALT can make one transaction use 256 accounts; the current limit is 64
- Assuming an ALT works with legacy or v1 transactions; only v0 supports it
- Sending a format the user's wallet or an RPC client cannot read

## Example

```typescript
import {
  Connection, PublicKey, Keypair,
  VersionedTransaction, TransactionMessage,
  clusterApiUrl, SystemProgram
} from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "finalized");
const payer = Keypair.generate();

// Use an existing ALT that already contains the recipient address.
// Fund this payer on devnet before sending the transaction.
const configuredLookupTable = process.env.LOOKUP_TABLE_ADDRESS;
if (!configuredLookupTable) throw new Error("Set LOOKUP_TABLE_ADDRESS to an existing devnet table");
const lookupTableAddress = new PublicKey(configuredLookupTable);
const lookupTableResult = await connection.getAddressLookupTable(lookupTableAddress);
const lookupTable = lookupTableResult.value;
if (!lookupTable) throw new Error("Lookup table was not found");

// An address cannot be used in the same slot when it was added to the table.
const currentSlot = await connection.getSlot("finalized");
if (currentSlot <= lookupTable.state.lastExtendedSlot) {
  throw new Error("Wait for a later slot before using this table");
}

const recipient = lookupTable.state.addresses[0];
if (!recipient) throw new Error("Add an address to the lookup table first");

const { blockhash, lastValidBlockHeight } =
  await connection.getLatestBlockhash("finalized");

const message = new TransactionMessage({
  payerKey: payer.publicKey,
  recentBlockhash: blockhash,
  instructions: [SystemProgram.transfer({
    fromPubkey: payer.publicKey,
    toPubkey: recipient,
    lamports: 1_000,
  })],
}).compileToV0Message([lookupTable]);

const transaction = new VersionedTransaction(message);
transaction.sign([payer]);

const bytes = transaction.serialize().length;
if (bytes > 1_232) throw new Error("v0 transaction is larger than 1,232 bytes");

const signature = await connection.sendTransaction(transaction);
const result = await connection.confirmTransaction({
  signature,
  blockhash,
  lastValidBlockHeight,
}, "finalized");
if (result.value.err) throw new Error(`Transaction failed: ${result.value.err}`);
console.log("Confirmed v0 transaction:", signature);
```

## References
- [Solana Docs — Versioned Transactions](https://solana.com/docs/core/transactions/versioned-transactions)
- [Solana Docs — Address Lookup Tables](https://solana.com/docs/advanced/lookup-tables)
