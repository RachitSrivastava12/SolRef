# Reference maintenance

## Quarterly review cycle

Review every concept at least once each quarter, with earlier reviews for pages
affected by protocol activations, SDK releases, validator changes, or changed
RPC behavior. The scheduled workflow checks page metadata and reference links;
it does not replace expert review of technical claims.

For each page:

- Open every linked reference and replace redirects, dead links, or obsolete
  versions.
- Recheck time-sensitive statements against primary sources and classify the
  page as current, historical, proposed, or mixed.
- Confirm the example's dependencies, network, and assumptions; reproduce it
  before setting `exampleStatus: verified`.
- Record the human expert reviewer and review date in frontmatter.
- Mark AI-assisted changes with `aiAssisted: yes` and keep them pending until
  the expert reviewer has reviewed the final text.
- Update the affected learning track's order, outcome, or checkpoint if the
  change alters what a learner needs to understand.

## Current audit queue

All migrated concept pages, learning tracks, and deep dives begin with
`pending-expert-review`, no review date, and unclassified temporal status.
Concept examples are also unverified. This is deliberate: the migration
preserves existing material but does not claim that a human expert has checked
it. Reviewers should work through the two initial tracks first:

1. Execution Hot Path
2. Consensus & Finality

After those pilots establish the review standard, continue through the
remaining concept pages and learning tracks. Keep the queue visible until each
page has a named reviewer and evidence for its examples.
