// Shared search over reference pages, learning tracks, architecture notes,
// and interactive guides. Concept retrieval also grounds the site assistant.
import { concepts, metaFor } from "./concepts";
import { deepDiveFor } from "./deepDives";
import { chapters } from "./chapters";
import { innovations, lifecycle } from "./innovations";

// User language and common shorthand that may not appear in the page title.
export const ALIASES: Record<string, string> = {
  transactions: "tx txs signature blockhash nonce expiry atomic 1232 bytes fee payer serialize sign send durable nonce",
  "blocks-slots": "slot block time 200ms 5 slots per second skipped leader schedule block height native clock alpenglow finality",
  "proof-of-history": "poh clock vdf verifiable delay function sha256 hash chain timestamp ordering",
  "tx-lifecycle": "lifecycle confirm confirmation finality processed confirmed finalized commitment retry dropped",
  "gulf-stream": "mempool no mempool pending pool forward upcoming leaders frontrun prevention",
  turbine: "shred shreds block propagation erasure coding reed solomon fec fanout tree bandwidth neighborhood",
  "tower-bft": "consensus vote voting lockout fork choice finality pbft rooted bft validator votes",
  mev: "mev frontrun frontrunning backrun sandwich maximal extractable value ordering searcher arbitrage",
  "priority-fees": "priority fee gas compute unit price microlamports congestion bid inclusion landing",
  "epochs-validators": "epoch leader schedule stake activation 432000 slots rewards delegation",
  "accounts-model": "account wallet keypair address owner lamports data executable program account sysvar ata",
  "instructions-cpis": "instruction ix cpi cross program invocation invoke invoke_signed compose composability depth",
  sealevel: "parallel execution runtime multithread multicore account locks conflict race condition scheduler simd",
  "rpc-infra": "rpc node endpoint getaccountinfo getprogramaccounts json rpc sendtransaction helius quicknode provider",
  pda: "program derived address seeds bump off curve ed25519 sign invoke_signed deterministic",
  "versioned-tx": "versioned v0 transaction legacy address lookup table account limit maxsupportedtransactionversion",
  "fee-economics": "fee burn burned validator base fee deflation deflationary tokenomics half",
  clusters: "cluster mainnet beta devnet testnet localnet network airdrop endpoints",
  sandwich: "sandwich attack slippage frontrun backrun protection mev bundle private flow",
  "validator-economics": "validator economics inflation rewards apy staking commission vote cost yield delegators stakers",
  alpenglow: "alpenglow live mainnet epoch 1064 slot 459653000 tower retired votor bls certificate off-chain direct validator votes rotor later unscheduled turbine finality 150ms confirmed finalized same PoH no longer paces blocks clock timestamp Agave 4.3 VAT",
  firedancer: "firedancer frankendancer agave validator client jump c rust client diversity sig syndica",
  doublezero: "doublezero fiber network internet layer multicast latency 2z dedicated bandwidth",
  "async-execution": "async execution ape block limit compute unit simd 0256 0286 60m 100m throughput tps scaling million",
  "quic-swqos": "quic swqos stake weighted qos quality of service udp ingest connection landing staked sender 0-rtt",
  "gossip-repair": "gossip repair crds peer discovery shred metadata cluster nodes push pull",
  "compute-units": "compute unit cu budget setcomputeunitlimit setcomputeunitprice metering gas 1.4m 200k simulate",
  rent: "rent rent exempt exemption storage deposit minimum balance refundable close reclaim getminimumbalance",
  "svm-bytecode": "svm sbf bpf ebpf rbpf bytecode vm virtual machine register sandbox loader pinocchio isa",
  "token-extensions": "token 2022 token-2022 extensions transfer fee confidential transfer hook soulbound non-transferable interest mint spl royalty",
  "state-compression": "compression compressed nft cnft merkle tree concurrent zk compression das digital asset light protocol airdrop",
  "lookup-tables": "lookup table alt address lookup table 256 accounts 1-byte index versioned warm",
  geyser: "geyser stream streaming yellowstone grpc webhook indexer plugin real time data kafka firehose",
  accountsdb: "accountsdb accounts db cloudbreak snapshot ledger blockstore appendvec state storage memory mapped index history archival",
  "banking-stage": "banking stage scheduler tpu worker priograph greedy bank open frozen rooted execute commit hot path",
  jito: "jito bundle block engine tip auction mev searcher jitosol relay",
  "local-fee-markets": "local fee market hot account per account contention congestion pricing isolated",
  "memory-allocator": "memory allocator bump allocator heap 32kb 256kb requestheapframe stack frame 4kb access violation out of memory alloc free drop dealloc zero copy pinocchio rust no_std",
  signatures: "signature signatures ed25519 secp256k1 secp256r1 p-256 passkey webauthn precompile ed25519program secp256k1program is_signer sign verify multisig ethereum signature scheme curve25519 instructions sysvar introspection",
};

