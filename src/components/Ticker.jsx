const ITEMS = [
  { text: "SUPREME COURT", strong: "3 new judgments today" },
  { text: "DELHI HC", strong: "collector healthy" },
  { text: "BOMBAY HC", strong: "1 field auto-repaired · 312ms" },
];

export default function Ticker() {
  const doubled = [...ITEMS, ...ITEMS];
  return (
    <div className="border-b border-border bg-surface-2 overflow-hidden whitespace-nowrap py-2">
      <div className="inline-block animate-ticker">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="font-mono text-[0.72rem] tracking-wide text-text-dim px-6"
          >
            {item.text} · <b className="text-accent font-semibold">{item.strong}</b>
          </span>
        ))}
      </div>
    </div>
  );
}
