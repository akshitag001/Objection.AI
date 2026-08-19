"""
Quick local RAG test — no API keys, no cost.
Uses sentence-transformers (free, local) for embeddings + Chroma (free, local) for vector search.

HOW TO USE:
1. Save your scraped judgment JSON as files: case1.json, case2.json, etc.
   in the SAME folder as this script.
2. Run: python test_rag.py
3. It'll load all case*.json files, chunk them, embed them, and let you
   test a query to see if retrieval works.
"""

import json
import glob
import re
import chromadb
from chromadb.utils import embedding_functions

# --- Step 1: Clean up known junk from scraping (nav leaks etc) ---
def clean_text(text):
    if not text:
        return text
    # strip known trailing nav junk we saw in the scraper output
    text = re.sub(r'\[?\!?\[?\]?\(?/images/site/goback\.jpg\)?\]?\(?javascript:void\(0\);?\)?', '', text)
    text = re.sub(r'\[?Back\]?\(?javascript:void\(0\);?\)?', '', text)
    text = re.sub(r'·\s*Back\s*$', '', text.strip())
    return text.strip()

# --- Step 2: Chunk judgment text by numbered paragraphs ---
def chunk_judgment(text, case_title):
    text = clean_text(text)
    # split on numbered paragraphs like "\n1\\.", "\n2\\." etc (matches your scrape output style)
    parts = re.split(r'\n\d+\\?\.\s*', text)
    chunks = [p.strip() for p in parts if p.strip() and len(p.strip()) > 20]
    return chunks

# --- Step 3: Load all case JSON files ---
def load_cases():
    cases = []
    for filepath in glob.glob("case*.json"):
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            # handle both single-object and list-wrapped JSON
            if isinstance(data, list):
                cases.extend(data)
            else:
                cases.append(data)
    return cases

def main():
    print("Loading case files...")
    cases = load_cases()
    print(f"Loaded {len(cases)} case(s).")

    if not cases:
        print("\nNo case*.json files found in this folder.")
        print("Save your scraped judgment JSON as case1.json, case2.json, etc. and re-run.")
        return

    # Set up free local embedding function (downloads model once, ~80MB, then fully offline)
    print("\nLoading free local embedding model (first run downloads ~80MB, then cached)...")
    embed_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="all-MiniLM-L6-v2"
    )

    client = chromadb.Client()
    collection = client.create_collection(name="judgments_test", embedding_function=embed_fn)

    # Chunk and add each case
    doc_id = 0
    for case in cases:
        title = case.get("case_title", "Unknown Case")
        judgment_text = case.get("judgment_text", "")
        if not judgment_text:
            print(f"  Skipping '{title}' — no judgment_text field found.")
            continue

        chunks = chunk_judgment(judgment_text, title)
        print(f"  '{title}' -> {len(chunks)} chunks")

        for i, chunk in enumerate(chunks):
            # Prepend case title so the embedding actually knows which case this chunk belongs to
            # (paragraphs usually say "the appellant"/"the accused", not the party name itself)
            embedded_text = f"Case: {title}\n\n{chunk}"
            collection.add(
                documents=[embedded_text],
                metadatas=[{
                    "case_title": title,
                    "date": clean_text(case.get("date_of_judgment", case.get("date", ""))),
                    "court": case.get("court_name", ""),
                    "source_url": case.get("source_url", case.get("input", {}).get("url", "")),
                    "chunk_index": i,
                }],
                ids=[f"doc_{doc_id}"]
            )
            doc_id += 1

    print(f"\nTotal chunks indexed: {doc_id}")

    # --- Step 4: Test retrieval ---
    print("\n" + "="*60)
    print("Type a legal question to test retrieval (or 'quit' to exit)")
    print("="*60)

    while True:
        query = input("\nYour question: ").strip()
        if query.lower() in ("quit", "exit", "q"):
            break
        if not query:
            continue

        # Pull more candidates than we need, then re-rank with a keyword boost.
        # Pure semantic search is weak at exact name/proper-noun matching (a known
        # RAG limitation, especially with small free models) so we combine it with
        # simple keyword overlap against the case title.
        raw_results = collection.query(query_texts=[query], n_results=10)

        query_words = set(w.lower() for w in re.findall(r'\w+', query) if len(w) > 3)

        scored = []
        for doc, meta, dist in zip(raw_results['documents'][0], raw_results['metadatas'][0], raw_results['distances'][0]):
            title_words = set(w.lower() for w in re.findall(r'\w+', meta['case_title']) if len(w) > 3)
            keyword_overlap = len(query_words & title_words)
            # lower distance = more semantically similar; keyword_overlap > 0 = strong signal, push to top
            scored.append((keyword_overlap, -dist, doc, meta))

        scored.sort(key=lambda x: (x[0], x[1]), reverse=True)
        top_matches = scored[:3]

        print(f"\nTop {len(top_matches)} matches:\n")
        for i, (kw, _, doc, meta) in enumerate(top_matches):
            tag = " [name match]" if kw > 0 else ""
            print(f"[{i+1}]{tag} {meta['case_title']} ({meta['date']})")
            print(f"    {doc[:200]}...")
            print(f"    Source: {meta['source_url']}\n")

if __name__ == "__main__":
    main()