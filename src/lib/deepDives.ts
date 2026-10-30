import { parse as parseYaml } from "yaml";
import type { ConceptLink } from "./concepts";

export interface DeepDiveSection {
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
}

export interface DeepDive {
  title: string;
  conceptId: string;
  thesis: string;
  stages: string[];
  sourceNotes: string[];
  sections: DeepDiveSection[];
  links: ConceptLink[];
  reviewStatus: "pending-expert-review" | "expert-reviewed";
  lastReviewed: string | null;
  expertReviewer: string | null;
  temporalStatus: "unclassified" | "current" | "historical" | "proposed" | "mixed";
  aiAssisted: "unknown" | "yes" | "no";
  provenance: string;
  license: "GPL-3.0-only";
}

const deepDiveFiles = import.meta.glob<string>("../../content/deep-dives/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

function parseSections(markdown: string): DeepDiveSection[] {
  const headings = [...markdown.matchAll(/^## ([^\r\n]+)\r?\n/gm)];
  return headings.map((heading, index) => {
    const start = heading.index! + heading[0].length;
    const end = headings[index + 1]?.index ?? markdown.length;
    const sectionBody = markdown.slice(start, end).trim();
    const titleMatch = sectionBody.match(/^### ([^\r\n]+)\r?\n/);
    const pointsMatch = sectionBody.match(/\n#### Key points\s*\n([\s\S]*)$/);
    const prose = sectionBody.slice(titleMatch?.[0].length ?? 0).replace(/\n#### Key points\s*\n[\s\S]*$/, "").trim();
    return {
      eyebrow: heading[1].trim(),
      title: titleMatch?.[1].trim() ?? heading[1].trim(),
      body: prose,
      bullets: (pointsMatch?.[1] ?? "").split(/\r?\n/).filter((line) => line.startsWith("- ")).map((line) => line.slice(2).trim()),
    };
  });
}

function deepDiveFromMarkdown(markdown: string, filename: string): DeepDive {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`Missing YAML frontmatter in ${filename}`);
  const metadata = parseYaml(match[1]) as Omit<DeepDive, "sections">;
  const dive: DeepDive = { ...metadata, sections: parseSections(match[2]) };
  if (!dive.conceptId || !dive.thesis || !dive.sections.length) {
    throw new Error(`Incomplete deep dive in ${filename}`);
  }
  return dive;
}

export const deepDives: Record<string, DeepDive> = Object.fromEntries(
  Object.entries(deepDiveFiles).map(([filename, markdown]) => {
    const dive = deepDiveFromMarkdown(markdown, filename);
    return [dive.conceptId, dive];
  }),
);

export function deepDiveFor(conceptId: string): DeepDive | undefined {
  return deepDives[conceptId];
}
