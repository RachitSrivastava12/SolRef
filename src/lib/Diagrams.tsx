// Inline SVG diagrams for the conceptually hard topics. Theme-aware via CSS vars.
// Rendered inside the concept modal "Overview" tab when a concept has a diagramKey.

const G = "var(--metal)";
const MUT = "var(--text-dim)";
const BRD = "var(--line)";
const FG = "var(--text)";
const SEC = "var(--surface-2)";

const wrap = (children: React.ReactNode, vb = "0 0 600 230") => (
  <div
    className="rounded-xl p-3 overflow-x-auto"
    style={{ background: "var(--bg)", border: `1px solid ${BRD}` }}
  >
    <svg viewBox={vb} width="100%" style={{ display: "block", minWidth: 320 }} fontFamily="ui-monospace, monospace">
      {children}
    </svg>
  </div>
);

const box = (x: number, y: number, w: number, h: number, fill = SEC, stroke = BRD) => (
  <rect x={x} y={y} width={w} height={h} rx="8" fill={fill} stroke={stroke} strokeWidth="1" />
);
const t = (x: number, y: number, s: string, fill = FG, size = 12, weight = 600, anchor = "middle") => (
  <text x={x} y={y} fill={fill} fontSize={size} fontWeight={weight} textAnchor={anchor as "middle"}>{s}</text>
);
const arrow = (x1: number, y1: number, x2: number, y2: number, color = G) => (
  <g>
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1.5" markerEnd="url(#ah)" />
  </g>
);
const Defs = () => (
  <defs>
    <marker id="ah" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill={G} />
    </marker>
  </defs>
);

const diagrams: Record<string, () => React.ReactNode> = {
  accounts: () =>
    wrap(
      <>
        <Defs />
        {t(300, 22, "Programs are STATELESS — logic and state are separate accounts", MUT, 11, 600)}
        {box(40, 50, 220, 150, SEC, G)}
        {t(150, 74, "PROGRAM ACCOUNT", G, 11, 700)}
        {t(150, 100, "executable: true", FG, 12)}
        {t(150, 124, "owns →", MUT, 11)}
        {t(150, 150, "holds code (SBF)", MUT, 11)}
        {t(150, 174, "no mutable state", MUT, 11)}
        {arrow(262, 125, 338, 125)}
        {box(340, 50, 220, 150, SEC, BRD)}
        {t(450, 74, "DATA ACCOUNT", FG, 11, 700)}
        {t(450, 100, "owner = program", G, 12)}
        {t(450, 124, "lamports + data[]", FG, 11)}
        {t(450, 150, "rent-exempt balance", MUT, 11)}
        {t(450, 174, "only owner can write", MUT, 11)}
      </>
    ),

  poh: () =>
    wrap(
      <>
        <Defs />
        {t(300, 22, "Proof of History — a SHA-256 hash chain = verifiable clock", MUT, 11, 600)}
        {[0, 1, 2, 3].map((i) => {
          const x = 30 + i * 140;
          return (
            <g key={i}>
              {box(x, 70, 110, 60, SEC, i === 2 ? G : BRD)}
              {t(x + 55, 95, `hash ${i}`, FG, 12, 700)}
              {t(x + 55, 115, "sha256(prev)", MUT, 9.5)}
              {i < 3 && arrow(x + 110, 100, x + 30 + i * 0 + 30, 100)}
            </g>
          );
        })}
        {t(170, 170, "tx embedded here", G, 11, 700)}
        {arrow(190, 160, 165, 132)}
        {t(300, 200, "each hash proves ~400ms passed · order is provable without messaging", MUT, 10.5, 500)}
      </>
    ),

  gulfstream: () =>
    wrap(
      <>
        <Defs />
        {t(300, 22, "Gulf Stream — NO mempool, txs go straight to upcoming leaders", MUT, 11, 600)}
        {box(30, 75, 110, 50, SEC, BRD)}
        {t(85, 105, "Client + RPC", FG, 12, 700)}
        {arrow(142, 100, 198, 100)}
        {box(200, 75, 90, 50, SEC, G)}
        {t(245, 98, "Leader N", G, 11, 700)}
        {t(245, 114, "(current)", MUT, 9)}
        {[0, 1, 2].map((i) => {
          const y = 35 + i * 60;
          return (
            <g key={i}>
              {arrow(292, 100, 358, y + 25)}
              {box(360, y, 110, 40, SEC, BRD)}
              {t(415, y + 25, `Leader N+${i + 1}`, FG, 11, 600)}
            </g>
          );
        })}
        {t(300, 215, "leaders pre-cache your tx before their slot · stale blockhash = silently dropped", MUT, 10, 500)}
      </>
    ),

  turbine: () =>
    wrap(
      <>
        <Defs />
        {t(300, 20, "Turbine — block split into shreds, fanned out BitTorrent-style", MUT, 11, 600)}
        {box(255, 36, 90, 34, SEC, G)}
        {t(300, 58, "Leader", G, 12, 700)}
        {[0, 1, 2].map((i) => {
          const x = 130 + i * 170;
          return (
            <g key={i}>
              {arrow(300, 70, x + 35, 96)}
              {box(x, 100, 70, 30, SEC, BRD)}
              {t(x + 35, 120, "tier 1", FG, 10, 600)}
              {[0, 1].map((j) => {
                const cx = x - 20 + j * 60;
                return (
                  <g key={j}>
                    {arrow(x + 35, 130, cx + 25, 156)}
                    {box(cx, 160, 50, 26, SEC, BRD)}
                    {t(cx + 25, 177, "node", MUT, 9, 500)}
                  </g>
                );
              })}
            </g>
          );
        })}
        {t(300, 212, "~1228-byte erasure-coded shreds · FEC rebuilds blocks from ⅔ · O(n log n)", MUT, 9.5, 500)}
      </>
    ),

  sealevel: () =>
    wrap(
      <>
        <Defs />
        {t(300, 22, "Sealevel — non-overlapping accounts execute in parallel", MUT, 11, 600)}
        {/* parallel lanes */}
        {[0, 1].map((i) => {
          const y = 50 + i * 40;
          return (
            <g key={i}>
              {box(40, y, 150, 30, SEC, G)}
              {t(115, y + 20, `tx${i + 1} · accounts {A${i}}`, G, 10.5, 600)}
            </g>
          );
        })}
        {t(115, 140, "⇅ different accounts", MUT, 10, 600)}
        {t(115, 156, "RUN IN PARALLEL", G, 10.5, 700)}
        {/* serialized */}
        {box(360, 50, 200, 30, SEC, "var(--sol-red)")}
        {t(460, 70, "tx3 · writes pool P", FG, 10.5, 600)}
        {box(360, 92, 200, 30, SEC, "var(--sol-red)")}
        {t(460, 112, "tx4 · writes pool P", FG, 10.5, 600)}
        {t(460, 150, "same hot account", MUT, 10, 600)}
        {t(460, 166, "→ SERIALIZE", "var(--sol-red)", 10.5, 700)}
        {t(300, 210, "declare accounts upfront · only mark mutable what you write", MUT, 10, 500)}
      </>
    ),

  pda: () =>
    wrap(
      <>
        <Defs />
        {t(300, 22, "PDA — deterministic address with NO private key (off-curve)", MUT, 11, 600)}
        {box(30, 70, 130, 60, SEC, BRD)}
        {t(95, 95, "seeds[]", FG, 12, 700)}
        {t(95, 114, '"vault", user', MUT, 9.5)}
        {box(30, 145, 130, 36, SEC, BRD)}
        {t(95, 168, "program_id", FG, 11, 600)}
        {arrow(162, 100, 235, 110)}
        {arrow(162, 163, 235, 120)}
        {box(240, 85, 130, 60, SEC, G)}
        {t(305, 108, "sha256 +", G, 11, 700)}
        {t(305, 126, "bump search", G, 11, 700)}
        {arrow(372, 115, 438, 115)}
        {box(440, 85, 140, 60, SEC, G)}
        {t(510, 108, "PDA", G, 13, 800)}
        {t(510, 128, "off ed25519 curve", MUT, 9)}
        {t(300, 208, "same seeds + program = same PDA forever · program signs via invoke_signed", MUT, 9.5, 500)}
      </>
    ),

  lifecycle: () =>
    wrap(
      <>
        <Defs />
        {t(300, 20, "Transaction lifecycle — there is no mempool, so retry is on you", MUT, 11, 600)}
        {["Client", "RPC", "Leader", "Turbine", "Vote", "Final"].map((s, i) => {
          const x = 18 + i * 96;
          return (
            <g key={s}>
              {box(x, 70, 80, 46, SEC, i === 5 ? G : BRD)}
              {t(x + 40, 90, `0${i + 1}`, G, 10, 700)}
              {t(x + 40, 106, s, FG, 11, 600)}
              {i < 5 && arrow(x + 80, 93, x + 96 + 0, 93)}
            </g>
          );
        })}
        {t(300, 165, "processed → confirmed (⅔ stake) → finalized (32 votes, irreversible)", MUT, 10.5, 500)}
      </>,
      "0 0 600 185"
    ),
};

export default function ConceptDiagram({ diagramKey }: { diagramKey?: string }) {
  if (!diagramKey || !diagrams[diagramKey]) return null;
  return <div className="mb-2">{diagrams[diagramKey]()}</div>;
}
