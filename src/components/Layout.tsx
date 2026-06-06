import { useState, useEffect, useRef, useMemo, type CSSProperties, type ReactNode } from "react";
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
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 80, display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "12vh 18px 0", background: "rgba(0,0,0,.72)", backdropFilter: "blur(10px)", animation: "fadeIn .12s" }}>
      <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: "100%", maxWidth: 640, overflow: "hidden", animation: "scaleIn .14s", boxShadow: "0 24px 90px rgba(0,0,0,.46)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: "1px solid var(--line)", background: "var(--bg)" }}>
          <Search size={17} style={{ color: "var(--text-dim)" }} />
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey}
            placeholder={`Search ${concepts.length} concepts — Alpenglow, Firedancer, PDAs, fees…`}
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--text)", fontSize: 15, fontFamily: "var(--font-display)" }} />
          <kbd>ESC</kbd>
        </div>
        <div style={{ maxHeight: 420, overflowY: "auto", padding: 8 }}>
          {results.length === 0 && <div style={{ padding: "28px", textAlign: "center", color: "var(--text-dim)", fontSize: 14 }}>No matches.</div>}
          {results.map((c, i) => {
            const m = metaFor(c.title);
            return (
              <button key={m.id} onMouseEnter={() => setActive(i)} onClick={() => pick(i)}
                style={{ width: "100%", minHeight: 54, display: "flex", alignItems: "center", gap: 13, padding: "10px 12px", borderRadius: 8, border: "1px solid transparent", textAlign: "left", background: i === active ? "var(--surface-2)" : "transparent", color: "var(--text)", transition: "background .12s var(--ease-out), border-color .12s var(--ease-out)" }}>
                <span style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text)", background: "var(--surface-3)", flexShrink: 0 }}>{iconFor(c.icon)}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</span>
                  <span style={{ display: "block", fontSize: 12, color: "var(--text-dim)" }}>{c.tag} · {levelMeta[m.level].label}</span>
                </span>
                <ArrowRight size={15} style={{ color: i === active ? "var(--neon-green)" : "var(--text-dim)", flexShrink: 0 }} />
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
  const [scrolled, setScrolled] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
  const isLanding = loc.pathname === "/";

  const dockStyle: CSSProperties = {
    pointerEvents: "auto",
    position: "relative",
    width: "100%",
    maxWidth: wide ? 1360 : 1120,
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: 12,
    height: 58,
    padding: "0 8px 0 18px",
    borderRadius: 18,
    background: scrolled ? "rgba(9,9,9,.86)" : "rgba(9,9,9,.46)",
    border: `1px solid ${scrolled ? "var(--line-2)" : "var(--line)"}`,
    backdropFilter: "blur(20px) saturate(150%)",
    WebkitBackdropFilter: "blur(20px) saturate(150%)",
    boxShadow: scrolled ? "0 16px 50px rgba(0,0,0,.55)" : "0 8px 30px rgba(0,0,0,.28)",
    transition: "background .3s var(--ease-out), border-color .3s var(--ease-out), box-shadow .3s var(--ease-out)",
  };
  const linkBase: CSSProperties = {
    fontSize: 13, fontWeight: 550, letterSpacing: ".01em",
    padding: "7px 13px", borderRadius: 11, lineHeight: 1,
    transition: "background .18s var(--ease-out), color .18s var(--ease-out)",
  };

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      {/* FLOATING NAV DOCK */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 60, display: "flex", justifyContent: "center", padding: scrolled ? "10px 16px" : "16px 16px", pointerEvents: "none", transition: "padding .3s var(--ease-out)" }}>
        <nav style={dockStyle}>
          {/* left: brand */}
          <Link to="/" aria-label="SolRef home" style={{ justifySelf: "start", display: "inline-flex", alignItems: "center" }}><Wordmark /></Link>

          {/* center: nav links */}
          <div className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: 2, justifySelf: "center" }}>
            {NAV.map((n) => {
              const on = isActive(n.to);
              return (
                <Link key={n.to} to={n.to}
                  className="nav-link"
                  style={{ ...linkBase, color: on ? "var(--text)" : "var(--text-dim)", background: on ? "var(--surface-3)" : "transparent" }}>
                  {n.label}
                </Link>
              );
            })}
          </div>

          {/* right: search */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, justifySelf: "end" }}>
            <button onClick={() => setSearchOpen(true)} className="nav-desktop nav-search" aria-label="Search"
              style={{ display: "flex", alignItems: "center", gap: 9, height: 38, padding: "0 11px 0 13px", borderRadius: 11, background: "var(--surface-2)", border: "1px solid var(--line)", color: "var(--text-dim)", fontSize: 13 }}>
              <Search size={14} /> <span className="nav-search-label">Search</span>
              <kbd style={{ display: "inline-flex", alignItems: "center", gap: 2 }}><Command size={10} />K</kbd>
            </button>
            <button className="nav-mobile" onClick={() => setMenuOpen((o) => !o)} style={{ background: "transparent", border: "none", color: "var(--text)", display: "none", alignItems: "center", justifyContent: "center", width: 40, height: 40 }} aria-label="Menu">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* mobile dropdown — anchored under the dock */}
          {menuOpen && (
            <div className="nav-mobile" style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, display: "none", flexDirection: "column", padding: 10, borderRadius: 16, border: "1px solid var(--line-2)", background: "rgba(7,7,7,.96)", backdropFilter: "blur(20px)", boxShadow: "0 24px 60px rgba(0,0,0,.6)" }}>
              {NAV.map((n) => (
                <Link key={n.to} to={n.to} style={{ padding: "12px 14px", borderRadius: 10, fontSize: 15, fontWeight: 550, color: isActive(n.to) ? "var(--text)" : "var(--text-mid)", background: isActive(n.to) ? "var(--surface-2)" : "transparent" }}>{n.label}</Link>
              ))}
              <button onClick={() => { setSearchOpen(true); setMenuOpen(false); }} style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 9, padding: "12px 14px", borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--line)", color: "var(--text)", fontSize: 15 }}>
                <Search size={16} /> Search concepts
              </button>
            </div>
          )}
        </nav>
      </header>

      <main style={{ position: "relative", zIndex: 1, background: "var(--bg)", paddingTop: isLanding ? 0 : 84 }}>{children}</main>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid var(--line)", marginTop: 88, background: "var(--bg)" }}>
        <div className={wide ? "shell-wide" : "shell"} style={{ padding: "40px 28px 32px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 40, justifyContent: "space-between" }}>
            <div style={{ maxWidth: 300 }}>
              <Wordmark />
              <p style={{ color: "var(--text-dim)", fontSize: 13, marginTop: 14, lineHeight: 1.65 }}>
                A concise Solana reference for protocol internals, infrastructure, and program-side concepts.
              </p>
            </div>
            <div style={{ display: "flex", gap: 56, flexWrap: "wrap" }}>
              <FootCol title="Learn" links={[["Docs", "/docs"], ["Learning path", "/learn"], ["Quizzes", "/quizzes"], ["Workspace", "/workspace"]]} />
              <FootCol title="Build" links={[["Solana Playground", "https://beta.solpg.io"], ["Solana Docs", "https://docs.solana.com"], ["Anchor", "https://www.anchor-lang.com"], ["Cookbook", "https://solanacookbook.com"]]} ext />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--line)" }}>
            <span style={{ fontSize: 12, color: "var(--text-dim)" }} className="mono">{concepts.length} concepts · diagrams · quizzes · workspace</span>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--text-dim)" }}>
              Powered by <SolanaMark size={14} /> Solana
            </span>
          </div>
        </div>
      </footer>

      {searchOpen && <CommandSearch onClose={() => setSearchOpen(false)} />}

      <style>{`
        .nav-link:hover { color: var(--text) !important; background: var(--surface-2); }
        .nav-search:hover { border-color: var(--line-2); color: var(--text); }
        @media (max-width: 1040px) {
          .nav-search-label { display: none; }
        }
        @media (max-width: 920px) {
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
