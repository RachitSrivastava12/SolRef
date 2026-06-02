// ─────────────────────────────────────────────────────────────────────────────
// QUIZ BANK — questions are hand-grounded in the concept content on this site.
// Each is keyed by the concept `id` from content.tsx.
//
// To go fully dynamic later: keep this as the offline fallback and add an
// `generateQuizFromLLM(concept)` call (DeepSeek / Claude) that returns the same
// shape. The UI already consumes `QuizQuestion[]`, so it's a drop-in swap.
// See generateQuiz() at the bottom for the seam.
// ─────────────────────────────────────────────────────────────────────────────

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number; // index into options
  explain: string;
}

export const quizBank: Record<string, QuizQuestion[]> = {
  transactions: [
    {
      q: "What is the hard byte-size limit for a single Solana transaction?",
      options: ["512 bytes", "1232 bytes", "10 KB", "No limit"],
      answer: 1,
      explain: "A Solana transaction is capped at 1232 bytes. Touch enough accounts and you'll hit this wall — that's when you reach for versioned txs + Address Lookup Tables.",
    },
    {
      q: "What does the recent blockhash on a transaction actually do?",
      options: [
        "It encrypts the transaction payload",
        "It acts as a nonce and an expiry — it's only valid for ~150 slots",
        "It sets the priority fee",
        "It selects which validator runs the tx",
      ],
      answer: 1,
      explain: "The blockhash doubles as a nonce and an expiry. It expires in ~150 slots (~60s), so a stale blockhash gets the tx rejected outright.",
    },
    {
      q: "In a multi-instruction transaction, instruction #2 fails. What happens to instruction #1?",
      options: [
        "It stays committed; only #2 reverts",
        "Everything reverts — execution is all-or-nothing",
        "#1 commits and #2 retries automatically",
        "The runtime asks you which to keep",
      ],
      answer: 1,
      explain: "Transactions are atomic. Either ALL instructions succeed or ALL fail — there's no partial execution.",
    },
  ],
  "blocks-slots": [
    {
      q: "What's the difference between a slot and a block?",
      options: [
        "They're the same thing",
        "A slot is a ~400ms time window; a block is the data produced in that slot (and slots can be skipped)",
        "A block is faster than a slot",
        "A slot only exists on devnet",
      ],
      answer: 1,
      explain: "A slot is a fixed ~400ms window assigned to a leader. A block is the data at that slot — but if the leader is offline/slow, the slot is skipped and no block is produced.",
    },
    {
      q: "A skipped slot means…",
      options: [
        "Data was permanently lost",
        "The chain forked",
        "No block was produced for that slot — your tx just wasn't included there",
        "The network is down",
      ],
      answer: 2,
      explain: "Skipped slots ≠ lost data. The leader simply didn't produce a block; your transaction wasn't included in that slot.",
    },
    {
      q: "What is Solana's primary native unit of time for on-chain logic?",
      options: ["Unix timestamp", "Block number", "Slot number", "Epoch only"],
      answer: 2,
      explain: "The slot number is the blockchain's native clock — tx expiry, leader schedules, and rewards are all measured in slots.",
    },
  ],
  "proof-of-history": [
    {
      q: "Is Proof of History a consensus mechanism?",
      options: [
        "Yes, it replaces voting",
        "No — it's a cryptographic clock (a VDF). Tower BFT handles consensus",
        "Yes, it prevents double-spends directly",
        "Only on testnet",
      ],
      answer: 1,
      explain: "PoH is NOT consensus. It's a SHA-256 hash-chain clock proving time passed. Consensus (and double-spend prevention) is Tower BFT's job.",
    },
    {
      q: "Why does PoH let Solana skip 'what time is it?' messaging rounds?",
      options: [
        "Validators trust the leader blindly",
        "The leader timestamps txs into a verifiable hash chain, so order can be verified without communicating",
        "It uses GPS clocks",
        "It doesn't — it still needs rounds",
      ],
      answer: 1,
      explain: "The leader embeds txs into the hash sequence, creating a verifiable timeline. Validators verify order without round-trip time agreement — enabling sub-second blocks.",
    },
    {
      q: "Where does the PoH sequence live?",
      options: [
        "Stored permanently on-chain",
        "It runs ephemerally in the leader's CPU — only the resulting block hashes persist",
        "In every user's wallet",
        "On an external time server",
      ],
      answer: 1,
      explain: "PoH runs inside the leader's CPU and is ephemeral. Only block hashes persist on-chain — the full hash chain itself isn't stored.",
    },
  ],
  "tx-lifecycle": [
    {
      q: "Does Solana have a mempool?",
      options: [
        "Yes, like Ethereum",
        "No — if the leader drops your tx, it's gone and you must retry yourself",
        "Only during congestion",
        "Yes, but it's private",
      ],
      answer: 1,
      explain: "Solana has NO mempool. A dropped tx is gone — there's no pending pool it sits in. You implement retry logic yourself.",
    },
    {
      q: "What does the 'processed' commitment level guarantee?",
      options: [
        "The tx is finalized and irreversible",
        "2/3 of stake has voted",
        "The leader received it — no guarantee of inclusion or that it won't roll back",
        "Nothing was received",
      ],
      answer: 2,
      explain: "'Processed' just means the leader saw it. It is NOT confirmed and can still drop or roll back — use it only for real-time UI feedback.",
    },
    {
      q: "Which field should you track to know when it's safe to stop retrying a tx?",
      options: ["priorityFee", "lastValidBlockHeight", "computeUnits", "feePayer"],
      answer: 1,
      explain: "lastValidBlockHeight tells you the expiry. Once it's passed, the tx will never confirm and you can safely retry with a fresh blockhash.",
    },
  ],
  "gulf-stream": [
    {
      q: "What does Gulf Stream do?",
      options: [
        "Stores pending txs in a public pool",
        "Forwards txs directly to the current and upcoming leaders before their slot — no mempool",
        "Compresses blocks",
        "Runs consensus voting",
      ],
      answer: 1,
      explain: "Gulf Stream is mempool-less forwarding: your RPC sends txs straight to the next leaders (the schedule is public and deterministic).",
    },
    {
      q: "Why is mempool-style frontrunning harder on Solana?",
      options: [
        "Fees are too high",
        "There's no public pending pool for bots to scan and sandwich",
        "Transactions are encrypted",
        "Leaders are anonymous",
      ],
      answer: 1,
      explain: "No mempool = no public pool of pending txs to scan. That's why Solana MEV is leader-centric / Jito-based rather than mempool sniping.",
    },
    {
      q: "Tx forwarding via Gulf Stream is best described as…",
      options: [
        "Guaranteed delivery with receipts",
        "Fire-and-forget — a tx can silently drop if the leader was offline",
        "A two-phase commit",
        "Encrypted end to end",
      ],
      answer: 1,
      explain: "Forwarding is fire-and-forget with no delivery guarantee, which is exactly why robust retry logic is essential.",
    },
  ],
  turbine: [
    {
      q: "Why doesn't the leader send the full block to every validator?",
      options: [
        "Validators don't need the whole block",
        "That would be O(n²) bandwidth — instead Turbine fans out shreds through a stake-weighted tree",
        "Blocks are too small to matter",
        "Only the top validator gets the block",
      ],
      answer: 1,
      explain: "Sending a full block to ~1700 validators would be ~1.7 GB/s of upload. Turbine breaks blocks into shreds and fans them out, reducing bandwidth to O(n log n).",
    },
    {
      q: "What does Forward Error Correction (FEC) give Turbine?",
      options: [
        "Faster signatures",
        "The ability to reconstruct a block even when some shreds are missing",
        "Cheaper fees",
        "Encrypted shreds",
      ],
      answer: 1,
      explain: "Shreds are erasure-coded. With FEC, a validator can rebuild the full block from a subset of shreds, so missing pieces don't break propagation.",
    },
    {
      q: "Roughly how big is a single shred?",
      options: ["~128 bytes", "~1228 bytes", "~10 KB", "~1 MB"],
      answer: 1,
      explain: "Shreds are ~1228-byte erasure-coded fragments of a block.",
    },
  ],
  "tower-bft": [
    {
      q: "What does each consecutive vote on the same fork do to a validator's lockout?",
      options: [
        "Nothing",
        "Doubles it exponentially — making fork-switching exponentially expensive",
        "Halves it",
        "Resets it to zero",
      ],
      answer: 1,
      explain: "Lockout doubles on each consecutive vote (first is 2 slots, up to 2^31 slots). This makes reversing consensus mathematically extremely expensive.",
    },
    {
      q: "How many confirmations make a block 'finalized' (rooted)?",
      options: ["8", "16", "32", "150"],
      answer: 2,
      explain: "32 consecutive confirmations root the block, making it finalized and effectively irreversible.",
    },
    {
      q: "What does PoH provide to Tower BFT?",
      options: [
        "The staking rewards",
        "A cryptographic clock that reduces messaging overhead for agreeing on time/order",
        "The fee market",
        "The RPC layer",
      ],
      answer: 1,
      explain: "Tower BFT leans on PoH as a clock, so validators don't need extra messaging rounds to agree on timing — that's the efficiency win.",
    },
  ],
  mev: [
    {
      q: "Because Solana has no mempool, MEV is primarily…",
      options: [
        "Impossible",
        "Leader-centric — the leader orders txs in their block; Jito runs an off-chain bundle auction",
        "Done via the public pending pool",
        "Banned by the protocol",
      ],
      answer: 1,
      explain: "MEV is leader-centric. Jito built an off-chain block engine where searchers submit ordered bundles and bid tips to validators.",
    },
    {
      q: "What is a Jito bundle?",
      options: [
        "A wallet backup",
        "1–5 atomic, ordered transactions that all succeed or all fail",
        "A validator's stake account",
        "A type of NFT",
      ],
      answer: 1,
      explain: "A bundle is 1–5 ordered txs executed atomically. The tip tx is usually last, so a failed arb means the validator earns no tip.",
    },
    {
      q: "A common way retail traders get burned by MEV is…",
      options: [
        "Using too low a priority fee",
        "Setting very loose slippage (e.g. 100%) and getting sandwiched",
        "Using a hardware wallet",
        "Trading on devnet",
      ],
      answer: 1,
      explain: "Loose slippage is an open invitation to sandwich bots. Tight slippage makes the sandwich unprofitable.",
    },
  ],
  "priority-fees": [
    {
      q: "Which TWO ComputeBudget instructions should you always set?",
      options: [
        "setFeePayer and setNonce",
        "setComputeUnitLimit and setComputeUnitPrice",
        "setSlippage and setTip",
        "setBlockhash and setSigner",
      ],
      answer: 1,
      explain: "Set both: the CU limit (caps usage) and the CU price (microlamports per CU). Skipping the limit defaults to 200k CUs and wastes fees.",
    },
    {
      q: "How should you decide the CU limit for a tx?",
      options: [
        "Always use the 1.4M max",
        "Simulate to get exact CU usage, then add ~10% buffer",
        "Guess based on tx size",
        "Leave it unset",
      ],
      answer: 1,
      explain: "Simulate first to learn actual CUs consumed, then set the limit to that + ~10%. Guessing wastes SOL or risks failure.",
    },
    {
      q: "Where must the ComputeBudget instructions go in the transaction?",
      options: ["Last", "Anywhere", "First", "In a separate tx"],
      answer: 2,
      explain: "ComputeBudget instructions must come FIRST in the transaction, or the budget won't apply correctly.",
    },
  ],
  "epochs-validators": [
    {
      q: "About how long is one Solana epoch?",
      options: ["~400ms", "~1 hour", "~2.5 days (~432,000 slots)", "~1 month"],
      answer: 2,
      explain: "An epoch is ~432,000 slots ≈ 2.5 days. It's the unit for staking, rewards, and leader schedules.",
    },
    {
      q: "When does a stake activation or deactivation actually take effect?",
      options: [
        "Instantly",
        "After a 1-epoch boundary delay",
        "After 32 slots",
        "Never automatically",
      ],
      answer: 1,
      explain: "Stake activation/deactivation is delayed by one epoch boundary — protocol designs must account for that lag.",
    },
    {
      q: "What happens to Solana's inflation rate over time?",
      options: [
        "Fixed forever",
        "Increases yearly",
        "Starts ~8% and decreases ~15% per year by design",
        "Set by governance vote each week",
      ],
      answer: 2,
      explain: "Initial inflation is ~8% and decreases ~15% per year — so validator/staker APY isn't fixed.",
    },
  ],
  "accounts-model": [
    {
      q: "On Solana, where does a program's state live?",
      options: [
        "Inside the program, like an Ethereum contract",
        "In separate data accounts the program owns — programs are stateless",
        "In the mempool",
        "Nowhere; it's recomputed each block",
      ],
      answer: 1,
      explain: "Programs are stateless. State lives in separate data accounts owned by the program. This separation is what enables parallel execution.",
    },
    {
      q: "What does 'rent-exempt' mean for an account?",
      options: [
        "It pays rent monthly",
        "It holds enough lamports upfront so it won't be garbage-collected",
        "It's owned by the rent program",
        "It's free to create",
      ],
      answer: 1,
      explain: "You deposit a minimum balance (~0.00204 SOL per 128 bytes) so the account is rent-exempt; otherwise it gets reclaimed.",
    },
    {
      q: "A program can write to…",
      options: [
        "Any account on the chain",
        "Only accounts it owns",
        "Only the system program",
        "Only its own bytecode",
      ],
      answer: 1,
      explain: "Programs can only modify accounts they own — a core part of Solana's security model.",
    },
  ],
  "instructions-cpis": [
    {
      q: "What is the maximum CPI depth (program calling program calling…)?",
      options: ["2", "4", "8", "Unlimited"],
      answer: 1,
      explain: "Max CPI depth is 4 levels. A composable flow A→B→C→D→E will fail at the 5th call.",
    },
    {
      q: "How does a program 'sign' for a PDA in a CPI?",
      options: [
        "With a stored private key",
        "invoke_signed using the PDA's seeds",
        "It can't",
        "Via the user's wallet",
      ],
      answer: 1,
      explain: "PDAs have no private key. A program signs for them via invoke_signed, passing the seeds that derive the PDA.",
    },
    {
      q: "If a CPI fails partway through a transaction…",
      options: [
        "Only that CPI reverts",
        "The failure propagates up and the entire transaction reverts",
        "It retries silently",
        "The tx commits anyway",
      ],
      answer: 1,
      explain: "CPI failures bubble up and revert the whole transaction — consistent with Solana's atomic execution.",
    },
  ],
  sealevel: [
    {
      q: "What lets Sealevel run transactions in parallel?",
      options: [
        "Random scheduling",
        "Every instruction declares its accounts upfront, so non-overlapping txs run simultaneously",
        "Faster CPUs only",
        "It doesn't — it's sequential like the EVM",
      ],
      answer: 1,
      explain: "Because each tx declares its account access list, the runtime statically knows which txs conflict and runs non-overlapping ones in parallel.",
    },
    {
      q: "Two users both trade the SAME SOL/USDC pool in the same slot. What happens?",
      options: [
        "They run in parallel",
        "They serialize — the shared writable account forces exclusive access",
        "One is dropped",
        "The pool splits",
      ],
      answer: 1,
      explain: "A shared writable account (a hot pool) takes an exclusive lock, so those txs serialize. Hot accounts are the bottleneck.",
    },
    {
      q: "Marking an account as writable when you only read it…",
      options: [
        "Is required",
        "Wastes parallelism — read-only accounts can be shared across txs",
        "Makes the tx cheaper",
        "Has no effect",
      ],
      answer: 1,
      explain: "Only mark accounts mutable if you write to them. Read-only accounts can be shared by many txs simultaneously; over-marking kills parallelism.",
    },
  ],
  "rpc-infra": [
    {
      q: "Why avoid api.mainnet-beta.solana.com in production?",
      options: [
        "It's deprecated",
        "It's heavily rate-limited and will drop/fail under load",
        "It only works on devnet",
        "It charges per call",
      ],
      answer: 1,
      explain: "The public endpoint is rate-limited shared infrastructure. For production, use a dedicated RPC (Helius, QuickNode, Triton).",
    },
    {
      q: "What's the recommended way to watch an account for changes?",
      options: [
        "Poll getAccountInfo in a tight loop",
        "Use a WebSocket subscription like onAccountChange",
        "Re-fetch the whole chain",
        "Email yourself",
      ],
      answer: 1,
      explain: "WebSocket subscriptions (onAccountChange / onLogs) are far better than polling — real-time and easier on the RPC.",
    },
    {
      q: "How many Connection objects should a server app create?",
      options: [
        "One per request",
        "A single reused singleton",
        "One per route",
        "As many as possible",
      ],
      answer: 1,
      explain: "Reuse a singleton Connection. Creating a new one per request spins up a new HTTP client each time — expensive.",
    },
  ],
  pda: [
    {
      q: "What makes a PDA special compared to a normal keypair?",
      options: [
        "It has a stronger private key",
        "It has NO private key — it's off the ed25519 curve, so only its program can sign for it",
        "It's owned by the user",
        "It's faster to create",
      ],
      answer: 1,
      explain: "A PDA is deterministically derived from seeds + program ID and lies off the ed25519 curve, so no private key exists. The owning program signs via invoke_signed.",
    },
    {
      q: "Why store the bump seed in your account data?",
      options: [
        "For analytics",
        "You need it to re-derive and sign for the PDA in later CPIs",
        "It's required by rent",
        "You don't — it's optional decoration",
      ],
      answer: 1,
      explain: "Always store the canonical bump. You need it to reconstruct the PDA's signer seeds for future invoke_signed calls.",
    },
    {
      q: "Which derivation function should you use client-side?",
      options: [
        "createProgramAddress",
        "findProgramAddressSync",
        "Keypair.generate",
        "PublicKey.unique",
      ],
      answer: 1,
      explain: "Use findProgramAddressSync — it searches bumps for an off-curve point. createProgramAddress can fail if the point lands on the curve.",
    },
  ],
  "versioned-tx": [
    {
      q: "What problem do Address Lookup Tables (ALTs) solve?",
      options: [
        "They lower fees",
        "They let a v0 tx reference accounts by a 1-byte index instead of 32 bytes, raising the account ceiling to 256",
        "They encrypt accounts",
        "They speed up consensus",
      ],
      answer: 1,
      explain: "Legacy txs cap out around 35 accounts. ALTs store pubkeys on-chain and reference them by 1-byte index, allowing up to 256 accounts per v0 tx.",
    },
    {
      q: "Which Solana product relies heavily on ALTs for multi-hop routing?",
      options: ["A wallet", "Jupiter (DEX aggregator)", "A block explorer", "The faucet"],
      answer: 1,
      explain: "Jupiter routes through many pools in one atomic tx, which would blow past the legacy account limit without ALTs.",
    },
    {
      q: "A gotcha when creating an ALT is…",
      options: [
        "It works instantly",
        "You must extend it in a separate tx and wait ~1 slot for activation before use",
        "It can't hold more than 5 accounts",
        "It only works on devnet",
      ],
      answer: 1,
      explain: "A freshly created/extended ALT needs a slot to activate. Use it too early and the tx fails.",
    },
  ],
  "fee-economics": [
    {
      q: "What is the flat base fee per signature?",
      options: ["500 lamports", "5,000 lamports", "50,000 lamports", "It varies with congestion"],
      answer: 1,
      explain: "Base fee is a flat 5,000 lamports per signature. Priority fees are the variable part on top.",
    },
    {
      q: "What happens to the base fee on a transaction?",
      options: [
        "100% burned",
        "100% to the leader",
        "50% burned, 50% to the current leader",
        "Refunded if the tx fails",
      ],
      answer: 2,
      explain: "Base fees are split 50% burned (deflationary) / 50% to the leader. Priority fees, by contrast, go 100% to the leader.",
    },
    {
      q: "Do failed transactions still cost you?",
      options: [
        "No, failures are free",
        "Yes — failed txs still pay the base fee, so simulate before sending",
        "Only on mainnet",
        "Only if they time out",
      ],
      answer: 1,
      explain: "Failed txs still pay base fees. Retrying a failing tx 10× burns 10× the base fee — simulate first to avoid it.",
    },
  ],
  clusters: [
    {
      q: "Which cluster uses real assets and real consequences?",
      options: ["Devnet", "Testnet", "Mainnet-Beta", "Localnet"],
      answer: 2,
      explain: "Mainnet-Beta is the real-money network. Devnet/Testnet/Localnet are for development and testing.",
    },
    {
      q: "What's a common cluster mistake that breaks on mainnet?",
      options: [
        "Using HTTPS",
        "Hardcoding program IDs that only exist on devnet",
        "Using a keypair",
        "Setting a commitment level",
      ],
      answer: 1,
      explain: "Program IDs differ across clusters. Hardcoding a devnet-only ID means it simply doesn't exist on mainnet. Use env vars per cluster.",
    },
    {
      q: "What's the catch with devnet SOL airdrops?",
      options: [
        "They cost real money",
        "They're rate-limited (typically 1–2 SOL per request/IP) and devnet state resets periodically",
        "They never work",
        "They appear on mainnet",
      ],
      answer: 1,
      explain: "Airdrops are rate-limited and devnet resets occasionally — don't build anything that depends on persistent devnet state.",
    },
  ],
  sandwich: [
    {
      q: "Describe a sandwich attack in order.",
      options: [
        "Sell before, buy after the victim",
        "Buy (front-run) before the victim's swap, then sell (back-run) right after to profit from the price impact",
        "Copy the victim's tx exactly",
        "Cancel the victim's tx",
      ],
      answer: 1,
      explain: "Front-run with a buy to push price up, let the victim's swap move it further, then back-run with a sell. The victim's price impact is the attacker's profit.",
    },
    {
      q: "What's a user's primary defense against sandwiching?",
      options: [
        "Higher priority fee",
        "Tight slippage tolerance (e.g. 0.5%) so the tx reverts if price moves too much",
        "Bigger trades",
        "Using a public RPC",
      ],
      answer: 1,
      explain: "Tight slippage makes the sandwich unprofitable — if the bot moves the price past your tolerance, your tx just reverts.",
    },
    {
      q: "Why are large swaps more attractive sandwich targets?",
      options: [
        "They pay more fees",
        "Larger trades create larger price impact = larger profit for the attacker",
        "They're slower",
        "They use more accounts",
      ],
      answer: 1,
      explain: "Bigger price impact means a bigger spread for the sandwicher to capture. Splitting large orders into chunks reduces the target size.",
    },
  ],
  "validator-economics": [
    {
      q: "What are a validator's three revenue sources?",
      options: [
        "Airdrops, NFTs, fees",
        "Inflation rewards, transaction fees, and MEV tips (via Jito)",
        "Gas, rent, royalties",
        "Staking only",
      ],
      answer: 1,
      explain: "Validators earn from inflation (stake-weighted), tx fees (50% base + 100% priority), and MEV tips — which now rival inflation for top validators.",
    },
    {
      q: "Roughly what does a validator spend on vote transactions per epoch?",
      options: ["~0.02 SOL", "~2.16 SOL", "~50 SOL", "Nothing — votes are free"],
      answer: 1,
      explain: "~5,000 lamports × ~432,000 slots ≈ 2.16 SOL/epoch in vote costs. Earnings have to cover that.",
    },
    {
      q: "Picking a staking validator purely by lowest commission is risky because…",
      options: [
        "Low commission is illegal",
        "A 0% validator with poor uptime/credits can earn you less than a higher-commission, reliable one",
        "Commission doesn't exist",
        "It always maximizes returns",
      ],
      answer: 1,
      explain: "Uptime and epoch credits matter. A reliable validator at modest commission often out-earns a flaky 0% one — check the credits, not just the headline rate.",
    },
  ],
};

