---
id: network-propagation
sequence: 4
prerequisites:
  - execution-hot-path
title: Networking & Propagation
domain: QUIC, SWQoS, Gossip, Turbine, Repair
outcome: You can identify whether a problem is sender ingress, leader
  forwarding, block propagation, or repair.
conceptIds:
  - quic-swqos
  - gulf-stream
  - gossip-repair
  - turbine
  - doublezero
checkpoints:
  - Stake-weighted lanes
  - No public mempool
  - CRDS gossip
  - Shreds and repair
  - Private validator pipes
sourceNotes:
  - QUIC, SWQoS, tpu_vote, and tpu_forwards are separate concerns inside the
    validator ingress story.
  - No global mempool does not mean no queues; the TPU still uses bounded
    in-memory queues between stages.
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: unclassified
aiAssisted: unknown
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
phase: 3
---

## Summary

Map how transactions, metadata, shreds, and missing data move across validators under load.
