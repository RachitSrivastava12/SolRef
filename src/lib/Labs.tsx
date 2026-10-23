// Interactive labs — embedded inside the relevant concept page. Each one turns
// a hard-to-visualize behavior into something you toggle/slide and watch react.
// Keyed by concept id. Pure-black, green-accent, no extra deps.
import { useState, useEffect, type ReactNode } from "react";

const A = "var(--neon-green)";
const RED = "var(--sol-red)";

function LabShell({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <figure style={{ margin: 0, background: "#050505", border: "1px solid var(--line)", borderRadius: "var(--r-md)", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid var(--line)", background: "var(--surface)" }}>
        <span style={{ fontSize: 12.5, fontWeight: 650, display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: A, display: "inline-block", boxShadow: `0 0 8px ${A}` }} />{title}
        </span>
        <span className="mono" style={{ fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: ".14em" }}>interactive</span>
      </div>
      <div style={{ padding: "18px 16px" }}>{children}</div>
      <div style={{ padding: "0 16px 14px", fontSize: 12, color: "var(--text-dim)", lineHeight: 1.55 }}>{hint}</div>
    </figure>
  );
}

const btn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6, height: 34, padding: "0 13px", borderRadius: 8,
  background: "var(--surface-2)", border: "1px solid var(--line-2)", color: "var(--text)", fontSize: 13, fontWeight: 600, cursor: "pointer",
};
const btnPrimary: React.CSSProperties = { ...btn, background: A, color: "#04140d", border: "none" };

// ── 1. Proof of History — Tower-era clock model ──────────────────────────
function PohClock() {
  const [hashes, setHashes] = useState(3);
  const [playing, setPlaying] = useState(false);
  const [stamps, setStamps] = useState<number[]>([]);
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setHashes((h) => h + 1), 300);
    return () => window.clearInterval(id);
  }, [playing]);
  const hex = (n: number) => ((n * 2654435761) >>> 0).toString(16).padStart(8, "0").slice(0, 6);
  const start = Math.max(0, hashes - 5);
  const window6 = Array.from({ length: hashes - start + 1 }, (_, i) => start + i);
  const reset = () => { setHashes(3); setStamps([]); setPlaying(false); };

  return (
    <LabShell title="Proof of History — Tower-era clock model" hint="This model shows how PoH worked with Tower BFT. Since Alpenglow activated, PoH no longer paces block production, and the Clock sysvar timestamp has a new source.">
      <div style={{ display: "flex", alignItems: "center", gap: 6, overflowX: "auto", paddingBottom: 8 }}>
        {window6.map((n, i) => {
          const stamped = stamps.includes(n);
          const isLast = n === hashes;
          return (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <div style={{ minWidth: 78, padding: "9px 10px", borderRadius: 9, border: `1px solid ${stamped ? A : isLast ? "var(--line-3)" : "var(--line)"}`, background: stamped ? "rgba(20,241,149,.08)" : "var(--surface)", textAlign: "center" }}>
                <div className="mono" style={{ fontSize: 11, color: stamped ? A : "var(--text)", fontWeight: 700 }}>#{n}</div>
                <div className="mono" style={{ fontSize: 9.5, color: "var(--text-dim)" }}>{hex(n)}</div>
                {stamped && <div className="mono" style={{ fontSize: 8.5, color: A, marginTop: 2 }}>◆ tx</div>}
              </div>
              {i < window6.length - 1 && <span style={{ color: "var(--text-dim)" }}>→</span>}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14, alignItems: "center" }}>
        <button style={playing ? btn : btnPrimary} onClick={() => setPlaying((p) => !p)}>{playing ? "Pause" : "Play"}</button>
        <button style={btn} onClick={() => setHashes((h) => h + 1)}>Step</button>
        <button style={btn} onClick={() => setStamps((s) => (s.includes(hashes) ? s : [...s, hashes]))}>Stamp a tx here</button>
        <button style={btn} onClick={reset}>Reset</button>
        <span className="mono" style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-dim)" }}>hashes recorded: <b style={{ color: "var(--text)" }}>{hashes.toLocaleString()}</b></span>
      </div>
    </LabShell>
  );
}

