// Mock judgment dataset for Phase 1 (frontend prototype).
// Real data will come from Bright Data Scraper Studio collectors in Phase 2.

export const judgments = [
  {
    id: "sushila-aggarwal-2020",
    case: "Sushila Aggarwal v. State (NCT of Delhi)",
    citation: "2020 INSC 43",
    court: "Supreme Court of India",
    bench: "Arun Mishra, J. · Indira Banerjee, J. · Vineet Saran, J. · M.R. Shah, J. · S. Ravindra Bhat, J.",
    date: "2020-01-29",
    category: "Criminal Procedure — Bail",
    sourceUrl: "https://main.sci.gov.in/judgments",
  },
  {
    id: "gurbaksh-sibbia-1980",
    case: "Gurbaksh Singh Sibbia v. State of Punjab",
    citation: "1980 AIR 1632",
    court: "Supreme Court of India",
    bench: "Y.V. Chandrachud, C.J. · A.C. Gupta, J. · N.L. Untwalia, J. · P.S. Kailasam, J. · R.S. Pathak, J.",
    date: "1980-04-09",
    category: "Criminal Procedure — Bail",
    sourceUrl: "https://main.sci.gov.in/judgments",
  },
  {
    id: "puttaswamy-2017",
    case: "Justice K.S. Puttaswamy (Retd.) v. Union of India",
    citation: "2017 (10) SCC 1",
    court: "Supreme Court of India",
    bench: "J.S. Khehar, C.J. · J. Chelameswar, J. · S.A. Bobde, J. · R.K. Agrawal, J. · R.F. Nariman, J. · A.M. Sapre, J. · D.Y. Chandrachud, J. · S.K. Kaul, J. · S. Abdul Nazeer, J.",
    date: "2017-08-24",
    category: "Constitutional Law — Fundamental Rights",
    sourceUrl: "https://main.sci.gov.in/judgments",
  },
  {
    id: "adr-electoral-bonds-2024",
    case: "Association for Democratic Reforms v. Union of India",
    citation: "2024 INSC 113",
    court: "Supreme Court of India",
    bench: "D.Y. Chandrachud, C.J. · Sanjiv Khanna, J. · B.R. Gavai, J. · J.B. Pardiwala, J. · Manoj Misra, J.",
    date: "2024-02-15",
    category: "Constitutional Law — Electoral Reform",
    sourceUrl: "https://main.sci.gov.in/judgments",
  },
];

// Canned RAG-style answers keyed by topic, with inline citations mapped to
// exhibit letters. This simulates the retrieval + generation layer that
// Phase 4 will replace with real embeddings + LLM calls.
export const cannedAnswers = [
  {
    keywords: ["anticipatory bail", "bail", "arrest"],
    question: "what's the recent SC stance on anticipatory bail duration?",
    answer:
      "Courts have moved away from time-bound anticipatory bail. In [A] a five-judge bench held that protection under Section 438 need not be limited to a fixed period and can extend until the conclusion of trial, absent specific reasons to curtail it. This builds on [B], which first established that anticipatory bail isn't meant to be a short, interim shield but a genuine pre-arrest protection against harassment.",
    exhibits: ["sushila-aggarwal-2020", "gurbaksh-sibbia-1980"],
  },
  {
    keywords: ["privacy", "right to privacy", "puttaswamy", "aadhaar"],
    question: "is the right to privacy a fundamental right in india?",
    answer:
      "Yes. In [A], a nine-judge bench unanimously held that the right to privacy is a fundamental right protected under Article 21, overruling earlier decisions that had held otherwise. The judgment grounded privacy in dignity, autonomy, and liberty, and became the constitutional foundation for later challenges to data collection and surveillance regimes.",
    exhibits: ["puttaswamy-2017"],
  },
  {
    keywords: ["electoral bond", "electoral bonds", "political funding"],
    question: "what did the SC say about the electoral bonds scheme?",
    answer:
      "The Court struck down the Electoral Bonds Scheme in [A], holding that it violated the right to information under Article 19(1)(a) by making political funding anonymous. The bench directed the State Bank of India to disclose bond details, including donor identity and amounts, to the Election Commission.",
    exhibits: ["adr-electoral-bonds-2024"],
  },
];

export const suggestedQuestions = cannedAnswers.map((a) => a.question);

export function findAnswer(query) {
  const q = query.toLowerCase();
  return cannedAnswers.find((a) => a.keywords.some((k) => q.includes(k)));
}

export function getJudgment(id) {
  return judgments.find((j) => j.id === id);
}
