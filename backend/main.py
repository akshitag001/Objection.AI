import os
import json
import re
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import chromadb
from chromadb.utils import embedding_functions

# Data paths
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
CHROMA_DB_DIR = os.path.join(DATA_DIR, "chroma_db")
HEALTH_FILE = os.path.join(DATA_DIR, "health_stats.json")

app = FastAPI(title="Objection.AI Backend")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables to hold DB client and collection
chroma_client = None
collection = None

@app.on_event("startup")
def startup_event():
    global chroma_client, collection
    if os.path.exists(CHROMA_DB_DIR):
        chroma_client = chromadb.PersistentClient(path=CHROMA_DB_DIR)
        embed_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name="all-MiniLM-L6-v2"
        )
        # Get collection (should be created by index_data.py)
        try:
            collection = chroma_client.get_collection(name="judgments", embedding_function=embed_fn)
            print("Loaded ChromaDB collection successfully.")
        except Exception as e:
            print(f"Warning: Could not load collection. Has index_data.py been run? Error: {e}")

class SearchQuery(BaseModel):
    query: str
    top_k: int = 3

@app.get("/api/health")
def get_health():
    """Returns the collector health stats."""
    if os.path.exists(HEALTH_FILE):
        with open(HEALTH_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"status": "No stats available yet."}

@app.post("/api/search")
def search_judgments(req: SearchQuery):
    if not collection:
        return {"results": [], "error": "Database not initialized."}

    query = req.query.strip()
    if not query:
        return {"results": []}

    # Semantic Search
    raw_results = collection.query(query_texts=[query], n_results=10)
    
    # Keyword-boost logic
    query_words = set(w.lower() for w in re.findall(r'\w+', query) if len(w) > 3)
    
    scored = []
    if raw_results['documents'] and raw_results['documents'][0]:
        for doc, meta, dist in zip(raw_results['documents'][0], raw_results['metadatas'][0], raw_results['distances'][0]):
            title_words = set(w.lower() for w in re.findall(r'\w+', meta['case_title']) if len(w) > 3)
            keyword_overlap = len(query_words & title_words)
            scored.append((keyword_overlap, -dist, doc, meta))
            
    # Sort: highest keyword overlap first, then highest similarity (-dist)
    scored.sort(key=lambda x: (x[0], x[1]), reverse=True)
    
    top_matches = scored[:req.top_k]
    
    response_data = []
    for i, (kw, _, doc, meta) in enumerate(top_matches):
        response_data.append({
            "id": f"result_{i}",
            "case_title": meta['case_title'],
            "date": meta['date'],
            "snippet": doc[:500] + "..." if len(doc) > 500 else doc,
            "source_url": meta['source_url'],
            "keyword_match": kw > 0
        })

    return {"results": response_data}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