const STOP = new Set([
  "how", "do", "does", "did", "what", "whats", "which", "is", "the", "a", "an", "of", "to", "in", "on", "for", "and", "or",
  "work", "works", "working", "why", "when", "are", "my", "i", "can", "with", "vs", "explain", "about", "tell", "me", "between",
  "difference", "mean", "means", "should", "use", "solana",
]);

export type SearchEntry = {
  c: (typeof concepts)[number];
  id: string;
  hay: string;
  titleTokens: string[];
  keywordTokens: string[];
  bodyTokens: string[];
};

export type SiteSearchResult = {
  id: string;
  title: string;
  category: string;
  description: string;
  route: string;
  icon: string;
  level?: string;
  score?: number;
  titleTokens: string[];
  keywordTokens: string[];
  bodyTokens: string[];
};

function normalize(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokens(value: string): string[] {
  return normalize(value).split(/\s+/).filter((word) => word.length >= 2);
}

function editDistanceWithin(a: string, b: string, max: number): boolean {
  if (Math.abs(a.length - b.length) > max) return false;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost);
      rowMin = Math.min(rowMin, current[j]);
    }
    if (rowMin > max) return false;
    previous = current;
  }
  return previous[b.length] <= max;
}

function wordQuality(queryWord: string, fieldTokens: string[]): number {
  let best = 0;
  for (const candidate of fieldTokens) {
    if (candidate === queryWord) return 1;
    if (queryWord.length >= 3 && candidate.startsWith(queryWord)) best = Math.max(best, 0.76);
    if (queryWord.length >= 4 && candidate.startsWith(queryWord.slice(0, -1)) && queryWord.length <= candidate.length + 1) {
      best = Math.max(best, 0.58);
    }
    const maxDistance = queryWord.length >= 8 ? 2 : 1;
    if (queryWord.length >= 4 && editDistanceWithin(queryWord, candidate, maxDistance)) best = Math.max(best, 0.52);
  }
  return best;
}

function scoreQuery(query: string, entry: Pick<SiteSearchResult, "title" | "titleTokens" | "keywordTokens" | "bodyTokens">): number {
  const normalizedQuery = normalize(query);
  const queryTokens = tokens(query).filter((word) => !STOP.has(word));
  if (!queryTokens.length) return 0;

  let score = 0;
  let matched = 0;
  for (const queryWord of queryTokens) {
    const title = wordQuality(queryWord, entry.titleTokens) * 10;
    const keyword = wordQuality(queryWord, entry.keywordTokens) * 5;
    const body = wordQuality(queryWord, entry.bodyTokens) * 3;
    const best = Math.max(title, keyword, body);
    if (best > 0) {
      score += best;
      matched += 1;
    }
  }

  if (!matched) return 0;
  const normalizedTitle = normalize(entry.title);
  if (normalizedQuery.length >= 3 && normalizedTitle.includes(normalizedQuery)) score += 8;
  return score + (matched / queryTokens.length) * 4;
}

const innovationByConcept = new Map(
  innovations.filter((item) => item.conceptId).map((item) => [item.conceptId!, item]),
);

