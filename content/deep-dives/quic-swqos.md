---
id: quic-swqos
conceptId: quic-swqos
thesis: Before a priority fee can matter, the packet must reach the leader. QUIC
  and stake-weighted QoS are the congestion-control layer at the front door.
stages:
  - Client/RPC sender
  - QUIC connection
  - Stake-weighted lane
  - Leader TPU
sourceNotes:
  - "Engineering Solana treats QUIC as the start of the hot path: transaction
    bytes arrive at the TPU Fetch Stage over authenticated streams."
  - Stake-weighted QoS changes ingress capacity before Banking Stage priority
    fees ever matter.
  - The TPU has separate ports/paths for standard transactions, vote traffic,
    and forwarded transactions.
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: unclassified
aiAssisted: unknown
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Helius — Stake-Weighted QoS
    url: https://www.helius.dev/blog/stake-weighted-quality-of-service-everything-you-need-to-know
    sourceKind: secondary
  - label: Anza — QUIC & transaction ingest
    url: https://www.anza.xyz/blog
    sourceKind: primary
title: QUIC & Stake-Weighted QoS
---

## Ingress

### The first bottleneck is not block space

Under load, transactions compete to be received before they ever compete to be scheduled. QUIC gives leaders identity-aware flow control, while SWQoS reserves most ingest capacity for trusted/staked peers.

#### Key points

- Public, unstaked senders share a smaller open lane.
- Staked RPC or sender relationships can materially change landing reliability.
- A high CU price cannot help a packet that never reaches the leader.

## Design Takeaway

### Sender infrastructure is part of app architecture

For latency-sensitive apps, RPC choice is not just a convenience decision. It affects retry cadence, preflight strategy, and how quickly transactions reach upcoming leaders.

#### Key points

- Simulate once, then send raw bytes through a strong sender when speed matters.
- Retry with fresh blockhashes instead of trusting indefinite default retries.
- Measure landing rate per sender, not just RPC request latency.
