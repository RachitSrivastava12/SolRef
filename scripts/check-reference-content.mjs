import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { parse as parseYaml } from "yaml";
import ts from "typescript";

const root = process.cwd();
const checkLinks = process.argv.includes("--links");
const checkExamples = process.argv.includes("--examples");
const contentDirs = ["concepts", "tracks", "deep-dives"];
const files = contentDirs.flatMap((dir) => fs.readdirSync(path.join(root, "content", dir))
  .filter((name) => name.endsWith(".md"))
  .map((name) => ({ dir, name, file: path.join(root, "content", dir, name) })))
  .sort((a, b) => a.file.localeCompare(b.file));
const errors = [];
const links = [];
const records = [];

function fail(file, message) {
  errors.push(`${path.relative(root, file)}: ${message}`);
}

function parseFile(file, kind) {
  const text = fs.readFileSync(file, "utf8");
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    fail(file, "missing YAML frontmatter");
    return;
  }

  let metadata;
  try {
    metadata = parseYaml(match[1]);
  } catch (error) {
    fail(file, `invalid YAML frontmatter (${error.message})`);
    return;
  }

  const expectedId = path.basename(file, ".md");
  const commonFields = ["id", "title", "reviewStatus", "lastReviewed", "expertReviewer", "temporalStatus", "aiAssisted", "license"];
  const kindFields = kind === "concepts"
    ? ["tag", "level", "codeLanguage", "exampleStatus", "links"]
    : kind === "tracks"
      ? ["sequence", "phase", "prerequisites", "conceptIds", "checkpoints", "outcome"]
      : ["conceptId", "thesis", "stages", "sourceNotes", "links"];
  for (const field of [...commonFields, ...kindFields]) {
    if (!(field in metadata)) fail(file, `missing frontmatter field: ${field}`);
  }
  if (metadata.id !== expectedId) fail(file, `filename must match id ${metadata.id}`);
  if (!["pending-expert-review", "expert-reviewed"].includes(metadata.reviewStatus)) fail(file, `invalid reviewStatus: ${metadata.reviewStatus}`);
  if (!["unknown", "yes", "no"].includes(metadata.aiAssisted)) fail(file, `invalid aiAssisted: ${metadata.aiAssisted}`);
  if (!["unclassified", "current", "historical", "proposed", "mixed"].includes(metadata.temporalStatus)) fail(file, `invalid temporalStatus: ${metadata.temporalStatus}`);
  if (kind === "concepts") {
    if (!["beginner", "intermediate", "advanced"].includes(metadata.level)) fail(file, `invalid level: ${metadata.level}`);
    if (!["typescript", "rust"].includes(metadata.codeLanguage)) fail(file, `invalid codeLanguage: ${metadata.codeLanguage}`);
    if (!["needs-expert-verification", "verified"].includes(metadata.exampleStatus)) fail(file, `invalid exampleStatus: ${metadata.exampleStatus}`);
  } else if (kind === "tracks") {
    if (!Number.isInteger(metadata.sequence) || !Number.isInteger(metadata.phase) || !Array.isArray(metadata.prerequisites) || !Array.isArray(metadata.conceptIds)) {
      fail(file, "track needs integer sequence/phase values and prerequisite/concept id lists");
    }
  } else if (kind === "deep-dives" && (metadata.conceptId !== metadata.id || !Array.isArray(metadata.stages) || !Array.isArray(metadata.sourceNotes))) {
    fail(file, "deep dive needs a matching conceptId and stage/source-note lists");
  }

  if (metadata.reviewStatus === "expert-reviewed") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(metadata.lastReviewed ?? "")) fail(file, "expert-reviewed pages need lastReviewed in YYYY-MM-DD format");
    if (!metadata.expertReviewer) fail(file, "expert-reviewed pages need a named expertReviewer");
    if (metadata.temporalStatus === "unclassified") fail(file, "expert-reviewed pages need a temporalStatus classification");
    if (kind === "concepts" && metadata.exampleStatus !== "verified") fail(file, "expert-reviewed pages need an independently verified example");
  }

  if (kind === "concepts" || kind === "deep-dives") {
    if (!Array.isArray(metadata.links) || metadata.links.length === 0) fail(file, "add at least one source reference");
    for (const reference of metadata.links ?? []) {
      if (!reference.label || !/^https:\/\//.test(reference.url ?? "")) fail(file, "each source needs a label and HTTPS URL");
      if (!["unclassified", "primary", "implementation", "secondary"].includes(reference.sourceKind)) {
        fail(file, `invalid sourceKind for ${reference.label ?? "source"}`);
      }
      if (metadata.reviewStatus === "expert-reviewed" && reference.sourceKind === "unclassified") {
        fail(file, `expert-reviewed pages need a source classification for ${reference.label ?? "source"}`);
      }
      if (reference.url) links.push({ file, label: reference.label, url: reference.url });
    }
  }

  if (kind === "concepts") {
    const sections = new Set([...match[2].matchAll(/^## ([^\r\n]+)/gm)].map((heading) => heading[1].trim().toLowerCase()));
    for (const section of ["overview", "key facts", "why it matters", "common mistakes", "example", "references"]) {
      if (!sections.has(section)) fail(file, `missing section: ${section}`);
    }
    const code = match[2].match(/^## Example\s*\n+```([^\r\n]*)\r?\n([\s\S]*?)\r?\n```/m);
    if (!code?.[2]) fail(file, "example section needs a non-empty fenced code block");
    else if (checkExamples && metadata.codeLanguage === "typescript") {
      const parsed = ts.createSourceFile(file, code[2], ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
      for (const diagnostic of parsed.parseDiagnostics) {
        const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, " ");
        fail(file, `TypeScript example syntax: ${message}`);
      }
    }
  } else if (kind === "tracks") {
    if (!/^## Summary\s*\n/m.test(match[2])) fail(file, "track needs a Summary section");
  } else {
    if (!/^## [^\r\n]+\s*\n/m.test(match[2]) || !/^### [^\r\n]+\s*\n/m.test(match[2])) {
      fail(file, "deep dive needs section and section-title headings");
    }
  }
  records.push({ file, kind, metadata });
}

for (const entry of files) parseFile(entry.file, entry.dir);
const conceptIds = new Set(records.filter((record) => record.kind === "concepts").map((record) => record.metadata.id));
const routedConceptIds = new Set();
for (const record of records.filter((item) => item.kind === "tracks")) {
  for (const id of record.metadata.conceptIds ?? []) {
    if (!conceptIds.has(id)) fail(record.file, `unknown concept id: ${id}`);
    else routedConceptIds.add(id);
  }
}
for (const record of records.filter((item) => item.kind === "concepts")) {
  if (!routedConceptIds.has(record.metadata.id)) fail(record.file, "reference is not included in any learning track");
}
for (const record of records.filter((item) => item.kind === "deep-dives")) {
  if (!conceptIds.has(record.metadata.conceptId)) fail(record.file, `unknown concept id: ${record.metadata.conceptId}`);
}

if (checkLinks) {
  let cursor = 0;
  const workers = Array.from({ length: 8 }, async () => {
    while (cursor < links.length) {
      const reference = links[cursor++];
      try {
        let response = await fetch(reference.url, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(12000) });
        if ([403, 405, 501].includes(response.status)) {
          response = await fetch(reference.url, {
            method: "GET",
            headers: { Range: "bytes=0-0" },
            redirect: "follow",
            signal: AbortSignal.timeout(12000),
          });
        }
        if (!response.ok) fail(reference.file, `source returned HTTP ${response.status}: ${reference.url}`);
      } catch (error) {
        fail(reference.file, `source check failed for ${reference.url} (${error.message})`);
      }
    }
  });
  await Promise.all(workers);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  const mode = [checkLinks && "links", checkExamples && "example syntax"].filter(Boolean).join(" + ") || "metadata";
  console.log(`Checked ${files.length} content files (${links.length} source links): ${mode} OK.`);
}
