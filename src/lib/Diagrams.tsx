// Inline SVG schematics — one per concept, keyed by concept id.
// Pure-black, neutral nodes, a single green accent, mono labels. Each renders
// inside the concept article above the lede. Add a key here = the page shows it.

import type { ReactNode } from "react";

const A = "var(--neon-green)";
const FG = "var(--text)";
const MID = "var(--text-mid)";
const DIM = "var(--text-dim)";
const LINE = "var(--line-2)";
const PANEL = "var(--surface)";
const PANEL2 = "var(--surface-2)";
const RED = "var(--sol-red)";
const YEL = "var(--sol-yellow)";

const Defs = () => (
  <defs>
    <marker id="ah" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={A} /></marker>
    <marker id="ahd" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={DIM} /></marker>
    <marker id="ahr" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={RED} /></marker>
    <marker id="ahy" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={YEL} /></marker>
  </defs>
);
const MARK: Record<string, string> = { [A]: "ah", [DIM]: "ahd", [RED]: "ahr", [YEL]: "ahy" };

function Wrap({ vb = "0 0 640 250", caption, children }: { vb?: string; caption?: string; children: ReactNode }) {
  return (
    <figure style={{ margin: 0, background: "#050505", border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: "16px 16px 4px", overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <svg viewBox={vb} width="100%" style={{ display: "block", minWidth: 380 }} fontFamily="var(--font-mono)">
          <Defs />
          {children}
        </svg>
      </div>
      {caption && <figcaption style={{ margin: "10px 2px 12px", fontSize: 11.5, color: DIM, fontFamily: "var(--font-mono)", lineHeight: 1.55 }}>{caption}</figcaption>}
    </figure>
  );
}

type Align = "middle" | "start" | "end";
const T = (x: number, y: number, s: string, fill = FG, size = 11.5, weight = 600, anchor: Align = "middle") => (
  <text x={x} y={y} fill={fill} fontSize={size} fontWeight={weight} textAnchor={anchor} style={{ letterSpacing: "-0.01em" }}>{s}</text>
);
const title = (s: string, x = 320) => T(x, 20, s, MID, 11.5, 600);

function Node({ x, y, w, h, t, sub, accent, color, fill, align = "middle" }:
  { x: number; y: number; w: number; h: number; t: string; sub?: string; accent?: boolean; color?: string; fill?: string; align?: Align }) {
  const stroke = color ?? (accent ? A : LINE);
  const tcol = color ?? (accent ? A : FG);
  const tx = align === "start" ? x + 13 : align === "end" ? x + w - 13 : x + w / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="9" fill={fill ?? PANEL} stroke={stroke} strokeWidth={accent || color ? 1.3 : 1} />
      <text x={tx} y={sub ? y + h / 2 - 3 : y + h / 2 + 4} fill={tcol} fontSize={11.5} fontWeight={700} textAnchor={align} style={{ letterSpacing: "-0.01em" }}>{t}</text>
      {sub && <text x={tx} y={y + h / 2 + 12} fill={DIM} fontSize={9.5} fontWeight={500} textAnchor={align}>{sub}</text>}
    </g>
  );
}
const arrow = (x1: number, y1: number, x2: number, y2: number, c = A, dashed = false) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth="1.5" markerEnd={`url(#${MARK[c] ?? "ah"})`} strokeDasharray={dashed ? "4 4" : undefined} />
);
// horizontal stage pipeline
function Pipeline({ items, y = 86, h = 50, x0 = 24, gap = 16, vb = 640, hi }: { items: { t: string; sub?: string }[]; y?: number; h?: number; x0?: number; gap?: number; vb?: number; hi?: number }) {
  const w = (vb - x0 * 2 - gap * (items.length - 1)) / items.length;
  return (
    <>
      {items.map((it, i) => {
        const x = x0 + i * (w + gap);
        return (
          <g key={i}>
            <Node x={x} y={y} w={w} h={h} t={it.t} sub={it.sub} accent={hi === i} />
            {i < items.length - 1 && arrow(x + w + 1, y + h / 2, x + w + gap - 1, y + h / 2, DIM)}
          </g>
        );
      })}
    </>
  );
}