// ── 2. Sealevel — parallel vs serialize ───────────────────────────────────
const ACCTS = ["A", "B", "C", "P"];
function SealevelLab() {
  const [writes, setWrites] = useState(["A", "B", "P", "P"]);
  const cycle = (i: number) => setWrites((w) => w.map((a, j) => (j === i ? ACCTS[(ACCTS.indexOf(a) + 1) % ACCTS.length] : a)));
  // schedule: txs writing the same account must serialize (sequential steps).
  const nextStep: Record<string, number> = {};
  const stepOf = writes.map((acc) => { const s = nextStep[acc] ?? 0; nextStep[acc] = s + 1; return s; });
  const numSteps = Math.max(...stepOf) + 1;
  const cols = Array.from({ length: numSteps }, (_, s) => writes.map((_, i) => i).filter((i) => stepOf[i] === s));

  return (
    <LabShell title="Sealevel — parallel where accounts don't overlap" hint="Click a transaction to change the account it WRITES. Two txs writing the same account must run one after another; give them different accounts and they run at the same time. Fewer steps = more throughput — that's the whole point of declaring account access up front.">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {writes.map((acc, i) => (
          <button key={i} onClick={() => cycle(i)} style={{ ...btn, height: 38, flexDirection: "column", gap: 1, padding: "5px 12px", alignItems: "flex-start" }}>
            <span style={{ fontSize: 12.5, fontWeight: 700 }}>tx{i + 1}</span>
            <span className="mono" style={{ fontSize: 10.5, color: A }}>writes {`{${acc}}`}</span>
          </button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${numSteps}, 1fr)`, gap: 8 }}>
        {cols.map((ids, s) => (
          <div key={s}>
            <div className="mono" style={{ fontSize: 10, color: "var(--text-dim)", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".1em" }}>step {s + 1}{ids.length > 1 ? " · parallel" : ""}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {ids.map((i) => (
                <div key={i} style={{ padding: "9px 11px", borderRadius: 9, border: `1px solid ${A}`, background: "rgba(20,241,149,.06)", fontSize: 12.5 }}>
                  <b>tx{i + 1}</b> <span className="mono" style={{ color: "var(--text-dim)", fontSize: 11 }}>{`{${writes[i]}}`}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mono" style={{ fontSize: 12, color: numSteps === 1 ? A : "var(--text-mid)", marginTop: 14 }}>
        4 transactions executed in <b>{numSteps}</b> step{numSteps > 1 ? "s" : ""}{numSteps > 1 ? ` — ${numSteps - 1} forced by a shared account` : " — fully parallel"}
      </div>
    </LabShell>
  );
}

// ── 3. Compute & fee estimator ────────────────────────────────────────────
function FeeEstimator() {
  const [limit, setLimit] = useState(220000);
  const [price, setPrice] = useState(25000); // microLamports per CU
  const base = 5000; // lamports per signature (one signer)
  const priority = Math.round((price * limit) / 1_000_000); // lamports
  const total = base + priority;
  const sol = total / 1e9;
  const tier = price < 1000 ? ["base only", "fine when the network is idle"] : price < 20000 ? ["modest", "ok for normal load"] : price < 80000 ? ["competitive", "good odds under congestion"] : ["aggressive", "for hot mints / liquidations"];

  const Row = ({ label, val, max, step, set, fmt }: { label: string; val: number; max: number; step: number; set: (n: number) => void; fmt: (n: number) => string }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 7 }}>
        <span style={{ color: "var(--text-mid)" }}>{label}</span>
        <span className="mono" style={{ color: "var(--text)" }}>{fmt(val)}</span>
      </div>
      <input type="range" min={step} max={max} step={step} value={val} onChange={(e) => set(Number(e.target.value))}
        style={{ width: "100%", accentColor: "var(--neon-green)" }} />
    </div>
  );

  return (
    <LabShell title="Priority fee & compute budget" hint="Priority fee = price-per-CU × the CU limit you request (in micro-lamports). A tighter, well-estimated limit costs less AND schedules better. Base fee is 5,000 lamports per signature. Higher price ≈ better inclusion only versus other txs touching the same accounts (fees are local).">
      <Row label="Compute unit limit" val={limit} max={1_400_000} step={10000} set={setLimit} fmt={(n) => `${n.toLocaleString()} CU`} />
      <Row label="Price per CU" val={price} max={200000} step={1000} set={setPrice} fmt={(n) => `${n.toLocaleString()} µLamports`} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 }}>
        <div style={{ padding: "12px 14px", borderRadius: 9, background: "var(--surface)", border: "1px solid var(--line)" }}>
          <div className="mono" style={{ fontSize: 10.5, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6 }}>total fee</div>
          <div style={{ fontSize: 20, fontWeight: 750, color: A }}>{sol.toFixed(9)} <span style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 500 }}>SOL</span></div>
          <div className="mono" style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 3 }}>{total.toLocaleString()} lamports</div>
        </div>
        <div style={{ padding: "12px 14px", borderRadius: 9, background: "var(--surface)", border: "1px solid var(--line)" }}>
          <div className="mono" style={{ fontSize: 10.5, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6 }}>breakdown</div>
          <div style={{ fontSize: 12.5, color: "var(--text-mid)", lineHeight: 1.7 }}>
            base <span className="mono" style={{ color: "var(--text)" }}>{base.toLocaleString()}</span><br />
            + priority <span className="mono" style={{ color: A }}>{priority.toLocaleString()}</span>
          </div>
          <div className="mono" style={{ fontSize: 10.5, color: "var(--text-dim)", marginTop: 6 }}>{tier[0]} · {tier[1]}</div>
        </div>
      </div>
    </LabShell>
  );
}

// ── 4. Tower BFT — retired lockout model ─────────────────────────────────
function TowerLockout() {
  const [votes, setVotes] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const rooted = votes >= 5; // 2^5 = 32 → rooted
  const curLock = votes > 0 ? Math.pow(2, votes) : 0;
  const reset = () => { setVotes(0); setBlocked(false); };

  return (
    <LabShell title="Tower BFT — retired lockout model" hint="This historical simulation shows Tower BFT, which Alpenglow replaced on mainnet in October 2026. Tower lockouts doubled (2 → 4 → 8 → 16 → 32 slots) until the slot rooted; Votor now finalizes with validator votes and certificates.">
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
        {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => {
          const cast = n <= votes;
          const lock = Math.pow(2, n);
          return (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 13px", borderRadius: 9, border: `1px solid ${cast ? A : "var(--line)"}`, background: cast ? "rgba(20,241,149,.06)" : "var(--surface)", opacity: cast ? 1 : 0.5 }}>
              <span style={{ fontSize: 12.5, fontWeight: 650, minWidth: 54 }}>vote {n}</span>
              <div style={{ flex: 1, height: 6, borderRadius: 99, background: "var(--surface-2)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(lock / 32) * 100}%`, background: cast ? A : "var(--line-2)", transition: "width .3s var(--ease-out)" }} />
              </div>
              <span className="mono" style={{ fontSize: 11.5, color: cast ? A : "var(--text-dim)", minWidth: 70, textAlign: "right" }}>lockout {lock}</span>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        {!rooted && <button style={btnPrimary} onClick={() => { setVotes((v) => Math.min(5, v + 1)); setBlocked(false); }}>Cast vote</button>}
        {votes > 0 && !rooted && <button style={btn} onClick={() => setBlocked(true)}>Try to switch fork</button>}
        <button style={btn} onClick={reset}>Reset</button>
        {rooted ? (
          <span className="mono" style={{ marginLeft: "auto", fontSize: 12.5, color: A, fontWeight: 700 }}>◆ ROOTED — finalized, irreversible</span>
        ) : blocked ? (
          <span className="mono" style={{ marginLeft: "auto", fontSize: 12, color: RED }}>blocked — locked out for {curLock} slots</span>
        ) : (
          <span className="mono" style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-dim)" }}>{votes === 0 ? "cast a vote to begin" : `current lockout: ${curLock} slots`}</span>
        )}
      </div>
    </LabShell>
  );
}

const labs: Record<string, () => ReactNode> = {
  "proof-of-history": () => <PohClock />,
  sealevel: () => <SealevelLab />,
  "priority-fees": () => <FeeEstimator />,
  "tower-bft": () => <TowerLockout />,
};

export function hasLab(id?: string): boolean {
  return !!id && !!labs[id];
}
export default function ConceptLab({ id }: { id?: string }) {
  if (!id || !labs[id]) return null;
  return <div>{labs[id]()}</div>;
}
