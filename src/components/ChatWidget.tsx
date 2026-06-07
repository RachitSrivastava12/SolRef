import { useState, useRef, useEffect, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { MessageCircle, X, Send, Sparkles, ArrowUpRight } from "lucide-react";
import { retrieveContext, relatedConcepts, type RelatedPage } from "../lib/searchIndex";
import { iconFor } from "../lib/concepts";

interface Msg { role: "user" | "assistant"; content: string; related?: RelatedPage[] }

const SUGGESTIONS = [
  "What is Proof of History?",
  "How do priority fees work?",
  "Explain the validator hot path",
  "Why is Alpenglow a big deal?",
  "What's a PDA?",
];

const INTERNAL = "(?:docs|deep-dives|quizzes|learn|workspace|innovations|lifecycle|sandwich|resources)";

// ── tiny markdown-lite renderer: links, bullets, paragraphs ───────────────
function inline(text: string, baseKey: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = new RegExp(`\\[([^\\]]+)\\]\\((\\/[^)\\s]+|https?:\\/\\/[^)\\s]+)\\)|(\\/${INTERNAL}[A-Za-z0-9\\-/]*)|(https?:\\/\\/[^\\s)]+)`, "g");
  let last = 0, i = 0, m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = `${baseKey}-${i++}`;
    if (m[1] && m[2]) out.push(linkNode(m[2], m[1], key));
    else if (m[3]) out.push(linkNode(m[3], m[3], key));
    else if (m[4]) out.push(<a key={key} href={m[4]} target="_blank" rel="noopener noreferrer" className="cw-link">{m[4]}</a>);
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
function linkNode(path: string, label: string, key: string): ReactNode {
  if (path.startsWith("/")) return <Link key={key} to={path} className="cw-link">{label}</Link>;
  return <a key={key} href={path} target="_blank" rel="noopener noreferrer" className="cw-link">{label}</a>;
}
function renderRich(text: string, baseKey: string): ReactNode[] {
  const lines = text.replace(/\*\*/g, "").replace(/__/g, "").split("\n");
  const blocks: ReactNode[] = [];
  let bullets: ReactNode[] = [];
  const flush = () => { if (bullets.length) { blocks.push(<ul key={`${baseKey}-ul-${blocks.length}`} className="cw-ul">{bullets}</ul>); bullets = []; } };
  lines.forEach((ln, idx) => {
    const t = ln.trim();
    if (!t) { flush(); return; }
    if (/^[-•*]\s+/.test(t)) bullets.push(<li key={idx}>{inline(t.replace(/^[-•*]\s+/, ""), `${baseKey}-li-${idx}`)}</li>);
    else { flush(); blocks.push(<p key={idx} className="cw-p">{inline(t, `${baseKey}-p-${idx}`)}</p>); }
  });
  flush();
  return blocks;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const loc = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);
  useEffect(() => { if (open) setTimeout(() => taRef.current?.focus(), 60); }, [open]);

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || loading) return;
    const related = relatedConcepts(text, 4);
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          context: retrieveContext(text, 5),
          page: loc.pathname,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.text) {
        setMessages((m) => [...m, { role: "assistant", content: data.text, related }]);
      } else {
        setMessages((m) => [...m, {
          role: "assistant",
          related,
          content: related.length
            ? "I can't reach the AI assistant right now, but these SolRef pages cover that — open one below."
            : `I can't reach the AI right now. Try the [docs](/docs), or [search the web](https://www.google.com/search?q=${encodeURIComponent(`${text} solana`)}).`,
        }]);
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", related, content: "Network hiccup — but here are the most relevant pages:" }]);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  return (
    <>
      {/* launcher */}
      {!open && (
        <button onClick={() => setOpen(true)} aria-label="Ask the Solana assistant" className="cw-fab">
          <MessageCircle size={20} />
          <span>Ask</span>
        </button>
      )}

      {/* panel */}
      {open && (
        <div className="cw-panel" role="dialog" aria-label="Solana assistant">
          <div className="cw-head">
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span className="cw-avatar"><Sparkles size={15} /></span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 650, lineHeight: 1.1 }}>SolRef assistant</div>
                <div style={{ fontSize: 11, color: "var(--text-dim)" }}>Knows the docs + Engineering Solana</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="cw-x"><X size={18} /></button>
          </div>

          <div ref={scrollRef} className="cw-body">
            {messages.length === 0 && (
              <div className="cw-empty">
                <p className="cw-p" style={{ color: "var(--text-mid)" }}>
                  Ask me anything about how Solana works — I'll explain it and point you to the right page.
                </p>
                <div className="cw-chips">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} className="cw-chip" onClick={() => send(s)}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`cw-msg cw-msg--${m.role}`}>
                {m.role === "assistant" ? (
                  <div className="cw-bubble cw-bubble--bot">
                    <div className="cw-rich">{renderRich(m.content, `m${i}`)}</div>
                    {m.related && m.related.length > 0 && (
                      <div className="cw-related">
                        {m.related.map((r) => (
                          <Link key={r.id} to={`/docs/${r.id}`} className="cw-related__item">
                            <span className="cw-related__icon">{iconFor(r.icon)}</span>
                            <span>{r.title}</span>
                            <ArrowUpRight size={13} />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="cw-bubble cw-bubble--user">{m.content}</div>
                )}
              </div>
            ))}

            {loading && (
              <div className="cw-msg cw-msg--assistant">
                <div className="cw-bubble cw-bubble--bot cw-typing"><span /><span /><span /></div>
              </div>
            )}
          </div>

          <div className="cw-input">
            <textarea ref={taRef} value={input} rows={1} onChange={(e) => setInput(e.target.value)} onKeyDown={onKey}
              placeholder="Ask about PoH, fees, the SVM, Alpenglow…" />
            <button onClick={() => send(input)} disabled={!input.trim() || loading} aria-label="Send"><Send size={16} /></button>
          </div>
        </div>
      )}

      <style>{`
        .cw-fab { position: fixed; right: 20px; bottom: 20px; z-index: 70; display: inline-flex; align-items: center; gap: 8px;
          height: 46px; padding: 0 16px 0 14px; border-radius: 99px; border: 1px solid var(--line-2);
          background: var(--surface); color: var(--text); font-weight: 600; font-size: 14px; cursor: pointer;
          box-shadow: 0 10px 34px rgba(0,0,0,.5); transition: transform .18s var(--ease-out), border-color .18s var(--ease-out); }
        .cw-fab:hover { transform: translateY(-2px); border-color: var(--neon-green); }
        .cw-fab > svg { color: var(--neon-green); }

        .cw-panel { position: fixed; right: 20px; bottom: 20px; z-index: 75; width: 392px; max-width: calc(100vw - 32px);
          height: 600px; max-height: calc(100vh - 40px); display: flex; flex-direction: column; overflow: hidden;
          background: #0a0a0a; border: 1px solid var(--line-2); border-radius: 16px;
          box-shadow: 0 28px 80px rgba(0,0,0,.62); animation: scaleIn .16s var(--ease-out); }
        .cw-head { display: flex; align-items: center; justify-content: space-between; padding: 13px 14px;
          border-bottom: 1px solid var(--line); background: var(--surface); }
        .cw-avatar { width: 30px; height: 30px; border-radius: 9px; display: flex; align-items: center; justify-content: center;
          color: var(--neon-green); background: var(--surface-3); border: 1px solid var(--line); }
        .cw-x { background: transparent; border: none; color: var(--text-dim); display: flex; padding: 4px; border-radius: 7px; }
        .cw-x:hover { color: var(--text); background: var(--surface-2); }

        .cw-body { flex: 1; overflow-y: auto; padding: 16px 14px; display: flex; flex-direction: column; gap: 14px; }
        .cw-empty .cw-chips { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 14px; }
        .cw-chip { text-align: left; font-size: 12.5px; padding: 8px 12px; border-radius: 10px; cursor: pointer;
          background: var(--surface-2); border: 1px solid var(--line); color: var(--text-mid); transition: border-color .15s, color .15s; }
        .cw-chip:hover { border-color: var(--line-3); color: var(--text); }

        .cw-msg { display: flex; }
        .cw-msg--user { justify-content: flex-end; }
        .cw-bubble { max-width: 88%; border-radius: 13px; padding: 11px 13px; font-size: 14px; line-height: 1.6; }
        .cw-bubble--user { background: var(--neon-green); color: #04140d; font-weight: 500; border-bottom-right-radius: 5px; white-space: pre-wrap; }
        .cw-bubble--bot { background: var(--surface-2); border: 1px solid var(--line); color: var(--text-mid); border-bottom-left-radius: 5px; }
        .cw-rich .cw-p { margin: 0 0 8px; }
        .cw-rich .cw-p:last-child { margin-bottom: 0; }
        .cw-rich .cw-ul { margin: 4px 0 8px; padding-left: 18px; display: flex; flex-direction: column; gap: 4px; }
        .cw-rich .cw-ul li { line-height: 1.55; }
        .cw-link { color: var(--neon-green); text-decoration: none; border-bottom: 1px solid rgba(20,241,149,.3); }
        .cw-link:hover { border-bottom-color: var(--neon-green); }

        .cw-related { display: flex; flex-direction: column; gap: 5px; margin-top: 11px; padding-top: 10px; border-top: 1px solid var(--line); }
        .cw-related__item { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--text-mid);
          padding: 6px 8px; border-radius: 8px; background: var(--surface); border: 1px solid var(--line); transition: border-color .15s, color .15s; }
        .cw-related__item:hover { border-color: var(--neon-green); color: var(--text); }
        .cw-related__item > svg:last-child { margin-left: auto; color: var(--text-dim); flex-shrink: 0; }
        .cw-related__icon { display: flex; color: var(--neon-green); }
        .cw-related__icon svg { width: 14px; height: 14px; }

        .cw-typing { display: inline-flex; gap: 4px; align-items: center; }
        .cw-typing span { width: 6px; height: 6px; border-radius: 99px; background: var(--text-dim); animation: cwb 1s infinite; }
        .cw-typing span:nth-child(2) { animation-delay: .15s; } .cw-typing span:nth-child(3) { animation-delay: .3s; }
        @keyframes cwb { 0%,60%,100% { opacity: .25; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-2px); } }

        .cw-input { display: flex; align-items: flex-end; gap: 8px; padding: 10px; border-top: 1px solid var(--line); background: var(--surface); }
        .cw-input textarea { flex: 1; resize: none; max-height: 120px; background: var(--surface-2); border: 1px solid var(--line-2);
          border-radius: 10px; padding: 10px 12px; color: var(--text); font-family: var(--font-display); font-size: 14px; line-height: 1.4; outline: none; }
        .cw-input textarea:focus { border-color: var(--line-3); }
        .cw-input button { flex-shrink: 0; width: 40px; height: 40px; border-radius: 10px; border: none; cursor: pointer;
          background: var(--neon-green); color: #04140d; display: flex; align-items: center; justify-content: center; }
        .cw-input button:disabled { opacity: .4; cursor: default; }

        @media (max-width: 480px) {
          .cw-panel { right: 12px; left: 12px; bottom: 12px; width: auto; height: calc(100vh - 24px); }
          .cw-fab { right: 14px; bottom: 14px; }
        }
      `}</style>
    </>
  );
}
