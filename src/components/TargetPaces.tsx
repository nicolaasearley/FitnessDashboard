import { pace } from "@/lib/training/format";
import { TargetIcon } from "./icons";

interface Pace {
  label: string;
  paceSecPerKm: number;
  context: string;
}

export function TargetPaces({ paces }: { paces: Pace[] }) {
  return (
    <div className="panel panel-pad">
      <div className="mb-4 flex items-center gap-2">
        <TargetIcon width={16} height={16} className="text-accent" />
        <p className="kicker">Target paces · this block</p>
      </div>
      <ul className="grid gap-x-4 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
        {paces.map((p, i) => (
          <li
            key={p.label}
            className="flex flex-col"
            style={{
              borderLeft: i === 0 ? "none" : undefined,
            }}
          >
            <span className="text-xs text-ink-3">{p.label}</span>
            <span className="mt-1.5 mono text-[1.7rem] font-medium leading-none tracking-tight tnum">
              {pace(p.paceSecPerKm)}
              <span className="ml-1 text-xs font-normal text-ink-4">/km</span>
            </span>
            <span className="mt-1.5 text-[0.7rem] text-ink-4">{p.context}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
