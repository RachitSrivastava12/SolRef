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
    thesis: "Proof of History is not consensus and it is not a timestamp server. It is a verifiable delay function — a SHA-256 chain whose only purpose is to prove that real time elapsed between two events — so that the rest of the protocol can agree on the ORDER of transactions without paying for rounds of node-to-node 'what time is it?' messaging.",
    stages: ["Leader runs SHA-256(prev) on one core", "Transactions are recorded as entries into the stream", "A fixed count of hashes = one slot (~400ms)", "Validators re-verify the chain in parallel", "Tower votes on the fork the PoH hash identifies"],
    sourceNotes: [
      "Engineering Solana frames PoH as 'the basis of all major technical optimizations' — the trustless clock that removes the multi-round voting other chains need just to agree on time.",
      "SHA-256 is the load-bearing primitive: deterministic, preimage-resistant, and collision-resistant, which is what makes the recorded sequence impossible to forge or reorder after the fact.",
      "Generation is single-core and strictly sequential; verification is embarrassingly parallel across all other validators — that asymmetry IS the design.",
      "A slot is defined as a fixed number of hashes (~400ms of them), so 'elapsed time' becomes a count Tower can encode directly into vote lockouts.",
      "Boundary to hold onto: PoH orders events; Tower (and, later, Alpenglow's Votor) decides which fork is final.",
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
        body: "The leader runs PoH on a single CPU core, sequentially, with no shortcuts. But every other validator can split the produced sequence into chunks and verify all of them at once across many cores — checking that each recorded hash really is sha256 of the previous. So generation cost is O(n) on one core while verification cost is O(n / cores). This is precisely why Solana can keep a fast clock without that clock becoming a global bottleneck.",
        bullets: [
          "Generation: strictly sequential, single-threaded, bounded by one core's hash rate.",
          "Verification: parallel, batched, distributed across the network's hardware.",
          "An adversarial leader cannot 'compress' history — forging a shorter-than-real timeline is computationally infeasible.",
        ],
      },
      {
        eyebrow: "Recording",
        title: "Transactions are stamped INTO the stream",
        body: "PoH isn't a clock running off to the side. The leader interleaves transaction hashes into the sequence as it produces them, creating 'entries' — chunks of ordered transactions anchored to a specific point in the hash chain. The position of a transaction in the stream is its order, and that position is cryptographically fixed the instant it is recorded.",
        bullets: [
          "Inserting a transaction's hash mixes it into the chain, so its place in history can't be moved later.",
          "Entries (ordered transaction batches) are the unit Turbine later breaks into shreds and propagates.",
          "Ticks are 'empty' hashes that keep the clock advancing between entries, fixing the slot's hash count.",
        ],
      },
      {
        eyebrow: "Why It Matters",
        title: "It lets Tower skip the conversation about time",
        body: "On Bitcoin or Ethereum, nodes must exchange messages and run timeout logic to agree on when things happened before they can agree on order. PoH removes that entire round-trip: because the ledger itself is a reliable clock, a validator's vote can reference a PoH hash, and everyone already agrees what 'before' and 'after' mean. Tower BFT's lockouts are literally expressed as counts of PoH hashes — elapsed time encoded directly into the ledger.",
        bullets: [
          "No multi-round time-agreement protocol → far lower consensus latency.",
          "Vote lockouts (2, 4, 8, … slots) are denominated in PoH-counted time.",
          "A vote message is only valid if the PoH hash it voted on is actually present in the ledger.",
        ],
      },
      {
        eyebrow: "The Boundary",
        title: "PoH orders; it does not finalize",
        body: "The single most common misconception is that PoH 'is' Solana's consensus. It isn't. PoH proposes an order that is cheap to verify; validator voting (Tower today) still decides which fork becomes canonical and irreversible. Keeping these separate is what lets Alpenglow later replace the voting/finality path while leaving PoH's ordering role essentially intact.",
        bullets: [
          "PoH = ordering substrate. Tower / Votor = fork choice and finality.",
          "Under Alpenglow, PoH stays as the ordering clock but moves off the voting hot path.",
          "Confusing 'ordered' with 'final' leads to releasing funds on `processed` — a rollback-prone state.",
        ],
      },
      {
        eyebrow: "Failure Mode",
        title: "Ordered does not mean included",
        body: "Because there is no public mempool, a transaction can be signed, forwarded by an RPC, and even visible to tooling without ever being recorded into a leader's PoH stream. PoH says nothing about whether your transaction made it in — only about the order of what did. Robust clients treat inclusion as a separate fact they must poll for.",
        bullets: [
          "A recent blockhash bounds the window (~150 slots) in which a transaction can still be recorded.",
          "`processed` is a leader-local signal; `confirmed`/`finalized` are consensus signals — never conflate them.",
          "A dropped transaction is a networking/scheduling outcome, not a contradiction of PoH.",
        ],
      },
    ],
  },
  "tower-bft": {
    conceptId: "tower-bft",
    thesis: "Tower BFT is a PBFT-style consensus adapted to ride on top of PoH. Its core trick is vote-locking: every time a validator votes for a fork, the time it must wait before abandoning that fork DOUBLES (2 → 4 → 8 → … slots). That exponential lockout is what converts a stack of ordinary votes into mathematically irreversible finality, and it's why validators can't cheaply flip-flop between competing forks.",
    stages: ["Validator votes for a slot's blockhash", "Lockout for that vote = 2^n slots", "Each descendant vote doubles all prior lockouts", "32 consecutive votes → slot is rooted", "Rooted state is squashed into AccountsDB"],
    sourceNotes: [
      "Engineering Solana: because the PoH ledger is itself a reliable clock, PBFT-style timeouts can be ENCODED into the ledger, so validators stake votes against elapsed (hash-counted) time rather than wall-clock time.",
      "Four formal properties make a vote valid: (1) every node computes the same result without P2P chatter, (2) the PoH hash uniquely identifies the fork, (3) a vote is valid only if its PoH hash is in the ledger, (4) after voting, a validator won't vote for any non-descendant for at least H hashes — and those timeouts double.",
      "Vote transactions are consensus-critical, so the Banking Stage runs PHYSICALLY SEPARATE pipelines (dedicated VoteWorkers) for them rather than a unified priority queue.",
      "Alpenglow targets exactly this layer — it replaces the vote-transaction-heavy finality path while leaving execution untouched.",
    ],
    sections: [
      {
        eyebrow: "Mechanism",
        title: "Exponential lockouts, not majority counting",
        body: "A vote in Tower is not a one-shot ballot — it is a commitment with a timer. The first vote on a fork locks you out of competing forks for 2 slots; the next descendant vote makes it 4, then 8, 16, 32. After ~32 consecutive votes the lockout is so large (2^31 slots ≈ centuries) that the slot is considered ROOTED — reverting it would require a supermajority of validators to abandon their stake. Finality isn't a vote count crossing a line; it's the lockout growing until reversal is economically impossible.",
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
        title: "Why votes get a physically separate pipeline",
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
        title: "Tower is consensus, not execution",
        body: "Tower doesn't run programs, schedule accounts, price fees, or propagate shreds. It votes on blocks the leader pipeline already produced — execution and conflict scheduling happen earlier, in the Banking Stage, and propagation is Turbine's job. Keeping consensus cleanly separated from execution is exactly what lets Alpenglow swap the finality mechanism without rewriting the runtime.",
        bullets: [
          "Account-write conflicts are resolved in Banking Stage, before any consensus vote.",
          "Turbine and Repair are propagation concerns, governed by stake-weighting, not vote rules.",
          "Alpenglow replaces this voting/finality layer specifically — not the SVM, the scheduler, or AccountsDB.",
        ],
      },
    ],
  },
  alpenglow: {
    conceptId: "alpenglow",
    thesis: "Alpenglow is the largest change to Solana's consensus ever proposed — approved by 98.27% of voting stake. It retires Tower BFT's on-chain vote transactions and replaces them with two components: Votor, which aggregates validator votes into BLS-signed certificates OFF-chain, and Rotor, a flatter data-dissemination layer. The headline result is finality in ~100–150ms instead of ~12.8 seconds, and the elimination of the network's single largest source of ledger bloat: vote transactions.",
    stages: ["Leader proposes a block", "Validators sign votes with BLS keys", "Votes aggregate into one certificate (off-chain)", "≥80% stake → finalize in 1 round (~100ms)", "60–80% stake → 2nd round (~150–250ms)"],
    sourceNotes: [
      "Read Alpenglow AFTER Tower: it's easiest to understand as a redesign of the exact voting/finality path Tower owns, not a new runtime.",
      "Votor is the active mental model: off-chain BLS vote certificates replace the stream of on-chain vote transactions. Rotor (single-relay propagation that supersedes Turbine's multi-hop tree) is part of the same effort but worth scoping separately.",
      "Vote transactions are ~the largest consumer of block space and ledger growth today; removing them frees capacity for real user activity and shrinks ledger bloat dramatically.",
      "PoH does NOT disappear — it remains the ordering clock; Alpenglow just takes voting off the on-chain hot path.",
      "For app builders the implication is settlement latency and commitment assumptions, not a new SDK primitive.",
    ],
    sections: [
      {
        eyebrow: "What Changes",
        title: "Votes become off-chain BLS certificates",
        body: "Under Tower, validators broadcast vote TRANSACTIONS — millions per day — that occupy block space and grow the ledger forever. Votor changes the medium: validators sign their votes with BLS keys, and those signatures aggregate into a single compact certificate that proves a supermajority agreed, without any of it touching the normal transaction stream. Finality stops being 'how deep is the lockout?' and becomes 'does a valid certificate exist for this block?'.",
        bullets: [
          "BLS signature aggregation = thousands of votes collapse into one verifiable certificate.",
          "No more vote transactions → kills the #1 source of ledger bloat and frees block space for users.",
          "The finality question becomes binary and fast: certificate exists, or it doesn't.",
        ],
      },
      {
        eyebrow: "The Latency Math",
        title: "One round if 80%, two rounds if 60–80%",
        body: "Votor's speed comes from collapsing finality into one or two network round-trips. If ≥80% of stake responds in the first round, the block finalizes in roughly 100ms. If participation lands between 60% and 80%, a second round runs and finality still completes within a worst-case window of ~150–250ms. Compare that to Tower's ~32-slot rooting, which is ~12.8 seconds. This is an ~80x improvement in settlement latency — finality faster than most web requests.",
        bullets: [
          "≥80% stake in round 1 → finalized in ~100ms.",
          "60–80% stake → a 2nd round, finalized in ~150–250ms worst case.",
          "'20+20' resilience: tolerates 20% Byzantine AND 20% offline stake at the same time.",
        ],
      },
      {
        eyebrow: "Rotor",
        title: "Flatter propagation, scoped alongside Votor",
        body: "Rotor is the data-layer half of Alpenglow. Where Turbine fans shreds through a multi-hop, stake-weighted tree, Rotor uses a flatter single-relay-layer broadcast so blocks reach validators with fewer hops — tightening the propagation budget that fast finality depends on. It's part of the same redesign, but Votor is the piece that changes consensus semantics; treat Rotor as the propagation optimization that makes Votor's latency targets physically achievable.",
        bullets: [
          "Supersedes Turbine's multi-hop tree with a single-relay-layer broadcast.",
          "Lower propagation latency is a prerequisite for ~150ms finality.",
          "Complements DoubleZero's dedicated-fiber pipes — both shrink the time-on-the-wire budget.",
        ],
      },
      {
        eyebrow: "The Boundary",
        title: "Finality upgrade, not an execution rewrite",
        body: "Alpenglow does not change how SVM programs run, how the scheduler resolves account conflicts, how compute budgets are metered, or how AccountsDB stores state. It changes how the network agrees a produced block is final. This is the same clean separation that let Tower be swapped in the first place — consensus is a distinct layer from execution.",
        bullets: [
          "Banking Stage, account locks, compute budgets, and AccountsDB are untouched.",
          "Throughput (1M TPS path) comes from Firedancer + block-limit raises, not Alpenglow — Alpenglow is latency.",
          "PoH stays as the ordering clock; only the voting hot path moves.",
        ],
      },
      {
        eyebrow: "Builder Impact",
        title: "The confirmed/finalized gap nearly disappears",
        body: "Today builders trade safety for speed: wait ~1–2s for `confirmed`, or ~13s for `finalized`. Under Alpenglow, finalized settlement returns in ~150ms — so the gap between 'fast but reversible' and 'final' collapses. Payments, order books, and games can treat the chain as a low-latency backend and reserve true finality for settlement without imposing a visible delay. The same client code path simply gets ~80x faster when the upgrade activates.",
        bullets: [
          "Stop hard-coding 'finalized ≈ 32 slots forever' — that assumption expires with Alpenglow.",
          "Keep UX optimism (`confirmed`) and settlement safety (`finalized`) as distinct states in your client.",
          "Treat activation as protocol-version dependent: it passed governance but rolls out via testnet first.",
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
