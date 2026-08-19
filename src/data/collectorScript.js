// Scripted self-healing timeline for the Collector Health panel.
// Phase 5 will replace this with real Scraper Studio repair events.

export const collectors = [
  { id: "sc", label: "sc_judgments", source: "Supreme Court of India" },
  { id: "delhi_hc", label: "delhi_hc_judgments", source: "Delhi High Court" },
  { id: "bombay_hc", label: "bombay_hc_judgments", source: "Bombay High Court" },
];

// Each step: which collector, field, and its lifecycle.
// status: "ok" | "broken" | "healing" | "recovered"
export const healScript = [
  {
    collector: "sc",
    field: "judgment_date",
    status: "ok",
    value: "2026-08-14",
  },
  {
    collector: "delhi_hc",
    field: "bench_names",
    status: "broken",
    detail: "empty — selector matched 0 nodes",
  },
  {
    collector: "delhi_hc",
    field: "bench_names",
    status: "healing",
    detail: "Scraper Studio re-parsing layout, trying fallback selector…",
  },
  {
    collector: "delhi_hc",
    field: "bench_names",
    status: "recovered",
    value: '"Manmohan, J. & Manmeet Pritam Singh Arora, J."',
    latencyMs: 312,
  },
  {
    collector: "bombay_hc",
    field: "case_citation",
    status: "broken",
    detail: "malformed — unexpected date format in citation string",
  },
  {
    collector: "bombay_hc",
    field: "case_citation",
    status: "healing",
    detail: "Scraper Studio normalizing date pattern…",
  },
  {
    collector: "bombay_hc",
    field: "case_citation",
    status: "recovered",
    value: "2026 BHC 981",
    latencyMs: 480,
  },
  {
    collector: "sc",
    field: "party_names",
    status: "ok",
    value: '"Ramesh Kumar v. Union of India"',
  },
];
