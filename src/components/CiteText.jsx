const CITE_RE = /\[([A-E])\]/g;

// Splits answer text on [A] [B] style tokens and renders them as
// tappable inline citation chips instead of plain footnote links.
export default function CiteText({ text, onCite }) {
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = CITE_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const letter = match[1];
    parts.push(
      <button
        key={`${letter}-${match.index}`}
        type="button"
        onClick={() => onCite?.(letter)}
        className="mx-0.5 rounded-sm border border-accent/40 bg-accent-soft px-1.5 py-0.5 font-mono text-[0.72rem] font-medium text-accent align-baseline hover:border-accent"
      >
        Exhibit {letter}
      </button>
    );
    lastIndex = CITE_RE.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}
