// Vercel Serverless (Edge) Function — POST /api/chat
// SolRef's built-in Solana assistant. Answers questions, explains internals,
// and points users to the right page. Grounded in (a) the live site map +
// concept index, (b) a distilled digest of "Engineering Solana" (Prince Israel),
// and (c) per-question RETRIEVED CONTEXT the client sends from its search index.
//
// Env vars (Vercel → Settings → Environment Variables):
//   OPENROUTER_API_KEY = sk-or-...        (required)
//   OPENROUTER_MODEL   = deepseek/...     (optional; default below)
//
// The browser falls back to "related pages" links if this errors or the key is
// missing, so the assistant is still useful without a key.

export const config = { runtime: "edge" };

interface ChatMessage { role: "user" | "assistant"; content: string }
interface Body { messages: ChatMessage[]; context?: string; page?: string }

const PERSONA = `You are SolRef's built-in assistant: a friendly, precise Solana systems expert embedded in SolRef — a reference site for how Solana works internally (protocol, runtime, validator hot path, and the 2025 frontier).

YOUR JOB
- Answer the user's Solana question clearly, and point them to the right page on THIS site.
- Help confused users: explain the mental model, disambiguate terms, and redirect them to the best page or learning track.

GROUNDING
- Prefer the SITE MAP, the ENGINEERING SOLANA DIGEST, and the RETRIEVED CONTEXT below. They are your source of truth for Solana internals and for linking.
- If the answer isn't in your knowledge and you're not sure, say so briefly. Never invent API names, numbers, or behavior.
- If the question is not about Solana/blockchain, gently steer back.

STYLE
- Concise and high-signal: a short paragraph or a tight bulleted list. ~2–8 sentences. No fluff, no restating the question.
- Teach the WHY, not just trivia, when it helps understanding.
- ALWAYS link relevant site pages inline as markdown links using their exact path, e.g. [Proof of History](/docs/proof-of-history) or the [Consensus & Finality track](/deep-dives/consensus-finality). Use ids exactly as given in the context/site map.
- If the user seems lost or new, suggest [the learning path](/learn) or a deep-dive track.
- Plain markdown only: short paragraphs, "-" bullets, and links. Code fences only for a 1–4 line snippet that genuinely helps. No big headers.`;

const SITE_MAP = `SITE MAP (link to these):
- /learn — guided learning path (start here for beginners)
- /docs — all concept references; /docs/<id> for one concept
- /deep-dives — curated study tracks; /deep-dives/<trackId> for one track
- /quizzes and /quizzes/<id> — grounded quizzes per concept
- /workspace — in-browser code editor with AI hints/review
- /innovations — the protocol systems + interactive commitment states
- /lifecycle — interactive transaction lifecycle; /sandwich — sandwich-attack simulator

CONCEPT PAGES (/docs/<id>): transactions, blocks-slots, proof-of-history, tx-lifecycle, gulf-stream, turbine, tower-bft, mev, priority-fees, epochs-validators, accounts-model, instructions-cpis, sealevel, rpc-infra, pda, versioned-tx, fee-economics, clusters, sandwich, validator-economics, alpenglow, firedancer, doublezero, async-execution, quic-swqos, gossip-repair, compute-units, rent, svm-bytecode, token-extensions, state-compression, lookup-tables, geyser, accountsdb, banking-stage, jito, local-fee-markets.

DEEP-DIVE TRACKS (/deep-dives/<id>): execution-hot-path (TPU→Banking→SVM→AccountsDB), consensus-finality (PoH, Tower, Alpenglow), runtime-programs (accounts, Sealevel, SBF, CPI, PDAs), network-propagation (QUIC/SWQoS, Gossip, Turbine, DoubleZero), state-data (AccountsDB, Geyser, compression), fees-mev-roadmap (priority fees, MEV, Jito), frontier-2025 (Alpenglow, Firedancer, DoubleZero, async exec).`;

