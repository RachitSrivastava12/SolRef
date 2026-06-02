import { useNavigate } from "react-router-dom";
import { useState } from "react";

// Fixed-aspect "stage" so rays + labels never distort. Everything is laid out
// in a 1100×640 coordinate space, then scaled to fit the viewport.
const STAGE_W = 1100, STAGE_H = 640;
const CX = STAGE_W / 2, CY = STAGE_H / 2;

const SPOKES = [
  { label: "Proof of History", to: "/docs/proof-of-history", angle: -90 },
  { label: "Turbine", to: "/docs/turbine", angle: -52 },
  { label: "Sealevel", to: "/docs/sealevel", angle: -18 },
  { label: "Gulf Stream", to: "/docs/gulf-stream", angle: 16 },
  { label: "MEV", to: "/docs/mev", angle: 52 },
  { label: "PDAs", to: "/docs/pda", angle: 90 },
  { label: "Tower BFT", to: "/docs/tower-bft", angle: 128 },
  { label: "Fee Economics", to: "/docs/fee-economics", angle: 164 },
  { label: "Accounts", to: "/docs/accounts-model", angle: 198 },
  { label: "Lifecycle", to: "/lifecycle", angle: 232 },
];

export default function RaysHero() {
  const navigate = useNavigate();
  const [hover, setHover] = useState<number | null>(null);

  const RX = 430, RY = 250;     // label ellipse radius
  const RAY = 0.62;             // ray ends at 62% toward the label
  const pt = (angle: number, rx: number, ry: number) => {
    const r = (angle * Math.PI) / 180;
    return { x: CX + rx * Math.cos(r), y: CY + ry * Math.sin(r) };
  };

  return (
    <section style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <div className="grid-bg" style={{ position: "absolute", inset: 0, zIndex: 0 }} />

      {/* STAGE — scales down on small screens */}
      <div className="rays-stage" style={{ position: "relative", width: STAGE_W, height: STAGE_H, flexShrink: 0 }}>
        {/* RAYS — gradient stroke, brightest at the coin, fading out (the "flow") */}
        <svg width={STAGE_W} height={STAGE_H} viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} style={{ position: "absolute", inset: 0, zIndex: 1, overflow: "visible" }}>
          <defs>
            <radialGradient id="rayFade" cx={CX} cy={CY} r={RX} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
              <stop offset="35%" stopColor="#bdbdbd" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#bdbdbd" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="coinGlow" cx={CX} cy={CY} r="260" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--neon-green)" stopOpacity="0.24" />
              <stop offset="48%" stopColor="#ffffff" stopOpacity="0.05" />
              <stop offset="100%" stopColor="var(--neon-green)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* glow halo behind coin so it melts into the background */}
          <circle cx={CX} cy={CY} r="260" fill="url(#coinGlow)" />

          {SPOKES.map((s, i) => {
            const end = pt(s.angle, RX * RAY, RY * RAY);
            const active = hover === i;
            return (
              <line key={i} x1={CX} y1={CY} x2={end.x} y2={end.y}
                stroke={active ? "var(--neon-green)" : "url(#rayFade)"}
                strokeWidth={active ? 2 : 1}
                strokeDasharray={active ? "none" : "1 7"}
                strokeLinecap="round"
                style={{ transition: "stroke .2s, stroke-width .2s" }} />
            );
          })}
        </svg>

        {/* LABELS */}
        {SPOKES.map((s, i) => {
          const p = pt(s.angle, RX, RY);
          const active = hover === i;
          return (
            <button key={i}
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
              onClick={() => navigate(s.to)}
              style={{
                position: "absolute", left: p.x, top: p.y, transform: "translate(-50%,-50%)", zIndex: 3,
                fontFamily: "var(--font-mono)", fontSize: 12.5, letterSpacing: ".02em",
                padding: "7px 14px", borderRadius: 99, whiteSpace: "nowrap", fontWeight: 600,
                background: active ? "var(--neon-green)" : "rgba(15,15,16,.85)",
                color: active ? "#060606" : "var(--text-mid)",
                border: `1px solid ${active ? "var(--neon-green)" : "var(--line-2)"}`,
                backdropFilter: "blur(4px)", transition: "all .2s", cursor: "pointer",
                boxShadow: active ? "0 0 28px var(--neon-green-glow)" : "none",
              }}>
              {s.label}
            </button>
          );
        })}

        {/* CENTER COIN — circular cut-out (transparent corners) + glow, blends into bg */}
        <div style={{ position: "absolute", left: CX, top: CY, transform: "translate(-50%,-50%)", zIndex: 2 }}>
          <div style={{ position: "relative", width: 168, height: 168, animation: "coinFloat 6s ease-in-out infinite" }}>
            <div style={{ position: "absolute", inset: "-44%", borderRadius: "50%", background: "radial-gradient(circle, var(--neon-green-glow) 0%, var(--neon-green-soft) 28%, rgba(255,255,255,.04) 44%, transparent 70%)", pointerEvents: "none" }} />
            <img src="/solana-coin-circle.png" alt="Solana" width={168} height={168}
              style={{ position: "relative", display: "block", borderRadius: "50%", boxShadow: "0 0 0 1px rgba(20,241,149,.34), 0 0 54px rgba(20,241,149,.26)", filter: "drop-shadow(0 24px 60px rgba(0,0,0,.85)) drop-shadow(0 0 26px var(--neon-green-soft))" }} draggable={false} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes coinFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        /* scale the fixed stage down to fit narrower viewports */
        @media (max-width: 1180px) { .rays-stage { transform: scale(.82); } }
        @media (max-width: 980px)  { .rays-stage { transform: scale(.66); } }
        @media (max-width: 760px)  {
          .rays-stage { transform: scale(.5); height: 520px; }
        }
        @media (max-width: 560px)  { .rays-stage { transform: scale(.4); } }
      `}</style>
    </section>
  );
}
