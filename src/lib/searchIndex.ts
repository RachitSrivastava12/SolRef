// Shared search + retrieval index over all concept pages.
// Used by the ⌘K command palette AND the chat assistant (for grounding/links).
import { concepts, metaFor } from "./concepts";
import { deepDiveFor } from "./deepDives";

// Extra search keywords so "confused-user" language finds the right page even
// when the concept page never uses those exact words (gas → priority fees,
// frontrunning → MEV, soulbound → token extensions, etc.). Keyed by concept id.
export const ALIASES: Record<string, string> = {
  transactions: "tx signature blockhash nonce expiry atomic 1232 bytes fee payer serialize sign send durable nonce",
  "blocks-slots": "slot block time 400ms skipped leader schedule block height native clock",
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
  pda: "pda program derived address seeds bump off curve ed25519 sign invoke_signed deterministic",
  "versioned-tx": "versioned v0 transaction legacy address lookup table account limit maxsupportedtransactionversion",
  "fee-economics": "fee burn burned validator base fee deflation deflationary tokenomics half",
  clusters: "cluster mainnet beta devnet testnet localnet network airdrop endpoints",
  sandwich: "sandwich attack slippage frontrun backrun protection mev bundle private flow",
  "validator-economics": "validator economics inflation rewards apy staking commission vote cost yield delegators stakers",
  alpenglow: "alpenglow votor rotor bls certificate finality 150ms new consensus 2025 upgrade fast finality",
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
  accountsdb: "accountsdb accounts db snapshot ledger blockstore appendvec state storage memory mapped index history archival",
  "banking-stage": "banking stage scheduler tpu worker priograph greedy bank open frozen rooted execute commit hot path",
  jito: "jito bundle block engine tip auction mev searcher jitosol relay",
  "local-fee-markets": "local fee market hot account per account contention congestion pricing isolated",
  "memory-allocator": "memory allocator bump allocator heap 32kb 256kb requestheapframe stack frame 4kb access violation out of memory alloc free drop dealloc zero copy pinocchio rust no_std",
  signatures: "signature signatures ed25519 secp256k1 secp256r1 p-256 passkey webauthn precompile ed25519program secp256k1program is_signer sign verify multisig ethereum signature scheme curve25519 instructions sysvar introspection",
};

const STOP = new Set(["how", "do", "does", "did", "what", "whats", "which", "is", "is", "the", "a", "an", "of", "to", "in", "on", "for", "and", "or", "work", "works", "working", "why", "when", "are", "my", "i", "can", "with", "vs", "explain", "about", "tell", "me", "between", "difference", "mean", "means", "should", "use"]);

export type SearchEntry = { c: (typeof concepts)[number]; id: string; hay: string };

export const INDEX: SearchEntry[] = concepts.map((c) => {
  const id = metaFor(c.title).id;
  const dd = deepDiveFor(id);
  const ddText = dd ? `${dd.thesis} ${(dd.stages ?? []).join(" ")} ${dd.sections.map((s) => `${s.title} ${s.body}`).join(" ")}` : "";
  const hay = [c.title, c.desc, c.tag, c.details.join(" "), ALIASES[id] ?? "", ddText].join(" ").toLowerCase();
  return { c, id, hay };
});

export function searchConcepts(query: string, limit = 8): SearchEntry[] {
  const t = query.trim().toLowerCase();
  const tokens = t.split(/\s+/).filter((w) => w.length >= 2 && !STOP.has(w));
  if (!t || tokens.length === 0) return INDEX.slice(0, limit);
  return INDEX
    .map((e) => ({ e, score: tokens.reduce((n, tok) => n + (e.hay.includes(tok) ? 1 : 0), 0) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.e.c.title.localeCompare(b.e.c.title))
    .slice(0, limit)
    .map((x) => x.e);
}

export interface RelatedPage { id: string; title: string; tag: string; icon: string }
export function relatedConcepts(query: string, k = 4): RelatedPage[] {
  return searchConcepts(query, k).map((e) => ({ id: e.id, title: e.c.title, tag: e.c.tag, icon: e.c.icon }));
}

// A compact, grounded context block for the chat assistant: the top matching
// pages with their facts, so the model answers from THIS site and links exact ids.
export function retrieveContext(query: string, k = 5): string {
  const hits = searchConcepts(query, k);
  if (!hits.length) return "";
  return hits
    .map(({ c, id }) => {
      const dd = deepDiveFor(id);
      const facts = c.details.slice(0, 6).map((d) => `  - ${d}`).join("\n");
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
