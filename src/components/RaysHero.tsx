import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const STAGE_W = 1100;
const STAGE_H = 550;
const CX = STAGE_W / 2;
const CY = 285;

const SPOKES = [
  { label: "01 Start · Foundations", to: "/deep-dives/core-foundations", angle: -90 },
  { label: "02 Runtime", to: "/deep-dives/runtime-programs", angle: -45 },
  { label: "03 Execution", to: "/deep-dives/execution-hot-path", angle: 0 },
  { label: "04 Networking", to: "/deep-dives/network-propagation", angle: 45 },
  { label: "05 State & data", to: "/deep-dives/state-data", angle: 90 },
  { label: "06 Consensus", to: "/deep-dives/consensus-finality", angle: 135 },
  { label: "07 Fees & MEV", to: "/deep-dives/fees-mev-roadmap", angle: 180 },
  { label: "08 Finish · Frontier", to: "/deep-dives/frontier-2025", angle: 225 },
];

export default function RaysHero() {
  const navigate = useNavigate();
  const [hover, setHover] = useState<number | null>(null);

  const RX = 430;
  const RY = 215;
  const RAY = 0.64;

  const pt = (angle: number, rx: number, ry: number) => {
    const r = (angle * Math.PI) / 180;
    return {
      x: CX + rx * Math.cos(r),
      y: CY + ry * Math.sin(r),
    };
  };

  return (
    <section
      style={{
        position: "relative",
        minHeight: "100svh",
        boxSizing: "border-box",
        padding: "112px 20px 26px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        overflow: "hidden",
        background: "var(--bg)",
      }}
    >
      <div
        className="grid-bg"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background:
            "radial-gradient(circle at 50% 48%, rgba(20,241,149,.07), transparent 34%), radial-gradient(circle at 50% 52%, rgba(255,255,255,.028), transparent 32%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="rays-heading"
        style={{
          position: "relative",
          zIndex: 2,
          width: STAGE_W,
          maxWidth: "calc(100vw - 40px)",
          marginBottom: 2,
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          letterSpacing: ".13em",
          textTransform: "uppercase",
          fontWeight: 700,
          color: "var(--text-dim)",
          textAlign: "left",
        }}
      >
        Learn How{" "}
        <span
          style={{
            color: "var(--neon-green)",
            textShadow: "0 0 18px rgba(20,241,149,.22)",
          }}
        >
          Solana
        </span>{" "}
        Works Internally
      </div>

      <nav className="rays-route-list" aria-label="SolRef learning route, in order">
        <ol>
          {SPOKES.map((spoke) => (
            <li key={spoke.to}>
              <Link to={spoke.to}>
                <span className="rays-route-list__number">{spoke.label.slice(0, 2)}</span>
                <span>{spoke.label.slice(3)}</span>
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      <div
        className="rays-stage"
        style={{
          position: "relative",
          width: STAGE_W,
          height: STAGE_H,
          flexShrink: 0,
          zIndex: 1,
        }}
      >
        <svg
          width={STAGE_W}
          height={STAGE_H}
          viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            overflow: "visible",
          }}
        >
          <defs>
            <radialGradient id="rayFade" cx={CX} cy={CY} r={RX} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--neon-green)" stopOpacity="0.24" />
              <stop offset="45%" stopColor="var(--neon-green)" stopOpacity="0.08" />
              <stop offset="100%" stopColor="var(--neon-green)" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="coinGlow" cx={CX} cy={CY} r="260" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--neon-green)" stopOpacity="0.09" />
              <stop offset="48%" stopColor="#ffffff" stopOpacity="0.02" />
              <stop offset="100%" stopColor="var(--neon-green)" stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle cx={CX} cy={CY} r="260" fill="url(#coinGlow)" />

          {SPOKES.map((s, i) => {
            const end = pt(s.angle, RX * RAY, RY * RAY);
            const active = hover === i;

            return (
              <line
                key={i}
                x1={CX}
                y1={CY}
                x2={end.x}
                y2={end.y}
                stroke={active ? "var(--neon-green)" : "url(#rayFade)"}
                strokeWidth={active ? 2 : 1}
                strokeDasharray={active ? "none" : "1 7"}
                strokeLinecap="round"
                style={{
                  transition: "stroke .2s, stroke-width .2s, opacity .2s",
                  opacity: active ? 1 : 0.9,
                }}
              />
            );
          })}
        </svg>

        {SPOKES.map((s, i) => {
          const p = pt(s.angle, RX, RY);
          const active = hover === i;

          return (
            <button
              key={i}
              className="hero-spoke"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onClick={() => navigate(s.to)}
              aria-label={`Open ${s.label}`}
              style={{
                position: "absolute",
                left: p.x,
                top: p.y,
                transform: active ? "translate(-50%,-50%) scale(1.04)" : "translate(-50%,-50%)",
                zIndex: 3,
                fontFamily: "var(--font-mono)",
                fontSize: 12.5,
                letterSpacing: ".02em",
                padding: "8px 15px",
                borderRadius: 99,
                whiteSpace: "nowrap",
                fontWeight: 650,
                background: active ? "var(--text)" : i === 0 ? "rgba(20,241,149,.11)" : "rgba(255,255,255,.045)",
                color: active ? "var(--bg)" : i === 0 ? "var(--neon-green)" : "var(--text-mid)",
                border: `1px solid ${active ? "var(--text)" : i === 0 ? "rgba(20,241,149,.36)" : "var(--line)"}`,
                transition:
                  "background .18s var(--ease-out), border-color .18s var(--ease-out), color .18s var(--ease-out), transform .18s var(--ease-out)",
                cursor: "pointer",
                boxShadow: active ? "0 12px 34px rgba(0,0,0,.32)" : "none",
                backdropFilter: "blur(10px)",
              }}
            >
              {s.label}
            </button>
          );
        })}

        <div
          style={{
            position: "absolute",
            left: CX,
            top: CY,
            transform: "translate(-50%,-50%)",
            zIndex: 2,
          }}
        >
          <div
            style={{
              position: "relative",
              width: 158,
              height: 158,
              animation: "coinFloat 6s ease-in-out infinite",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: "-32%",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(20,241,149,.09), transparent 62%)",
                pointerEvents: "none",
              }}
            />

            <img
              src="/solana-coin-circle.png"
              alt="Solana"
              width={158}
              height={158}
              style={{
                position: "relative",
                display: "block",
                borderRadius: "50%",
                boxShadow: "0 0 0 1px var(--line-2)",
                filter: "drop-shadow(0 22px 40px rgba(0,0,0,.7))",
              }}
              draggable={false}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes coinFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-9px); }
        }

        .rays-stage {
          transform-origin: top center;
        }

        .rays-route-list {
          display: none;
          position: relative;
          z-index: 2;
          width: min(520px, calc(100vw - 40px));
          margin-top: 16px;
        }

        .rays-route-list ol {
          display: grid;
          gap: 8px;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .rays-route-list a {
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 44px;
          padding: 8px 12px;
          border: 1px solid var(--line);
          border-radius: 9px;
          background: var(--surface);
          color: var(--text-mid);
          font-family: var(--font-mono);
          font-size: 12px;
          text-decoration: none;
        }

        .rays-route-list a:hover {
          border-color: var(--line-3);
          background: var(--surface-2);
          color: var(--text);
        }

        .rays-route-list a:focus-visible {
          outline: 2px solid var(--neon-green);
          outline-offset: 3px;
        }

        .rays-route-list__number {
          color: var(--neon-green);
          font-weight: 700;
        }

        @media (max-width: 1180px) {
          .rays-stage {
            transform: scale(.86);
            height: 473px !important;
          }
        }

        @media (max-width: 980px) {
          .rays-heading {
            text-align: center !important;
          }

          .rays-stage {
            display: none;
          }

          .rays-route-list {
            display: block;
          }
        }

        @media (max-width: 760px) {
          .rays-stage {
            transform: scale(.58);
            height: 319px !important;
          }
        }

        @media (max-width: 560px) {
          .rays-stage {
            transform: scale(.45);
            height: 248px !important;
          }
        }

        @media (max-width: 430px) {
          .rays-stage {
            transform: scale(.34);
            height: 187px !important;
          }
        }

        .hero-spoke:focus-visible {
          outline: 2px solid var(--neon-green);
          outline-offset: 4px;
        }
      `}</style>
    </section>
  );
}
