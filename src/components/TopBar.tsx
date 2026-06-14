import { MapPinIcon } from "./icons";

interface Props {
  name: string;
  location: string;
  blockName: string;
  weekNumber: number;
  referenceDate: string;
}

export function TopBar({ name, location, blockName, weekNumber, referenceDate }: Props) {
  const asOf = new Date(referenceDate).toLocaleDateString("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-[var(--r-md)] border border-[var(--accent-line)] bg-[var(--accent-soft)] mono text-sm font-semibold text-accent-bright lg:hidden">
          NE
        </span>
        <div>
          <h1 className="text-lg font-semibold leading-tight tracking-tight sm:text-xl">{name}</h1>
          <p className="flex items-center gap-1.5 text-xs text-ink-4">
            <MapPinIcon width={13} height={13} />
            {location}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <span className="chip chip-accent">
          {blockName} · Wk {weekNumber}
        </span>
        <span className="chip">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-[var(--pos)]" />
          As of {asOf}
        </span>
      </div>
    </header>
  );
}
