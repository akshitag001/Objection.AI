# Objection.AI

Live SC and High Court judgments, scraped and self-healed by Bright Data
Scraper Studio, chattable with real citations back to the source. Built for
**Into the Scrape-Verse** (WeMakeDevs + Bright Data, Aug 17–23 2026).

> Research aid, not legal advice.

## Status: Ready for Submission

The prototype is now fully integrated with a working FastAPI backend, a persistent ChromaDB vector store, and a batch data pipeline pulling live judgments via Bright Data Scraper Studio.

## Architecture & Stack

- **Scraping Pipeline:** Python script orchestrating Bright Data CLI to extract and clean Indian court judgments.
- **RAG Backend:** FastAPI + ChromaDB (`PersistentClient`) + `sentence-transformers` for embeddings. Hybrid search (semantic + keyword boosting).
- **Frontend:** React 19 + Vite + Tailwind CSS v4. Features dynamic citation rails and a real-time Collector Health panel.

## How to Run locally

### 1. Scrape the Data
Run the batch pipeline to fetch and clean cases into `data/judgments/` (requires Bright Data CLI authenticated).
```bash
python pipeline/scrape_batch.py
```

### 2. Start the Backend
Index the JSON files into ChromaDB and start the FastAPI search endpoint.
```bash
python backend/index_data.py
python -m uvicorn backend.main:app --port 8000
```

### 3. Start the Frontend
In a new terminal window:
```bash
npm install
npm run dev
```

## Demo Video Checklist

When recording your submission video, be sure to hit these points:
1. **The Problem:** Explain how fragmented legal data is across state high courts.
2. **Bright Data Integration:** Show the Scraper Studio dashboard. Briefly mention how you set up the listing and judgment collectors, and specifically highlight the **"Self-Healing"** feature (e.g., when the schema broke, you used `heal` to auto-repair the extraction rule).
3. **Data Pipeline:** Briefly show the raw `case*.json` files.
4. **The UI:** Open `http://localhost:5173`. Show the GenZ-coded design.
5. **The Magic (RAG):** Ask a legal question in the chat. Show how it returns an AI synthesized answer with clickable "Exhibit" cards that link straight back to the source URL.
6. **Health Panel:** Open the mobile drawer or point to the sidebar to show the live "Collector Health" panel pulling the `health_stats.json`.
