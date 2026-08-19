export default function ExhibitCard({ letter, judgment, highlighted, onFocus }) {
  return (
    <a
      href={judgment.sourceUrl}
      target="_blank"
      rel="noreferrer"
      onMouseEnter={onFocus}
      onFocus={onFocus}
      className={`group relative block rounded-sm border bg-surface p-3 pt-4 transition-all hover:-translate-y-0.5 focus-visible:-translate-y-0.5 ${
        highlighted ? "border-accent" : "border-border-strong"
      }`}
    >
      <span
        aria-hidden="true"
        className="absolute -top-2.5 left-2.5 rounded-sm bg-accent px-1.5 py-0.5 font-mono text-[0.6rem] tracking-wide text-white"
      >
        EXHIBIT {letter}
      </span>
      <p className="font-accent italic text-accent text-[1rem] leading-snug">
        {judgment.case}
      </p>
      <dl className="mt-2 flex flex-col gap-0.5 font-mono text-[0.68rem] text-text-dim">
        <div>{judgment.court}</div>
        <div>{judgment.date}</div>
        <div>{judgment.citation}</div>
      </dl>
      <span className="mt-2 inline-block font-mono text-[0.65rem] text-accent underline decoration-dotted underline-offset-2 group-hover:no-underline">
        view original judgment ↗
      </span>
    </a>
  );
}