// Distilled from "Engineering Solana" (Prince Israel, 1st ed.) — the validator
// hot path and the "why" behind it. Keep facts faithful; this is grounding, not a quote.
const BOOK_DIGEST = `ENGINEERING SOLANA DIGEST (validator hot path, from network ingress to committed state):

WHAT SOLANA IS — at its core a globally-replicated state machine that behaves like a specialized key-value database: key = Pubkey, value = Account. It has a state store (AccountsDB), an in-memory index (AccountsIndex), multi-layer caches, and is queried via RPC (getAccountInfo/getProgramAccounts). A "write" is a transaction that costs fees and must be agreed by consensus. State is append-only (you supersede, never UPDATE/DELETE), which creates an immutable audit trail. Tension: high throughput → fast AccountsDB growth (state bloat) → heavier hardware → fewer independent verifiers.

ACCOUNT MODEL — Account fields: lamports, data (bytes), owner (program), executable (bool), rent_epoch (legacy; rent collection deprecated). In-runtime accounts use AccountSharedData with data behind an Arc for thread-safe concurrent access in the Banking Stage. Rules: only the OWNER program can modify an account's data or deduct its lamports; ANY program can credit lamports or read any account. New accounts are owned by the System Program, which alone can assign ownership and allocate zero-initialized data. Programs are stateless accounts holding SBF code; state lives in separate data accounts. PDAs are addresses bumped OFF the ed25519 curve (no private key); the owning program signs via invoke_signed(seeds, bump). find_program_address can be compute-costly, so derive off-chain and verify on-chain with create_program_address.

SVM vs SEALEVEL — the SVM is the execution environment that runs programs compiled to SBF (Solana's eBPF dialect) on the rBPF VM implementing the SVM ISA. Sealevel is the PARALLEL execution strategy: because every transaction pre-declares the accounts it reads/writes, the runtime batches non-conflicting txs across cores and serializes only those that write the same account. rBPF ISA: 64-bit registers, r0=return value, r1–r4=args, r5–r9=callee-saved, r10=frame pointer, r11=stack pointer; bounded stack; restricted syscalls; verifier rejects unbounded loops. Pinocchio is a zero-dependency alternative to the solana-program crate for lean programs.

TPU (Transaction Processing Unit) — the leader's pipeline, 4 stages: Fetch → SigVerify → Banking → Broadcast (PoH records alongside). QUIC is the ingress transport (over UDP): connection identity via mTLS, multiplexed independent streams (a lost spam packet only blocks its own stream — no head-of-line blocking like TCP), and 0-RTT for known clients. Stake-Weighted QoS (SWQoS): bandwidth is allocated proportional to a sender's stake; staked-node connection cap ~2000, unstaked ~500 — so spam can't starve real/vote traffic. Ports: tpu (user txs), tpu_vote (consensus votes), tpu_forwards (txs forwarded from the prior leader). SigVerify batches Ed25519 checks (often GPU-accelerated). The TPU Client / fast path: getLeaderSchedule + a "fanout" that sends the wire transaction in parallel to the current AND next N leaders (a client-side Gulf Stream), via a warm QUIC connection pool. The RPC slow path adds a middleman hop but gives commitment feedback.

BANKING STAGE — where Sealevel becomes real. Three receiver channels: non_vote, tpu_vote, gossip_vote. PacketDeserializer turns raw packets into SanitizedTransactions buffered to decouple ingress from execution. A SchedulerController runs one of two schedulers: PrioGraphScheduler (builds a dependency graph by account locks, schedules max parallelism, orders by priority fee) or GreedyScheduler (simpler, lower overhead). Output = batches of non-conflicting txs → ConsumeWorker threads (one per core, minus vote-reserved). Vote and non-vote txs get PHYSICALLY SEPARATE pipelines (dedicated VoteWorkers): a unified queue would let expensive non-vote spam starve the votes the chain needs to advance (a liveness attack / head-of-line blocking) — so robustness is chosen over a "cleaner" unified design. After execution, a Committer fans out side effects: TransactionStatusSender (RPC getSignatureStatuses), PrioritizationFeeCache, ReplayVoteSender.

THE BANK — a slot-local snapshot of state. Lifecycle: OPEN (mutable, processes txs, records deltas) → FROZEN (slot closes, computes the bank hash validators vote on, updates sysvars, collects rent) → ROOTED (enough votes → "squashed": deltas committed to AccountsDB, parent link cleared, sibling forks purged). The bank hash is a COMPOSITE of parent hash + signature_count + last_blockhash + hard_forks. Hashing every account each slot is too slow, so Solana uses a homomorphic Lattice Hash (LtHash): "mix out" an account's old state and "mix in" the new without rehashing everything. Banks chain into BankForks via new_from_parent (delta on the parent). Crossing an epoch boundary triggers process_new_epoch (stake rewards, leader schedule, feature activations).

THE SVM RUNTIME / INVOKE CONTEXT — for each transaction the TransactionBatchProcessor builds an ephemeral, sandboxed InvokeContext. It holds: TransactionContext (only the loaded accounts this tx may touch — least privilege), ProgramCacheForTxBatch (local compiled-program cache), EnvironmentConfig (feature_set, sysvar_cache, callback to the Bank), a ComputeMeter (RefCell gas tank — hits zero → halt), and a LogCollector. Determinism is enforced (no randomness, no network). CPIs use push/pop of stack frames with a reentrancy check; prepare_instruction prevents privilege escalation (can't pass a read-only account as writable, can't gain signer rights), deduplicates accounts, and validates the callee is executable. Atomicity is trivial: on any failure the whole sandbox is discarded and state rolls back. Programs reach the outside only via syscalls (sol_log, sol_invoke / sol_invoke_signed, sysvar getters, crypto, memory). Read-only logic STILL requires a transaction — Solana has no free Ethereum-style "view"/"call"; to read state, query account data via RPC instead.

CALLBACK-TRAIT DEPENDENCY INVERSION — the Bank needs the processor and the processor needs Bank state: a circular dependency. It's broken by a callback trait (TransactionProcessingCallback extends InvokeContextCallback). The Bank implements the trait; the processor depends only on the abstraction (so it can run against a MockBank or an in-memory HashMap for tests/simulators). FORK-AWARE PROGRAM CACHE: programs are upgradeable accounts, so a cached compiled program can go stale across forks. A ForkGraph answers relationship(slotA, slotB) → Ancestor/Descendant/Same/Unrelated; replenish_program_cache compares the cached program's slot to the on-chain account's modification slot to evict stale bytecode and avoid a consensus-breaking mismatch. (BankForks implements ForkGraph.)

ACCOUNTSDB — the live state engine (NOT the historical ledger). Three layers: persistent storage, in-memory index, caches. Storage unit = AccountsFile enum (AppendVec | TieredStorage), accessed via mmap or File. AppendVec is append-only: serialize a batch and write contiguously at the end (sequential I/O, no in-place mutation); record layout = StoredMeta (~48B, has data_len + pubkey) + AccountMeta (~56B) + AccountHash + variable data + padding to 8B; an append_lock Mutex serializes writers while readers proceed lock-free. AccountStorage maps Slot → AccountStorageEntry and handles SHRINKING (compacting out dead account versions) via a two-map system + a ShrinkInProgress RAII guard: the new store lives in a shrink_in_progress_map until the guard drops, which atomically swaps it into the main map — so readers always find the account during compaction (solves the race). AccountsIndex is sharded into bins (account_maps) so different pubkeys lock independently; each AccountMapEntry holds a slot_list (Vec<(Slot, AccountInfo)>) + a ref_count for garbage collection (purge at zero); it runs hybrid memory/disk (hot/abnormal entries in RAM, the rest on disk). RootsTracker (RollingBitField) tracks rooted slots; latest_slot() picks the newest slot that's an ancestor or a root ≤ max_root. CACHES: AccountsCache (write cache: AccountsCache → SlotCache → CachedAccount; absorbs parallel writes, decouples execution from disk) uses a SeqLock for lazy account hashing (readers never block; writers bump a version counter, readers retry if it changed — no writer starvation). ReadOnlyAccountsCache speeds reads of rooted, hot, large (executable) accounts, evicted by a sampled-LRU on a background thread. FLUSHING (rooted SlotCache → new AppendVec on disk, index updated, cache freed) is distinct from SHRINKING (reclaim dead bytes on disk). Snapshots let a new validator bootstrap from recent state instead of replaying genesis.

SIGNATURES — Ed25519 (EdDSA over Curve25519), 64-byte signature wrapping [u8;64]; verified with verify_strict; gives authenticity + authorization + replay protection (via recent blockhash). Inside execution programs see account.is_signer = true only when a valid signature was included for that account.

PROTOCOL ENGINEERING TOOLING — Criterion.rs (statistical benchmarking; black_box to defeat the optimizer); Trident (Anchor fuzzing; catches missing-signer, arithmetic-overflow, cross-instruction corruption, type-cosplay bugs); formal verification of SBF bytecode via the Certora Solana Prover and the K framework; LiteSVM (in-process SVM with "time travel" / sysvar manipulation for fast tests); Lighthouse (on-chain assertion guardrails); observability distinguishes "surface latency" from "freshness" (poll getSlot vs a direct validator to detect drift).`;

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  // @ts-ignore — Vercel edge exposes process.env at runtime
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return json({ error: "OPENROUTER_API_KEY not configured" }, 503);
  // @ts-ignore
  const model = (process.env.OPENROUTER_MODEL as string) || "deepseek/deepseek-v4-flash";

  let body: Body;
  try {
    body = await req.json();
    if (!Array.isArray(body?.messages) || body.messages.length === 0) throw new Error("no messages");
  } catch {
    return json({ error: "Send { messages: [...] }" }, 400);
  }

  const history = body.messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

  const system = [
    PERSONA,
    SITE_MAP,
    BOOK_DIGEST,
    body.context ? `RETRIEVED CONTEXT — most relevant SolRef pages for this question (use these to answer and to link exact ids):\n\n${body.context.slice(0, 6000)}` : "",
    body.page ? `The user is currently on the page: ${body.page}` : "",
  ].filter(Boolean).join("\n\n");

  try {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "X-Title": "SolRef Assistant" },
      body: JSON.stringify({
        model, temperature: 0.3, max_tokens: 700,
        messages: [{ role: "system", content: system }, ...history],
      }),
    });
    if (!r.ok) return json({ error: "Upstream error", detail: (await r.text()).slice(0, 200) }, 502);
    const data = await r.json();
    const text: string = data?.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) return json({ error: "Empty response" }, 502);
    return json({ text, model });
  } catch (e) {
    return json({ error: "Request failed", detail: String(e).slice(0, 200) }, 500);
  }
}

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
