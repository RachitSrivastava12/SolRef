import { useNavigate } from "react-router-dom";
import { useState } from "react";

const STAGE_W = 1100;
const STAGE_H = 550;
const CX = STAGE_W / 2;
const CY = 285;

const SPOKES = [
  { label: "Native 101", to: "/learn", angle: -90 },
  { label: "Infra", to: "/docs?cat=Core%20Infra", angle: -45 },
  { label: "Protocol internals", to: "/docs?cat=Consensus", angle: 0 },
  { label: "Data flow", to: "/docs?cat=Data%20Flow", angle: 45 },
  { label: "Low level runtime", to: "/docs?cat=System%20Design", angle: 90 },
  { label: "Program side", to: "/docs?cat=Programs", angle: 135 },
  { label: "Token economics", to: "/docs?cat=Economics", angle: 180 },
  { label: "MEV / ordering", to: "/docs?cat=MEV", angle: 225 },
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
                background: active ? "var(--text)" : "rgba(255,255,255,.045)",
                color: active ? "var(--bg)" : "var(--text-mid)",
                border: `1px solid ${active ? "var(--text)" : "var(--line)"}`,
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
            transform: scale(.72);
            height: 396px !important;
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

        .hero-spoke:focus-visible {
          outline: 2px solid var(--neon-green);
          outline-offset: 4px;
        }
      `}</style>
    </section>
  );
}