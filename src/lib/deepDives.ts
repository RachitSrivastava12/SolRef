export interface DeepDiveSection {
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
}

export interface DeepDive {
  conceptId: string;
  thesis: string;
  stages?: string[];
  sourceNotes?: string[];
  sections: DeepDiveSection[];
}

export const deepDives: Record<string, DeepDive> = {
  "proof-of-history": {
    conceptId: "proof-of-history",
    thesis: "Proof of History is a verifiable SHA-256 hash chain, not consensus or a trusted timestamp server. It supplied Solana's cryptographic clock under Tower BFT. Since Alpenglow activated, PoH no longer paces block production, and the Clock sysvar timestamp has a new source.",
    stages: ["Tower-era leader ran SHA-256(prev) on one core", "Transactions were recorded as entries in the stream", "A fixed count of hashes paced a slot (~400ms then)", "Validators re-verified the chain in parallel", "Tower voted on forks identified by the PoH ledger"],
    sourceNotes: [
      "Engineering Solana frames Tower-era PoH as 'the basis of all major technical optimizations' — the trustless clock that removed separate time-agreement rounds from the old design.",
      "SHA-256 is the load-bearing primitive: deterministic, preimage-resistant, and collision-resistant, which is what makes the recorded sequence impossible to forge or reorder after the fact.",
      "Generation is single-core and strictly sequential; verification is embarrassingly parallel across all other validators — that asymmetry IS the design.",
      "In the Tower era, a slot was paced by a fixed amount of hashing (about 400ms); mainnet now uses 200ms slots after a separate slot-time rollout.",
      "Boundary to hold onto: PoH is part of the historical Tower model; Votor now handles mainnet consensus, and PoH no longer paces block production.",
    ],
    sections: [
      {
        eyebrow: "First Principles",
        title: "A verifiable delay function, not a clock you trust",
        body: "Each output of the hash becomes the next input: h(n+1) = sha256(h(n)). Because you cannot compute hash N without first computing hash N-1, the only way to produce a sequence of, say, 800,000 hashes is to actually spend the wall-clock time it takes one core to run them. The length of the chain is therefore cryptographic proof that time passed — no external clock, NTP server, or honest-majority assumption required.",
        bullets: [
          "VDF property: cheap to verify, impossible to fast-forward — you can't skip ahead in the chain.",
          "SHA-256 gives determinism + collision resistance, so every validator that replays the chain gets the exact same sequence.",
          "Time is measured in hashes, not seconds: the leader's 'experience of time' is encoded as the count of recursive hashes it produced.",
        ],
      },
      {
        eyebrow: "The Asymmetry",
        title: "One slow writer, thousands of fast checkers",
        body: "In the Tower-era implementation, the leader ran PoH on a single CPU core, sequentially, with no shortcuts. Other validators could split the sequence into chunks and verify them across many cores, checking each recorded hash against its predecessor. That made hash generation sequential and verification parallel. It explains the former clock design; PoH no longer paces mainnet block production.",
        bullets: [
          "Generation: strictly sequential, single-threaded, bounded by one core's hash rate.",
          "Verification: parallel, batched, distributed across the network's hardware.",
          "An adversarial leader cannot 'compress' history — forging a shorter-than-real timeline is computationally infeasible.",
        ],
      },
      {
        eyebrow: "Recording",
        title: "Tower-era transactions were stamped into the stream",
        body: "Under Tower, the leader interleaved transaction hashes into the PoH sequence, creating entries — chunks of ordered transactions anchored to a point in the hash chain. That position fixed the transaction's order in the old ledger model. Alpenglow changed block production: PoH no longer paces it, and tick entries have left the shred stream.",
        bullets: [
          "A transaction hash was mixed into the Tower-era chain, anchoring its place in that history.",
          "Entries were the unit Turbine broke into shreds and propagated.",
          "Ticks advanced the old clock between entries; they no longer appear in the shred stream.",
        ],
      },
      {
        eyebrow: "Why It Matters",
        title: "It lets Tower skip the conversation about time",
        body: "In Solana's Tower era, PoH supplied a ledger-based clock. Tower used that agreed history to express vote lockouts without a separate time-agreement round. Alpenglow changed that model: Votor now handles consensus, PoH no longer paces block production, and tick entries have left the shred stream.",
        bullets: [
          "This describes the previous Tower BFT design, not current Votor consensus.",
          "Tower vote lockouts (2, 4, 8, … slots) were tied to the PoH-paced ledger.",
          "The Clock sysvar timestamp has a new source under Alpenglow; do not assume the old derivation.",
        ],
      },
      {
        eyebrow: "The Boundary",
        title: "PoH orders; it does not finalize",
        body: "PoH is not consensus. It formed part of the Tower-era timing and ledger model, while Tower votes determined which fork became canonical. Alpenglow has replaced Tower BFT with Votor. The Foundation says PoH no longer paces block production, so older descriptions of its ordering and clock role should be read as historical context.",
        bullets: [
          "Tower BFT was the previous consensus; Votor is live on mainnet.",
          "PoH no longer paces block production under Alpenglow.",
          "The Clock sysvar timestamp now has a different source.",
          "Confusing 'ordered' with 'final' leads to releasing funds on `processed` — a rollback-prone state.",
        ],
      },
      {
        eyebrow: "Failure Mode",
        title: "Ordered does not mean included",
        body: "Because there is no public mempool, a transaction can be signed, forwarded by an RPC, and visible to tooling without being included in a block. PoH does not tell an app whether its transaction landed. Robust clients treat inclusion as a separate fact they must poll for.",
        bullets: [
          "A recent blockhash bounds the window (~150 slots) in which a transaction can still be recorded.",
          "`processed` is provisional; on mainnet, `confirmed` and `finalized` now describe the same consensus state.",
          "A dropped transaction is a networking/scheduling outcome, not a contradiction of PoH.",
        ],
      },
    ],
  },
  "tower-bft": {
    conceptId: "tower-bft",
    thesis: "Tower BFT was Solana's pre-Alpenglow consensus protocol. It used PoH and exponentially growing vote lockouts (2 → 4 → 8 → … slots) to make it costly for validators to abandon a fork. Tower was retired on mainnet when Votor activated in October 2026; this deep dive explains the former design.",
    stages: ["Tower validator voted for a slot's blockhash", "Lockout for that vote = 2^n slots", "Each descendant vote doubled prior lockouts", "32 consecutive votes → slot rooted under Tower", "Rooted state was squashed into AccountsDB"],
    sourceNotes: [
      "Engineering Solana: because the PoH ledger is itself a reliable clock, PBFT-style timeouts can be ENCODED into the ledger, so validators stake votes against elapsed (hash-counted) time rather than wall-clock time.",
      "Four formal properties make a vote valid: (1) every node computes the same result without P2P chatter, (2) the PoH hash uniquely identifies the fork, (3) a vote is valid only if its PoH hash is in the ledger, (4) after voting, a validator won't vote for any non-descendant for at least H hashes — and those timeouts double.",
      "Vote transactions are consensus-critical, so the Banking Stage runs PHYSICALLY SEPARATE pipelines (dedicated VoteWorkers) for them rather than a unified priority queue.",
      "Alpenglow replaced Tower BFT on mainnet with Votor, removing vote transactions while leaving execution untouched.",
    ],
    sections: [
      {
        eyebrow: "Mechanism",
        title: "Exponential lockouts, not majority counting",
        body: "A vote in Tower was not a one-shot ballot — it was a commitment with a timer. The first vote on a fork locked a validator out of competing forks for 2 slots; the next descendant vote made it 4, then 8, 16, 32. After ~32 consecutive votes the lockout reached 2^31 slots (about 27 years at Tower's former 400ms slot target), and the slot was considered rooted. Reverting it required a supermajority of validators to abandon their stake. Finality came from the lockout growing until reversal became economically impossible.",
        bullets: [
          "Switching forks early is cheap; switching after many descendant votes means forfeiting locked stake.",
          "32 consecutive confirmations → rooted / finalized → irreversible.",
          "User-facing commitment levels (processed/confirmed/finalized) are thin wrappers over this voting depth.",
        ],
      },
      {
        eyebrow: "PoH Dependency",
        title: "Lockout is elapsed time encoded in the ledger",
        body: "Tower can only express 'wait 2^n slots before switching' because PoH already gives every validator an agreed, tamper-proof count of elapsed time. The timeout isn't enforced by a wall clock or a coordinator — it's a property of the ledger. Within a slot there is a rollback window; every subsequent vote tethered to that parent hash doubles the real time the network would have to stall to unroll it.",
        bullets: [
          "A slot is the rollback window in which a leader may produce a block.",
          "Voting on a fork constrains all FUTURE votes to that fork's descendants for the lockout period.",
          "Doubling timeouts are what turn a sequence of cheap votes into compounding finality pressure.",
        ],
      },
      {
        eyebrow: "Asynchrony",
        title: "Agreement without a messaging storm",
        body: "Classic PBFT needs multiple rounds of all-to-all messaging to tolerate Byzantine faults. Tower collapses most of that because the PoH hash deterministically and uniquely identifies a fork: every honest node replaying the ledger computes the same result, so a signed vote referencing a PoH hash is self-contained proof of what was voted on. The network gets BFT safety without each validator having to chat with every other validator every round.",
        bullets: [
          "All nodes compute the same fork state without P2P negotiation — PoH removes the round-trips.",
          "A vote message is only valid if the PoH hash it references actually exists in the ledger.",
          "Once a vote is cast, the validator won't vote for any non-descendant hash for at least H hashes.",
        ],
      },
      {
        eyebrow: "Liveness Engineering",
        title: "Why Tower gave votes a separate pipeline",
        body: "This is the design decision Engineering Solana dwells on. If votes shared one queue with user transactions, an attacker could flood the network with expensive non-vote traffic and starve the votes the chain needs to keep advancing — a liveness attack. The team considered a unified queue with absolute vote priority (vulnerable to head-of-line blocking and priority-logic bugs that could cause consensus failure) and a dynamic master-controller (reassignment overhead becomes its own bottleneck). The chosen answer — physically separate VoteWorker threads — isn't the most theoretically efficient, but it gives the strongest guarantee that consensus traffic always has an unblocked path.",
        bullets: [
          "Votes arrive via two paths: tpu_vote (direct from validators) and gossip_vote (older/forwarded votes).",
          "Vote txs barely conflict with each other, so the heavy conflict-scheduling of non-vote txs is wasted on them.",
          "The trade-off favors network stability over a cleaner unified design — correct for a foundational layer.",
        ],
      },
      {
        eyebrow: "Rooting",
        title: "From frozen vote target to permanent state",
        body: "Validators vote on the bank HASH of a frozen slot. Once enough of the network has voted and the lockouts have accumulated, the bank becomes rooted, and its state is 'squashed' — committed down into AccountsDB and its parent link cleared so older forked-off slots can be purged. Rooting is the moment Tower's accumulated votes turn into durable, on-disk, irreversible ledger state.",
        bullets: [
          "Validators vote on the composite bank hash, not raw account contents.",
          "Rooting (squashing) flushes the slot's deltas into persistent AccountsDB storage.",
          "Non-rooted sibling forks become safe to garbage-collect once a competing branch roots.",
        ],
      },
      {
        eyebrow: "The Boundary",
        title: "Tower was consensus, not execution",
        body: "Tower did not run programs, schedule accounts, price fees, or propagate shreds. It voted on blocks the leader pipeline had produced. Alpenglow replaced that consensus layer with Votor while leaving transaction execution and the SVM unchanged; Rotor, a later phase, is planned to change block propagation.",
        bullets: [
          "Account-write conflicts are resolved in Banking Stage, before any consensus vote.",
          "Turbine and Repair are propagation concerns, governed by stake-weighting, not vote rules.",
          "Votor replaced Tower's voting/finality layer; SVM execution, the scheduler, and AccountsDB remain separate.",
        ],
      },
    ],
  },
  alpenglow: {
    conceptId: "alpenglow",
    thesis: "Alpenglow is Solana's live mainnet consensus protocol. Votor replaced Tower BFT at slot 459,653,000 in epoch 1064 on October 21, 2026, removing vote transactions from blocks and targeting roughly 150ms finality. Rotor is a later, unscheduled phase that is planned to replace Turbine for block propagation.",
    stages: ["Leader proposes a block", "Validators exchange votes directly", "BLS signatures aggregate into certificates off-chain", "Votor finalizes in one or two voting rounds", "Rotor is planned for a later release"],
    sourceNotes: [
      "Votor is live on mainnet; Rotor is planned for a later release and is not yet scheduled.",
      "Votor's direct votes and aggregate BLS certificates replaced Tower's on-chain vote transactions.",
      "Mainnet activation began in epoch 1064; Tower handed off after the migration window at slot 459,653,000.",
      "PoH no longer paces block production, tick entries leave the shred stream, and the Clock sysvar timestamp has a new source.",
      "For most app builders, transaction execution is unchanged; `confirmed` and `finalized` now describe the same state.",
      "For the migration, validators needed Agave v4.3.2, Jito-Solana v4.3.2, or Harmonic Salsa v4.3.2, plus 0.8 SOL above vote-account rent for the VAT fee each epoch; Firedancer and Frankendancer were not supported.",
      "Anza developed Alpenglow and implemented Votor in Agave; independent validators adopted and activated the upgrade.",
    ],
    sections: [
      {
        eyebrow: "What Changes",
        title: "Votor replaces vote transactions with certificates",
        body: "Under Tower, validators broadcast vote transactions that occupied block space and grew the ledger. Votor changed the mechanism: validators exchange votes directly, sign with BLS keys, and aggregate signatures into certificates outside the normal transaction stream. Tower's vote transactions are no longer included in mainnet blocks.",
        bullets: [
          "BLS aggregation combines validator signatures into compact, verifiable certificates.",
          "Mainnet blocks no longer contain Tower vote transactions.",
          "A certificate records the validator agreement used to finalize a block.",
        ],
      },
      {
        eyebrow: "The Latency Math",
        title: "Finality in roughly 150ms",
        body: "Alpenglow replaces Tower's 32-slot rooting path, which took about 12.8 seconds, with Votor's one or two voting rounds. The Solana Foundation gives roughly 150ms as the mainnet finality target. This is finality latency, not block time: mainnet slots separately moved from 400ms to 200ms in October 2026.",
        bullets: [
          "The Foundation's target is roughly 150ms finality, down from about 12.8 seconds under Tower.",
          "Slot time is 200ms after a separate rollout; don't equate slot duration with finality latency.",
          "Votor tolerates 20% adversarial stake plus 20% offline stake.",
        ],
      },
      {
        eyebrow: "Rotor",
        title: "Rotor is planned for a later phase",
        body: "Rotor is designed to replace Turbine's multi-hop, stake-weighted tree with a single relay layer for block data. It is not part of the live Votor rollout: the Solana Foundation says Rotor is planned for a later release and has no schedule yet. Anza also lists geographically aware leader rotations and Quantumglow as future work, with no committed dates. Quantumglow is a research design for post-quantum security that replaces elliptic-curve cryptography with hash-based signatures.",
        bullets: [
          "Rotor would replace Turbine's multi-hop tree with a single relay layer.",
          "Rotor is not live on mainnet and has no scheduled release.",
          "Turbine remains the active block propagation protocol while Votor is live.",
          "Geographically aware leader rotations aim to reduce leader handoff latency.",
          "Quantumglow is an Anza post-quantum research design; neither it nor the leader-rotation work has a committed release date.",
        ],
      },
      {
        eyebrow: "The Boundary",
        title: "Finality upgrade, not an execution rewrite",
        body: "Alpenglow changes consensus and finality, not how SVM programs run, the scheduler resolves account conflicts, compute budgets are metered, or AccountsDB stores state. Programs and transactions continue to work as before. Infrastructure that consumes block and timestamp data does need to account for the new protocol behavior.",
        bullets: [
          "Banking Stage, account locks, compute budgets, and AccountsDB are unchanged.",
          "Alpenglow targets finality latency; it is not a throughput upgrade.",
          "PoH no longer paces block production; tick entries leave the shred stream.",
          "The Clock sysvar timestamp has a new source under Alpenglow.",
        ],
      },
      {
        eyebrow: "Builder Impact",
        title: "Confirmed and finalized now describe the same state",
        body: "On mainnet, `confirmed` and `finalized` now report the same Alpenglow consensus state. `processed` remains provisional and can be rolled back. The Foundation's finality target is roughly 150ms, compared with about 12.8 seconds under Tower. Apps can keep their existing RPC methods, while operators and indexers should review the stream and clock changes.",
        bullets: [
          "`processed` is provisional; `confirmed` and `finalized` now describe the same state.",
          "Most app builders need no migration for transaction execution.",
          "Geyser consumers should use `bank_id`; a slot can contain more than one candidate bank.",
          "The migration required Agave v4.3.2, Jito-Solana v4.3.2, or Harmonic Salsa v4.3.2, and 0.8 SOL above vote-account rent for VAT.",
        ],
      },
    ],
  },
  "quic-swqos": {
    conceptId: "quic-swqos",
    thesis: "Before a priority fee can matter, the packet must reach the leader. QUIC and stake-weighted QoS are the congestion-control layer at the front door.",
    stages: ["Client/RPC sender", "QUIC connection", "Stake-weighted lane", "Leader TPU"],
    sourceNotes: [
      "Engineering Solana treats QUIC as the start of the hot path: transaction bytes arrive at the TPU Fetch Stage over authenticated streams.",
      "Stake-weighted QoS changes ingress capacity before Banking Stage priority fees ever matter.",
      "The TPU has separate ports/paths for standard transactions, vote traffic, and forwarded transactions.",
    ],
    sections: [
      {
        eyebrow: "Ingress",
        title: "The first bottleneck is not block space",
        body: "Under load, transactions compete to be received before they ever compete to be scheduled. QUIC gives leaders identity-aware flow control, while SWQoS reserves most ingest capacity for trusted/staked peers.",
        bullets: [
          "Public, unstaked senders share a smaller open lane.",
          "Staked RPC or sender relationships can materially change landing reliability.",
          "A high CU price cannot help a packet that never reaches the leader.",
        ],
      },
      {
        eyebrow: "Design Takeaway",
        title: "Sender infrastructure is part of app architecture",
        body: "For latency-sensitive apps, RPC choice is not just a convenience decision. It affects retry cadence, preflight strategy, and how quickly transactions reach upcoming leaders.",
        bullets: [
          "Simulate once, then send raw bytes through a strong sender when speed matters.",
          "Retry with fresh blockhashes instead of trusting indefinite default retries.",
          "Measure landing rate per sender, not just RPC request latency.",
        ],
      },
    ],
  },
  "banking-stage": {
    conceptId: "banking-stage",
    thesis: "Banking Stage is where Sealevel becomes real: the scheduler turns declared account access into parallel batches, then commits successful writes into a Bank.",
    stages: ["Verified queue", "Conflict scheduler", "Worker execution", "Bank commit", "PoH record"],
    sourceNotes: [
      "Engineering Solana describes Banking Stage as a pipelined process inside the larger TPU pipeline.",
      "The Bank lifecycle is open -> frozen -> rooted; rooted state is squashed into AccountsDB after consensus.",
      "Vote and non-vote transactions are intentionally separated to protect liveness under load.",
    ],
    sections: [
      {
        eyebrow: "Hot Path",
        title: "The scheduler decides usable throughput",
        body: "Solana can only parallelize transactions whose account access does not conflict. A sophisticated scheduler can fill more of the block with useful work by choosing compatible transactions and respecting priority signals.",
        bullets: [
          "Two writable accesses to the same account serialize.",
          "Read-only shared accounts are cheap; writable global accounts are bottlenecks.",
          "Tight compute estimates help the scheduler pack the block without over-reserving budget.",
        ],
      },
      {
        eyebrow: "Bank Lifecycle",
        title: "Open, frozen, rooted",
        body: "A Bank is the slot-local state snapshot the leader mutates while producing a block. When the slot closes, the Bank freezes, computes its final hash, and can later become rooted after consensus.",
        bullets: [
          "Open banks can process transactions and collect state deltas.",
          "Frozen banks no longer accept writes and expose the hash validators vote on.",
          "Rooted banks make state permanent and allow older fork data to be cleaned.",
        ],
      },
      {
        eyebrow: "Liveness",
        title: "Votes are not just another transaction class",
        body: "The dedicated vote paths are a protocol-safety decision. A unified queue might look cleaner, but it risks user traffic delaying the votes needed for the chain to keep moving.",
        bullets: [
          "Non-vote transactions need conflict-aware scheduling.",
          "Vote transactions are consensus-critical and have a different processing profile.",
          "Alpenglow changes this area by moving finality votes away from the normal transaction hot path.",
        ],
      },
      {
        eyebrow: "Program Design",
        title: "Your account layout is performance engineering",
        body: "A protocol with one giant mutable state account can sabotage Solana's parallel runtime. Splitting state into per-user, per-market, or per-position accounts gives the Banking Stage more independent work.",
        bullets: [
          "Prefer many small writable state accounts over one global mutable account.",
          "Keep shared config accounts read-only inside hot instructions.",
          "Use local fee market behavior as a signal that a state shard is too hot.",
        ],
      },
    ],
  },
  "svm-bytecode": {
    conceptId: "svm-bytecode",
    thesis: "The SVM is not just a VM instruction set. It is the runtime boundary that meters compute, enforces account ownership, manages invocation context, and isolates programs.",
    stages: ["SBF bytecode", "Transaction processor", "Invoke context", "Account borrow rules", "Metered result"],
    sourceNotes: [
      "Engineering Solana separates the SVM execution environment from Sealevel's parallel scheduling idea.",
      "The InvokeContext is intentionally ephemeral: programs do not get direct access to ledger state.",
      "Runtime callbacks let the transaction processor ask the Bank for state while preserving a clean execution boundary.",
    ],
    sections: [
      {
        eyebrow: "Runtime",
        title: "Execution is constrained by account metadata",
        body: "Programs can only touch accounts declared by the transaction and can only mutate data they own. CPI extends the call graph, but the runtime still meters compute and tracks account borrows across calls.",
        bullets: [
          "SBF is the bytecode target; Solana programs are loaded and executed under runtime rules.",
          "InvokeContext carries the nested call state for CPIs.",
          "Compute metering prevents one instruction from monopolizing a slot.",
        ],
      },
      {
        eyebrow: "Low Level",
        title: "SVM APIs make the runtime portable",
        body: "A clean runtime interface lets test engines and clients execute Solana transactions without needing the entire validator pipeline. That is why tools like LiteSVM can be fast while still teaching the right execution model.",
        bullets: [
          "The runtime consumes transactions plus account state, then emits account changes and logs.",
          "Validator stages around it handle networking, scheduling, banking, and propagation.",
          "Testing at the SVM boundary catches account/compute mistakes earlier than full-cluster tests.",
        ],
      },
    ],
  },
  accountsdb: {
    conceptId: "accountsdb",
    thesis: "AccountsDB is the live state engine, not the historical ledger. It makes current account reads fast and validator bootstrapping possible through snapshots.",
    stages: ["Bank account writes", "Accounts cache", "AppendVec storage", "Accounts index", "Snapshot"],
    sourceNotes: [
      "Engineering Solana frames AccountsDB as three cooperating layers: persistent storage, in-memory index, and caches.",
      "AppendVec favors sequential writes instead of in-place mutation, which fits Solana's high write pressure.",
      "Shrinking uses a careful two-map/guard pattern so background compaction does not break hot transaction reads.",
    ],
    sections: [
      {
        eyebrow: "Storage Split",
        title: "Current state and history are different products",
        body: "A normal validator optimizes for replaying the recent chain and serving current state. Old ledger history, indexed history, and analytics are usually externalized to archive nodes or data products.",
        bullets: [
          "The ledger/blockstore records shreds and entries.",
          "AccountsDB answers what an account looks like now.",
          "Snapshots let a new validator start from a recent state root instead of replaying from genesis.",
        ],
      },
      {
        eyebrow: "Internals",
        title: "Append-only files plus an index",
        body: "AccountsDB writes account versions into append-only storage and keeps an index to find the latest version. Cleanup, shrinking, and caching are essential because hot accounts update frequently.",
        bullets: [
          "AppendVec-style storage favors fast sequential writes.",
          "The account index maps pubkeys to the latest storage location.",
          "Caches smooth the hot path before flush/shrink work compacts storage.",
        ],
      },
      {
        eyebrow: "Compaction",
        title: "Shrinking must not pause the hot path",
        body: "AccountsDB cannot let background cleanup expose inconsistent storage to transaction workers. During shrink, readers may need to find either the old sparse store or the new compacted store.",
        bullets: [
          "The main storage map remains available for the old store while shrinking begins.",
          "A temporary shrink-in-progress map exposes the new store during the transition.",
          "When the guard drops, the compacted store swaps into the main map cleanly.",
        ],
      },
    ],
  },
  sealevel: {
    conceptId: "sealevel",
    thesis: "Sealevel is the scheduling idea that makes Solana horizontal inside one validator: transactions declare account access, so non-conflicting work can run at the same time.",
    stages: ["Declare accounts", "Lock read/write sets", "Batch non-conflicts", "Execute in SVM", "Commit account writes"],
    sourceNotes: [
      "Engineering Solana calls out the common confusion: SVM is the VM/execution environment; Sealevel is the parallel execution strategy.",
      "The developer pays complexity upfront by declaring accounts, and the validator earns that back as scheduler parallelism.",
      "Hot writable accounts collapse parallelism, no matter how many CPU cores the validator has.",
    ],
    sections: [
      {
        eyebrow: "Distinction",
        title: "Sealevel is not the whole SVM",
        body: "The SVM runs instructions under runtime rules. Sealevel is the reason the runtime can feed independent transactions to worker threads without discovering conflicts only after execution begins.",
        bullets: [
          "Every instruction declares the accounts it will read or write.",
          "Writable overlap forces serialization.",
          "Read-only program and config accounts can be shared across many transactions.",
        ],
      },
      {
        eyebrow: "Program Design",
        title: "Account topology is throughput topology",
        body: "A protocol's state layout tells the scheduler how much parallelism is possible. Splitting state into independent shards lets the runtime use more of the validator's hardware.",
        bullets: [
          "Per-user, per-position, or per-market accounts usually scale better than one global mutable account.",
          "Compute units measure work; account locks decide whether that work can run beside other work.",
          "Local fee markets expose which writable accounts are becoming bottlenecks.",
        ],
      },
    ],
  },
  firedancer: {
    conceptId: "firedancer",
    thesis: "Firedancer is both a performance project and a resilience project: a second independently engineered validator stack reduces client monoculture risk.",
    stages: ["Networking tiles", "Runtime integration", "Consensus compatibility", "Mainnet hardening"],
    sections: [
      {
        eyebrow: "Client Diversity",
        title: "Same protocol, independent implementation",
        body: "Client diversity only works if every client agrees on state transitions. Firedancer is valuable because it is not a rewrite in the same style; it stress-tests assumptions in networking, scheduling, and runtime integration.",
        bullets: [
          "Frankendancer combines Firedancer networking with the Agave runtime path.",
          "Full Firedancer is still being hardened and should be treated separately from Frankendancer.",
          "The network goal is no single implementation controlling enough stake to stop the cluster.",
        ],
      },
      {
        eyebrow: "Performance",
        title: "Throughput raises need validator headroom",
        body: "Block limit increases and tighter latency targets are only safe when validators can replay and vote without falling behind. Firedancer increases that margin through a radically optimized validator architecture.",
        bullets: [
          "Kernel-bypass networking reduces packet overhead.",
          "Tile-based design isolates high-throughput stages.",
          "Client performance gates roadmap items like larger blocks and async execution.",
        ],
      },
    ],
  },
};

export function deepDiveFor(conceptId: string): DeepDive | undefined {
  return deepDives[conceptId];
}