export const INDEX: SearchEntry[] = concepts.map((c) => {
  const id = metaFor(c.title).id;
  const dd = deepDiveFor(id);
  const innovation = innovationByConcept.get(id);
  const deepDiveText = dd
    ? `${dd.thesis} ${(dd.stages ?? []).join(" ")} ${dd.sections.map((s) => `${s.title} ${s.body} ${s.bullets.join(" ")}`).join(" ")}`
    : "";
  const aliasText = `${ALIASES[id] ?? ""} ${innovation ? `${innovation.name} ${innovation.mechanism} ${innovation.impact} ${innovation.summary}` : ""}`;
  const bodyText = [c.desc, c.details.join(" "), c.whyItMatters, c.commonMistakes.join(" "), c.code,
    c.links.map((link) => link.label).join(" "), deepDiveText].join(" ");
  const hay = `${c.title} ${c.tag} ${aliasText} ${bodyText}`.toLowerCase();
  return {
    c,
    id,
    hay,
    titleTokens: tokens(c.title),
    keywordTokens: tokens(`${c.tag} ${aliasText}`),
    bodyTokens: tokens(bodyText),
  };
});

const conceptResults: SiteSearchResult[] = INDEX.map((entry) => ({
  id: entry.id,
  title: entry.c.title,
  category: entry.c.tag,
  description: entry.c.desc,
  route: `/docs/${entry.id}`,
  icon: entry.c.icon,
  level: entry.c.level,
  titleTokens: entry.titleTokens,
  keywordTokens: entry.keywordTokens,
  bodyTokens: entry.bodyTokens,
}));

const trackResults: SiteSearchResult[] = chapters.map((chapter) => {
  const referenceTitles = chapter.conceptIds.map((id) => concepts.find((concept) => concept.id === id)?.title ?? id).join(" ");
  const body = `${chapter.domain} ${chapter.summary} ${chapter.outcome} ${chapter.checkpoints.join(" ")} ${referenceTitles}`;
  return {
    id: `track-${chapter.id}`,
    title: chapter.title,
    category: `Track ${String(chapter.sequence).padStart(2, "0")}`,
    description: chapter.summary,
    route: `/deep-dives/${chapter.id}`,
    icon: "BookOpen",
    titleTokens: tokens(chapter.title),
    keywordTokens: tokens(`${chapter.domain} learning path curriculum stage ${chapter.phase}`),
    bodyTokens: tokens(body),
  };
});

const standaloneInnovationResults: SiteSearchResult[] = innovations
  .filter((item) => !item.conceptId)
  .map((item) => {
    const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const body = `${item.mechanism} ${item.impact} ${item.summary} ${item.legacy ? "historical legacy" : ""}`;
    return {
      id: `innovation-${slug}`,
      title: item.name,
      category: "Architecture",
      description: `${item.mechanism} · ${item.impact}`,
      route: `/innovations#innovation-${slug}`,
      icon: item.icon,
      titleTokens: tokens(item.name),
      keywordTokens: tokens(`${item.mechanism} ${item.impact} architecture innovation`),
      bodyTokens: tokens(body),
    };
  });

const labDocs = [
  { id: "lab-poh", title: "Proof of History lab", route: "/labs#poh", icon: "Clock", body: "Play the SHA-256 chain forward and see how PoH supplied Solana's clock under Tower BFT. Alpenglow changed block pacing and timestamp semantics." },
  { id: "lab-sealevel", title: "Sealevel scheduler lab", route: "/labs#sealevel", icon: "Cpu", body: "Change which account each transaction writes and watch what runs in parallel versus what serializes." },
  { id: "lab-fees", title: "Fee and compute estimator", route: "/labs#fees", icon: "Activity", body: "Slide the compute-unit limit and price; watch the base and priority fee update live." },
  { id: "lab-tower", title: "Tower lockouts lab", route: "/labs#tower", icon: "Shield", body: "Replay the lockout mechanism Tower BFT used before Votor replaced it on mainnet." },
];

