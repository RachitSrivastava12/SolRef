---
id: state-compression
order: 31
title: State & ZK Compression
tag: Programs
level: advanced
icon: Database
diagramKey: null
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: unclassified
exampleStatus: needs-expert-verification
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Solana — State Compression
    url: https://solana.com/developers/guides/javascript/compressed-nfts
    sourceKind: primary
  - label: Light Protocol — ZK Compression
    url: https://www.zkcompression.com/
    sourceKind: secondary
aiAssisted: unknown
codeLanguage: typescript
---

## Overview

Storing one account per item (e.g. an NFT) means paying rent per item — fine for thousands, ruinous for millions. State compression stores data in a concurrent Merkle tree where only the tiny root lives on-chain; the actual leaves live in cheap ledger/off-chain storage, validated by proofs. Compressed NFTs cut minting cost by orders of magnitude. ZK Compression (Light Protocol) extends the idea to general program state.

## Key facts
- Concurrent Merkle tree: on-chain account holds only the root + a changelog buffer
- Leaf data lives off the account model; validity is proven against the on-chain root
- cNFTs: mint millions of NFTs for a fraction of the per-account rent cost
- Reads/indexing rely on RPC providers that store and serve the leaves + proofs (DAS API)
- ZK Compression generalizes this to fungible state with validity proofs (Light Protocol)
- Trade-off: cheap writes, but updates need a proof and a supporting indexer
- Great for airdrops, tickets, loyalty points, large collections — anything high-cardinality
- Not for hot, frequently-mutated state where proof overhead dominates

## Why it matters

Rent makes 'an account per user/item' economically impossible at internet scale — a 10M-item airdrop as real accounts could cost thousands of SOL just in rent. Compression collapses that to the cost of a single tree plus per-mint fees, making mass distribution viable. It's the reason Solana can do million-item NFT drops and large-scale loyalty programs cheaply. The cost is architectural: you depend on indexers (the DAS API) to reconstruct state and supply Merkle proofs, so reads are no longer a simple getAccountInfo.

## Common mistakes
- Reaching for compression on hot, frequently-updated state where proof overhead kills you
- Forgetting compressed assets need a DAS-API RPC to read — they aren't normal accounts
- Under-sizing the Merkle tree's max depth/buffer for the collection size you'll mint
- Assuming a wallet shows cNFTs automatically — it must support the DAS read path

## Example

```typescript
// Reading compressed NFTs uses the DAS (Digital Asset Standard) API, not
// getAccountInfo — the asset isn't a normal on-chain account.
const RPC = "https://mainnet.helius-rpc.com/?api-key=YOUR_KEY";

async function getCompressedAsset(assetId: string) {
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0", id: "1", method: "getAsset",
      params: { id: assetId },
    }),
  });
  const { result } = await res.json();
  console.log("compressed:", result.compression?.compressed);
  console.log("tree:", result.compression?.tree);     // the Merkle tree account
  return result;
}

// Transferring a cNFT requires a Merkle proof fetched via getAssetProof,
// passed into the Bubblegum transfer instruction — the program verifies the
// leaf against the on-chain root. One tree root represents millions of leaves.
```

## References
- [Solana — State Compression](https://solana.com/developers/guides/javascript/compressed-nfts)
- [Light Protocol — ZK Compression](https://www.zkcompression.com/)
