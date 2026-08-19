import ExhibitCard from "./ExhibitCard";

const LETTERS = ["A", "B", "C", "D", "E", "F", "G"];

export default function ExhibitRail({
  exhibits,
  activeLetter,
  onFocusLetter,
  variant = "sidebar", // "sidebar" (desktop column, hidden on mobile) | "drawer" (mobile modal content)
}) {
  const wrapperClass =
    variant === "sidebar"
      ? "hidden lg:flex w-[280px] shrink-0 flex-col gap-3 border-l border-border bg-surface p-4"
      : "flex w-full flex-col gap-3";

  if (!exhibits || exhibits.length === 0) {
    return (
      <aside aria-label="Cited judgments" className={wrapperClass}>
        <p className="font-mono text-[0.68rem] uppercase tracking-wider text-text-dim">
          Exhibits
        </p>
        <p className="text-[0.8rem] text-text-dim">
          Citations for the current answer will appear here as tappable
          source cards.
        </p>
      </aside>
    );
  }

  return (
    <aside aria-label="Cited judgments" className={wrapperClass}>
      <p className="font-mono text-[0.68rem] uppercase tracking-wider text-text-dim">
        Exhibits
      </p>
      {exhibits.map((judgment, i) => {
        if (!judgment) return null;
        const letter = LETTERS[i] || "?";
        return (
          <ExhibitCard
            key={judgment.id}
            letter={letter}
            judgment={judgment}
            highlighted={activeLetter === letter}
            onFocus={() => onFocusLetter?.(letter)}
          />
        );
      })}
    </aside>
  );
}
