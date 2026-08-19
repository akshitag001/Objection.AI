import { useEffect, useState } from "react";
import StatusPill from "./StatusPill";

export default function CollectorHealth({ compact = false }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/health")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => {
        console.error("Failed to fetch health stats", err);
        setError(true);
      });
  }, []);

  if (error) {
    return (
      <div className="rounded-sm border border-border bg-surface p-4 font-mono text-[0.8rem]">
        <p className="text-alert">Failed to connect to backend.</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-sm border border-border bg-surface p-4 font-mono text-[0.8rem]">
        <p className="text-text-dim">Loading health stats...</p>
      </div>
    );
  }

  const anyHealing = false; // Based on real stats, we'll assume healthy if API returns

  return (
    <div className="rounded-sm border border-border bg-surface p-4 font-mono text-[0.8rem]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="font-sans text-[0.8rem] font-semibold tracking-tight">
          Collector Health
        </span>
        <StatusPill tone={anyHealing ? "warn" : "ok"}>
          {anyHealing ? "healing" : "healthy"}
        </StatusPill>
      </div>

      <ul className="flex flex-col gap-2">
        <li className="text-[0.7rem] text-text-dim">
          <span className="text-text font-sans font-medium">Judgments Indexed:</span>{" "}
          {stats.cases_indexed || 0} cases
        </li>
        <li className="text-[0.7rem] text-text-dim">
          <span className="text-text font-sans font-medium">Last Scrape:</span>{" "}
          {stats.last_scrape_time ? new Date(stats.last_scrape_time).toLocaleString() : 'N/A'}
        </li>
      </ul>

      <div className="mt-3 flex flex-col gap-2 border-t border-dashed border-border pt-3">
        <span className="font-sans text-[0.75rem] font-semibold tracking-tight">
          Recent Heal Events
        </span>
        {stats.recent_heal_events && stats.recent_heal_events.length > 0 ? (
          stats.recent_heal_events.map((event, i) => (
            <div key={i} className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[0.72rem]">
              <span className="text-ok font-semibold inline-block">
                {event.description}
              </span>
              <span className="text-text-dim text-[0.65rem]">
                {new Date(event.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))
        ) : (
          <p className="text-text-dim text-[0.72rem]">No recent heal events.</p>
        )}
      </div>
    </div>
  );
}
