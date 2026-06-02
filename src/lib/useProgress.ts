import { useState, useEffect, useCallback } from "react";

export interface Progress {
  visited: string[];
  scores: Record<string, { best: number; total: number }>;
}
const KEY = "solref_progress_v2";

function load(): Progress {
  try { const r = localStorage.getItem(KEY); if (r) return JSON.parse(r); } catch { /* noop */ }
  return { visited: [], scores: {} };
}
function save(p: Progress) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* noop */ } }

export function useProgress() {
  const [progress, setProgress] = useState<Progress>({ visited: [], scores: {} });
  useEffect(() => { setProgress(load()); }, []);

  const visit = useCallback((id: string) => {
    setProgress((prev) => {
      if (prev.visited.includes(id)) return prev;
      const next = { ...prev, visited: [...prev.visited, id] };
      save(next); return next;
    });
  }, []);

  const record = useCallback((id: string, score: number, total: number) => {
    setProgress((prev) => {
      const best = Math.max(prev.scores[id]?.best ?? 0, score);
      const next = { ...prev, scores: { ...prev.scores, [id]: { best, total } } };
      save(next); return next;
    });
  }, []);

  const isMastered = useCallback((id: string) => {
    const s = progress.scores[id];
    return !!s && s.total > 0 && s.best / s.total >= 0.7;
  }, [progress]);

  return { progress, visit, record, isMastered };
}