const diagrams: Record<string, () => ReactNode> = {
  // ── CORE INFRA ─────────────────────────────────────────────────────────
  transactions: () => (
    <Wrap vb="0 0 640 234" caption="All-or-nothing: every instruction executes atomically, or the whole transaction reverts.">
      {title("Anatomy of a transaction")}
      <rect x={36} y={36} width={568} height={150} rx={11} fill="none" stroke={A} strokeWidth={1.2} />
      {T(54, 54, "TRANSACTION", A, 10.5, 700, "start")}
      {T(604 - 18, 54, "≤ 1232 bytes", DIM, 10, 600, "end")}
      <Node x={54} y={66} w={532} h={28} t="Signatures[]  ·  one per required signer (64 bytes each)" align="start" />
      <Node x={54} y={100} w={532} h={28} t="Message › header · account keys[] · recent blockhash (nonce + ~150-slot expiry)" align="start" />
      <Node x={54} y={134} w={532} h={40} t="Instructions[]" sub="{ program_id, accounts[], data }  — run in order" accent align="start" />
      {T(320, 212, "fee payer signs · recent blockhash gives a ~60s expiry window", DIM, 10.5, 500)}
    </Wrap>
  ),
  "blocks-slots": () => (
    <Wrap vb="0 0 640 220" caption="A slot is a ~400ms window assigned to a leader. If the leader is offline/slow, the slot is skipped — no block.">
      {title("Slots vs blocks — slot is the clock, block is the data")}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const x = 36 + i * 98;
        const skipped = i === 3;
        return (
          <g key={i}>
            {T(x + 45, 56, `slot ${100 + i}`, skipped ? RED : DIM, 9.5, 600)}
            <Node x={x} y={66} w={90} h={48} t={skipped ? "— skipped —" : `block`} sub={skipped ? "no block" : "leader L" + ((i % 3) + 1)} color={skipped ? RED : undefined} accent={!skipped && i === 2} />
            {i < 5 && arrow(x + 91, 90, x + 98 - 1, 90, DIM)}
          </g>
        );
      })}
      {T(320, 158, "~2.5 slots/sec · slot number is Solana's native time reference", MID, 11, 600)}
      {T(320, 188, "tx blockhash from slot N is valid until ~slot N+150", DIM, 10.5, 500)}
    </Wrap>
  ),
  "proof-of-history": () => (
    <Wrap vb="0 0 640 220" caption="PoH is a clock, not consensus: a SHA-256 chain where each hash proves time passed since the last. Transactions are stamped into the sequence.">
      {title("Proof of History — a verifiable SHA-256 hash chain")}
      {[0, 1, 2, 3].map((i) => {
        const x = 40 + i * 150;
        return (
          <g key={i}>
            <Node x={x} y={70} w={120} h={56} t={`hash ${i}`} sub="= sha256(prev)" accent={i === 2} />
            {i < 3 && arrow(x + 121, 98, x + 150 - 1, 98, DIM)}
          </g>
        );
      })}
      {T(345, 158, "tx stamped between hash 2 → 3", A, 10.5, 700)}
      {arrow(345, 148, 345, 128, A)}
      {T(320, 196, "verifiers replay the chain in parallel — order is provable with zero messaging", DIM, 10.5, 500)}
    </Wrap>
  ),
  "compute-units": () => (
    <Wrap vb="0 0 640 224" caption="Default 200k CU/tx, max 1.4M. Set a tight limit (measure via simulation) and a per-CU price; priority fee = price × limit.">
      {title("Compute budget — metering work per transaction")}
      <rect x={40} y={64} width={560} height={40} rx={9} fill={PANEL} stroke={LINE} />
      <rect x={40} y={64} width={330} height={40} rx={9} fill="rgba(20,241,149,.10)" stroke={A} />
      {T(205, 80, "used ≈ 165k CU", A, 11, 700)}
      {T(205, 95, "what your tx actually consumes", DIM, 9)}
      {T(484, 80, "headroom", DIM, 10, 600)}
      {T(40, 122, "0", DIM, 9.5, 500, "start")}
      {T(370, 122, "requested limit (200k)", MID, 9.5, 600)}
      {T(600, 122, "1.4M max", DIM, 9.5, 500, "end")}
      <Node x={40} y={150} w={270} h={40} t="setComputeUnitLimit(units)" sub="hard ceiling — exceed it and the tx fails" align="start" />
      <Node x={330} y={150} w={270} h={40} t="setComputeUnitPrice(µLamports)" sub="priority bid = price × units" align="start" accent />
    </Wrap>
  ),
  rent: () => (
    <Wrap vb="0 0 640 214" caption="Rent is a refundable deposit, not a recurring fee. Fund the rent-exempt minimum; close the account to reclaim every lamport.">
      {title("Rent exemption — a refundable storage deposit")}
      <Node x={40} y={64} w={250} h={70} t="Account (size = N bytes)" sub="must hold ≥ rent-exempt minimum" accent />
      {T(165, 150, "balance ≥ min_balance(N)", A, 10, 600)}
      {arrow(295, 99, 355, 99, DIM)}
      <Node x={360} y={64} w={110} h={70} t="LIVES" sub="indefinitely" color={A} />
      {arrow(415, 138, 415, 158, DIM)}
      <Node x={345} y={162} w={250} h={36} t="close account → deposit refunded in full" align="middle" color={A} />
      <Node x={490} y={64} w={105} h={70} t="below min" sub="garbage-collected" color={RED} />
      {T(165, 196, "~0.00089 SOL for a bare account · scales with bytes", DIM, 10, 500)}
    </Wrap>
  ),

  // ── CONSENSUS ────────────────────────────────────────────────────────
  "tower-bft": () => (
    <Wrap vb="0 0 640 232" caption="Each consecutive vote on a fork doubles your lockout (2,4,8…). After 32 confirmations a block is rooted — reverting it would cost the supermajority their stake.">
      {title("Tower BFT — exponential vote lockouts")}
      {[1, 2, 3, 4, 5].map((i) => {
        const x = 44 + (i - 1) * 118;
        const lock = Math.pow(2, i);
        return (
          <g key={i}>
            <Node x={x} y={70} w={96} h={46} t={`vote ${i}`} sub={`lockout ${lock}`} accent={i === 5} />
            {i < 5 && arrow(x + 97, 93, x + 118 - 1, 93, DIM)}
          </g>
        );
      })}
      {T(320, 160, "32 consecutive votes  →  rooted / finalized (irreversible)", A, 11.5, 700)}
      {T(320, 192, "switching forks early is cheap; switching late means forfeiting locked stake", DIM, 10.5, 500)}
    </Wrap>
  ),
  alpenglow: () => (
    <Wrap vb="0 0 640 244" caption="Alpenglow retires Tower BFT + on-chain vote txs. Votor aggregates BLS vote certificates off-chain; Rotor flattens propagation. Finality drops from ~12.8s to ~100–150ms.">
      {title("Alpenglow — Votor + Rotor")}
      <Node x={40} y={50} w={270} h={86} t="VOTOR" sub="off-chain BLS vote certificates" accent />
      {T(175, 112, "≥80% stake → 1 round ≈ 100ms", MID, 9.5, 600)}
      {T(175, 126, "60–80% → 2 rounds ≈ 150–250ms", DIM, 9)}
      <Node x={330} y={50} w={270} h={86} t="ROTOR" sub="single-relay-layer broadcast" accent />
      {T(465, 112, "supersedes Turbine's multi-hop tree", DIM, 9.5, 500)}
      <Node x={40} y={154} w={270} h={40} t="no more vote transactions" sub="kills the #1 ledger-bloat source" color={A} align="start" />
      <Node x={330} y={154} w={270} h={40} t="PoH stays as a clock" sub="just removed from the voting hot path" align="start" />
      {T(320, 222, "approved by 98.27% of voting stake · rolling out via testnet first", DIM, 10.5, 500)}
    </Wrap>
  ),

  // ── NETWORKING ───────────────────────────────────────────────────────
  turbine: () => (
    <Wrap vb="0 0 640 238" caption="The leader never sends a full block to everyone. It splits the block into ~1228-byte erasure-coded shreds and fans them through a stake-weighted tree.">
      {title("Turbine — stake-weighted shred fan-out")}
      <Node x={272} y={36} w={96} h={36} t="Leader" accent />
      {[0, 1, 2].map((i) => {
        const x = 110 + i * 190;
        return (
          <g key={i}>
            {arrow(320, 73, x + 50, 108, DIM)}
            <Node x={x} y={110} w={100} h={32} t="tier-1 node" />
            {[0, 1].map((j) => {
              const cx = x - 6 + j * 64;
              return (
                <g key={j}>
                  {arrow(x + 50, 143, cx + 26, 174, DIM)}
                  <Node x={cx} y={176} w={52} h={28} t="node" />
                </g>
              );
            })}
          </g>
        );
      })}
      {T(320, 228, "~1228-byte erasure-coded shreds · FEC rebuilds the block from a ⅔ subset", DIM, 10.5, 500)}
    </Wrap>
  ),
  "gulf-stream": () => (
    <Wrap vb="0 0 640 230" caption="No public mempool. RPCs forward signed txs straight to the current and upcoming leaders, who pre-cache them before their slot.">
      {title("Gulf Stream — push txs to upcoming leaders")}
      <Node x={36} y={86} w={130} h={50} t="Client + RPC" />
      {arrow(167, 111, 205, 111, DIM)}
      <Node x={208} y={86} w={110} h={50} t="Leader N" sub="current slot" accent />
      {[0, 1, 2].map((i) => {
        const y = 44 + i * 60;
        return (
          <g key={i}>
            {arrow(320, 111, 388, y + 22, DIM)}
            <Node x={390} y={y} w={130} h={44} t={`Leader N+${i + 1}`} sub="pre-caches tx" />
          </g>
        );
      })}
      {T(320, 214, "deterministic leader schedule = no frontrunnable pending pool · stale blockhash is dropped", DIM, 10.5, 500)}
    </Wrap>
  ),
  "quic-swqos": () => (
    <Wrap vb="0 0 640 218" caption="QUIC gives ingest connection identity + flow control. SWQoS reserves most of the leader's intake for stake-weighted peers, so spam can't crowd out real traffic.">
      {title("QUIC ingest + Stake-Weighted QoS")}
      <Node x={36} y={70} w={150} h={50} t="senders" sub="RPCs / wallets" />
      {arrow(187, 95, 233, 95, DIM)}
      <Node x={236} y={56} w={140} h={78} t="Leader QUIC" sub="rate-limited intake" accent />
      <rect x={400} y={56} width={200} height={36} rx={8} fill="rgba(20,241,149,.10)" stroke={A} />
      {T(500, 78, "staked lane ≈ 80%", A, 10.5, 700)}
      <rect x={400} y={98} width={200} height={36} rx={8} fill={PANEL} stroke={LINE} />
      {T(500, 120, "unstaked ≈ 20%", DIM, 10.5, 600)}
      {arrow(377, 78, 399, 78, A)}
      {arrow(377, 116, 399, 116, DIM)}
      {T(320, 176, "a staked sender rides the reserved lane — same tx lands when a public RPC's is dropped", DIM, 10.5, 500)}
    </Wrap>
  ),
  "gossip-repair": () => (
    <Wrap vb="0 0 640 224" caption="Gossip spreads cluster metadata (peers, versions, votes) epidemic-style. Repair fetches the exact shreds a node missed — erasure coding means it only needs enough.">
      {title("Gossip (metadata) + Repair (missing shreds)")}
      {[[110, 70], [250, 60], [200, 130], [90, 150]].map(([x, y], i) => (
        <g key={i}><Node x={x} y={y} w={84} h={32} t={`node ${i + 1}`} accent={i === 0} /></g>
      ))}
      {arrow(152, 92, 250, 78, DIM, true)}
      {arrow(242, 130, 174, 100, DIM, true)}
      {arrow(132, 150, 200, 92, DIM, true)}
      {T(180, 200, "gossip mesh — metadata only", DIM, 10, 600)}
      <Node x={400} y={70} w={120} h={40} t="lagging node" color={YEL} />
      {arrow(522, 90, 560, 90, YEL)}
      <Node x={400} y={124} w={200} h={40} t="Repair: request shred #N" sub="from a peer that has it" align="start" />
      {arrow(500, 122, 500, 112, DIM)}
      {T(500, 200, "metadata ≠ block data", DIM, 10, 500)}
    </Wrap>
  ),
  doublezero: () => (
    <Wrap vb="0 0 640 226" caption="A dedicated fiber network for consensus. An outer public ring filters/dedups (FPGAs at line rate); an inner ring multicasts each block to all validators at once.">
      {title("DoubleZero — private fiber + multicast")}
      <ellipse cx={320} cy={120} rx={290} ry={92} fill="none" stroke={LINE} strokeDasharray="5 5" />
      {T(320, 48, "outer ring · public ingress + FPGA filter/dedup", DIM, 10, 600)}
      <ellipse cx={320} cy={128} rx={170} ry={56} fill="none" stroke={A} />
      <Node x={272} y={108} w={96} h={40} t="Leader" accent />
      {[[150, 128], [490, 128], [320, 186]].map(([x, y], i) => (
        <g key={i}>{arrow(320, 128, (x as number) > 320 ? (x as number) - 36 : (x as number) + 36, y as number, A)}<Node x={(x as number) - 40} y={(y as number) - 16} w={80} h={32} t={`validator`} /></g>
      ))}
      {T(320, 218, "inner ring · multicast = one broadcast reaches every validator (≈50% lower latency)", A, 10, 600)}
    </Wrap>
  ),

  // ── DATA FLOW ────────────────────────────────────────────────────────
  "tx-lifecycle": () => (
    <Wrap vb="0 0 640 188" caption="processed → confirmed (⅔ stake voted) → finalized (32-deep root, irreversible). There's no mempool, so retrying is the client's job.">
      {title("Transaction lifecycle — sign to finality")}
      <Pipeline items={[{ t: "Client", sub: "sign" }, { t: "RPC", sub: "forward" }, { t: "Leader", sub: "execute" }, { t: "Turbine", sub: "propagate" }, { t: "Vote", sub: "⅔ stake" }, { t: "Final", sub: "rooted" }]} y={70} h={52} hi={5} />
      {T(320, 162, "confirmed ≈ 1–2s · finalized ≈ 13s today (≈150ms under Alpenglow)", DIM, 10.5, 500)}
    </Wrap>
  ),
  "lookup-tables": () => (
    <Wrap vb="0 0 640 214" caption="Each inline address is 32 bytes; an ALT reference is a 1-byte index. A warmed, reusable table lifts the practical ceiling from ~35 to 256 accounts per v0 tx.">
      {title("Address Lookup Tables — index, don't inline")}
      <Node x={40} y={58} w={250} h={44} t="legacy: 32 bytes per address" sub="≈ 35 accounts before 1232B wall" color={YEL} align="start" />
      <Node x={40} y={112} w={250} h={44} t="v0 + ALT: 1-byte index" sub="up to 256 accounts in one tx" accent align="start" />
      <Node x={360} y={66} w={240} h={82} t="Lookup Table (on-chain)" sub="[ pubkey0, pubkey1, … pubkeyN ]" />
      {arrow(292, 134, 358, 110, A)}
      {T(480, 178, "create once · warm ~1 slot · reuse forever", DIM, 10, 500)}
    </Wrap>
  ),
  geyser: () => (
    <Wrap vb="0 0 640 210" caption="Geyser hooks the validator's write path and pushes every account/tx/slot update out in real time — no polling, no gaps. The basis of indexers and the DAS API.">
      {title("Geyser — stream the validator, don't poll it")}
      <Node x={36} y={78} w={150} h={54} t="Validator" sub="write path" accent />
      {arrow(187, 105, 233, 105, A)}
      <Node x={236} y={78} w={150} h={54} t="Geyser plugin" sub="Yellowstone gRPC" />
      {[0, 1, 2].map((i) => {
        const y = 56 + i * 42;
        return (<g key={i}>{arrow(388, 105, 436, y + 16, DIM)}<Node x={438} y={y} w={166} h={32} t={["indexer / DAS", "Kafka / queue", "Postgres / cache"][i]} /></g>);
      })}
      {T(320, 192, "filter server-side by program / owner / signature · consumers should be idempotent", DIM, 10.5, 500)}
    </Wrap>
  ),

  // ── PROGRAMS ─────────────────────────────────────────────────────────
  "accounts-model": () => (
    <Wrap vb="0 0 640 214" caption="Programs are stateless — code and state live in separate accounts. A data account names its owning program; only that program can mutate it.">
      {title("Accounts — code and state are separate")}
      <Node x={44} y={56} w={250} h={130} t="PROGRAM ACCOUNT" sub="executable: true · holds SBF code" accent />
      {T(169, 120, "stateless logic", MID, 10.5, 600)}
      {T(169, 150, "owns data accounts →", DIM, 10, 500)}
      {arrow(296, 121, 344, 121, A)}
      <Node x={346} y={56} w={250} h={130} t="DATA ACCOUNT" sub="owner = program" />
      {T(471, 120, "lamports + data[]", FG, 11, 600)}
      {T(471, 144, "rent-exempt", MID, 10, 500)}
      {T(471, 166, "only owner writes", DIM, 10, 500)}
    </Wrap>
  ),
  "instructions-cpis": () => (
    <Wrap vb="0 0 640 222" caption="A tx carries ordered instructions; each targets one program. Programs call other programs via CPI — invoke (or invoke_signed for PDA-signed) — up to a depth of 4.">
      {title("Instructions & Cross-Program Invocations")}
      <Node x={40} y={50} w={150} h={130} t="Transaction" sub="instructions[]" accent />
      {[0, 1].map((i) => { const y = 64 + i * 60; return <g key={i}>{arrow(191, y + 16, 233, y + 16, DIM)}<Node x={236} y={y} w={150} h={40} t={`ix ${i + 1}`} sub="program_id, accounts, data" /></g>; })}
      <Node x={236} y={64} w={150} h={40} t="Program A" sub="ix 1" accent />
      {arrow(388, 84, 430, 84, A)}
      <Node x={432} y={64} w={170} h={40} t="Program B (CPI)" sub="invoke / invoke_signed" />
      {T(320, 204, "atomic: any instruction or CPI fails → the whole transaction reverts · max CPI depth 4", DIM, 10.5, 500)}
    </Wrap>
  ),
  sealevel: () => (
    <Wrap vb="0 0 640 222" caption="Because every tx declares its account accesses up front, the runtime runs non-overlapping txs in parallel. Two txs writing the same account must serialize.">
      {title("Sealevel — parallel where accounts don't overlap")}
      {[0, 1].map((i) => { const y = 52 + i * 40; return <Node key={i} x={40} y={y} w={230} h={30} t={`tx${i + 1} · writes {A${i}}`} accent align="start" />; })}
      {T(155, 150, "different accounts", MID, 10.5, 600)}
      {T(155, 168, "RUN IN PARALLEL", A, 11, 700)}
      {[0, 1].map((i) => { const y = 52 + i * 40; return <Node key={i} x={370} y={y} w={230} h={30} t={`tx${i + 3} · writes pool P`} color={RED} align="start" />; })}
      {T(485, 150, "same hot account", MID, 10.5, 600)}
      {T(485, 168, "→ SERIALIZE", RED, 11, 700)}
      {T(320, 204, "mark an account writable only if you actually write it", DIM, 10.5, 500)}
    </Wrap>
  ),
  pda: () => (
    <Wrap vb="0 0 640 214" caption="A PDA is a deterministic address with no private key (forced off the ed25519 curve by a bump). Same seeds + program = same address forever; the program signs via invoke_signed.">
      {title("Program Derived Address — keyless, deterministic")}
      <Node x={36} y={64} w={150} h={44} t="seeds[]" sub={'"vault", user_pubkey'} />
      <Node x={36} y={120} w={150} h={40} t="program_id" />
      {arrow(188, 90, 248, 104, DIM)}
      {arrow(188, 138, 248, 116, DIM)}
      <Node x={250} y={80} w={150} h={56} t="sha256 + bump" sub="find off-curve point" accent />
      {arrow(402, 108, 446, 108, A)}
      <Node x={448} y={80} w={150} h={56} t="PDA" sub="off ed25519 curve" accent />
      {T(320, 192, "no secret key exists — the owning program authorizes writes with invoke_signed(seeds)", DIM, 10.5, 500)}
    </Wrap>
  ),
  "svm-bytecode": () => (
    <Wrap vb="0 0 640 200" caption="Rust/C compiles to SBF (a Solana eBPF dialect), executed by the sandboxed rBPF VM. The verifier rejects unbounded loops; every opcode costs compute units.">
      {title("SVM bytecode — Rust → SBF → rBPF VM")}
      <Pipeline items={[{ t: "Rust / C", sub: "source" }, { t: "cargo build-sbf", sub: "compile" }, { t: "SBF ELF", sub: ".so bytecode" }, { t: "rBPF VM", sub: "sandbox · metered" }]} y={70} h={54} hi={3} />
      {T(320, 162, "11 registers · bounded stack · restricted syscalls · isolated from other programs", DIM, 10.5, 500)}
    </Wrap>
  ),
  "token-extensions": () => (
    <Wrap vb="0 0 640 220" caption="Token-2022 is a separate program whose mints/accounts carry opt-in extensions in TLV data — features that previously needed bespoke wrapper programs.">
      {title("Token Extensions (Token-2022) — native opt-in features")}
      <Node x={40} y={58} w={180} h={120} t="Mint (Token-2022)" sub="extensions in TLV data" accent />
      {[["Transfer fee", 0], ["Confidential transfer", 1], ["Transfer hook", 2], ["Non-transferable", 3], ["Interest-bearing", 4], ["Metadata pointer", 5]].map(([label, i]) => {
        const col = (i as number) % 2; const row = Math.floor((i as number) / 2);
        const x = 250 + col * 178; const y = 58 + row * 40;
        return <Node key={i as number} x={x} y={y} w={168} h={32} t={label as string} align="start" />;
      })}
      {arrow(221, 118, 248, 92, A)}
      {T(320, 200, "different program id than legacy SPL Token — integrations must opt in to support it", DIM, 10.5, 500)}
    </Wrap>
  ),
  "state-compression": () => (
    <Wrap vb="0 0 640 220" caption="A concurrent Merkle tree keeps only the root on-chain; millions of leaves live off-account, validated by proofs. cNFTs cut per-item rent by orders of magnitude.">
      {title("State compression — one root, millions of leaves")}
      <Node x={250} y={42} w={140} h={40} t="Merkle root" sub="on-chain account" accent />
      {[0, 1].map((i) => { const x = 180 + i * 200; return <g key={i}>{arrow(320, 83, x + 60, 104, DIM)}<Node x={x} y={106} w={120} h={30} t="node hash" /></g>; })}
      {[0, 1, 2, 3].map((i) => { const x = 70 + i * 135; return <g key={i}>{arrow(i < 2 ? 240 : 440, 137, x + 55, 162, DIM)}<Node x={x} y={164} w={110} h={28} t={`leaf ${i}`} color={i === 1 ? A : undefined} /></g>; })}
      {T(320, 212, "read via the DAS API · transfers supply a Merkle proof checked against the root", DIM, 10.5, 500)}
    </Wrap>
  ),

  // ── SYSTEM DESIGN ────────────────────────────────────────────────────
  accountsdb: () => (
    <Wrap vb="0 0 640 202" caption="Three stores: the Ledger is append-only history, AccountsDB is live current state (memory-mapped, O(1)), and Snapshots let a fresh node bootstrap without replaying genesis.">
      {title("A validator's three data stores")}
      <Node x={40} y={62} w={175} h={72} t="Ledger" sub="append-only history" />
      <Node x={232} y={62} w={175} h={72} t="AccountsDB" sub="current state · in-memory" accent />
      <Node x={424} y={62} w={176} h={72} t="Snapshot" sub="periodic state dump" />
      {arrow(232, 98, 216, 98, DIM)}
      {arrow(407, 98, 423, 98, DIM)}
      {T(127, 160, "“what was it?”", DIM, 10, 500)}
      {T(319, 160, "“what is it now?”", A, 10, 600)}
      {T(512, 160, "fast bootstrap", DIM, 10, 500)}
      {T(320, 186, "most nodes prune old ledger — deep history needs an archival/warehouse provider", DIM, 10.5, 500)}
    </Wrap>
  ),
  "banking-stage": () => (
    <Wrap vb="0 0 640 206" caption="Inside the leader's TPU, verified txs hit the Banking Stage. A central scheduler builds a conflict graph and runs non-conflicting txs across worker threads; PoH stamps the result.">
      {title("Banking Stage — the parallel scheduler")}
      <Pipeline items={[{ t: "Fetch", sub: "QUIC" }, { t: "SigVerify", sub: "signatures" }, { t: "Banking", sub: "scheduler" }, { t: "PoH / record", sub: "stamp" }]} y={56} h={48} hi={2} />
      <Node x={300} y={120} w={150} h={28} t="worker 1 · {A}" align="start" accent />
      <Node x={300} y={152} w={150} h={28} t="worker 2 · {B}" align="start" accent />
      <Node x={460} y={120} w={150} h={28} t="hot account P" sub="serializes" color={RED} align="start" />
      {arrow(330, 104, 360, 118, DIM)}
      {T(150, 150, "non-conflicting → parallel", A, 10, 600)}
      {T(150, 170, "shared writes → serialize", RED, 10, 600)}
    </Wrap>
  ),

  // ── MEV ──────────────────────────────────────────────────────────────
  mev: () => (
    <Wrap vb="0 0 640 196" caption="With no public mempool, the leader controls in-block ordering. A sandwich places a buy before and a sell after the victim's swap to profit from the price it moves.">
      {title("MEV — the leader orders txs inside the block")}
      {[["front-run", A], ["victim swap", YEL], ["back-run", A]].map(([label, c], i) => {
        const x = 60 + i * 180;
        return <g key={i}><Node x={x} y={74} w={150} h={46} t={label as string} sub={i === 1 ? "your trade" : "attacker"} color={c as string} />{i < 2 && arrow(x + 151, 97, x + 180 - 1, 97, DIM)}</g>;
      })}
      {T(320, 156, "buy before → victim pushes price → sell after = extracted value", DIM, 10.5, 500)}
    </Wrap>
  ),
  sandwich: () => (
    <Wrap vb="0 0 640 210" caption="Defenses: tight slippage caps the gap an attacker can exploit, and atomic Jito bundles or private order flow remove the ordering opportunity entirely.">
      {title("Sandwich attack & protection")}
      {[["1 · attacker buys", A], ["2 · YOUR swap", YEL], ["3 · attacker sells", A]].map(([label, c], i) => {
        const x = 50 + i * 185;
        return <g key={i}><Node x={x} y={56} w={155} h={44} t={label as string} color={c as string} />{i < 2 && arrow(x + 156, 78, x + 185 - 1, 78, DIM)}</g>;
      })}
      <Node x={50} y={128} w={250} h={44} t="tight slippage tolerance" sub="caps the exploitable gap" accent align="start" />
      <Node x={330} y={128} w={260} h={44} t="atomic bundle / private flow" sub="removes the ordering window" accent align="start" />
      {T(320, 196, "wide slippage on a thin pool is the open invitation", DIM, 10.5, 500)}
    </Wrap>
  ),
  jito: () => (
    <Wrap vb="0 0 640 200" caption="Searchers submit bundles (≤5 txs, atomic, ordered) with a tip. The off-chain Block Engine auctions placement to the highest tip and forwards winners to the leader.">
      {title("Jito — bundles + off-chain auction")}
      <Node x={36} y={78} w={130} h={50} t="searchers" sub="build bundles" />
      {arrow(167, 103, 209, 103, DIM)}
      <Node x={212} y={70} w={170} h={66} t="Block Engine" sub="sealed tip auction" accent />
      {arrow(383, 103, 425, 103, A)}
      <Node x={428} y={78} w={170} h={50} t="Leader" sub="includes winners" />
      {T(297, 168, "bundle = ≤5 txs, atomic & ordered · highest tip wins placement", DIM, 10.5, 500)}
    </Wrap>
  ),

  // ── ECONOMICS ────────────────────────────────────────────────────────
  "priority-fees": () => (
    <Wrap vb="0 0 640 196" caption="Total fee = base (5000 lamports/signature) + priority (CU price × CU limit). Priority is a per-account bid for inclusion when block space is contended.">
      {title("Priority fees — bidding for block space")}
      <Node x={40} y={64} w={250} h={50} t="base fee" sub="5000 lamports / signature" />
      {T(305, 95, "+", FG, 18, 700)}
      <Node x={330} y={64} w={270} h={50} t="priority fee = µLamports/CU × CU limit" sub="optional bid for inclusion" accent align="start" />
      {T(320, 156, "local market: you bid only against txs touching the SAME accounts", DIM, 10.5, 500)}
    </Wrap>
  ),
  "fee-economics": () => (
    <Wrap vb="0 0 640 200" caption="Half of every base fee is burned (deflationary pressure); the rest goes to the block producer. 100% of priority fees go to the validator.">
      {title("Fee economics — burn vs validator")}
      <Node x={120} y={56} w={400} h={36} t="transaction fee" accent />
      {arrow(220, 93, 200, 118, DIM)}
      {arrow(420, 93, 440, 118, DIM)}
      <Node x={100} y={120} w={200} h={48} t="50% BURNED" sub="reduces SOL supply" color={RED} />
      <Node x={340} y={120} w={200} h={48} t="50% to validator" sub="+ 100% of priority fees" color={A} />
      {T(320, 188, "burn makes activity deflationary · priority fees fully reward the producer", DIM, 10.5, 500)}
    </Wrap>
  ),
  "local-fee-markets": () => (
    <Wrap vb="0 0 640 200" caption="Fees are priced per-account, not globally. A hot mint spikes fees only for txs touching it; unrelated transactions elsewhere stay at the base fee.">
      {title("Local fee markets — contention is per-account")}
      <Node x={40} y={60} w={260} h={56} t="hot account (viral mint)" sub="fees SPIKE here only" color={RED} />
      <Node x={340} y={60} w={260} h={56} t="unrelated accounts" sub="stay cheap — base fee" color={A} />
      {T(170, 150, "bidding war", RED, 10.5, 600)}
      {T(470, 150, "unaffected", A, 10.5, 600)}
      {T(320, 182, "estimate priority against the exact accounts your tx writes — never a global average", DIM, 10.5, 500)}
    </Wrap>
  ),
  "validator-economics": () => (
    <Wrap vb="0 0 640 206" caption="Revenue: inflation (stake-weighted) + fee share + Jito MEV tips — which now rival inflation for top validators. Cost: vote transactions (~1+ SOL/day).">
      {title("Validator economics — revenue vs cost")}
      {[["Inflation rewards", "stake-weighted"], ["Fee share", "50% base + priority"], ["MEV tips", "via Jito"]].map(([t1, s], i) => {
        const x = 40 + i * 200;
        return <Node key={i} x={x} y={58} w={180} h={56} t={t1} sub={s} accent />;
      })}
      {T(320, 150, "− vote costs (~1+ SOL/day) − hardware/bandwidth", RED, 11, 600)}
      {T(320, 182, "tips can now exceed inflation — why stakers favor MEV-enabled validators", DIM, 10.5, 500)}
    </Wrap>
  ),

  // ── FRONTIER / INFRA ─────────────────────────────────────────────────
  firedancer: () => (
    <Wrap vb="0 0 640 200" caption="Independent client implementations of the SAME network. A consensus bug in one can't halt the chain if another disagrees — the diversity that prevents outages.">
      {title("Validator clients — one network, many implementations")}
      <Node x={36} y={64} w={180} h={62} t="Agave" sub="Rust · Anza (reference)" />
      <Node x={230} y={64} w={180} h={62} t="Frankendancer" sub="FD networking + Agave runtime" accent />
      <Node x={424} y={64} w={180} h={62} t="Firedancer" sub="pure C · Jump" accent />
      {T(320, 162, "must agree bit-for-bit on state · no single client should hold > ⅓ of stake", DIM, 10.5, 500)}
    </Wrap>
  ),
  "async-execution": () => (
    <Wrap vb="0 0 640 214" caption="Throughput scales two ways: raising the per-block compute ceiling, and decoupling ordering from execution (APE) so block production isn't bound by single-thread replay.">
      {title("Scaling — bigger blocks + async execution")}
      <Node x={40} y={56} w={110} h={40} t="48M" sub="legacy" />
      {arrow(151, 76, 169, 76, DIM)}
      <Node x={170} y={56} w={110} h={40} t="60M" sub="SIMD-0256" accent />
      {arrow(281, 76, 299, 76, DIM)}
      <Node x={300} y={56} w={120} h={40} t="100M" sub="SIMD-0286 (proposed)" />
      {T(320, 132, "Asynchronous Program Execution (APE)", FG, 11.5, 700)}
      <Node x={120} y={146} w={190} h={40} t="consensus orders txs" sub="agree on sequence" accent align="start" />
      {arrow(312, 166, 332, 166, DIM)}
      <Node x={334} y={146} w={190} h={40} t="state computed after" sub="off the critical path" align="start" />
      {T(320, 204, "ordering is still final — only state computation moves off the hot path", DIM, 10.5, 500)}
    </Wrap>
  ),

  // ── INFRA: rpc, clusters, epochs, versioned-tx ───────────────────────
  "rpc-infra": () => (
    <Wrap vb="0 0 640 196" caption="RPC nodes are the API layer: they answer reads (getAccountInfo, getBlock) and forward your signed txs to leaders. They don't guarantee delivery — poll for confirmation yourself.">
      {title("RPC & node infrastructure")}
      <Node x={36} y={78} w={140} h={50} t="your app" />
      {arrow(177, 103, 219, 103, DIM)}
      <Node x={222} y={70} w={170} h={66} t="RPC node" sub="reads + tx forwarding" accent />
      {arrow(393, 103, 435, 103, A)}
      <Node x={438} y={78} w={166} h={50} t="leaders / cluster" />
      {T(310, 168, "sendTransaction is fire-and-forget · staked senders land better under load", DIM, 10.5, 500)}
    </Wrap>
  ),
  clusters: () => (
    <Wrap vb="0 0 640 196" caption="Same software, separate networks. Build on localnet/devnet (free airdrops), stage on testnet (where upgrades bake), ship to mainnet-beta (real value).">
      {title("Solana clusters — four separate networks")}
      {[["localnet", "your machine"], ["devnet", "free airdrops"], ["testnet", "upgrade staging"], ["mainnet-beta", "real value"]].map(([t1, s], i) => {
        const x = 36 + i * 152;
        return <Node key={i} x={x} y={70} w={138} h={58} t={t1} sub={s} accent={i === 3} />;
      })}
      {T(320, 168, "an address/program on one cluster does not exist on another", DIM, 10.5, 500)}
    </Wrap>
  ),
  "epochs-validators": () => (
    <Wrap vb="0 0 640 196" caption="An epoch is 432,000 slots (~2–3 days). The leader schedule is computed per epoch from stake weights; stake activation/deactivation and rewards align to epoch boundaries.">
      {title("Epochs — 432,000 slots of fixed leader schedule")}
      <Node x={40} y={64} w={250} h={56} t="Epoch N" sub="432,000 slots (~2–3 days)" accent />
      {arrow(291, 92, 331, 92, DIM)}
      <Node x={334} y={64} w={250} h={56} t="Epoch N+1" sub="new leader schedule" />
      {T(165, 150, "schedule fixed at epoch start", DIM, 10, 500)}
      {T(459, 150, "stake changes + rewards apply", DIM, 10, 500)}
      {T(320, 180, "leader for each slot is deterministic and known in advance", DIM, 10.5, 500)}
    </Wrap>
  ),
  "versioned-tx": () => (
    <Wrap vb="0 0 640 196" caption="v0 transactions add Address Lookup Table support, so a single tx can reference up to 256 accounts. Legacy txs are capped at ~35. Always set maxSupportedTransactionVersion.">
      {title("Versioned (v0) vs legacy transactions")}
      <Node x={40} y={64} w={250} h={64} t="legacy" sub="inline accounts · ≈ 35 max" color={YEL} />
      <Node x={350} y={64} w={250} h={64} t="v0 (versioned)" sub="ALT support · up to 256 accounts" accent />
      {arrow(292, 96, 348, 96, A)}
      {T(320, 168, "complex DeFi routes need v0 + ALTs to fit under the 1232-byte limit", DIM, 10.5, 500)}
    </Wrap>
  ),
};

export function hasDiagram(id?: string): boolean {
  return !!id && !!diagrams[id];
}

export default function ConceptDiagram({ diagramKey, id }: { diagramKey?: string; id?: string }) {
  const key = id ?? diagramKey;
  if (!key || !diagrams[key]) return null;
  return <div style={{ marginBottom: 4 }}>{diagrams[key]()}</div>;
}
