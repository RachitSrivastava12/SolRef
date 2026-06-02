import { useState, useEffect, useRef, useMemo, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Command, Menu, X, ArrowRight, ExternalLink } from "lucide-react";
import { Wordmark, SolanaMark } from "./Brand";
import { concepts, metaFor, levelMeta, iconFor } from "../lib/concepts";

const NAV = [
  { to: "/innovations", label: "Innovations" },
  { to: "/docs", label: "Docs" },
  { to: "/lifecycle", label: "Lifecycle" },
  { to: "/learn", label: "Learn" },
  { to: "/workspace", label: "Workspace" },
  { to: "/quizzes", label: "Quizzes" },
];

function CommandSearch({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  useEffect(() => { inputRef.current?.focus(); }, []);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return concepts.slice(0, 7);
    return concepts.filter((c) =>
      c.title.toLowerCase().includes(t) || c.desc.toLowerCase().includes(t) ||
      c.tag.toLowerCase().includes(t) || c.details.some((d) => d.toLowerCase().includes(t))
    ).slice(0, 9);
  }, [q]);
  useEffect(() => { setActive(0); }, [q]);

  const pick = (i: number) => {
    const c = results[i]; if (!c) return;
    navigate(`/docs/${metaFor(c.title).id}`); onClose();
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") pick(active);
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 80, display: "flex", justifyContent: "center", alignItems: "flex-start", paddingTop: "13vh", background: "rgba(4,3,8,.78)", backdropFilter: "blur(10px)", animation: "fadeIn .12s" }}>
      <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: "100%", maxWidth: 580, overflow: "hidden", animation: "scaleIn .14s", boxShadow: "0 40px 120px -30px rgba(0,0,0,.8)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 18px", borderBottom: "1px solid var(--line)" }}>
          <Search size={17} style={{ color: "var(--text-dim)" }} />
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey}
            placeholder="Search 20 concepts — PoH, Turbine, PDAs, priority fees…"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--text)", fontSize: 15, fontFamily: "var(--font-display)" }} />
          <kbd>ESC</kbd>
        </div>
        <div style={{ maxHeight: 380, overflowY: "auto", padding: 8 }}>
          {results.length === 0 && <div style={{ padding: "28px", textAlign: "center", color: "var(--text-dim)", fontSize: 14 }}>No matches.</div>}
          {results.map((c, i) => {
            const m = metaFor(c.title);
            return (
              <button key={m.id} onMouseEnter={() => setActive(i)} onClick={() => pick(i)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 13, padding: "11px 13px", borderRadius: 10, border: "none", textAlign: "left", background: i === active ? "var(--surface-2)" : "transparent", color: "var(--text)", transition: "background .12s" }}>
                <span style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text)", background: "var(--surface-3)", flexShrink: 0 }}>{iconFor(c.icon)}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</span>
                  <span style={{ display: "block", fontSize: 12, color: "var(--text-dim)" }}>{c.tag} · {levelMeta[m.level].label}</span>
                </span>
                <ArrowRight size={15} style={{ color: "var(--text-dim)", flexShrink: 0 }} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Layout({ children, wide }: { children: ReactNode; wide?: boolean }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearchOpen((o) => !o); }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
  useEffect(() => { setMenuOpen(false); }, [loc.pathname]);

  const isActive = (to: string) => loc.pathname === to || (to !== "/" && loc.pathname.startsWith(to));

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      {/* NAV */}
      <header style={{ position: "sticky", top: 0, zIndex: 60, background: "rgba(5,5,5,.78)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--line)" }}>
        <nav className={wide ? "shell-wide" : "shell"} style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", height: 64, gap: 12 }}>
          {/* left: brand */}
          <Link to="/" aria-label="SolRef home" style={{ justifySelf: "start" }}><Wordmark /></Link>

          {/* center: nav links (truly centered) */}
          <div className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: 2, justifySelf: "center", background: "var(--surface)", border: "1px solid rgba(20,241,149,.2)", borderRadius: 99, padding: 4, boxShadow: "0 0 26px rgba(20,241,149,.08)" }}>
            {NAV.map((n) => (
              <Link key={n.to} to={n.to}
                style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".08em", padding: "7px 14px", borderRadius: 99, color: isActive(n.to) ? "#03130c" : "var(--text-mid)", background: isActive(n.to) ? "var(--neon-green)" : "transparent", boxShadow: isActive(n.to) ? "0 0 24px var(--neon-green-soft)" : "none", transition: "all .18s" }}>
                {n.label.toUpperCase()}
              </Link>
            ))}
          </div>

          {/* right: search */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, justifySelf: "end" }}>
            <button onClick={() => setSearchOpen(true)} className="nav-desktop"
              style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 14px", borderRadius: 99, background: "var(--surface)", border: "1px solid var(--line)", color: "var(--text-dim)", fontSize: 13 }}>
              <Search size={14} /> Search
              <kbd style={{ display: "inline-flex", alignItems: "center", gap: 2 }}><Command size={10} />K</kbd>
            </button>
            <button className="nav-mobile" onClick={() => setMenuOpen((o) => !o)} style={{ background: "transparent", border: "none", color: "var(--text)", display: "none" }} aria-label="Menu">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div className="nav-mobile" style={{ display: "none", flexDirection: "column", padding: "12px 28px 18px", borderTop: "1px solid var(--line)", background: "var(--bg-2)" }}>
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} style={{ padding: "11px 0", fontSize: 15, color: isActive(n.to) ? "var(--text)" : "var(--text-mid)" }}>{n.label}</Link>
            ))}
            <button onClick={() => { setSearchOpen(true); setMenuOpen(false); }} style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 9, padding: "11px 0", background: "transparent", border: "none", color: "var(--text)", fontSize: 15 }}>
              <Search size={16} /> Search concepts
            </button>
          </div>
        )}
      </header>

      <main style={{ position: "relative", zIndex: 1 }}>{children}</main>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid var(--line)", marginTop: 80, background: "var(--bg-2)" }}>
        <div className={wide ? "shell-wide" : "shell"} style={{ padding: "48px 28px 36px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 40, justifyContent: "space-between" }}>
            <div style={{ maxWidth: 300 }}>
              <Wordmark />
              <p style={{ color: "var(--text-dim)", fontSize: 13.5, marginTop: 14, lineHeight: 1.65 }}>
                Be a dot sol. The interactive reference for Solana infrastructure — built for developers who actually ship.
              </p>
            </div>
            <div style={{ display: "flex", gap: 56, flexWrap: "wrap" }}>
              <FootCol title="Learn" links={[["Docs", "/docs"], ["Learning path", "/learn"], ["Quizzes", "/quizzes"], ["Workspace", "/workspace"]]} />
              <FootCol title="Build" links={[["Solana Playground", "https://beta.solpg.io"], ["Solana Docs", "https://docs.solana.com"], ["Anchor", "https://www.anchor-lang.com"], ["Cookbook", "https://solanacookbook.com"]]} ext />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--line)" }}>
            <span style={{ fontSize: 12.5, color: "var(--text-dim)" }} className="mono">20 concepts · interactive · grounded in the docs</span>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--text-dim)" }}>
              Powered by <SolanaMark size={14} /> Solana
            </span>
          </div>
        </div>
      </footer>

      {searchOpen && <CommandSearch onClose={() => setSearchOpen(false)} />}

      <style>{`
        @media (max-width: 860px) {
          .nav-desktop { display: none !important; }
          .nav-mobile { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

function FootCol({ title, links, ext }: { title: string; links: [string, string][]; ext?: boolean }) {
  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: 14 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {links.map(([label, to]) => ext ? (
          <a key={label} href={to} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13.5, color: "var(--text-mid)", display: "inline-flex", alignItems: "center", gap: 5 }}>{label} <ExternalLink size={11} /></a>
        ) : (
          <Link key={label} to={to} style={{ fontSize: 13.5, color: "var(--text-mid)" }}>{label}</Link>
        ))}
      </div>
    </div>
  );
}
