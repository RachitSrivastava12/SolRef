import { parse as parseYaml } from "yaml";
import { conceptById, metaFor } from "./concepts";

export interface Chapter {
  id: string;
  sequence: number;
  phase: number;
  prerequisites: string[];
  title: string;
  domain: string;
  summary: string;
  outcome: string;
  conceptIds: string[];
  checkpoints: string[];
  sourceNotes: string[];
  reviewStatus: "pending-expert-review" | "expert-reviewed";
  lastReviewed: string | null;
  expertReviewer: string | null;
  temporalStatus: "unclassified" | "current" | "historical" | "proposed" | "mixed";
  aiAssisted: "unknown" | "yes" | "no";
  provenance: string;
  license: "GPL-3.0-only";
}

export interface LearningPhase {
  id: number;
  title: string;
  summary: string;
}

export const learningPhases: LearningPhase[] = [
  { id: 1, title: "Start with the basics", summary: "Learn the objects and vocabulary every Solana topic builds on." },
  { id: 2, title: "Understand execution", summary: "See how programs use state and how a validator processes a transaction." },
  { id: 3, title: "Follow the data", summary: "Trace ingress, block propagation, stored state, and observation." },
  { id: 4, title: "Reason about finality and cost", summary: "Connect consensus guarantees with fees, ordering, and MEV." },
  { id: 5, title: "Finish at the protocol frontier", summary: "Use the complete model to understand current validator and protocol changes." },
];

const trackFiles = import.meta.glob<string>("../../content/tracks/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

function chapterFromMarkdown(markdown: string, filename: string): Chapter {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`Missing YAML frontmatter in ${filename}`);
  const metadata = parseYaml(match[1]) as Omit<Chapter, "summary">;
  const summary = match[2].match(/^## Summary\s*\n+([\s\S]*?)(?=\n## |$)/m)?.[1]?.trim() ?? "";
  const chapter: Chapter = { ...metadata, summary };
  if (!chapter.id || !chapter.title || !chapter.summary || !chapter.outcome || !chapter.conceptIds.length) {
    throw new Error(`Incomplete learning track in ${filename}`);
  }
  return chapter;
}

export const chapters: Chapter[] = Object.entries(trackFiles)
  .map(([filename, content]) => chapterFromMarkdown(content, filename))
  .sort((a, b) => a.sequence - b.sequence);

export const hotPathStages = [
  { label: "QUIC", detail: "stake-weighted ingress", conceptId: "quic-swqos" },
  { label: "Fetch / SigVerify", detail: "packets become verified txs", conceptId: "tx-lifecycle" },
  { label: "Banking", detail: "scheduler batches conflicts", conceptId: "banking-stage" },
  { label: "SVM", detail: "SBF instructions execute", conceptId: "svm-bytecode" },
  { label: "AccountsDB", detail: "state writes land", conceptId: "accountsdb" },
  { label: "PoH / Broadcast", detail: "entries propagate as shreds", conceptId: "turbine" },
];

export function chapterConcepts(chapter: Chapter) {
  return chapter.conceptIds
    .map((id) => conceptById(id))
    .filter(Boolean)
    .map((concept) => {
      const c = concept!;
      return { concept: c, meta: metaFor(c.title) };
    });
}

export function chapterForConceptId(conceptId: string): Chapter | undefined {
  return chapters.find((chapter) => chapter.conceptIds.includes(conceptId));
}
