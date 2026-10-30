---
id: tower-bft
conceptId: tower-bft
thesis: Tower BFT was Solana's pre-Alpenglow consensus protocol. It used PoH and
  exponentially growing vote lockouts to make switching to a competing fork
  costly. Tower was retired on mainnet when Votor activated in October 2026;
  this deep dive explains the former design.
stages:
  - Tower validator voted for a slot's blockhash
  - Each vote carried a lockout measured in slots
  - Later votes for descendants extended earlier lockouts
  - Deep vote history could cause older slots to become roots
sourceNotes:
  - Lockouts were measured in slots, not seconds.
  - A later vote for a descendant could double earlier lockouts.
  - Tower is historical on mainnet; Votor replaced it in October 2026.
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: historical
aiAssisted: unknown
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Tower BFT Implemented Proposal
    url: https://docs.anza.xyz/implemented-proposals/tower-bft
    sourceKind: primary
  - label: Vote Program Source
    url: https://github.com/solana-labs/solana/tree/master/programs/vote
    sourceKind: implementation
title: Tower BFT
---

## What Tower did

### Votes and lockouts

Tower BFT was Solana's consensus protocol before Alpenglow. Validators voted for the block they believed belonged to the correct fork. Each vote had a lockout: a period, measured in slots, during which the validator could not vote for a conflicting fork.

As a validator voted for later blocks on the same fork, earlier votes could receive longer lockouts. This made it increasingly costly for a validator to switch forks. A slot becoming a root meant it was settled under Tower's consensus rules.

## How PoH fit in

### A shared clock for the old design

PoH supplied an ordered sequence of hashes that Tower used as a shared clock. The lockout itself was counted in slots. PoH did not decide which fork won; validators' stake-weighted votes and Tower's fork-choice rules did that.

## What changed

### Votor is current on mainnet

Alpenglow replaced Tower with Votor on mainnet in October 2026. Votor uses direct validator votes and aggregate certificates instead of on-chain vote transactions. This page describes the old protocol for understanding historical blocks and older technical material; use the Alpenglow guide for current mainnet consensus.

Tower did not execute programs or set compute budgets. It handled consensus after the leader pipeline had produced candidate blocks. Program execution and transaction fees are separate topics.
