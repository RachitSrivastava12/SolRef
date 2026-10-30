---
id: memory-allocator
order: 38
title: Memory & the Allocator
tag: Programs
level: advanced
icon: Box
diagramKey: null
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: current
exampleStatus: needs-expert-verification
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Solana Docs — programs FAQ (memory)
    url: https://solana.com/docs/programs/faq
    sourceKind: primary
  - label: Helius — optimizing Solana programs
    url: https://www.helius.dev/blog/optimizing-solana-programs
    sourceKind: secondary
aiAssisted: unknown
codeLanguage: typescript
---

## Overview

Solana programs use a fixed-size heap and small stack frames. The default heap is 32 KiB per program invocation. The bump allocator moves a pointer forward for each allocation; freeing a value does not return that memory during the invocation. Each SBF call-stack frame is 4 KiB. A transaction can request a larger heap for each program it invokes, up to 256 KiB.

## Key facts
- Default heap: 32 KiB for each invoked program; `RequestHeapFrame` can request 32–256 KiB in 1 KiB steps for every program in the transaction, including CPIs
- The bump allocator does not reclaim freed heap memory during that program invocation
- Stack: 4 KiB per SBF function-call frame
- SBF function-call depth and CPI nesting depth are different limits. CPI currently allows up to 4 nested calls; a proposed change to 8 is not active.
- Memory regions: program code (read-only), stack, heap, and the serialized account input region
- An invalid memory access causes the instruction to fail
- Borrowing or zero-copy account parsing can reduce heap use

## Why it matters

Because freeing does not reclaim heap memory during an invocation, repeated allocations can use up the 32 KiB default even after values go out of scope. Large local variables can also exceed a 4 KiB stack frame. Knowing which memory limit a program is hitting makes allocation and stack failures easier to diagnose.

## Common mistakes
- Expecting Drop/free to reclaim heap — it doesn't; allocations only accumulate within an instruction
- Putting a large array or struct on the stack and blowing the 4 KiB frame ('access violation')
- Requesting more heap than needed; a larger heap applies to each program invoked by the transaction
- Confusing the 64-frame SBF function-call limit with the separate CPI nesting limit

## Example

```typescript
import {
  ComputeBudgetProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

function buildTransaction(programInstruction: TransactionInstruction) {
  return new Transaction().add(
    // The requested heap applies to each invoked program, including CPIs.
    ComputeBudgetProgram.requestHeapFrame({ bytes: 64 * 1024 }),
    programInstruction,
  );
}
```

### Heap allocation on chain

```rust
// Repeated allocations use heap space. Dropping a value does not reclaim
// that space until this program invocation ends.
let mut values = Vec::new();
for i in 0..100 {
    values.push(format!("item {i}"));
}
drop(values); // Frees the Rust value, but not the bump-allocated heap space.
```

## References
- [Solana Docs — Compute Budget](https://solana.com/docs/core/fees/compute-budget)
- [Solana Docs — Programs FAQ (memory)](https://solana.com/docs/programs/faq)
- [Helius — optimizing Solana programs](https://www.helius.dev/blog/optimizing-solana-programs)
