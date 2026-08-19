import { useEffect, useRef, useState } from "react";
import { suggestedQuestions } from "../data/mockJudgments";
import CiteText from "./CiteText";
import { Landmark } from "lucide-react";

export default function ChatPanel({ messages, onSend, onCite, onOpenExhibits }) {
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function submit(e) {
    e.preventDefault();
    const value = input.trim();
    if (!value) return;
    onSend(value);
    setInput("");
  }

  return (
    <section className="flex min-w-0 flex-1 flex-col" aria-label="Chat">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 sm:px-8"
        aria-live="polite"
      >
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {messages.length === 0 && (
            <div className="mb-4 flex flex-col items-start mt-4">
              <div className="p-3 rounded-full bg-accent-soft mb-5 border border-border">
                <Landmark className="h-8 w-8 text-accent" />
              </div>
              <h1 className="font-accent text-4xl tracking-tight sm:text-5xl text-white">
                Intelligent Legal Research.
              </h1>
              <p className="mt-3 max-w-md text-text-dim text-[0.95rem]">
                Live SC and High Court judgments, chattable, with real
                citations back to the source.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => onSend(q)}
                    className="rounded-sm border border-border-strong px-3 py-1.5 text-left text-[0.82rem] text-text-dim transition-colors hover:border-accent hover:text-accent"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <Message key={i} message={m} onCite={onCite} onOpenExhibits={onOpenExhibits} />
          ))}
        </div>
      </div>

      <form
        onSubmit={submit}
        className="border-t border-border bg-surface px-4 py-3 sm:px-8"
      >
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          <label htmlFor="chat-input" className="sr-only">
            Ask a legal research question
          </label>
          <input
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="what's the SC stance on…"
            className="flex-1 rounded-sm border border-border-strong bg-bg px-3 py-2.5 text-sm outline-none focus-visible:border-accent"
          />
          <button
            type="submit"
            className="rounded-sm bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            Ask
          </button>
        </div>
        <p className="mx-auto mt-2 max-w-2xl text-[0.7rem] italic text-text-dim">
          Research aid, not legal advice.
        </p>
      </form>
    </section>
  );
}

function Message({ message, onCite, onOpenExhibits }) {
  if (message.role === "user") {
    return (
      <div className="self-end max-w-[85%] rounded-tl-[10px] rounded-tr-[10px] rounded-bl-[10px] rounded-br-[2px] bg-accent-soft px-4 py-2.5 text-[0.92rem]">
        {message.text}
      </div>
    );
  }

  return (
    <div className="rounded-tl-[2px] rounded-tr-[10px] rounded-bl-[10px] rounded-br-[10px] border border-border bg-surface-2 px-4 py-3.5 text-[0.92rem] leading-relaxed">
      <CiteText
        text={message.text}
        onCite={(letter) => {
          onCite(letter);
          onOpenExhibits?.();
        }}
      />
      {message.exhibits?.length > 0 && (
        <button
          type="button"
          onClick={onOpenExhibits}
          className="mt-3 block font-mono text-[0.7rem] text-accent underline decoration-dotted underline-offset-2 lg:hidden"
        >
          view {message.exhibits.length} exhibit{message.exhibits.length > 1 ? "s" : ""} →
        </button>
      )}
    </div>
  );
}
