---
id: sealevel
order: 13
title: Sealevel Runtime
tag: Programs
level: advanced
icon: Cpu
diagramKey: sealevel
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: current
exampleStatus: needs-expert-verification
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Solana Docs — Program execution
    url: https://solana.com/docs/core/programs/program-execution
    sourceKind: primary
  - label: Solana Docs — Compute budget
    url: https://solana.com/docs/core/fees/compute-budget
    sourceKind: primary
  - label: Program Optimization Tips
    url: https://solana.com/docs/core/programs/program-execution
    sourceKind: primary
aiAssisted: unknown
codeLanguage: rust
---

## Overview

Sealevel is Solana's way of scheduling transactions that can run at the same time. Every transaction lists the accounts it will read or change. Transactions that write to different accounts can often run in parallel; transactions that write to the same account must take turns. The SVM runs each program, while Sealevel coordinates the work.

## Key facts
- Transactions with separate writable accounts may run at the same time.
- Multiple transactions can read the same account at once.
- Transactions that write to the same account must be sequenced.
- The SVM executes programs; Sealevel describes how the runtime schedules transactions.
- Compute limits cap work in a transaction. They are separate from account conflicts.
- A frequently used writable account can become a bottleneck.

## Why it matters

If two users update different accounts, a validator may process those transactions at the same time. If both transactions need to change the same pool account, they must be sequenced. This is why account design affects how much work a program can handle in parallel.

## Common mistakes
- Marking an account writable when the instruction only reads it.
- Expecting parallel execution when transactions update the same account.
- Confusing compute limits with account locking; either can limit a transaction.

## Example

```rust
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct UpdateCounter<'info> {
    // This instruction changes the counter, so it must be writable.
    #[account(mut)]
    pub counter: Account<'info, Counter>,
    pub authority: Signer<'info>,
}

#[account]
pub struct Counter {
    pub value: u64,
}

// Transactions that update this same counter must be sequenced.
// Transactions that update different counters may run in parallel.
```

## References
- [Solana Docs — Program execution](https://solana.com/docs/core/programs/program-execution)
- [Solana Docs — Compute budget](https://solana.com/docs/core/fees/compute-budget)
- [Solana Docs — Program execution](https://solana.com/docs/core/programs/program-execution)
