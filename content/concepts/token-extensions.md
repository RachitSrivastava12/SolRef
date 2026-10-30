---
id: token-extensions
order: 30
title: Token Extensions (Token-2022)
tag: Programs
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
  - label: Solana — Token Extensions
    url: https://solana.com/solutions/token-extensions
    sourceKind: primary
  - label: SPL Token-2022 docs
    url: https://www.solana-program.com/docs/token-2022
    sourceKind: secondary
aiAssisted: unknown
codeLanguage: typescript
---

## Overview

Token-2022 is a second, superset SPL token program that adds native 'extensions' — opt-in features baked into the mint or token account rather than bolted on with custom programs. Transfer fees, confidential (encrypted) balances, transfer hooks, non-transferable 'soulbound' tokens, interest-bearing balances, metadata pointers, and permanent delegates all become first-class without a separate contract.

## Key facts
- Lives at a different program id than the original SPL Token program — they coexist
- Extensions are configured at mint creation and stored in the account's TLV data
- Transfer Fee: protocol-level fee withheld on every transfer, claimable by the authority
- Confidential Transfer: ElGamal-encrypted balances + ZK proofs hide amounts on-chain
- Transfer Hook: invoke a custom program on every transfer (allowlists, royalties, KYC)
- Non-Transferable: soulbound tokens for credentials/identity
- Interest-Bearing + Metadata Pointer + Permanent Delegate + Default Account State
- Wallets/dapps must support the new program id — not every integration does yet

## Why it matters

Before Token-2022, things like transfer fees, royalties, or compliance gating required wrapping tokens in bespoke programs — fragile, non-composable, and easy to get wrong. Token Extensions make these features native and standardized, so wallets and DEXes can support them uniformly. For stablecoins and RWAs, confidential transfers and transfer hooks are the unlock for on-chain compliance. The catch: extensions live in a separate program, so you must explicitly target Token-2022 and confirm downstream tooling supports the specific extensions you use.

## Common mistakes
- Sending Token-2022 tokens to integrations that only know the legacy SPL Token program id
- Forgetting transfer-hook tokens require extra accounts on every transfer instruction
- Assuming all wallets render confidential or fee-bearing tokens correctly today
- Mixing up the two program ids — accounts are not interchangeable between them

## Example

```typescript
import {
  createMint, TOKEN_2022_PROGRAM_ID, ExtensionType,
  getMintLen, createInitializeTransferFeeConfigInstruction,
} from "@solana/spl-token";
import { Connection, Keypair, SystemProgram, Transaction } from "@solana/web3.js";

const conn = new Connection("https://api.devnet.solana.com");
const payer = Keypair.generate();
const mint = Keypair.generate();

// A mint with the Transfer Fee extension (1% fee, capped) — Token-2022 only.
const extensions = [ExtensionType.TransferFeeConfig];
const mintLen = getMintLen(extensions);
const lamports = await conn.getMinimumBalanceForRentExemption(mintLen);

const tx = new Transaction().add(
  SystemProgram.createAccount({
    fromPubkey: payer.publicKey, newAccountPubkey: mint.publicKey,
    space: mintLen, lamports, programId: TOKEN_2022_PROGRAM_ID,
  }),
  createInitializeTransferFeeConfigInstruction(
    mint.publicKey, payer.publicKey, payer.publicKey,
    100 /* basis points = 1% */, BigInt(5_000_000) /* max fee */,
    TOKEN_2022_PROGRAM_ID,
  ),
  // ...then InitializeMint2 with TOKEN_2022_PROGRAM_ID
);
// Note: every transfer now withholds the fee automatically, on-chain.
```

## References
- [Solana — Token Extensions](https://solana.com/solutions/token-extensions)
- [SPL Token-2022 docs](https://www.solana-program.com/docs/token-2022)
