import {
  ArrowRight, Zap, Box, Layers, GitBranch, Shield, Activity, Clock,
  Database, Network, Cpu, Globe, Lock, Server, Code2, Flame, BarChart3,
  HardDrive, RefreshCw, Wifi, Eye, BookOpen, Terminal, Hash,
} from "lucide-react";
import type { ReactNode } from "react";
import { parse as parseYaml } from "yaml";

const ICONS: Record<string, ReactNode> = {
  ArrowRight: <ArrowRight className="w-5 h-5" />, Zap: <Zap className="w-5 h-5" />,
  Box: <Box className="w-5 h-5" />, Layers: <Layers className="w-5 h-5" />,
  GitBranch: <GitBranch className="w-5 h-5" />, Shield: <Shield className="w-5 h-5" />,
  Activity: <Activity className="w-5 h-5" />, Clock: <Clock className="w-5 h-5" />,
  Database: <Database className="w-5 h-5" />, Network: <Network className="w-5 h-5" />,
  Cpu: <Cpu className="w-5 h-5" />, Globe: <Globe className="w-5 h-5" />,
  Lock: <Lock className="w-5 h-5" />, Server: <Server className="w-5 h-5" />,
  Code2: <Code2 className="w-5 h-5" />, Flame: <Flame className="w-5 h-5" />,
  BarChart3: <BarChart3 className="w-5 h-5" />, HardDrive: <HardDrive className="w-5 h-5" />,
  RefreshCw: <RefreshCw className="w-5 h-5" />, Wifi: <Wifi className="w-5 h-5" />,
  Eye: <Eye className="w-5 h-5" />, BookOpen: <BookOpen className="w-5 h-5" />,
  Terminal: <Terminal className="w-5 h-5" />, Hash: <Hash className="w-5 h-5" />,
};

export function iconFor(name: string): ReactNode {
  return ICONS[name] ?? <Box className="w-5 h-5" />;
}

export type Level = "beginner" | "intermediate" | "advanced";
export type ReviewStatus = "pending-expert-review" | "expert-reviewed";
export type TemporalStatus = "unclassified" | "current" | "historical" | "proposed" | "mixed";
export type ExampleStatus = "needs-expert-verification" | "verified";
export type CodeLanguage = "typescript" | "rust";

export interface ConceptLink {
  label: string;
  url: string;
  sourceKind: "unclassified" | "primary" | "implementation" | "secondary";
}

export interface Concept {
  id: string;
  order: number;
  icon: string;
  tag: string;
  level: Level;
  title: string;
  desc: string;
  details: string[];
  whyItMatters: string;
  commonMistakes: string[];
  code: string;
  codeLanguage: CodeLanguage;
  links: ConceptLink[];
  diagramKey?: string;
  reviewStatus: ReviewStatus;
  lastReviewed: string | null;
  expertReviewer: string | null;
  temporalStatus: TemporalStatus;
  exampleStatus: ExampleStatus;
  provenance: string;
  aiAssisted: "unknown" | "yes" | "no";
  license: "GPL-3.0-only";
}

export const categories = ["All", "Frontier", "Core Infra", "Consensus", "Networking", "Data Flow", "Programs", "System Design", "MEV", "Economics"];

const contentFiles = import.meta.glob<string>("../../content/concepts/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

function sectionsFrom(markdown: string): Map<string, string> {
  const headings = [...markdown.matchAll(/^## ([^\r\n]+)\r?\n/gm)];
  const sections = new Map<string, string>();
  headings.forEach((heading, index) => {
    const start = heading.index! + heading[0].length;
    const end = headings[index + 1]?.index ?? markdown.length;
    sections.set(heading[1].trim().toLowerCase(), markdown.slice(start, end).trim());
  });
  return sections;
}

function listFrom(section: string | undefined): string[] {
  return (section ?? "").split(/\r?\n/)
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).trim());
}

function conceptFromMarkdown(markdown: string, filename: string): Concept {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`Missing YAML frontmatter in ${filename}`);
  const metadata = parseYaml(match[1]) as Omit<Concept, "desc" | "details" | "whyItMatters" | "commonMistakes" | "code">;
  const sections = sectionsFrom(match[2]);
  const example = sections.get("example") ?? "";
  const codeMatch = example.match(/```[^\r\n]*\r?\n([\s\S]*?)\r?\n```/);
  const links = Array.isArray(metadata.links) ? metadata.links : [];
  const concept: Concept = {
    ...metadata,
    desc: sections.get("overview") ?? "",
    details: listFrom(sections.get("key facts")),
    whyItMatters: sections.get("why it matters") ?? "",
    commonMistakes: listFrom(sections.get("common mistakes")),
    code: codeMatch?.[1] ?? "",
    codeLanguage: metadata.codeLanguage,
    links,
  };
  if (!concept.id || !concept.title || !concept.desc || !concept.code) {
    throw new Error(`Incomplete concept content in ${filename}`);
  }
  return concept;
}

export const concepts: Concept[] = Object.entries(contentFiles)
  .map(([filename, content]) => conceptFromMarkdown(content, filename))
  .sort((a, b) => a.order - b.order);

export interface Meta { id: string; level: Level; diagramKey?: string; }

export const META: Record<string, Meta> = Object.fromEntries(concepts.map((concept) => [
  concept.title,
  { id: concept.id, level: concept.level, ...(concept.diagramKey ? { diagramKey: concept.diagramKey } : {}) },
]));

export const levelMeta: Record<Level, { label: string; color: string }> = {
  beginner: { label: "Beginner", color: "var(--sol-green)" },
  intermediate: { label: "Intermediate", color: "var(--text-mid)" },
  advanced: { label: "Advanced", color: "var(--text)" },
};
export const levelOrder: Level[] = ["beginner", "intermediate", "advanced"];

export function metaFor(title: string): Meta {
  return META[title] ?? { id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"), level: "intermediate" };
}

export function conceptById(id: string): Concept | undefined {
  return concepts.find((concept) => concept.id === id);
}

export function conceptsByLevel(level: Level): Concept[] {
  return concepts.filter((concept) => concept.level === level);
}
