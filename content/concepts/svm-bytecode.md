---
id: svm-bytecode
order: 29
title: SVM Bytecode (rBPF / SBF)
tag: Programs
level: advanced
icon: Code2
diagramKey: null
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: unclassified
exampleStatus: needs-expert-verification
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Anza — rBPF VM (GitHub)
    url: https://github.com/anza-xyz/sbpf
    sourceKind: implementation
  - label: Solana Docs — programs & deployment
    url: https://solana.com/docs/core/programs
    sourceKind: primary
aiAssisted: unknown
codeLanguage: rust
---

## Overview

Solana programs don't run native code — they compile to SBF (Solana Bytecode Format), a Solana-flavored variant of eBPF, and execute inside rBPF, a sandboxed register-based virtual machine. The VM meters every operation in compute units, restricts syscalls, and isolates programs from each other and the host. This is the actual execution engine beneath Sealevel's parallelism.

## Key facts
- SBF = Solana's fork of eBPF; programs in Rust/C compile to SBF ELF binaries
- rBPF is the Rust-based interpreter/JIT that runs SBF with strict sandboxing
- Register VM (not stack-based): 11 registers, bounded stack, no arbitrary syscalls
- Every opcode has a CU cost — the VM halts a program that exceeds its compute budget
- The verifier checks bytecode safety before execution; compute metering stops work that exceeds the transaction budget
- Programs are deployed as immutable-by-default bytecode in executable accounts
- A loader (BPF Loader / Loader-v4) validates and runs the bytecode
- Runtime v2 and loader-v4 modernize deployment, upgrades, and execution

## Why it matters

Understanding the VM explains Solana's guarantees and limits: why programs must declare account access (the VM can't discover it at runtime), why deep recursion and huge stacks fail, why compute units exist (they meter VM opcodes), and why a buggy program can't corrupt others (sandbox isolation). When you hit 'access violation', 'computational budget exceeded', or memory errors, you're hitting rBPF's guardrails. It's also why Solana can run the same SVM in rollups and other contexts — the VM is a portable, well-defined execution target.

## Common mistakes
- Assuming programs run native machine code — they run sandboxed SBF bytecode with metered ops
- Writing deeply recursive logic that blows the VM's bounded stack
- Assuming the verifier replaces runtime compute limits — valid programs can still exceed their transaction budget
- Confusing the SVM (execution engine) with Sealevel (the parallel scheduler around it)

## Example

```rust
// You author in Rust; the toolchain emits SBF bytecode the VM executes.
// A minimal native program entrypoint (no Anchor):
use solana_program::{
    account_info::AccountInfo, entrypoint, entrypoint::ProgramResult,
    pubkey::Pubkey, msg,
};

entrypoint!(process_instruction);

pub fn process_instruction(
    _program_id: &Pubkey,
    _accounts: &[AccountInfo],
    _data: &[u8],
) -> ProgramResult {
    // This msg! call is a syscall — it costs compute units in the VM.
    msg!("hello from SBF bytecode");
    Ok(())
}

// cargo build-sbf  →  target/deploy/your_program.so  (the SBF ELF)
// solana program deploy your_program.so  → the rBPF VM runs this bytecode,
// metering every opcode and enforcing the sandbox on each invocation.
```

## References
- [Anza — rBPF VM (GitHub)](https://github.com/anza-xyz/sbpf)
- [Solana Docs — programs & deployment](https://solana.com/docs/core/programs)
