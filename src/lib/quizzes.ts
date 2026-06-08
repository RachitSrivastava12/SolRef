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

  alpenglow: [
    {
      q: "What is the first Alpenglow protocol change focused on?",
      options: ["Replacing accounts with UTXOs", "Votor: off-chain vote aggregation into certificates", "Launching a new token", "Moving programs to the EVM"],
      answer: 1,
      explain: "The active first step is Votor: validators vote and aggregate signatures into certificates instead of relying on on-chain vote transactions in the hot path.",
    },
    {
      q: "What latency property is Alpenglow trying to improve most directly?",
      options: ["Rent collection", "Finality latency", "PDA derivation speed", "NFT metadata storage"],
      answer: 1,
      explain: "Alpenglow targets the consensus/finality path, especially the time and overhead of validator voting.",
    },
    {
      q: "How should you treat Rotor when explaining the initial Alpenglow SIMD?",
      options: [
        "As the first activated Votor change",
        "As a separate data-dissemination scope in the broader Alpenglow design",
        "As a wallet feature",
        "As the name of the fee market",
      ],
      answer: 1,
      explain: "The broader design discusses Rotor, but the active initial SIMD separates Rotor from the Votor consensus change.",
    },
  ],
  firedancer: [
    {
      q: "What is Firedancer?",
      options: [
        "A new blockchain competing with Solana",
        "An independent Solana validator client written in C by Jump Crypto",
        "A Solana token",
        "An RPC provider",
      ],
      answer: 1,
      explain: "Firedancer is a from-scratch validator client in C, independent of the Rust Agave client — same network, different implementation.",
    },
    {
      q: "Why does a second independent validator client matter?",
      options: [
        "It creates a competing chain",
        "Client diversity means a consensus bug in one client can't halt the whole network",
        "It lowers transaction fees directly",
        "It replaces the need for validators",
      ],
      answer: 1,
      explain: "If one client has a consensus-breaking bug, an independent client that disagrees keeps the network safe — diversity removes a single point of failure.",
    },
    {
      q: "What is 'Frankendancer'?",
      options: [
        "A meme token",
        "A hybrid of Firedancer's networking stack with Agave's runtime and consensus",
        "The full pure-C Firedancer client",
        "A testnet-only fork",
      ],
      answer: 1,
      explain: "Frankendancer combines Firedancer's high-performance networking with Agave's runtime/consensus, making it the bridge between Agave and the full independent client.",
    },
    {
      q: "Why should full Firedancer and Frankendancer be discussed separately?",
      options: [
        "They run on different blockchains",
        "Frankendancer is the hybrid production bridge; full Firedancer is the independent pure-C validator path still being hardened",
        "Frankendancer is only a wallet",
        "Full Firedancer changes SOL tokenomics",
      ],
      answer: 1,
      explain: "Frankendancer is the deployed bridge using Firedancer networking with Agave runtime/consensus; full Firedancer is the deeper independent client rollout.",
    },
  ],
  doublezero: [
    {
      q: "What is DoubleZero?",
      options: [
        "A Layer-2 rollup",
        "A dedicated private fiber network ('Network Layer 1') for validator consensus traffic",
        "A new consensus algorithm",
        "A staking pool",
      ],
      answer: 1,
      explain: "DoubleZero gives consensus its own physical fiber, bypassing the public internet to cut latency and filter spam at the hardware level.",
    },
    {
      q: "How does DoubleZero's multicast change block propagation?",
      options: [
        "It encrypts every block",
        "It broadcasts a block to all validators at once instead of relaying hop-by-hop",
        "It removes the need for validators",
        "It compresses blocks with zero-knowledge proofs",
      ],
      answer: 1,
      explain: "Multicast is one-to-many: the leader broadcasts to all validators simultaneously rather than forwarding sequentially, cutting propagation latency.",
    },
    {
      q: "What hardware does DoubleZero use to filter traffic at line rate?",
      options: ["GPUs", "FPGAs", "ASphalt routers", "Quantum chips"],
      answer: 1,
      explain: "FPGAs perform signature verification and deduplication at 100+ Gbps, scrubbing spam before it reaches a validator's CPU.",
    },
  ],
  "async-execution": [
    {
      q: "What did SIMD-0256 do in 2025?",
      options: [
        "Removed transaction fees",
        "Raised the per-block compute limit from 50M to 60M CU",
        "Launched Firedancer",
        "Added confidential transfers",
      ],
      answer: 1,
      explain: "SIMD-0256 lifted the block limit to 60M CU; SIMD-0286 proposes pushing it to 100M.",
    },
    {
      q: "What is the core idea of Asynchronous Program Execution (APE)?",
      options: [
        "Running programs on a GPU",
        "Decoupling agreeing on transaction order from computing the resulting state",
        "Skipping consensus entirely",
        "Executing every tx twice for safety",
      ],
      answer: 1,
      explain: "Async execution separates ordering (consensus) from state computation, so block production isn't bounded by single-thread execution speed.",
    },
    {
      q: "Even with bigger block limits, what cap can still bottleneck a single hot account?",
      options: [
        "The 1232-byte tx size limit",
        "The per-account write limit (~12M CU/block)",
        "The signature limit",
        "The rent ceiling",
      ],
      answer: 1,
      explain: "One account can only absorb so much write activity per block (~12M CU), so concentrating writes on a hot account bottlenecks regardless of block size.",
    },
  ],
  "quic-swqos": [
    {
      q: "Why did Solana move transaction ingest to QUIC?",
      options: [
        "To encrypt blocks",
        "To add connection identity, flow control, and back-pressure against spam",
        "To increase the block size",
        "To remove the need for RPCs",
      ],
      answer: 1,
      explain: "Plain UDP let anyone flood the ingest port. QUIC adds identity and flow control so leaders can rate-limit and throttle abusive senders.",
    },
    {
      q: "What does Stake-Weighted QoS (SWQoS) guarantee?",
      options: [
        "Lower transaction fees",
        "High-stake connections get a reserved share of a leader's ingest capacity",
        "Faster block times",
        "Free transactions for stakers",
      ],
      answer: 1,
      explain: "SWQoS reserves most ingest bandwidth for stake-weighted peers, so spam from unstaked sources can't crowd real traffic out of the leader.",
    },
    {
      q: "Why might the same transaction land via a staked sender but vanish via a public RPC?",
      options: [
        "Public RPCs charge more",
        "The staked connection rides a reserved ingest lane under SWQoS",
        "Public RPCs use a different blockchain",
        "Priority fees don't apply to public RPCs",
      ],
      answer: 1,
      explain: "Under congestion, reaching the leader at all depends on ingest priority — staked connections get a reserved lane, unstaked traffic competes in the flood.",
    },
  ],
  "gossip-repair": [
    {
      q: "What does the gossip protocol actually carry?",
      options: [
        "Full block data",
        "Cluster metadata — node identities, contact info, versions, votes",
        "User transactions",
        "Private keys",
      ],
      answer: 1,
      explain: "Gossip spreads a small replicated data store (CRDS) of metadata. Actual block data moves via Turbine and Repair, not gossip.",
    },
    {
      q: "What is the Repair protocol for?",
      options: [
        "Fixing corrupted private keys",
        "Requesting specific missing shreds so a validator can reconstruct a block",
        "Repairing the leader schedule",
        "Restarting crashed validators",
      ],
      answer: 1,
      explain: "When a node misses shreds from Turbine, Repair lets it request the exact missing pieces from peers — erasure coding means it only needs 'enough'.",
    },
    {
      q: "Why doesn't a validator need 100% of a block's shreds?",
      options: [
        "Blocks are optional",
        "Erasure coding lets it reconstruct the block from a sufficient subset",
        "Gossip fills in the rest",
        "It re-downloads the whole block every time",
      ],
      answer: 1,
      explain: "Turbine's erasure coding (Forward Error Correction) means a node can rebuild the full block from enough shreds, with Repair filling any remaining gaps.",
    },
  ],
  "compute-units": [
    {
      q: "What is the default compute-unit cap on a transaction, and the maximum you can request?",
      options: ["50k / 500k", "200k default / 1.4M max", "1M / 10M", "There is no cap"],
      answer: 1,
      explain: "A tx defaults to 200,000 CU and can request up to 1,400,000 CU via the Compute Budget program.",
    },
    {
      q: "Why is requesting the full 1.4M CU 'just in case' a bad idea?",
      options: [
        "It's not allowed",
        "An oversized limit inflates your priority bid and worsens scheduling",
        "It makes the tx fail",
        "It burns extra SOL permanently",
      ],
      answer: 1,
      explain: "Priority fee = price-per-CU × requested units, and schedulers favor tight, predictable txs. Over-requesting overpays and packs worse.",
    },
    {
      q: "What's the right way to size your compute-unit limit?",
      options: [
        "Always use the default",
        "Simulate to measure real usage, then set the limit ~10–20% above it",
        "Guess based on tx byte size",
        "Set it to zero and let the runtime decide",
      ],
      answer: 1,
      explain: "Simulate the tx, read unitsConsumed, and add a small headroom. Tight limits mean lower fees and better landing odds.",
    },
  ],
  rent: [
    {
      q: "What is rent exemption on Solana?",
      options: [
        "A monthly fee paid to validators",
        "A refundable minimum balance an account holds to live indefinitely",
        "A tax on transactions",
        "A penalty for idle accounts",
      ],
      answer: 1,
      explain: "Accounts must hold a minimum lamport deposit proportional to their size to stay alive. It's locked, not spent — closing the account returns it in full.",
    },
    {
      q: "How do you recover the SOL locked in rent?",
      options: [
        "You can't — it's burned",
        "Close the account; the rent deposit is returned to the payer",
        "Wait one epoch and it auto-refunds",
        "Stake it",
      ],
      answer: 1,
      explain: "Rent is a refundable deposit. Closing temporary accounts (token accounts, PDAs, scratch state) reclaims the full balance.",
    },
    {
      q: "Why is rent a key motivation for state compression?",
      options: [
        "Compression avoids signatures",
        "Paying rent per account is ruinous at millions of items, so compression stores them under one tree",
        "Compression removes the need for validators",
        "Rent makes transactions slower",
      ],
      answer: 1,
      explain: "An account-per-item model means rent per item. Compression stores millions of leaves under a single on-chain Merkle root, collapsing the cost.",
    },
  ],
  "svm-bytecode": [
    {
      q: "What do Solana programs compile to and run inside?",
      options: [
        "Native x86 machine code on bare metal",
        "SBF bytecode running in the sandboxed rBPF virtual machine",
        "JavaScript in a browser engine",
        "EVM bytecode",
      ],
      answer: 1,
      explain: "Programs compile to SBF (a Solana fork of eBPF) and execute in rBPF, a register-based VM that meters every opcode and sandboxes the program.",
    },
    {
      q: "Why does the SVM reject programs with unbounded loops?",
      options: [
        "Loops are inefficient",
        "The verifier requires bounded control flow; compute metering is the only allowed limiter",
        "Loops cost too much rent",
        "It doesn't — loops are fine",
      ],
      answer: 1,
      explain: "The bytecode verifier rejects unbounded loops and illegal jumps. The compute budget is what halts long-running programs, not arbitrary timeouts.",
    },
    {
      q: "What does the VM's sandbox guarantee?",
      options: [
        "Programs run faster than native code",
        "A buggy program can't corrupt other programs or the host",
        "Programs never fail",
        "Unlimited memory access",
      ],
      answer: 1,
      explain: "rBPF isolates each program — bounded stack, restricted syscalls, no arbitrary memory — so one program's bug can't escape its sandbox.",
    },
  ],
  "token-extensions": [
    {
      q: "What is Token-2022 (Token Extensions)?",
      options: [
        "A new version of SOL",
        "A superset SPL token program adding native opt-in features like transfer fees and confidential transfers",
        "A bridge to Ethereum",
        "A staking contract",
      ],
      answer: 1,
      explain: "Token-2022 is a separate program (different id) that bakes features — fees, hooks, confidential balances, non-transferable tokens — into the mint natively.",
    },
    {
      q: "What does the Confidential Transfer extension do?",
      options: [
        "Hides the sender's IP address",
        "Encrypts balances/amounts on-chain using ElGamal encryption and ZK proofs",
        "Makes transfers free",
        "Disables transfers entirely",
      ],
      answer: 1,
      explain: "Confidential transfers keep token amounts encrypted on-chain while still proving validity with zero-knowledge proofs.",
    },
    {
      q: "What's a common integration pitfall with Token-2022?",
      options: [
        "It only works on devnet",
        "Sending its tokens to integrations that only recognize the legacy SPL Token program id",
        "It has no metadata",
        "It can't be transferred",
      ],
      answer: 1,
      explain: "Token-2022 lives at a different program id. Wallets/DEXes must explicitly support it (and any specific extensions like transfer hooks) or transfers break.",
    },
  ],
  "state-compression": [
    {
      q: "How does state compression store data cheaply?",
      options: [
        "It deletes old data",
        "Only a Merkle root lives on-chain; leaf data lives off-account and is proven against the root",
        "It zips each account",
        "It moves data to Ethereum",
      ],
      answer: 1,
      explain: "A concurrent Merkle tree keeps just the root (and a changelog) on-chain. Leaves live cheaply off the account model, validated by proofs.",
    },
    {
      q: "How do you read a compressed NFT?",
      options: [
        "With getAccountInfo like any account",
        "Via the DAS (Digital Asset Standard) API on a supporting RPC",
        "By running your own validator",
        "You can't read them",
      ],
      answer: 1,
      explain: "Compressed assets aren't normal accounts. You read them through the DAS API (e.g. getAsset/getAssetProof), which serves leaves and Merkle proofs.",
    },
    {
      q: "When is compression the WRONG choice?",
      options: [
        "For large NFT collections",
        "For hot, frequently-mutated state where proof overhead dominates",
        "For airdrops",
        "For loyalty points",
      ],
      answer: 1,
      explain: "Compression shines for high-cardinality, rarely-mutated data. For hot state that changes constantly, proof generation overhead outweighs the rent savings.",
    },
  ],
  "lookup-tables": [
    {
      q: "What problem do Address Lookup Tables (ALTs) solve?",
      options: [
        "Slow RPC calls",
        "The ~35-account ceiling that the 1232-byte tx limit imposes",
        "High rent costs",
        "Validator downtime",
      ],
      answer: 1,
      explain: "Each inline address costs 32 bytes. ALTs let a v0 tx reference addresses by a 1-byte index, raising the practical ceiling to 256 accounts.",
    },
    {
      q: "ALTs only work with which transaction format?",
      options: ["Legacy transactions", "Versioned (v0) transactions", "Both equally", "Neither"],
      answer: 1,
      explain: "Address Lookup Tables require versioned (v0) transactions — legacy txs can't reference them.",
    },
    {
      q: "What's a common ALT mistake?",
      options: [
        "Reusing the same table",
        "Using a freshly-extended table in the same slot before its addresses are active",
        "Freezing the table",
        "Adding too few addresses",
      ],
      answer: 1,
      explain: "Newly added addresses need ~1 slot to 'warm up'. Reference them too early and the lookup fails. Reusing a warmed table is exactly the right pattern.",
    },
  ],
  geyser: [
    {
      q: "What is a Geyser plugin?",
      options: [
        "A wallet extension",
        "A validator plugin that streams account/transaction/slot data out in real time",
        "A consensus algorithm",
        "A type of smart contract",
      ],
      answer: 1,
      explain: "Geyser hooks into the validator's write path and pushes updates (no polling) into sinks like gRPC, Kafka, or Postgres.",
    },
    {
      q: "Why prefer a Geyser stream over polling getProgramAccounts in a loop?",
      options: [
        "Polling is illegal",
        "Streaming is push-based, lower-latency, and gapless — you never miss updates between polls",
        "Geyser is free and polling costs SOL",
        "Polling only works on devnet",
      ],
      answer: 1,
      explain: "Polling adds latency and can miss changes between calls, and gets rate-limited at scale. Geyser emits every write as it lands.",
    },
    {
      q: "Which is a popular open-source Geyser streaming interface?",
      options: ["Yellowstone gRPC", "MetaMask", "Hardhat", "The Graph"],
      answer: 0,
      explain: "Yellowstone gRPC is the widely-used Geyser plugin for streaming Solana data; managed webhooks are a simpler abstraction over the same firehose.",
    },
  ],
  accountsdb: [
    {
      q: "What's the difference between the Ledger and AccountsDB?",
      options: [
        "They're the same store",
        "The Ledger is append-only history; AccountsDB holds current account state",
        "AccountsDB stores history; the Ledger stores balances",
        "Both store only votes",
      ],
      answer: 1,
      explain: "The Ledger (blockstore) is the immutable history of blocks; AccountsDB is the live, mutable current state held largely in memory.",
    },
    {
      q: "What are snapshots used for?",
      options: [
        "Backing up private keys",
        "Letting a new validator bootstrap from recent state instead of replaying genesis",
        "Storing NFT images",
        "Encrypting the ledger",
      ],
      answer: 1,
      explain: "Snapshots are compressed dumps of AccountsDB taken periodically. A fresh node downloads a recent one and joins in minutes, not by replaying everything.",
    },
    {
      q: "Why might a normal RPC return null for months-old historical state?",
      options: [
        "The state was deleted from the blockchain",
        "Most nodes prune old ledger; deep history lives on archival/warehouse providers",
        "Historical state is encrypted",
        "RPCs only serve devnet",
      ],
      answer: 1,
      explain: "AccountsDB holds current state; old history requires archival nodes. A default RPC often can't serve deep history because it prunes the ledger.",
    },
  ],
  "banking-stage": [
    {
      q: "What does the Banking Stage do inside the leader's TPU?",
      options: [
        "Signs transactions for users",
        "Executes verified txs and schedules non-conflicting ones in parallel",
        "Stores the ledger",
        "Runs the gossip protocol",
      ],
      answer: 1,
      explain: "Banking Stage is where ordered, verified transactions execute and get packed — the practical realization of Sealevel's parallelism.",
    },
    {
      q: "What did the 2024 'central scheduler' improve?",
      options: [
        "It removed transaction fees",
        "It builds a conflict graph for better throughput and fairer inclusion than the old thread-per-lane model",
        "It deleted the mempool",
        "It added staking rewards",
      ],
      answer: 1,
      explain: "The central scheduler reasons about account-write conflicts globally, raising effective throughput and making inclusion fairer under load.",
    },
    {
      q: "Why can many transactions touching one hot account bottleneck here?",
      options: [
        "Reads always serialize",
        "Conflicting writes to the same account must serialize, defeating parallelism",
        "The scheduler ignores priority fees",
        "Hot accounts are banned",
      ],
      answer: 1,
      explain: "Two txs writing the same account conflict and must run sequentially. Spreading writes across accounts (e.g. per-user PDAs) lets the scheduler fan out.",
    },
  ],
  jito: [
    {
      q: "What is a Jito 'bundle'?",
      options: [
        "A batch of NFTs",
        "Up to 5 transactions that execute atomically and in order, all-or-nothing",
        "A staking pool",
        "A type of validator",
      ],
      answer: 1,
      explain: "A bundle is an ordered group of txs (max 5) that land atomically — perfect for risk-free arbitrage, backruns, and liquidations.",
    },
    {
      q: "How do searchers win placement for their bundle?",
      options: [
        "First-come, first-served",
        "By bidding 'tips' in an off-chain auction run by the Block Engine",
        "By having the most SOL staked",
        "By calling the leader directly",
      ],
      answer: 1,
      explain: "Jito's Block Engine runs a sealed off-chain auction; the highest tip wins block placement. There's no public mempool to snipe.",
    },
    {
      q: "How do Jito tips differ from priority fees?",
      options: [
        "They're identical",
        "Tips are per-bundle auction bids; priority fees are per-tx, protocol-level",
        "Tips are paid in ETH",
        "Priority fees only exist on Jito",
      ],
      answer: 1,
      explain: "Priority fees are a protocol-level per-CU bid; Jito tips are a separate per-bundle bid paid to a tip account to win the auction.",
    },
  ],
  "local-fee-markets": [
    {
      q: "What makes Solana's fee market 'local'?",
      options: [
        "Fees are set by geography",
        "Congestion on one hot account only raises fees for txs touching that account",
        "Each city has its own fee",
        "Fees are free locally",
      ],
      answer: 1,
      explain: "Because txs declare account access up front, the scheduler prices contention per-account — a hot mint doesn't tax unrelated transactions.",
    },
    {
      q: "How should you estimate priority fees given local markets?",
      options: [
        "Use one global network average",
        "Estimate against the specific accounts your tx will write",
        "Always pay the maximum",
        "Fees can't be estimated",
      ],
      answer: 1,
      explain: "getRecentPrioritizationFees is keyed to the accounts you pass. Price against your tx's actual writable accounts, not a network-wide number.",
    },
    {
      q: "How does this contrast with Ethereum's fee market?",
      options: [
        "It's identical",
        "Ethereum has a single global base fee that rises for everyone; Solana contains spikes to contended accounts",
        "Solana has no fees",
        "Ethereum prices per-account too",
      ],
      answer: 1,
      explain: "On a global market, one viral mint makes every tx expensive. Local fee markets confine that blast radius to the accounts actually being fought over.",
    },
  ],

  "memory-allocator": [
    {
      q: "What does the default global allocator in a Solana program do when memory is freed/dropped?",
      options: [
        "Returns it to the heap for reuse",
        "Nothing — it's a bump allocator; deallocation is a no-op",
        "Triggers garbage collection",
        "Writes it to the account",
      ],
      answer: 1,
      explain: "The default allocator is a bump allocator: it advances a pointer to allocate and never reclaims. Within one instruction, dropped memory stays consumed.",
    },
    {
      q: "What is the default heap size for a program instruction, and how do you get more?",
      options: [
        "256 KiB; it's fixed",
        "32 KiB; request up to 256 KiB via ComputeBudget RequestHeapFrame",
        "1 MiB; via a bigger account",
        "4 KiB; via a larger stack frame",
      ],
      answer: 1,
      explain: "The heap is 32 KiB by default (and resets each instruction). RequestHeapFrame raises it in 1 KiB steps up to 256 KiB, for extra compute units.",
    },
    {
      q: "Why does a large array declared on the stack often cause an 'access violation'?",
      options: [
        "Stack arrays are forbidden",
        "Each call frame is only 4 KiB, so a big local overflows it",
        "The heap is full",
        "The compiler moves it to an account",
      ],
      answer: 1,
      explain: "SBF stack frames are 4 KiB. A large stack-allocated array/struct overruns the frame. Keep big data in accounts or on the heap, not the stack.",
    },
  ],
  signatures: [
    {
      q: "What signature scheme authorizes a normal Solana transaction (and sets is_signer)?",
      options: ["Secp256k1 (ECDSA)", "Ed25519 (EdDSA over Curve25519)", "RSA", "Schnorr over secp256r1"],
      answer: 1,
      explain: "Transactions are signed with Ed25519. A valid signature for an account is what makes account.is_signer true inside the program.",
    },
    {
      q: "How does a program verify a non-Ed25519 signature (e.g. an Ethereum or passkey signature)?",
      options: [
        "It re-implements the curve math in BPF",
        "It attaches a precompile instruction (Secp256k1 / Secp256r1) and checks it ran via the Instructions sysvar",
        "It can't — only Ed25519 works",
        "It calls an oracle",
      ],
      answer: 1,
      explain: "Verifying secp256k1/secp256r1 in BPF is impractical. You add the matching precompile instruction and confirm, via instruction introspection, that it verified the expected message and key.",
    },
    {
      q: "Which precompile makes passkeys / WebAuthn login possible on Solana?",
      options: ["Ed25519 Program", "Secp256k1 Program", "Secp256r1 Program (P-256)", "The System Program"],
      answer: 2,
      explain: "Passkeys and WebAuthn use the secp256r1 (P-256) curve, so the Secp256r1 precompile is what lets Solana verify those signatures — the basis for consumer account abstraction.",
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
  count = 5,
  timeoutMs = 5500
): Promise<{ questions: QuizQuestion[]; source: "llm" | "bank" }> {
  const fallback = { questions: getQuiz(concept.id), source: "bank" as const };
  const controller = new AbortController();
  const timer = globalThis.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
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
  } finally {
    globalThis.clearTimeout(timer);
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