// ─── LLM seam ────────────────────────────────────────────────────────────────
// Returns grounded questions for a concept. Today: offline bank.
// Tomorrow: race/await an LLM endpoint and fall back to the bank on error.
export function getQuiz(conceptId: string): QuizQuestion[] {
  return quizBank[conceptId] ?? [];
}

// Live generation via the secure /api/quiz Vercel function (DeepSeek/OpenRouter).
// The key lives server-side; this only sends concept CONTENT, never a key.
// Falls back to the hand-written bank on any error so the UI never breaks.
export interface ConceptForQuiz {
  id: string;
  title: string;
  desc: string;
  details: string[];
  whyItMatters?: string;
  commonMistakes?: string[];
}
export async function generateQuiz(
  concept: ConceptForQuiz,
  count = 5
): Promise<{ questions: QuizQuestion[]; source: "llm" | "bank" }> {
  const fallback = { questions: getQuiz(concept.id), source: "bank" as const };
  try {
    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: concept.title,
        desc: concept.desc,
        details: concept.details,
        whyItMatters: concept.whyItMatters,
        commonMistakes: concept.commonMistakes,
        count,
      }),
    });
    if (!res.ok) return fallback;
    const data = await res.json();
    const qs = Array.isArray(data?.questions) ? (data.questions as QuizQuestion[]) : [];
    if (qs.length === 0) return fallback;
    return { questions: qs, source: "llm" };
  } catch {
    return fallback;
  }
}

// Shuffle helper so the same quiz feels fresh on retake.
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Randomize the order of a question's options and remap the answer index, so
// the correct choice isn't always in the same slot (the hand-written bank
// skewed heavily toward option 2). Apply to every question before display.
export function shuffleOptions(q: QuizQuestion): QuizQuestion {
  const idxs = shuffle(q.options.map((_, i) => i));
  const options = idxs.map((i) => q.options[i]);
  const answer = idxs.indexOf(q.answer);
  return { ...q, options, answer };
}

export function shuffleQuiz(qs: QuizQuestion[]): QuizQuestion[] {
  return shuffle(qs).map(shuffleOptions);
}
