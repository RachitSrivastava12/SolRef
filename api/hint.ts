// Vercel Serverless Function — POST /api/hint
// Gives a Solana-focused hint or evaluation on the user's code in the workspace.
// Uses DeepSeek (via OpenRouter). Key stays server-side. Falls back gracefully
// on the client if this errors.
//
// Env vars: OPENROUTER_API_KEY (required), OPENROUTER_MODEL (optional).

export const config = { runtime: "edge" };

interface Body {
  code: string;
  concept?: string;       // concept title for context
  mode?: "hint" | "review" | "evaluate";
  task?: string;          // task goal/prompt
  criteria?: string;      // evaluation criteria (evaluate mode)
}

const SYSTEM = `You are a senior Solana engineer mentoring a developer in a code workspace.
You give SHORT, high-signal guidance on Solana/web3.js/Anchor code.
RULES:
- Be concise: 3-6 sentences max, or a tight bulleted list.
- In "hint" mode: nudge toward the next step without writing the full solution.
- In "review" mode: point out bugs, anti-patterns, missing error handling, and Solana-specific gotchas (blockhash expiry, compute budget, account ownership, commitment levels, PDA derivation, etc).
- In "evaluate" mode: judge the code against the given task criteria. Start your reply with exactly "PASS" or "TRY AGAIN" on its own first line, then 2-4 sentences of specific feedback. Be fair but rigorous — partial attempts that miss a required element are TRY AGAIN.
- Reference concrete API names where useful.
- Never invent APIs. Plain text only. No markdown headers, no code fences unless showing a 1-2 line snippet.`;

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  // @ts-ignore - Vercel edge exposes process.env at runtime
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return json({ error: "OPENROUTER_API_KEY not configured" }, 503);
  // @ts-ignore
  const model = (process.env.OPENROUTER_MODEL as string) || "deepseek/deepseek-v4-flash";

  let body: Body;
  try { body = await req.json(); if (!body?.code?.trim()) throw new Error("empty"); }
  catch { return json({ error: "Provide some code first." }, 400); }

  const mode = body.mode === "review" ? "review" : body.mode === "evaluate" ? "evaluate" : "hint";
  const ctx = [
    body.concept ? `Concept context: ${body.concept}.` : "",
    body.task ? `Task goal: ${body.task}` : "",
    body.criteria && mode === "evaluate" ? `Evaluation criteria: ${body.criteria}` : "",
    `Mode: ${mode}.`,
    "Code:",
    "```",
    body.code.slice(0, 6000),
    "```",
  ].filter(Boolean).join("\n");

  try {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "X-Title": "SolRef Workspace" },
      body: JSON.stringify({
        model, temperature: mode === "evaluate" ? 0.2 : 0.4, max_tokens: 500,
        messages: [{ role: "system", content: SYSTEM }, { role: "user", content: ctx }],
      }),
    });
    if (!r.ok) return json({ error: "Upstream error", detail: (await r.text()).slice(0, 200) }, 502);
    const data = await r.json();
    const text: string = data?.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) return json({ error: "Empty response" }, 502);
    const passed = mode === "evaluate" ? /^pass\b/i.test(text) : undefined;
    return json({ text, mode, passed, model });
  } catch (e) {
    return json({ error: "Request failed", detail: String(e).slice(0, 200) }, 500);
  }
}

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
