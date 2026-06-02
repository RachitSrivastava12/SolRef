// Vercel Serverless Function — POST /api/quiz
// Generates a grounded multiple-choice quiz for one concept using DeepSeek
// (via OpenRouter). The API key lives ONLY in server-side env vars and is
// never exposed to the browser. The frontend posts the concept content; this
// function asks the model to write questions anchored strictly to that content.
//
// Env vars required on Vercel (Project → Settings → Environment Variables):
//   OPENROUTER_API_KEY = sk-or-... (your OpenRouter key)
//   OPENROUTER_MODEL   = deepseek/deepseek-v4-flash   (optional; this is the default)
//
// The frontend falls back to the hand-written quiz bank if this endpoint errors,
// so the site never breaks even if the key is missing or rate-limited.

export const config = { runtime: "edge" };

interface ConceptPayload {
  title: string;
  desc: string;
  details: string[];
  whyItMatters?: string;
  commonMistakes?: string[];
  count?: number;
}

const SYSTEM = `You are a Solana developer-education quiz writer.
Write multiple-choice questions that test real understanding of Solana infrastructure.
RULES:
- Ground every question ONLY in the provided concept material. Do not invent facts.
- Each question has exactly 4 options, exactly one correct.
- VARY which option index is correct across questions — do NOT always put the answer at the same position.
- Vary difficulty; avoid trivially obvious wrong answers.
- "explain" must be 1-2 sentences and teach why the answer is right.
- Output STRICT JSON only. No markdown, no preamble, no code fences.
Schema: {"questions":[{"q":string,"options":[string,string,string,string],"answer":number,"explain":string}]}
"answer" is the 0-based index of the correct option.`;

function buildUserPrompt(c: ConceptPayload): string {
  const facts = (c.details || []).map((d) => `- ${d}`).join("\n");
  const mistakes = (c.commonMistakes || []).map((m) => `- ${m}`).join("\n");
  return `Concept: ${c.title}

Description:
${c.desc}

Key facts:
${facts}
${c.whyItMatters ? `\nWhy it matters:\n${c.whyItMatters}` : ""}
${mistakes ? `\nCommon mistakes:\n${mistakes}` : ""}

Write ${c.count ?? 5} questions grounded strictly in the material above. Return JSON only.`;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
  }

  const key = (globalThis as { process?: { env?: Record<string, string> } }).process?.env?.OPENROUTER_API_KEY
    // @ts-ignore - Vercel Edge exposes env via process.env at runtime
    || process.env.OPENROUTER_API_KEY;
  if (!key) {
    return new Response(JSON.stringify({ error: "OPENROUTER_API_KEY not configured" }), { status: 503, headers: { "Content-Type": "application/json" } });
  }
  // @ts-ignore
  const model = (process.env.OPENROUTER_MODEL as string) || "deepseek/deepseek-v4-flash";

  let concept: ConceptPayload;
  try {
    concept = await req.json();
    if (!concept?.title || !concept?.desc) throw new Error("missing fields");
  } catch {
    return new Response(JSON.stringify({ error: "Invalid body" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  try {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
        "X-Title": "SolRef",
      },
      body: JSON.stringify({
        model,
        temperature: 0.6,
        max_tokens: 1200,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: buildUserPrompt(concept) },
        ],
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      return new Response(JSON.stringify({ error: "Upstream error", detail: text.slice(0, 300) }), { status: 502, headers: { "Content-Type": "application/json" } });
    }

    const data = await r.json();
    const content: string = data?.choices?.[0]?.message?.content ?? "";
    const cleaned = content.replace(/```json|```/g, "").trim();

    let parsed: { questions?: unknown };
    try { parsed = JSON.parse(cleaned); } catch {
      return new Response(JSON.stringify({ error: "Model returned non-JSON" }), { status: 502, headers: { "Content-Type": "application/json" } });
    }

    const qs = Array.isArray(parsed.questions) ? parsed.questions : [];
    // validate shape; drop anything malformed so the client never renders garbage
    const valid = qs.filter((q: unknown) => {
      const x = q as { q?: string; options?: unknown[]; answer?: number; explain?: string };
      return typeof x?.q === "string" && Array.isArray(x.options) && x.options.length === 4
        && typeof x.answer === "number" && x.answer >= 0 && x.answer < 4 && typeof x.explain === "string";
    });

    if (valid.length === 0) {
      return new Response(JSON.stringify({ error: "No valid questions" }), { status: 502, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ questions: valid, source: "llm", model }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Request failed", detail: String(e).slice(0, 200) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
