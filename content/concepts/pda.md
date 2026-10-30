---
id: pda
order: 15
title: Program Derived Addresses
tag: Programs
level: intermediate
icon: Lock
diagramKey: pda
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: current
exampleStatus: needs-expert-verification
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Solana — Program Derived Addresses
    url: https://solana.com/docs/core/pda
    sourceKind: primary
  - label: Anchor — PDA constraints
    url: https://www.anchor-lang.com/docs/basics/pda
    sourceKind: secondary
aiAssisted: unknown
codeLanguage: typescript
---

## Overview

A Program Derived Address (PDA) is a predictable address made from seed values and a program ID. A PDA has no private key. The runtime lets the program whose ID was used to derive it sign for that address during a cross-program invocation. Deriving a PDA does not create an account at that address; an instruction must create the account if the program needs to store data there.

## Key facts

- The same seed bytes and program ID produce the same PDA.
- The derivation adds a one-byte bump so the result is off the Ed25519 curve.
- A PDA has no private key and cannot sign like a wallet keypair.
- The program ID used in the derivation can authorize the PDA as a signer with `invoke_signed`.
- The PDA's account owner is a separate field. The owner program controls its data and can debit its lamports.
- A PDA can be a state-account address or an authority for another account, such as a token account.
- Each seed is at most 32 bytes; the derivation accepts up to 16 seeds, including the bump.

## Why it matters

PDAs let programs use predictable addresses for state and authorities. For example, a program can derive one vault address for each user. The program can then authorize actions through its instructions instead of asking a user to hold a private key for that address. The program's checks still determine whether each action is safe.

## Common mistakes

- Thinking that deriving a PDA creates an on-chain account.
- Confusing the program ID used to derive the PDA with the account's owner field.
- Treating a PDA as if it had a private key.
- Using changing or ambiguous seed values that can derive a different address than intended.
- Assuming PDA derivation replaces authorization checks in the program.

## Example

```typescript
import { Keypair, PublicKey } from "@solana/web3.js";

// Use the program ID of the program that will create and control this PDA.
const programId = new PublicKey(process.env.PROGRAM_ID!);
const user = Keypair.generate().publicKey;

const [userVaultAddress, bump] = PublicKey.findProgramAddressSync(
  [Buffer.from("user-vault"), user.toBuffer()],
  programId,
);

console.log("Derived address:", userVaultAddress.toBase58());
console.log("Bump:", bump);
// This computes the address only. A program instruction must create the account.
```

## References

- [Solana — Program Derived Addresses](https://solana.com/docs/core/pda)
- [Anchor — PDA constraints](https://www.anchor-lang.com/docs/basics/pda)
