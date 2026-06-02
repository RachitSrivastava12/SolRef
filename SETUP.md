# SolRef — setup & deploy

Solana developer reference + interactive learning (quizzes, diagrams, learning
path, live mainnet stats). Everything runs on Vercel — the frontend plus one
serverless function for AI quiz generation.

## What's new (layered on top of the original design)
- **Multi-page** — every concept, feature, and tool is its own route (react-router,
  clean URLs). Landing is lean and NotebookLM-style; no infinite scroll.
- **The 8 Innovations** (`/innovations`) — the canonical framing (PoH, Tower BFT,
  Turbine, Gulf Stream, Sealevel, Pipelining, Cloudbreak, Archivers) as a matrix,
  plus an interactive commitment-state toggle (processed → confirmed → finalized).
- **Lifecycle stepper** (`/lifecycle`) — six-stage transaction journey to finality,
  each with the exact trigger that advances it.
- **Sandwich simulator** (`/sandwich`) — tune slippage + attacker size and watch the
  attack stop being profitable (illustrative model).
- **Workspace** (`/workspace`) — a real Monaco editor (TypeScript) on the left, AI
  hints + code review on the right (DeepSeek via /api/hint), Copy & open Playground.
  Monaco is code-split, so it only downloads when you open the workspace.
- **Quizzes** — a "Quiz" page per concept. Hand-written grounded bank ships offline;
  "Generate AI set" calls DeepSeek and falls back to the bank if unavailable.
- **Diagrams** — SVG diagrams for the hard concepts render in the doc pages.
- **Learning path** (`/learn`) — Beginner → Intermediate → Advanced with progress in
  localStorage; pass a quiz at 70%+ to mark a concept mastered.
- **Cmd/Ctrl+K search** over all concepts; **Resources** hub; themed 404.

All 20 concepts preserved. Dark Solana palette (#9945FF / #14F195) throughout, with
the official Solana logomark in nav/footer/CTA.

## Run locally
```bash
npm install
cp .env.example .env.local      # then fill in your keys
npm run dev                     # http://localhost:5173
```
Note: the `/api/quiz` function only runs on Vercel's runtime. Locally the quiz
falls back to the offline bank (which is fine). To exercise the live function
locally, use the Vercel CLI: `npm i -g vercel` then `vercel dev`.

## Deploy to Vercel (all-in-one)
1. Push this repo to GitHub.
2. Import it on vercel.com (framework preset: **Vite**).
3. Add Environment Variables (Project → Settings → Environment Variables):
   - `VITE_SOLANA_RPC` = your Solana RPC URL (used by the browser for live stats)
   - `OPENROUTER_API_KEY` = your OpenRouter key (server-only, used by /api/quiz)
   - `OPENROUTER_MODEL` = `deepseek/deepseek-v4-flash` (optional)
4. Deploy. The function auto-deploys at `/api/quiz` on the same domain.

## Security note
`OPENROUTER_API_KEY` has **no** `VITE_` prefix on purpose — Vite only exposes
`VITE_`-prefixed vars to the browser. The OpenRouter key stays server-side in
`/api/quiz`; the browser only ever sends concept text, never the key.

## File map for the additions
- `api/quiz.ts` — secure DeepSeek/OpenRouter proxy (server-side key)
- `src/features/quizzes.ts` — offline quiz bank + `generateQuiz()` live fetch
- `src/features/meta.ts` — per-concept id / difficulty / diagram key (keyed by
  title, so the original concepts array was never edited)
- `src/features/Diagrams.tsx` — theme-matched SVG diagrams
- `src/pages/Index.tsx` — original page, with features layered in surgically
