---
id: firedancer
conceptId: firedancer
thesis: "Firedancer is an independently built Solana validator client. A
  second implementation can reduce shared-software risk, while performance
  depends on the release, machine, configuration, and workload."
stages:
  - Networking tiles
  - Runtime integration
  - Consensus compatibility
  - Mainnet release track
sourceNotes: []
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: unclassified
aiAssisted: unknown
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Firedancer (GitHub)
    url: https://github.com/firedancer-io/firedancer
    sourceKind: implementation
  - label: Frankendancer release notes
    url: https://github.com/firedancer-io/firedancer/releases
    sourceKind: implementation
title: Firedancer & Validator Clients
---

## Client Diversity

### Same protocol, independent implementation

Client diversity helps only when each client follows the same protocol rules. Firedancer is an independently built Solana validator client from Jump Crypto, written in C. Its repository includes mainnet-ready releases, but the Solana Foundation's current Alpenglow migration guide says Firedancer and Frankendancer were not supported for that migration. Operators should check current compatibility, not infer it from a release label.

#### Key points

- Frankendancer combines Firedancer components with parts of the Agave runtime; it is distinct from the full Firedancer client.
- Firedancer has its own release track. Current support and rollout depend on the release and operator configuration.
- Client diversity reduces shared-code risk, but does not remove the need for compatible releases and correct protocol behavior.

## Performance

### Throughput raises need validator headroom

Validator clients have to keep up with block production, replay, and consensus. Firedancer is designed around a tile-based architecture and specialized networking. Actual performance depends on hardware, configuration, network conditions, and workload.

#### Key points

- The client uses a tile-based design to separate validator work.
- Its networking stack is independently implemented and optimized.
- Benchmarks from one machine or workload do not predict network-wide transaction capacity.
