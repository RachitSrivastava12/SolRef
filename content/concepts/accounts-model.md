---
id: accounts-model
order: 11
title: Accounts Model
tag: System Design
level: beginner
icon: Database
diagramKey: accounts
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: current
exampleStatus: needs-expert-verification
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Solana Docs — Accounts
    url: https://solana.com/docs/core/accounts
    sourceKind: primary
  - label: Solana Docs — Account Storage Balance
    url: https://solana.com/docs/core/accounts/account-structure
    sourceKind: primary
  - label: Account Compression (cNFTs)
    url: https://solana.com/news/how-to-use-compressed-nfts-on-solana
    sourceKind: primary
aiAssisted: unknown
codeLanguage: typescript
---

## Overview

An account is Solana's basic unit for storing state. A program account contains executable code; data accounts store information programs use. A wallet address can hold an account, but a new public key with no stored account is not an account yet. Programs keep their state in accounts rather than in private program memory.

## Key facts
- Owner field: program that can change the account data or debit its lamports
- Lamport balance: SOL stored in the account
- Data: arbitrary byte array (serialized state)
- Executable: true = program account
- A refundable storage minimum depends on the account's data size; query it instead of hardcoding a value
- A newly created wallet account is usually owned by the System Program; a public key with no stored account has no owner yet
- Only the owner can change account data or debit lamports; any program can credit a writable account
- Account data can be resized by its owner within runtime limits; each account can hold at most 10 MiB of data

## Why it matters

Programs and data are separate. Instructions name the accounts they need, so the runtime can check permissions and schedule work that does not conflict. Two transactions that write the same account still need to run one after another.

## Common mistakes
- Forgetting to fund a new data account with the required storage minimum
- Trying to change data or debit lamports from an account owned by another program
- Not closing accounts and recovering rent when they're no longer needed
- Making an account too small without planning for the limits on resizing

## Example

```typescript
import { Connection, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "finalized");

// ── READ RAW ACCOUNT DATA ─────────────────────────────────────────
const pubkey = new PublicKey("So11111111111111111111111111111111111111112"); // Wrapped SOL

const accountInfo = await connection.getAccountInfo(pubkey);
if (accountInfo) {
  console.log("Owner:",      accountInfo.owner.toBase58());  // which program owns it
  console.log("Lamports:",   accountInfo.lamports);          // SOL balance × 1e9
  console.log("Data bytes:", accountInfo.data.length);       // serialized state
  console.log("Executable:", accountInfo.executable);        // is it a program?
  console.log("Rent epoch:", accountInfo.rentEpoch);         // deprecated field
  console.log("SOL balance:", accountInfo.lamports / LAMPORTS_PER_SOL, "SOL");
}

// The RPC supplies the current storage minimum for an account's data size.
// This value can change, so do not hardcode it.
const tokenAccountSpace = 165;
const minimumLamports = await connection.getMinimumBalanceForRentExemption(tokenAccountSpace);
console.log("Storage minimum:", minimumLamports, "lamports");
```

## References
- [Solana Docs — Accounts](https://solana.com/docs/core/accounts)
- [Solana Docs — Account Structure](https://solana.com/docs/core/accounts/account-structure)
- [Solana Docs — Reduced Rent Upgrade](https://solana.com/upgrades/reduced-rent)
