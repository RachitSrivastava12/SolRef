import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Editor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import {
  Sparkles, Wand2, Loader2, ChevronDown, Copy, Check, Terminal, RotateCcw,
  BookOpen, Target, Lightbulb, CheckCircle2, XCircle, ArrowRight,
} from "lucide-react";
import Layout from "../components/Layout";
import { concepts, conceptById, metaFor, iconFor } from "../lib/concepts";
import { tasksFor, taskById, type Task } from "../lib/tasks";
import { useProgress } from "../lib/useProgress";

(self as unknown as { MonacoEnvironment: unknown }).MonacoEnvironment = {
  getWorker(_: string, label: string) {
    if (label === "typescript" || label === "javascript") return new tsWorker();
    return new editorWorker();
  },
};
loader.config({ monaco });

const STARTER = `import {
  Connection, Keypair, LAMPORTS_PER_SOL, clusterApiUrl,
} from "@solana/web3.js";

// A Solana scratchpad. Pick a concept (top right) to load a task,
// then ask for a hint or have your code evaluated.
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const wallet = Keypair.generate();

const balance = await connection.getBalance(wallet.publicKey);
console.log("Balance:", balance / LAMPORTS_PER_SOL, "SOL");
`;

export default function Workspace() {
  const [params, setParams] = useSearchParams();
  const { record } = useProgress();

  const [conceptId, setConceptId] = useState<string | null>(params.get("c"));
  const [task, setTask] = useState<Task | null>(() => {
    const c = params.get("c"), t = params.get("task");
    return c && t ? taskById(c, t) ?? null : null;
  });
  const [code, setCode] = useState(task?.starter ?? STARTER);
  const [output, setOutput] = useState<{ text: string; mode: string; passed?: boolean } | null>(null);
  const [loading, setLoading] = useState<"hint" | "review" | "evaluate" | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [hintsShown, setHintsShown] = useState(0);

  const concept = conceptId ? conceptById(conceptId) : null;
  const conceptTasks = conceptId ? tasksFor(conceptId) : [];

  // when concept changes via picker, load its first task (or its sample code)
  useEffect(() => {
    if (!concept) { setCode(STARTER); setTask(null); return; }
    const t = task && tasksFor(concept ? metaFor(concept.title).id : "").some((x) => x.id === task.id) ? task : (tasksFor(metaFor(concept.title).id)[0] ?? null);
    setTask(t);
    setCode(t ? t.starter : concept.code);
    setOutput(null); setErr(null); setHintsShown(0);
  }, [conceptId]); // eslint-disable-line

  const loadTask = (t: Task) => {
    setTask(t); setCode(t.starter); setOutput(null); setErr(null); setHintsShown(0);
    if (conceptId) setParams({ c: conceptId, task: t.id }, { replace: true });
  };

  const call = async (mode: "hint" | "review" | "evaluate") => {
    setLoading(mode); setErr(null); if (mode !== "hint") setOutput(null);
    try {
      const r = await fetch("/api/hint", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, concept: concept?.title, mode, task: task?.goal, criteria: task?.criteria }),
      });
      const d = await r.json();
      if (!r.ok) {
        setErr(d?.error === "OPENROUTER_API_KEY not configured"
          ? "AI features need the OpenRouter key in your Vercel env vars. Running locally? Use `vercel dev`."
          : (d?.error || "Something went wrong."));
      } else {
        setOutput({ text: d.text, mode: d.mode, passed: d.passed });
        if (mode === "evaluate" && d.passed && concept && task) {
          // mastering a task counts toward the concept (full marks for a pass)
          record(metaFor(concept.title).id, 1, 1);
        }
      }
    } catch {
      setErr("Couldn't reach the AI service. Check your connection or env config.");
    } finally { setLoading(null); }
  };

  const copy = () => { try { navigator.clipboard.writeText(code); } catch { /* noop */ } setCopied(true); setTimeout(() => setCopied(false), 1600); };
  const reset = () => { setCode(task ? task.starter : concept ? concept.code : STARTER); setOutput(null); setErr(null); };

  return (
    <Layout wide>
      <div className="shell-wide" style={{ paddingTop: 28 }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
          <div>
            <div className="eyebrow">Workspace</div>
            <h1 style={{ fontSize: 30, fontWeight: 800, marginTop: 6, letterSpacing: 0 }}>
              {task ? task.title : "Practice, get hints, get evaluated"}
            </h1>
          </div>
          <div style={{ display: "flex", gap: 10, position: "relative" }}>
            <button onClick={() => setPickerOpen((o) => !o)} className="btn btn-surface">
              {concept ? <>{iconFor(concept.icon)} {concept.title}</> : <>Load a concept</>} <ChevronDown size={14} />
            </button>
            {pickerOpen && (
              <div className="card" style={{ position: "absolute", top: 50, right: 0, width: 320, maxHeight: 400, overflowY: "auto", zIndex: 30, padding: 8, boxShadow: "0 30px 80px -20px rgba(0,0,0,.8)" }}>
                <button onClick={() => { setConceptId(null); setPickerOpen(false); }} style={{ width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 8, border: "none", background: "transparent", color: "var(--text-mid)", fontSize: 13.5 }}>Blank scratchpad</button>
                {concepts.map((c) => {
                  const cid = metaFor(c.title).id;
                  const n = tasksFor(cid).length;
                  return (
                    <button key={cid} onClick={() => { setConceptId(cid); setPickerOpen(false); }} style={{ width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 8, border: "none", display: "flex", alignItems: "center", gap: 10, background: cid === conceptId ? "var(--surface-2)" : "transparent", color: "var(--text)", fontSize: 13.5 }}>
                      <span style={{ color: "var(--text-mid)", display: "flex" }}>{iconFor(c.icon)}</span>
                      <span style={{ flex: 1 }}>{c.title}</span>
                      {n > 0 && <span className="mono" style={{ fontSize: 10.5, color: "var(--text-dim)" }}>{n} task{n > 1 ? "s" : ""}</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* task switcher chips */}
        {conceptTasks.length > 1 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {conceptTasks.map((t) => (
              <button key={t.id} onClick={() => loadTask(t)} className={`pill ${task?.id === t.id ? "on" : ""}`}>{t.title}</button>
            ))}
          </div>
        )}

        {/* TWO PANES */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }} className="ws-grid">
          {/* EDITOR */}
          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", borderBottom: "1px solid var(--line)", background: "var(--bg-2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "flex", gap: 6 }}>
                  <i style={{ width: 11, height: 11, borderRadius: 99, background: "#3a3a3d", display: "block" }} />
                  <i style={{ width: 11, height: 11, borderRadius: 99, background: "#3a3a3d", display: "block" }} />
                  <i style={{ width: 11, height: 11, borderRadius: 99, background: "#3a3a3d", display: "block" }} />
                </span>
                <span style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "var(--font-mono)", marginLeft: 6 }}>{concept ? `${metaFor(concept.title).id}.ts` : "scratchpad.ts"}</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={reset} title="Reset" style={{ background: "transparent", border: "none", color: "var(--text-dim)", display: "flex", padding: 5 }}><RotateCcw size={14} /></button>
                <button onClick={copy} title="Copy" style={{ background: "transparent", border: "none", color: "var(--text-dim)", display: "flex", padding: 5 }}>{copied ? <Check size={14} style={{ color: "var(--sol-green)" }} /> : <Copy size={14} />}</button>
              </div>
            </div>
            <div style={{ height: "60vh", minHeight: 380 }}>
              <Editor
                height="100%" defaultLanguage="typescript" language="typescript" theme="solref-dark"
                value={code} onChange={(v) => setCode(v ?? "")}
                beforeMount={(m) => {
                  m.editor.defineTheme("solref-dark", {
                    base: "vs-dark", inherit: true, rules: [],
                    colors: {
                      "editor.background": "#000000", "editor.foreground": "#f7f7f6",
                      "editorLineNumber.foreground": "#3f423f", "editorLineNumber.activeForeground": "#f7f7f6",
                      "editor.selectionBackground": "#14f19522", "editor.lineHighlightBackground": "#090909",
                      "editorCursor.foreground": "#14f195", "editorIndentGuide.background1": "#1a1a1a",
                    },
                  });
                  m.languages.typescript.typescriptDefaults.setDiagnosticsOptions({ noSemanticValidation: true, noSyntaxValidation: false });
                  m.languages.typescript.typescriptDefaults.setCompilerOptions({ target: m.languages.typescript.ScriptTarget.ESNext, allowNonTsExtensions: true, moduleResolution: m.languages.typescript.ModuleResolutionKind.NodeJs });
                }}
                options={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 16, bottom: 16 }, lineNumbersMinChars: 3, renderLineHighlight: "line", smoothScrolling: true, tabSize: 2, automaticLayout: true, wordWrap: "off" }}
              />
            </div>
            <div style={{ display: "flex", gap: 10, padding: 12, borderTop: "1px solid var(--line)", background: "var(--bg-2)" }}>
              {task ? (
                <button onClick={() => call("evaluate")} disabled={!!loading} className="btn btn-grad" style={{ flex: 1, justifyContent: "center", fontSize: 13 }}>
                  {loading === "evaluate" ? <Loader2 size={14} className="spin" /> : <CheckCircle2 size={14} />} Evaluate my solution
                </button>
              ) : (
                <button onClick={() => call("review")} disabled={!!loading} className="btn btn-grad" style={{ flex: 1, justifyContent: "center", fontSize: 13 }}>
                  {loading === "review" ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />} Review my code
                </button>
              )}
              <button onClick={() => call("hint")} disabled={!!loading} className="btn btn-surface" style={{ fontSize: 13 }}>
                {loading === "hint" ? <Loader2 size={14} className="spin" /> : <Wand2 size={14} />} Hint
              </button>
            </div>
          </div>

          {/* RIGHT: goal + hints + AI output */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* GOAL */}
            {task ? (
              <div className="card" style={{ padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <Target size={16} style={{ color: "var(--text)" }} />
                  <span style={{ fontSize: 15, fontWeight: 700 }}>Your goal</span>
                  <span className="mono" style={{ marginLeft: "auto", fontSize: 10.5, padding: "2px 8px", borderRadius: 99, border: "1px solid var(--line-2)", color: "var(--text-dim)" }}>{task.kind === "reasoning" ? "explain it" : "write code"} · {task.difficulty}</span>
                </div>
                <p style={{ fontSize: 14, color: "var(--text-mid)", lineHeight: 1.65 }}>{task.goal}</p>
              </div>
            ) : (
              <div className="card" style={{ padding: 18, display: "flex", alignItems: "center", gap: 12 }}>
                <Terminal size={18} style={{ color: "var(--text)" }} />
                <span style={{ fontSize: 13.5, color: "var(--text-dim)" }}>Load a concept (top right) to get a task to master — or just scratch around and hit Review.</span>
              </div>
            )}

            {/* HINTS (progressive) */}
            {task && task.hints.length > 0 && (
              <div className="card" style={{ padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: hintsShown > 0 ? 12 : 0 }}>
                  <Lightbulb size={16} style={{ color: "var(--text)" }} />
                  <span style={{ fontSize: 15, fontWeight: 700 }}>Hints</span>
                  <span className="mono" style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-dim)" }}>{hintsShown}/{task.hints.length}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {task.hints.slice(0, hintsShown).map((h, i) => (
                    <div key={i} style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.6, background: "var(--surface-2)", borderRadius: 9, padding: "10px 12px", borderLeft: "2px solid var(--line-2)" }}>{h}</div>
                  ))}
                </div>
                {hintsShown < task.hints.length && (
                  <button onClick={() => setHintsShown((n) => n + 1)} className="btn btn-surface" style={{ marginTop: hintsShown > 0 ? 10 : 12, fontSize: 12.5, width: "100%", justifyContent: "center" }}>
                    Reveal {hintsShown === 0 ? "a hint" : "next hint"}
                  </button>
                )}
              </div>
            )}

            {/* AI OUTPUT */}
            <div className="card" style={{ padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Sparkles size={16} style={{ color: "var(--text)" }} />
                <span style={{ fontSize: 15, fontWeight: 700 }}>AI mentor</span>
                <span style={{ marginLeft: "auto", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>DeepSeek</span>
              </div>
              <div style={{ minHeight: 120, borderRadius: 12, background: "var(--bg-2)", border: "1px solid var(--line)", padding: 16 }}>
                {loading && <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-dim)", fontSize: 13.5 }}><Loader2 size={15} className="spin" /> {loading === "evaluate" ? "Grading your solution…" : loading === "review" ? "Reviewing…" : "Thinking…"}</div>}
                {!loading && err && <div style={{ color: "var(--sol-yellow)", fontSize: 13.5, lineHeight: 1.6 }}>{err}</div>}
                {!loading && !err && output && (
                  <div>
                    {output.mode === "evaluate" && output.passed !== undefined && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, color: output.passed ? "var(--sol-green)" : "var(--text-mid)", fontWeight: 700, fontSize: 15 }}>
                        {output.passed ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                        {output.passed ? "Passed — concept mastered" : "Not quite yet"}
                      </div>
                    )}
                    <div style={{ fontSize: 14, color: "var(--text-mid)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                      {/* strip the leading PASS/TRY AGAIN token from the body */}
                      {output.mode === "evaluate" ? output.text.replace(/^(pass|try again)\b[:.\-\s]*/i, "") : output.text}
                    </div>
                    {output.mode === "evaluate" && output.passed && (
                      <Link to={`/quizzes/${conceptId}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 14, fontSize: 13, color: "var(--text)", fontWeight: 600 }}>
                        Lock it in with the quiz <ArrowRight size={14} />
                      </Link>
                    )}
                  </div>
                )}
                {!loading && !err && !output && (
                  <div style={{ color: "var(--text-dim)", fontSize: 13.5, lineHeight: 1.6 }}>
                    {task
                      ? <>Write your solution, then <b style={{ color: "var(--text-mid)" }}>Evaluate</b> to get graded — or take a <b style={{ color: "var(--text-mid)" }}>Hint</b> if you're stuck.</>
                      : <>Hit <b style={{ color: "var(--text-mid)" }}>Review</b> for a critique of whatever you write — Solana gotchas included.</>}
                  </div>
                )}
              </div>
            </div>

            {/* concept link */}
            {concept && (
              <Link to={`/docs/${metaFor(concept.title).id}`} className="card card-lift" style={{ padding: 16, display: "flex", alignItems: "center", gap: 10 }}>
                <BookOpen size={16} style={{ color: "var(--text)" }} />
                <span style={{ fontSize: 13.5 }}>Read the {concept.title} concept</span>
                <ArrowRight size={14} style={{ marginLeft: "auto", color: "var(--text-dim)" }} />
              </Link>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @media (max-width: 900px) { .ws-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </Layout>
  );
}
