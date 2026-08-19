import { useState } from "react";
import Ticker from "./components/Ticker";
import DocketStrip from "./components/DocketStrip";
import ChatPanel from "./components/ChatPanel";
import ExhibitRail from "./components/ExhibitRail";
import CollectorHealth from "./components/CollectorHealth";
import { Scale } from "lucide-react";

const FALLBACK =
  "No matching cases found in our current database index. Try adjusting your search terms.";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [activeLetter, setActiveLetter] = useState(null);
  const [mobilePanel, setMobilePanel] = useState(null); // "exhibits" | "health" | null

  const lastAi = [...messages].reverse().find((m) => m.role === "ai");
  const activeExhibits = lastAi?.exhibits ?? [];

  async function handleSend(text) {
    setMessages((prev) => [...prev, { role: "user", text }]);
    
    try {
      const res = await fetch("http://127.0.0.1:8000/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text, top_k: 3 })
      });
      const data = await res.json();
      
      if (data.results && data.results.length > 0) {
        const exhibits = data.results.map((r) => ({
          id: r.id,
          case: r.case_title,
          sourceUrl: r.source_url,
          date: r.date,
          court: "India Courts",
          snippet: r.snippet
        }));
        
        let answerText = "Based on the database, here are the most relevant findings:\n\n";
        exhibits.forEach((ex, idx) => {
           const letter = String.fromCharCode(65 + idx); // A, B, C
           answerText += `[${letter}] ${ex.case}: ${ex.snippet.substring(0, 150)}...\n\n`;
        });
        
        setMessages((prev) => [
          ...prev,
          { role: "ai", text: answerText, exhibits: exhibits },
        ]);
        setActiveLetter("A");
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "ai", text: FALLBACK, exhibits: [] },
        ]);
        setActiveLetter(null);
      }
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Error connecting to the backend API.", exhibits: [] },
      ]);
      setActiveLetter(null);
    }
  }

  return (
    <div className="flex h-dvh flex-col">
      <a
        href="#chat-input"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded-sm focus:bg-accent focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to chat
      </a>

      <Ticker />

      <header className="flex items-center justify-between border-b border-border bg-surface/90 px-4 py-4 sm:px-6 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded bg-accent/10 border border-accent/20">
            <Scale className="text-accent h-6 w-6" />
          </div>
          <span className="font-accent text-3xl tracking-wide text-text mt-1">
            Objection<span className="text-accent italic">.AI</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobilePanel("health")}
            className="rounded-sm border border-border-strong px-3 py-1.5 font-mono text-[0.7rem] text-text-dim hover:border-accent hover:text-accent lg:hidden"
          >
            Collector health
          </button>
          {activeExhibits.length > 0 && (
            <button
              type="button"
              onClick={() => setMobilePanel("exhibits")}
              className="rounded-sm border border-border-strong px-3 py-1.5 font-mono text-[0.7rem] text-text-dim hover:border-accent hover:text-accent lg:hidden"
            >
              Exhibits ({activeExhibits.length})
            </button>
          )}
        </div>
      </header>

      <main className="flex min-h-0 flex-1">
        <DocketStrip />
        <ChatPanel
          messages={messages}
          onSend={handleSend}
          onCite={setActiveLetter}
          onOpenExhibits={() => setMobilePanel("exhibits")}
        />
        <ExhibitRail
          exhibits={activeExhibits}
          activeLetter={activeLetter}
          onFocusLetter={setActiveLetter}
        />
      </main>

      {mobilePanel && (
        <div
          className="fixed inset-0 z-40 flex items-end bg-black/40 lg:hidden"
          role="dialog"
          aria-modal="true"
          onClick={() => setMobilePanel(null)}
        >
          <div
            className="max-h-[80vh] w-full overflow-y-auto rounded-t-lg border-t border-border bg-bg p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="font-mono text-[0.7rem] uppercase tracking-wider text-text-dim">
                {mobilePanel === "exhibits" ? "Exhibits" : "Collector Health"}
              </p>
              <button
                type="button"
                onClick={() => setMobilePanel(null)}
                className="rounded-sm border border-border-strong px-2 py-1 text-[0.7rem] text-text-dim"
                aria-label="Close panel"
              >
                Close
              </button>
            </div>
            {mobilePanel === "exhibits" ? (
              <ExhibitRail
                exhibits={activeExhibits}
                activeLetter={activeLetter}
                onFocusLetter={setActiveLetter}
                variant="drawer"
              />
            ) : (
              <CollectorHealth />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
