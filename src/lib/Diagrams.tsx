// Inline SVG schematics — one per concept, keyed by concept id.
// Pure-black, neutral nodes, a single green accent, mono labels. Each renders
// inside the concept article above the lede. Add a key here = the page shows it.

import { useId, type ReactNode } from "react";

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
const T = (x: number, y: number, s: string, fill = FG, size = 11.5, weight = 600, anchor: Align = "middle") => {
  const width = anchor === "middle"
    ? Math.max(1, 2 * Math.min(x - 12, 628 - x))
    : anchor === "start" ? Math.max(1, 628 - x) : Math.max(1, x - 12);
  const lines = wrapSvgText(s, Math.max(1, Math.floor(width / (size * 0.62))));
  const lineHeight = size * 1.2;
  const firstY = y - ((lines.length - 1) * lineHeight) / 2;
  return (
    <text x={x} y={firstY} fill={fill} fontSize={size} fontWeight={weight} textAnchor={anchor} style={{ letterSpacing: 0 }}>
      {lines.map((line, i) => <tspan key={i} x={x} y={firstY + i * lineHeight}>{line}</tspan>)}
    </text>
  );
};
const title = (s: string, x = 320) => T(x, 20, s, MID, 11.5, 600);

function wrapSvgText(value: string, maxChars: number): string[] {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    if (word.length > maxChars) {
      if (line) lines.push(line);
      line = "";
      for (let i = 0; i < word.length; i += maxChars) {
        const chunk = word.slice(i, i + maxChars);
        if (i + maxChars < word.length) lines.push(chunk);
        else line = chunk;
      }
      continue;
    }

    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }

  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function Node({ x, y, w, h, t, sub, accent, color, fill, align = "middle" }:
  { x: number; y: number; w: number; h: number; t: string; sub?: string; accent?: boolean; color?: string; fill?: string; align?: Align }) {
  const rawId = useId();
  const clipId = `diagram-node-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const stroke = color ?? (accent ? A : LINE);
  const tcol = color ?? (accent ? A : FG);
  const tx = align === "start" ? x + 13 : align === "end" ? x + w - 13 : x + w / 2;
  let titleSize = 11.5;
  let subSize = 9.5;
  let titleLines: string[] = [];
  let subLines: string[] = [];
  let titleLineHeight = titleSize * 1.18;
  let subLineHeight = subSize * 1.2;

  // SVG text has no automatic line wrapping. Fit each label to the node's
  // actual width and height so long labels stay readable on narrow screens.
  for (let attempt = 0; attempt < 8; attempt += 1) {
    titleLines = wrapSvgText(t, Math.max(3, Math.floor((w - 26) / (titleSize * 0.62))));
    subLines = sub ? wrapSvgText(sub, Math.max(4, Math.floor((w - 26) / (subSize * 0.62)))) : [];
    titleLineHeight = titleSize * 1.18;
    subLineHeight = subSize * 1.2;
    const textHeight = titleLines.length * titleLineHeight + (sub ? 3 + subLines.length * subLineHeight : 0);
    const availableHeight = h - 8;
    if (textHeight <= availableHeight) break;
    const scale = Math.max(0.78, availableHeight / textHeight);
    titleSize = Math.max(8, titleSize * scale);
    subSize = Math.max(7.2, subSize * scale);
  }

  // Recompute with the final font size so the last fit adjustment is reflected
  // in the rendered lines as well as in their positions.
  titleLines = wrapSvgText(t, Math.max(3, Math.floor((w - 26) / (titleSize * 0.62))));
  subLines = sub ? wrapSvgText(sub, Math.max(4, Math.floor((w - 26) / (subSize * 0.62)))) : [];
  titleLineHeight = titleSize * 1.18;
  subLineHeight = subSize * 1.2;

  const titleHeight = titleLines.length * titleLineHeight;
  const subHeight = sub ? 3 + subLines.length * subLineHeight : 0;
  const totalTextHeight = titleHeight + subHeight;
  const firstTitleY = y + (h - totalTextHeight) / 2 + titleSize;
  const firstSubY = firstTitleY + titleHeight + 2;
  const toText = (lines: string[], firstY: number, lineHeight: number) => lines.map((line, i) => (
    <tspan key={i} x={tx} y={firstY + i * lineHeight}>{line}</tspan>
  ));
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="9" fill={fill ?? PANEL} stroke={stroke} strokeWidth={accent || color ? 1.3 : 1} />
      <defs><clipPath id={clipId}><rect x={x + 3} y={y + 3} width={w - 6} height={h - 6} rx="6" /></clipPath></defs>
      <g clipPath={`url(#${clipId})`}>
        <text fill={tcol} fontSize={titleSize} fontWeight={700} textAnchor={align} style={{ letterSpacing: 0 }}>{toText(titleLines, firstTitleY, titleLineHeight)}</text>
        {sub && <text fill={DIM} fontSize={subSize} fontWeight={500} textAnchor={align}>{toText(subLines, firstSubY, subLineHeight)}</text>}
      </g>
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
    <Wrap vb="0 0 640 234" caption="Instructions run as one unit: if one fails, their state changes are reverted. The fee is still charged.">
      {title("Anatomy of a transaction")}
      <rect x={36} y={36} width={568} height={154} rx={11} fill="none" stroke={A} strokeWidth={1.2} />
      {T(54, 54, "TRANSACTION", A, 10.5, 700, "start")}
      {T(586, 54, "legacy/v0 ≤ 1,232 B · v1 ≤ 4,096 B", DIM, 9.5, 600, "end")}
      <Node x={54} y={66} w={532} h={28} t="Signatures[]  ·  one per required signer (64 bytes each)" align="start" />
      <Node x={54} y={100} w={532} h={40} t="Message · header · account keys[]" sub="Recent blockhash: valid for 150 slots · durable nonce is another option" align="start" />
      <Node x={54} y={146} w={532} h={40} t="Instructions[]" sub="{ program_id, accounts[], data }  — run in order" accent align="start" />
      {T(320, 212, "fee payer signs · 150 slots is about 30s at the 200ms target", DIM, 10.5, 500)}
    </Wrap>
  ),
  "blocks-slots": () => (
    <Wrap vb="0 0 640 220" caption="Mainnet slots target 200ms. A scheduled leader may produce a block; a skipped slot has no block. Under Alpenglow, more than one candidate bank may exist for a slot.">
      {title("Slots vs blocks — slot is the interval, block is the data")}
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
      {T(320, 158, "~5 slots/sec target · slot number is a protocol sequence", MID, 11, 600)}
      {T(320, 188, "a recent blockhash stays valid for up to 150 slots", DIM, 10.5, 500)}
    </Wrap>
  ),
  "proof-of-history": () => (
    <Wrap vb="0 0 640 220" caption="Tower-era PoH was a SHA-256 chain used to pace ledger entries. Since Alpenglow, PoH no longer paces block production and the Clock timestamp source has changed.">
      {title("Proof of History — Tower-era clock model")}
      {[0, 1, 2, 3].map((i) => {
        const x = 40 + i * 150;
        return (
          <g key={i}>
            <Node x={x} y={70} w={120} h={56} t={`hash ${i}`} sub="= sha256(prev)" accent={i === 2} />
            {i < 3 && arrow(x + 121, 98, x + 150 - 1, 98, DIM)}
          </g>
        );
      })}
      {T(345, 158, "Tower-era tx entry between hash 2 → 3", A, 10.5, 700)}
      {arrow(345, 148, 345, 128, A)}
      {T(320, 196, "each hash depends on the previous one · the sequence can be checked later", DIM, 10.5, 500)}
    </Wrap>
  ),
  "compute-units": () => (
    <Wrap vb="0 0 640 224" caption="Legacy/v0 defaults depend on instruction type: 200k CU per program instruction and 3k for most built-ins, capped at 1.4M per transaction. Priority fees use the requested limit. v1 sets limits in the message instead.">
      {title("Compute budget — metering work per transaction")}
      <rect x={40} y={64} width={560} height={40} rx={9} fill={PANEL} stroke={LINE} />
      <rect x={40} y={64} width={330} height={40} rx={9} fill="rgba(20,241,149,.10)" stroke={A} />
      {T(205, 80, "used ≈ 165k CU", A, 11, 700)}
      {T(205, 95, "what your tx actually consumes", DIM, 9)}
      {T(484, 80, "headroom", DIM, 10, 600)}
      {T(40, 122, "0", DIM, 9.5, 500, "start")}
      {T(370, 122, "requested limit", MID, 9.5, 600)}
      {T(600, 122, "1.4M max", DIM, 9.5, 500, "end")}
      <Node x={40} y={150} w={270} h={40} t="setComputeUnitLimit(units)" sub="legacy/v0: maximum work allowed" align="start" />
      <Node x={330} y={150} w={270} h={40} t="setComputeUnitPrice(µLamports)" sub="legacy/v0: fee uses price × limit" align="start" accent />
    </Wrap>
  ),
  rent: () => (
    <Wrap vb="0 0 640 214" caption="The account storage minimum is refundable, and its rate is changing in phases. Query the RPC for the current amount instead of hardcoding it.">
      {title("Rent exemption — a refundable storage deposit")}
      <Node x={40} y={64} w={250} h={70} t="Account (size = N bytes)" sub="must hold ≥ rent-exempt minimum" accent />
      {T(165, 150, "balance ≥ min_balance(N)", A, 10, 600)}
      {arrow(295, 99, 355, 99, DIM)}
      <Node x={360} y={64} w={110} h={70} t="LIVES" sub="indefinitely" color={A} />
      {arrow(415, 138, 415, 158, DIM)}
      <Node x={345} y={162} w={250} h={36} t="close account → deposit refunded in full" align="middle" color={A} />
      <Node x={490} y={64} w={105} h={70} t="below min" sub="not rent-exempt" color={RED} />
      {T(165, 196, "minimum depends on account size and current network rate", DIM, 10, 500)}
    </Wrap>
  ),

  // ── CONSENSUS ────────────────────────────────────────────────────────
  "tower-bft": () => (
    <Wrap vb="0 0 640 232" caption="Historical Tower BFT lockouts doubled with each vote. Alpenglow retired Tower on mainnet in October 2026 and replaced it with Votor.">
      {title("Tower BFT — retired lockout model")}
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
      {T(320, 160, "under Tower: deep vote history could root older slots", A, 11.5, 700)}
      {T(320, 192, "Votor now finalizes with direct votes + BLS certificates", DIM, 10.5, 500)}
    </Wrap>
  ),
  alpenglow: () => (
    <Wrap vb="0 0 640 244" caption="Votor is live on mainnet and replaced Tower BFT. Rotor is planned for a later, unscheduled release. Finality targets ~150ms; 200ms slot time is separate.">
      {title("Alpenglow — Votor live · Rotor planned")}
      <Node x={40} y={50} w={270} h={54} t="VOTOR · LIVE" sub="direct votes + BLS certificates" accent />
      {T(175, 120, "≈150ms finality target", MID, 9.5, 600)}
      {T(175, 136, "Tower retired at slot 459,653,000", DIM, 9)}
      <Node x={330} y={50} w={270} h={54} t="ROTOR · LATER" sub="planned Turbine replacement" />
      {T(465, 120, "planned · release date not set", DIM, 9.5, 500)}
      <Node x={40} y={154} w={270} h={40} t="no vote transactions" sub="Votor replaced Tower's vote txs" color={A} align="start" />
      <Node x={330} y={154} w={270} h={40} t="PoH no longer paces blocks" sub="Clock timestamp source changed" align="start" />
      {T(320, 222, "mainnet: confirmed = finalized · prefer finalized", DIM, 10.5, 500)}
    </Wrap>
  ),

  // ── NETWORKING ───────────────────────────────────────────────────────
  turbine: () => (
    <Wrap vb="0 0 640 238" caption="Turbine splits block data into data and coding shreds, then forwards them through a stake-weighted tree. Enough coding data can help validators recover missing pieces. Rotor is planned but not live.">
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
      {T(320, 228, "small erasure-coded shreds · enough data and coding shreds can rebuild missing data", DIM, 10.5, 500)}
    </Wrap>
  ),
  "gulf-stream": () => (
    <Wrap vb="0 0 640 230" caption="Solana has no single public pending-transaction pool. RPCs can forward transactions to current and upcoming leaders; providers and leaders may still keep private queues.">
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
      {T(320, 214, "leader schedule is known ahead · forwarding does not guarantee inclusion", DIM, 10.5, 500)}
    </Wrap>
  ),
  "quic-swqos": () => (
    <Wrap vb="0 0 640 218" caption="QUIC manages connections and flow control. Stake-Weighted QoS gives stake-weighted peers reserved transaction intake; exact capacity depends on validator settings.">
      {title("QUIC ingest + Stake-Weighted QoS")}
      <Node x={36} y={70} w={150} h={50} t="senders" sub="RPCs / wallets" />
      {arrow(187, 95, 233, 95, DIM)}
      <Node x={236} y={56} w={140} h={78} t="Leader QUIC" sub="rate-limited intake" accent />
      <rect x={400} y={56} width={200} height={36} rx={8} fill="rgba(20,241,149,.10)" stroke={A} />
      {T(500, 78, "stake-weighted lane", A, 10.5, 700)}
      <rect x={400} y={98} width={200} height={36} rx={8} fill={PANEL} stroke={LINE} />
      {T(500, 120, "other traffic", DIM, 10.5, 600)}
      {arrow(377, 78, 399, 78, A)}
      {arrow(377, 116, 399, 116, DIM)}
      {T(320, 176, "reserved intake can help a tx reach the leader · it cannot guarantee execution", DIM, 10.5, 500)}
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
    <Wrap vb="0 0 640 226" caption="DoubleZero is an opt-in network for validator traffic. Its fiber links and network services can improve how participating validators exchange data; details depend on deployment.">
      {title("DoubleZero — private fiber + multicast")}
      <ellipse cx={320} cy={120} rx={290} ry={92} fill="none" stroke={LINE} strokeDasharray="5 5" />
      {T(320, 48, "validator traffic over a dedicated network", DIM, 10, 600)}
      <ellipse cx={320} cy={128} rx={170} ry={56} fill="none" stroke={A} />
      <Node x={272} y={108} w={96} h={40} t="Leader" accent />
      {[[150, 128], [490, 128], [320, 186]].map(([x, y], i) => (
        <g key={i}>{arrow(320, 128, (x as number) > 320 ? (x as number) - 36 : (x as number) + 36, y as number, A)}<Node x={(x as number) - 40} y={(y as number) - 16} w={80} h={32} t={`validator`} /></g>
      ))}
      {T(320, 218, "participating validators exchange data over private links", A, 10, 600)}
    </Wrap>
  ),

  // ── DATA FLOW ────────────────────────────────────────────────────────
  "tx-lifecycle": () => (
    <Wrap vb="0 0 640 188" caption="`processed` is provisional. On mainnet, `confirmed` currently matches `finalized`; prefer `finalized` in new code because `confirmed` is planned for removal. Retry only while the blockhash is valid.">
      {title("Transaction lifecycle — sign to finality")}
      <Pipeline items={[{ t: "Client", sub: "sign" }, { t: "RPC", sub: "forward" }, { t: "Leader", sub: "execute" }, { t: "Turbine", sub: "propagate" }, { t: "Votor", sub: "BLS cert" }, { t: "Final", sub: "≈150ms" }]} y={70} h={52} hi={5} />
      {T(320, 162, "Alpenglow target ≈150ms · prefer finalized for new code", DIM, 10.5, 500)}
    </Wrap>
  ),
  "lookup-tables": () => (
    <Wrap vb="0 0 640 214" caption="An ALT can store 256 addresses and lets a v0 message use 1-byte indices. A transaction still has a 64-account runtime limit, including loaded accounts.">
      {title("Address Lookup Tables — index, don't inline")}
      <Node x={40} y={58} w={250} h={44} t="legacy: full address in message" sub="about 32 accounts in practice" color={YEL} align="start" />
      <Node x={40} y={112} w={250} h={44} t="v0 + ALT: 1-byte index" sub="table stores 256 · tx limit is 64" accent align="start" />
      <Node x={360} y={66} w={240} h={82} t="Lookup Table (on-chain)" sub="[ pubkey0, pubkey1, … pubkeyN ]" />
      {arrow(292, 134, 358, 110, A)}
      {T(480, 178, "create · wait for activation · reuse", DIM, 10, 500)}
    </Wrap>
  ),
  geyser: () => (
    <Wrap vb="0 0 640 210" caption="Geyser plugins stream validator updates to consumers. Streams can disconnect or lag; deduplicate events and use a provider's replay or backfill tools to catch up.">
      {title("Geyser — stream the validator, don't poll it")}
      <Node x={36} y={78} w={150} h={54} t="Validator" sub="write path" accent />
      {arrow(187, 105, 233, 105, A)}
      <Node x={236} y={78} w={150} h={54} t="Geyser plugin" sub="Yellowstone gRPC" />
      {[0, 1, 2].map((i) => {
        const y = 56 + i * 42;
        return (<g key={i}>{arrow(388, 105, 436, y + 16, DIM)}<Node x={438} y={y} w={166} h={32} t={["indexer / DAS", "Kafka / queue", "Postgres / cache"][i]} /></g>);
      })}
      {T(320, 192, "filter updates · deduplicate events · reconnect and catch up after gaps", DIM, 10.5, 500)}
    </Wrap>
  ),

  // ── PROGRAMS ─────────────────────────────────────────────────────────
  "accounts-model": () => (
    <Wrap vb="0 0 640 214" caption="Programs are stateless — code and state live in separate accounts. A data account names its owning program; only that program can mutate it.">
      {title("Accounts — code and state are separate")}
      <Node x={44} y={64} w={250} h={84} t="PROGRAM ACCOUNT" sub="executable code" accent />
      {arrow(296, 121, 344, 121, A)}
      <Node x={346} y={64} w={250} h={84} t="DATA ACCOUNT" sub="mutable state · owner = program" />
      {T(169, 180, "program runs the logic", MID, 10.5, 600)}
      {T(471, 180, "only its owner can change the data", DIM, 10, 500)}
    </Wrap>
  ),
  "instructions-cpis": () => (
    <Wrap vb="0 0 640 222" caption="Instructions run in order. A program can call another with `invoke`, or sign for its PDA with `invoke_signed`. The current maximum is four nested CPIs (five stack frames including the first program).">
      {title("Instructions & Cross-Program Invocations")}
      <Node x={40} y={50} w={150} h={130} t="Transaction" sub="instructions[]" accent />
      {[0, 1].map((i) => { const y = 64 + i * 60; return <g key={i}>{arrow(191, y + 16, 233, y + 16, DIM)}<Node x={236} y={y} w={150} h={40} t={`ix ${i + 1}`} sub="program_id, accounts, data" /></g>; })}
      <Node x={236} y={64} w={150} h={40} t="Program A" sub="ix 1" accent />
      {arrow(388, 84, 430, 84, A)}
      <Node x={432} y={64} w={170} h={40} t="Program B (CPI)" sub="invoke / invoke_signed" />
      {T(320, 204, "current limit: 4 nested CPIs · SIMD-0268 proposes 8, not active", DIM, 10.5, 500)}
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
    <Wrap vb="0 0 640 200" caption="Rust or C compiles to sBPF, which runs in the sandboxed rBPF VM. The verifier checks bytecode safety; compute-unit limits meter the work done at runtime.">
      {title("SVM bytecode — Rust → SBF → rBPF VM")}
      <Pipeline items={[{ t: "Rust / C", sub: "source" }, { t: "cargo build-sbf", sub: "compile" }, { t: "SBF ELF", sub: ".so bytecode" }, { t: "rBPF VM", sub: "sandbox · metered" }]} y={70} h={54} hi={3} />
      {T(320, 162, "11 registers · bounded stack · restricted syscalls · isolated from other programs", DIM, 10.5, 500)}
    </Wrap>
  ),
  "memory-allocator": () => (
    <Wrap vb="0 0 640 230" caption="Programs have a 32 KiB default heap and 4 KiB stack frames. `RequestHeapFrame` can raise the heap to 256 KiB for each program in the transaction, including CPIs. The default allocator does not reclaim freed memory during an invocation.">
      {title("A program's memory map (rBPF)")}
      <Node x={28} y={50} w={140} h={48} t="Program code" sub="read-only · SBF" />
      <Node x={180} y={50} w={140} h={48} t="Stack" sub="4 KiB / frame" color={YEL} />
      <Node x={332} y={50} w={140} h={48} t="Heap" sub="32 KiB → 256 KiB" accent />
      <Node x={484} y={50} w={128} h={48} t="Account input" sub="serialized in" />
      {T(40, 132, "heap", DIM, 10, 600, "start")}
      <rect x={40} y={140} width={560} height={30} rx={8} fill={PANEL} stroke={LINE} />
      <rect x={40} y={140} width={210} height={30} rx={8} fill="rgba(20,241,149,.12)" stroke={A} />
      {T(145, 159, "used", A, 10.5, 700)}
      {arrow(250, 155, 286, 155, A)}
      {T(300, 159, "bump pointer →", MID, 10, 600, "start")}
      {T(596, 159, "dealloc = no-op", DIM, 10, 600, "end")}
      {T(320, 200, "deallocation does not reclaim heap · large stack values can exceed one frame", DIM, 10, 500)}
    </Wrap>
  ),
  signatures: () => (
    <Wrap vb="0 0 640 220" caption="Tx signatures (Ed25519) authorize the transaction and set is_signer. Precompiles verify any signature as DATA — Secp256r1 (P-256) is what makes passkeys/WebAuthn possible.">
      {title("Two layers: signing a tx vs verifying a signature")}
      <Node x={36} y={56} w={170} h={50} t="Ed25519 tx signature" sub="64 bytes" accent />
      {arrow(207, 81, 251, 81, A)}
      <Node x={254} y={56} w={170} h={50} t="account.is_signer = true" sub="authorization" color={A} />
      {T(120, 132, "the tx is authorized", DIM, 10, 500)}
      <rect x={36} y={150} width={568} height={1} fill={LINE} />
      {T(54, 170, "PRECOMPILES — verify a signature as data:", DIM, 10, 700, "start")}
      <Node x={36} y={180} w={184} h={32} t="Ed25519 — arbitrary msgs" align="start" />
      <Node x={228} y={180} w={184} h={32} t="Secp256k1 — Ethereum" align="start" />
      <Node x={420} y={180} w={192} h={32} t="Secp256r1 — passkeys / WebAuthn" align="start" accent />
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
    <Wrap vb="0 0 640 202" caption="The ledger stores block history, AccountsDB holds current account state, and snapshots help validators load a recent state before replaying newer ledger data.">
      {title("A validator's three data stores")}
      <Node x={40} y={62} w={175} h={72} t="Ledger" sub="append-only history" />
      <Node x={232} y={62} w={175} h={72} t="AccountsDB" sub="account files + indexes" accent />
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
    <Wrap vb="0 0 640 206" caption="The leader pipeline verifies and executes transactions. The Banking Stage schedules work that does not conflict on writable accounts; PoH no longer paces block production under Alpenglow.">
      {title("Banking Stage — the parallel scheduler")}
      <Pipeline items={[{ t: "Fetch", sub: "QUIC" }, { t: "SigVerify", sub: "signatures" }, { t: "Banking", sub: "scheduler" }, { t: "Record", sub: "block data" }]} y={56} h={48} hi={2} />
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
    <Wrap vb="0 0 640 196" caption="There is no single public pending-transaction pool, but order flow can be private. A sandwich places a buy before and a sell after a swap to profit from its price impact.">
      {title("MEV — the leader orders txs inside the block")}
      {[["front-run", A], ["victim swap", YEL], ["back-run", A]].map(([label, c], i) => {
        const x = 60 + i * 180;
        return <g key={i}><Node x={x} y={74} w={150} h={46} t={label as string} sub={i === 1 ? "your trade" : "attacker"} color={c as string} />{i < 2 && arrow(x + 151, 97, x + 180 - 1, 97, DIM)}</g>;
      })}
      {T(320, 156, "buy before → victim pushes price → sell after = extracted value", DIM, 10.5, 500)}
    </Wrap>
  ),
  sandwich: () => (
    <Wrap vb="0 0 640 210" caption="A tight slippage limit caps how far execution can move from the quote. Private submission can reduce exposure, but neither protection guarantees a trade cannot be sandwiched.">
      {title("Sandwich attack & protection")}
      {[["1 · attacker buys", A], ["2 · YOUR swap", YEL], ["3 · attacker sells", A]].map(([label, c], i) => {
        const x = 50 + i * 185;
        return <g key={i}><Node x={x} y={56} w={155} h={44} t={label as string} color={c as string} />{i < 2 && arrow(x + 156, 78, x + 185 - 1, 78, DIM)}</g>;
      })}
      <Node x={50} y={128} w={250} h={44} t="tight slippage tolerance" sub="caps the exploitable gap" accent align="start" />
      <Node x={330} y={128} w={260} h={44} t="private routing / atomic bundle" sub="may reduce some exposure" accent align="start" />
      {T(320, 196, "wide slippage on a thin pool is the open invitation", DIM, 10.5, 500)}
    </Wrap>
  ),
  jito: () => (
    <Wrap vb="0 0 640 200" caption="Searchers submit ordered bundles of up to five transactions with a tip. The Block Engine runs auctions and may forward winning bundles to a leader; a tip does not guarantee inclusion.">
      {title("Jito — bundles + off-chain auction")}
      <Node x={36} y={78} w={130} h={50} t="searchers" sub="build bundles" />
      {arrow(167, 103, 209, 103, DIM)}
      <Node x={212} y={70} w={170} h={66} t="Block Engine" sub="sealed tip auction" accent />
      {arrow(383, 103, 425, 103, A)}
      <Node x={428} y={78} w={170} h={50} t="Leader" sub="includes winners" />
      {T(297, 168, "up to 5 txs · ordered · all-or-nothing", DIM, 10.5, 500)}
    </Wrap>
  ),

  // ── ECONOMICS ────────────────────────────────────────────────────────
  "priority-fees": () => (
    <Wrap vb="0 0 640 196" caption="Legacy/v0 total fee = base fee + priority fee (CU price × requested limit). v1 sets a total priority fee in its message. Priority can improve scheduling, but does not guarantee inclusion.">
      {title("Priority fees — bidding for block space")}
      <Node x={40} y={64} w={250} h={50} t="base fee" sub="5000 lamports / signature" />
      {T(305, 95, "+", FG, 18, 700)}
      <Node x={330} y={64} w={270} h={50} t="legacy/v0: price × requested limit" sub="v1: total fee in message config" accent align="start" />
      {T(320, 156, "priority fee can improve scheduling · it is not a guarantee", DIM, 10.5, 500)}
    </Wrap>
  ),
  "fee-economics": () => (
    <Wrap vb="0 0 640 200" caption="Half of the base fee is burned and half goes to the block-producing validator. The validator receives all of the priority fee.">
      {title("Fee economics — burn vs validator")}
      <Node x={120} y={56} w={400} h={36} t="transaction fee" accent />
      {arrow(220, 93, 200, 118, DIM)}
      {arrow(420, 93, 440, 118, DIM)}
      <Node x={100} y={120} w={200} h={48} t="50% BURNED" sub="of the base fee" color={RED} />
      <Node x={340} y={120} w={200} h={48} t="50% to validator" sub="+ 100% of priority fees" color={A} />
      {T(320, 188, "burning half the base fee alone does not determine net SOL supply", DIM, 10.5, 500)}
    </Wrap>
  ),
  "local-fee-markets": () => (
    <Wrap vb="0 0 640 200" caption="Congestion is often local to writable accounts. A hot pool can contend with transactions that touch it, while unrelated transactions may face less competition. Fees are not strictly priced per account.">
      {title("Local fee markets — contention is per-account")}
      <Node x={40} y={60} w={260} h={56} t="contended writable account" sub="more competition for block space" color={RED} />
      <Node x={340} y={60} w={260} h={56} t="unrelated accounts" sub="may face less competition" color={A} />
      {T(170, 150, "bidding war", RED, 10.5, 600)}
      {T(470, 150, "unaffected", A, 10.5, 600)}
      {T(320, 182, "check recent fees for the accounts your transaction locks", DIM, 10.5, 500)}
    </Wrap>
  ),
  "validator-economics": () => (
    <Wrap vb="0 0 640 206" caption="Validator revenue can include stake-weighted rewards, transaction fees, and MEV tips. Costs vary by operator and include hardware, network, and vote-account expenses.">
      {title("Validator economics — revenue vs cost")}
      {[["Inflation rewards", "stake-weighted"], ["Fee share", "50% base + priority"], ["MEV tips", "via Jito"]].map(([t1, s], i) => {
        const x = 40 + i * 200;
        return <Node key={i} x={x} y={58} w={180} h={56} t={t1} sub={s} accent />;
      })}
      {T(320, 150, "− vote-account fees − hardware and network costs", RED, 11, 600)}
      {T(320, 182, "revenue and operating costs vary across validators", DIM, 10.5, 500)}
    </Wrap>
  ),

  // ── FRONTIER / INFRA ─────────────────────────────────────────────────
  firedancer: () => (
    <Wrap vb="0 0 640 200" caption="Independent clients implement the same protocol. Client diversity can reduce shared software risk, but every client still has to agree on the same state.">
      {title("Validator clients — one network, many implementations")}
      <Node x={36} y={64} w={180} h={62} t="Agave" sub="Rust · Anza (reference)" />
      <Node x={230} y={64} w={180} h={62} t="Frankendancer" sub="FD networking + Agave runtime" accent />
      <Node x={424} y={64} w={180} h={62} t="Firedancer" sub="pure C · Jump" accent />
      {T(320, 162, "independent implementations reduce shared bug risk", DIM, 10.5, 500)}
    </Wrap>
  ),
  "async-execution": () => (
    <Wrap vb="0 0 640 214" caption="The 100M compute-unit block limit is live on mainnet. Asynchronous Program Execution (APE) is a separate research direction, not part of the live runtime.">
      {title("Scaling — bigger blocks + async execution")}
      <Node x={260} y={56} w={120} h={40} t="100M CU" sub="live on mainnet" accent />
      {T(320, 132, "APE · research direction", FG, 11.5, 700)}
      <Node x={120} y={146} w={190} h={40} t="consensus orders txs" sub="agree on sequence" accent align="start" />
      {arrow(312, 166, 332, 166, DIM)}
      <Node x={334} y={146} w={190} h={40} t="state computed after" sub="off the critical path" align="start" />
      {T(320, 204, "model: agree on order first · compute resulting state after", DIM, 10.5, 500)}
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
      {T(310, 168, "sending returns a signature · track confirmation separately", DIM, 10.5, 500)}
    </Wrap>
  ),
  clusters: () => (
    <Wrap vb="0 0 640 196" caption="Each cluster has separate accounts and programs. Use localnet or devnet while building, test against the target cluster before launch, and treat mainnet as real value.">
      {title("Solana clusters — four separate networks")}
      {[["localnet", "your machine"], ["devnet", "app testing"], ["testnet", "network testing"], ["mainnet-beta", "real value"]].map(([t1, s], i) => {
        const x = 36 + i * 152;
        return <Node key={i} x={x} y={70} w={138} h={58} t={t1} sub={s} accent={i === 3} />;
      })}
      {T(320, 168, "an address/program on one cluster does not exist on another", DIM, 10.5, 500)}
    </Wrap>
  ),
  "epochs-validators": () => (
    <Wrap vb="0 0 640 196" caption="An epoch is currently about 432,000 slots. At the 200ms slot target that is roughly one day, though skips and schedule changes affect elapsed time. Stake and reward changes follow epoch rules.">
      {title("Epochs — roughly 432,000 slots")}
      <Node x={40} y={64} w={250} h={56} t="Epoch N" sub="about 432,000 slots · ~1 day" accent />
      {arrow(291, 92, 331, 92, DIM)}
      <Node x={334} y={64} w={250} h={56} t="Epoch N+1" sub="new leader schedule" />
      {T(165, 150, "schedule fixed at epoch start", DIM, 10, 500)}
      {T(459, 150, "stake changes + rewards apply", DIM, 10, 500)}
      {T(320, 180, "leader for each slot is deterministic and known in advance", DIM, 10.5, 500)}
    </Wrap>
  ),
  "versioned-tx": () => (
    <Wrap vb="0 0 640 216" caption="Legacy and v0 transactions are limited to 1,232 bytes; v1 allows 4,096 bytes. All three currently allow at most 64 accounts. Only v0 supports ALTs, and SIMD-0596's proposed 96-account limit is not active.">
      {title("Three transaction formats")}
      <Node x={28} y={62} w={174} h={72} t="Legacy" sub="1,232 B · ~32 accounts" color={YEL} />
      <Node x={233} y={62} w={174} h={72} t="v0" sub="1,232 B · ALT · max 64" accent />
      <Node x={438} y={62} w={174} h={72} t="v1 · active" sub="4,096 B · inline · max 64" accent />
      {arrow(204, 98, 231, 98, DIM)}
      {arrow(409, 98, 436, 98, DIM)}
      {T(320, 166, "ALT tables store 256 addresses · one transaction still loads up to 64", DIM, 10.5, 500)}
      {T(320, 193, "SIMD-0596 proposes 96 accounts · not active", DIM, 10, 500)}
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
