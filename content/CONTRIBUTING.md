# Contributing reference content

SolRef's grant scope is reference content. Contributions should improve the
accuracy, clarity, source trail, or maintainability of those references.

## Authoring format

Each concept page, learning track, and deep dive under `content/` is a standalone
Markdown document with YAML frontmatter. The site renders these same files;
there is no second copy of that prose in the React application. The format is
intentionally plain Markdown so a reviewed page can be adapted for the Solana
documentation repo.

For concept pages, keep the sections in this order:

1. Overview
2. Key facts
3. Why it matters
4. Common mistakes
5. Example
6. References

Use direct links beside the claims they support when a claim is specific,
versioned, time-sensitive, or likely to be disputed. Prefer official Solana and
Anza specifications, documentation, source code, and proposals. Use community
articles for explanation or operational context, and label them as such.

## Review and provenance

New or materially changed technical content must stay marked
`pending-expert-review` until a qualified human reviewer has checked the facts,
sources, temporal status, and code. Never mark AI-generated or AI-assisted
content as reviewed by the AI author. Record `aiAssisted: yes` when AI helped
produce or materially edit the content; an expert reviewer must still approve
it before `reviewStatus` can become `expert-reviewed`.

For an expert-reviewed page, fill in all of the following:

- `reviewStatus: expert-reviewed`
- `lastReviewed: YYYY-MM-DD`
- `expertReviewer: Name (relevant expertise)`
- `temporalStatus: current`, `historical`, `proposed`, or `mixed`
- `exampleStatus: verified` only after the example has been reproduced in the
  stated environment
- A `sourceKind` for each reference: `primary`, `implementation`, or `secondary`

The content checker rejects an expert-reviewed page that is missing any of the
required review fields. Code snippets that rely on an RPC provider, SDK version,
validator release, or network should name those requirements in the page.

## License and upstreaming

Content in this directory is GPL-3.0-only, matching the license of the current
Solana documentation repository. Keep the attribution and license metadata with
content when preparing an upstream contribution. Linked third-party material
remains under its original license; do not copy it into SolRef without checking
the terms.

Before upstreaming, adapt frontmatter to the destination schema, preserve
source links and reviewer attribution, and follow the Solana documentation
repository's current contribution process.