const lifecycleBody = lifecycle.map((step) => `${step.title} ${step.trigger} ${step.detail}`).join(" ");
const otherResults: SiteSearchResult[] = [
  ...standaloneInnovationResults,
  ...labDocs.map((item) => ({
    ...item,
    category: "Interactive lab",
    description: item.body,
    titleTokens: tokens(item.title),
    keywordTokens: tokens("lab interactive simulator hands-on"),
    bodyTokens: tokens(item.body),
  })),
  {
    id: "transaction-lifecycle",
    title: "Transaction lifecycle",
    category: "Interactive guide",
    description: "Follow a transaction from signing through validator execution, propagation, consensus, and finalization.",
    route: "/lifecycle",
    icon: "Activity",
    titleTokens: tokens("Transaction lifecycle"),
    keywordTokens: tokens("signature send confirmation finality transaction"),
    bodyTokens: tokens(lifecycleBody),
  },
  {
    id: "sandwich-simulator",
    title: "Sandwich simulator",
    category: "Interactive lab",
    description: "Explore slippage, transaction ordering, and sandwich attacks.",
    route: "/sandwich",
    icon: "Activity",
    titleTokens: tokens("Sandwich simulator"),
    keywordTokens: tokens("mev frontrun backrun slippage attack bundle protection"),
    bodyTokens: tokens("Set slippage and attacker size; see the extracted value and how protection changes it."),
  },
  {
    id: "learning-curriculum",
    title: "SolRef learning route",
    category: "Learning guide",
    description: "Follow eight ordered tracks from core foundations to the protocol frontier.",
    route: "/learn",
    icon: "BookOpen",
    titleTokens: tokens("SolRef learning route"),
    keywordTokens: tokens("curriculum learning path beginner start finish stages tracks guide"),
    bodyTokens: tokens(chapters.map((chapter) => `${chapter.title} ${chapter.summary}`).join(" ")),
  },
  {
    id: "reference-library",
    title: "Reference library",
    category: "Browse all references",
    description: "Browse all SolRef concept pages by topic and experience level.",
    route: "/docs",
    icon: "BookOpen",
    titleTokens: tokens("Reference library"),
    keywordTokens: tokens("docs concepts pages browse reference"),
    bodyTokens: tokens(concepts.map((concept) => `${concept.title} ${concept.tag}`).join(" ")),
  },
  {
    id: "ecosystem-resources",
    title: "Solana ecosystem resources",
    category: "External resources",
    description: "Official docs, frameworks, RPC providers, explorers, and technical reading.",
    route: "/resources",
    icon: "Globe",
    titleTokens: tokens("Solana ecosystem resources"),
    keywordTokens: tokens("official docs cookbook anchor web3.js kit helius quicknode triton jito solscan explorer anza blog stackexchange"),
    bodyTokens: tokens("documentation tooling developer guides rpc endpoint indexer explorer program framework"),
  },
];

const SITE_INDEX: SiteSearchResult[] = [...conceptResults, ...trackResults, ...otherResults];

export function searchConcepts(query: string, limit = 8): SearchEntry[] {
  const queryTokens = tokens(query).filter((word) => !STOP.has(word));
  if (!queryTokens.length) return INDEX.slice(0, limit);
  return INDEX
    .map((entry) => ({ entry, score: scoreQuery(query, { title: entry.c.title, ...entry }) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.entry.c.title.localeCompare(b.entry.c.title))
    .slice(0, limit)
    .map(({ entry }) => entry);
}

export function searchSite(query: string, limit = 8): SiteSearchResult[] {
  const queryTokens = tokens(query).filter((word) => !STOP.has(word));
  if (!queryTokens.length) return SITE_INDEX.slice(0, limit);
  return SITE_INDEX
    .map((entry) => ({ entry, score: scoreQuery(query, entry) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
    .slice(0, limit)
    .map(({ entry, score }) => ({ ...entry, score }));
}

export interface RelatedPage { id: string; title: string; tag: string; icon: string }
export function relatedConcepts(query: string, k = 4): RelatedPage[] {
  return searchConcepts(query, k).map((entry) => ({ id: entry.id, title: entry.c.title, tag: entry.c.tag, icon: entry.c.icon }));
}

// A compact, grounded context block for the chat assistant: top matching pages
// with their facts, so answers can link to exact SolRef reference pages.
export function retrieveContext(query: string, k = 5): string {
  const hits = searchConcepts(query, k);
  if (!hits.length) return "";
  return hits
    .map(({ c, id }) => {
      const dd = deepDiveFor(id);
      const facts = c.details.slice(0, 6).map((detail) => `  - ${detail}`).join("\n");
      return [
        `### ${c.title}  (link: /docs/${id})  [${c.tag}]`,
        `${c.desc}`,
        facts,
        c.whyItMatters ? `Why it matters: ${c.whyItMatters}` : "",
        dd ? `Deep dive: ${dd.thesis}` : "",
      ].filter(Boolean).join("\n");
    })
    .join("\n\n");
}
