import json
import glob
import re
import os
import chromadb
from chromadb.utils import embedding_functions

# Use absolute or relative paths from the project root
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
JUDGMENTS_DIR = os.path.join(DATA_DIR, "judgments")
CHROMA_DB_DIR = os.path.join(DATA_DIR, "chroma_db")

def clean_text(text):
    if not text:
        return text
    text = re.sub(r'\[?\!?\[?\]?\(?/images/site/goback\.jpg\)?\]?\(?javascript:void\(0\);?\)?', '', text)
    text = re.sub(r'\[?Back\]?\(?javascript:void\(0\);?\)?', '', text)
    text = re.sub(r'·\s*Back\s*$', '', text.strip())
    return text.strip()

def chunk_judgment(text, case_title):
    text = clean_text(text)
    parts = re.split(r'\n\d+\\?\.\s*', text)
    chunks = [p.strip() for p in parts if p.strip() and len(p.strip()) > 20]
    return chunks

def load_cases():
    cases = []
    # Search for all json files in data/judgments
    pattern = os.path.join(JUDGMENTS_DIR, "*.json")
    for filepath in glob.glob(pattern):
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, list):
                cases.extend(data)
            else:
                cases.append(data)
    return cases

def main():
    print("Loading case files for indexing...")
    cases = load_cases()
    print(f"Loaded {len(cases)} case(s).")

    if not cases:
        print("No cases found in data/judgments to index.")
        return

    print("\nInitializing Chroma PersistentClient...")
    client = chromadb.PersistentClient(path=CHROMA_DB_DIR)
    
    embed_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="all-MiniLM-L6-v2"
    )

    # Recreate the collection to avoid duplicates if re-run
    try:
        client.delete_collection("judgments")
        print("Deleted existing 'judgments' collection.")
    except Exception:
        pass
        
    collection = client.create_collection(name="judgments", embedding_function=embed_fn)

    doc_id = 0
    total_cases_indexed = 0
    for case in cases:
        title = case.get("case_title", "Unknown Case")
        judgment_text = case.get("judgment_text", "")
        if not judgment_text:
            print(f"  Skipping '{title}' — no judgment_text field found.")
            continue

        chunks = chunk_judgment(judgment_text, title)
        print(f"  Indexing '{title}' -> {len(chunks)} chunks")

        for i, chunk in enumerate(chunks):
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
        total_cases_indexed += 1

    print(f"\nTotal chunks indexed: {doc_id} across {total_cases_indexed} cases.")
    print(f"ChromaDB persisted to {CHROMA_DB_DIR}")

if __name__ == "__main__":
    main()
