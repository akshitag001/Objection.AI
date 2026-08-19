const TONES = {
  ok: "bg-ok-soft text-ok",
  warn: "bg-alert-soft text-alert",
};

export default function StatusPill({ tone = "ok", children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[0.68rem] font-semibold ${TONES[tone]}`}
    >
      <span className="text-[0.55rem]" aria-hidden="true">
        ●
      </span>
      {children}
    </span>
  );
}
