import StatusPill from "./StatusPill";
import CollectorHealth from "./CollectorHealth";
import { Briefcase } from "lucide-react";

export default function DocketStrip() {
  return (
    <aside
      aria-label="Session and collector info"
      className="hidden lg:flex w-[240px] shrink-0 flex-col gap-6 border-r border-border bg-surface/80 p-5 backdrop-blur-sm"
    >
      <div>
        <p className="mb-1 font-mono text-[0.68rem] uppercase tracking-wider text-accent/80 font-bold">
          Matter
        </p>
        <div className="flex items-center gap-2">
           <Briefcase className="w-4 h-4 text-text-dim" />
           <p className="text-[0.9rem] font-medium font-sans">Case Research Demo</p>
        </div>
      </div>

      <div>
        <p className="mb-1.5 font-mono text-[0.68rem] uppercase tracking-wider text-accent/80 font-bold">
          Jurisdictions
        </p>
        <ul className="flex flex-col gap-1.5">
            <li className="font-mono text-[0.72rem] text-text-dim border-l-2 border-accent/40 pl-2">
              Supreme Court of India
            </li>
            <li className="font-mono text-[0.72rem] text-text-dim border-l-2 border-border-strong pl-2">
              Delhi High Court
            </li>
        </ul>
      </div>

      <div>
        <p className="mb-1.5 font-mono text-[0.68rem] uppercase tracking-wider text-accent/80 font-bold">
          Intelligence
        </p>
        <StatusPill tone="ok">System Online</StatusPill>
      </div>

      <div className="mt-auto">
        <CollectorHealth compact />
      </div>
    </aside>
  );
}
