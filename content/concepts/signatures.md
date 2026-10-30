---
id: signatures
order: 39
title: Signature Schemes
tag: Core Infra
level: intermediate
icon: Lock
diagramKey: null
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: unclassified
exampleStatus: needs-expert-verification
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Solana Docs — transactions & signatures
    url: https://solana.com/docs/core/transactions
    sourceKind: primary
  - label: SIMD-0075 — secp256r1 precompile (passkeys)
    url: https://github.com/solana-foundation/solana-improvement-documents/blob/main/proposals/0075-precompile-for-secp256r1-sigverify.md
    sourceKind: implementation
aiAssisted: unknown
codeLanguage: typescript
---

## Overview

Transactions are authorized with Ed25519 signatures (EdDSA over Curve25519, 64 bytes) — a valid one is what sets an account's is_signer flag. But Solana can also VERIFY other schemes inside a transaction through native precompile programs: Ed25519, Secp256k1 (Ethereum-style), and Secp256r1 (P-256 — the basis for passkeys/WebAuthn). The big confusion: 'signing a transaction' and 'verifying a signature inside a program' are two completely different things.

## Key facts
- Tx signatures are Ed25519 (Curve25519 EdDSA), 64 bytes; the fee payer + every signer account signs
- A valid signature → account.is_signer = true inside the program (that's authorization)
- Precompiles verify signatures as DATA — far cheaper than verifying in BPF bytecode:
-   • Ed25519 Program — verify arbitrary Ed25519 signatures
-   • Secp256k1 Program — verify Ethereum-style secp256k1 (bridges, ETH-signed messages)
-   • Secp256r1 Program — verify P-256 → passkeys / WebAuthn / hardware keys
- A precompile instruction points (by byte offset) at the signature, pubkey, and message
- Your program confirms it ran by reading the Instructions sysvar (instruction introspection)

## Why it matters

Signature verification is the foundation of every custom auth scheme on Solana — multisig, session keys, Ethereum interop, and especially passkeys. You cannot cheaply verify a non-Ed25519 signature in BPF; instead you attach the matching precompile instruction and have your program check — via the Instructions sysvar — that it was present and verified the exact message you expect. The Secp256r1 precompile is what makes passkey login and consumer-grade account abstraction possible; Secp256k1 is what lets a program trust an Ethereum signature. Confusing is_signer (the tx was signed) with precompile verification (an arbitrary signature was checked) leads to broken or insecure auth.

## Common mistakes
- Trying to verify a secp256k1/secp256r1 signature directly in BPF — use the precompile instead
- Not validating via the Instructions sysvar that the precompile instruction actually ran (spoofable otherwise)
- Confusing is_signer (this account signed the tx) with verifying a signature over custom data
- The precompile and your program disagreeing on the exact message / pubkey / offsets

## Example

```typescript
import { Transaction, Ed25519Program, Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";

// 1) TX-LEVEL: every required signer signs the message with Ed25519.
//    A valid signature is what makes account.is_signer === true on-chain.

// 2) IN-PROGRAM VERIFICATION via a precompile. Example: verify an Ed25519
//    signature over an arbitrary message (e.g. an off-chain attestation).
const signer = Keypair.generate();
const message = new TextEncoder().encode("approve:42");
const signature = nacl.sign.detached(message, signer.secretKey);

const tx = new Transaction().add(
  Ed25519Program.createInstructionWithPublicKey({
    publicKey: signer.publicKey.toBytes(),
    message,
    signature,
  }),
  // ...then YOUR instruction. Inside the program, read the Instructions sysvar
  // and confirm the Ed25519 precompile ran with the expected pubkey + message
  // BEFORE trusting it. Otherwise an attacker can omit/forge the check.
);

// Ethereum signatures → Secp256k1Program. Passkeys / WebAuthn → the Secp256r1
// precompile (P-256). Same pattern every time: attach the precompile ix, then
// verify it via instruction introspection.
```

## References
- [Solana Docs — transactions & signatures](https://solana.com/docs/core/transactions)
- [SIMD-0075 — secp256r1 precompile (passkeys)](https://github.com/solana-foundation/solana-improvement-documents/blob/main/proposals/0075-precompile-for-secp256r1-sigverify.md)
