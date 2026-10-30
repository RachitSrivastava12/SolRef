---
id: clusters
order: 18
title: Solana Clusters
tag: System Design
level: beginner
icon: Globe
diagramKey: null
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: unclassified
exampleStatus: needs-expert-verification
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Solana Clusters Docs
    url: https://solana.com/docs/references/clusters
    sourceKind: primary
  - label: Devnet Faucet
    url: https://faucet.solana.com
    sourceKind: primary
  - label: solana-test-validator Docs
    url: https://solana.com/docs/tools
    sourceKind: primary
  - label: Solana CLI Reference
    url: https://solana.com/docs/references/solana-cli
    sourceKind: primary
aiAssisted: unknown
codeLanguage: typescript
---

## Overview

Solana has three public clusters: Mainnet (real assets), Devnet (app development), and Testnet (network and validator testing). A local validator gives you a private development environment on your machine. Each cluster has separate accounts, programs, and balances.

## Key facts
- Mainnet: real SOL and real application users.
- Devnet: test environment for building and trying apps.
- Testnet: environment for testing the network and validator software.
- Local validator: a local environment that you control.
- Account data and custom program addresses are separate across clusters.
- Devnet can be reset, and its airdrops are rate-limited; do not treat test SOL as having value.

## Why it matters

Clusters let you test without using real SOL. Devnet does not perfectly reproduce mainnet: congestion, data, and program availability can differ. Before a launch, verify every required program on the target cluster and test the full flow with a small, controlled amount.

## Common mistakes
- Assuming a program or account on Devnet also exists at the same address on Mainnet.
- Treating Devnet behavior as a guarantee of Mainnet performance.
- Assuming a Devnet airdrop amount or rate limit will stay fixed.

## Example

```typescript
import {
  Connection, Keypair, LAMPORTS_PER_SOL,
  clusterApiUrl, PublicKey
} from "@solana/web3.js";

// ── CLUSTER URLS AND CONFIGS ──────────────────────────────────────
const CLUSTERS = {
  mainnet:  "https://api.mainnet.solana.com",
  devnet:   "https://api.devnet.solana.com",
  testnet:  "https://api.testnet.solana.com",
  localnet: "http://127.0.0.1:8899",

// Production RPC URLs are provided by an RPC service:
  helius_mainnet: "https://mainnet.helius-rpc.com/?api-key=YOUR_KEY",
  quicknode:      "https://YOUR_ENDPOINT.quiknode.pro/YOUR_KEY/",
};

// Programmatic cluster detection from ENV
function getConnection(): Connection {
  const rpcUrl = process.env.SOLANA_RPC_URL;
  const cluster = process.env.SOLANA_CLUSTER ?? "devnet";

  if (rpcUrl) {
    return new Connection(rpcUrl, "finalized");
  }

  const url = clusterApiUrl(cluster as "mainnet-beta" | "devnet" | "testnet");
  return new Connection(url, "finalized");
}

// ── REQUEST TEST SOL ON DEVNET ────────────────────────────────────
// Faucet availability, request amounts, and rate limits can change.
async function airdropDevnet(
  wallet: PublicKey,
  solAmount = 1
): Promise<void> {
  const connection = new Connection(clusterApiUrl("devnet"), "finalized");

  const before = await connection.getBalance(wallet);
  console.log(`Balance before: ${before / LAMPORTS_PER_SOL} SOL`);

  const sig = await connection.requestAirdrop(
    wallet,
    solAmount * LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(sig);

  const after = await connection.getBalance(wallet);
  console.log(`Balance after: ${after / LAMPORTS_PER_SOL} SOL`);
  console.log(`Received: ${(after - before) / LAMPORTS_PER_SOL} SOL`);
}

// ── LOCAL VALIDATOR SETUP ─────────────────────────────────────────
// Run in terminal: solana-test-validator
// Then connect to it:
const localConnection = new Connection("http://127.0.0.1:8899", "finalized");

// Clone mainnet programs to local validator:
// solana-test-validator \
//   --clone-upgradeable-program JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4 \ (Jupiter)
//   --clone-upgradeable-program whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc \ (Whirlpools)
//   --url mainnet-beta

// ── PROGRAM IDs DIFFER BY CLUSTER ────────────────────────────────
// Always use environment variables for program IDs:
const PROGRAM_IDS = {
  // System programs are the SAME across all clusters:
  systemProgram:    "11111111111111111111111111111111",
  splToken:         "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  associatedToken:  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe1Cg",
  computeBudget:    "ComputeBudget111111111111111111111111111111",

  // Your custom programs — use env vars per cluster:
  yourProgram: process.env.PROGRAM_ID,
};
```

## References
- [Solana Clusters Docs](https://solana.com/docs/references/clusters)
- [Devnet Faucet](https://faucet.solana.com)
- [Solana Local Development Tools](https://solana.com/docs/tools)
- [Solana CLI Reference](https://solana.com/docs/references/solana-cli)
