import type { Highlights } from "@/lib/training/derive";
import { CountUp } from "./CountUp";
import { shortDate } from "@/lib/training/format";
import {
  FlameIcon,
  MountainIcon,
  RunIcon,
  ClockIcon,
  TrophyIcon,
  SparkIcon,
} from "./icons";

export function HighlightsPanel({ highlights }: { highlights: Highlights }) {
  const h = highlights;

  return (
    <div className="panel panel-pad">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="kicker">Season highlights</p>
          <h3 className="mt-1.5 text-lg font-semibold tracking-tight">2026 so far</h3>
        </div>
        <span className="chip">Running · YTD</span>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {/* Streak — the hero tile */}
        <div className="relative overflow-hidden rounded-[var(--r-md)] border border-[var(--accent-line)] bg-[var(--accent-soft)] p-4 sm:col-span-2 xl:col-span-1 xl:row-span-2">
          <div className="flex items-center gap-2 text-accent-bright">
            <FlameIcon width={18} height={18} />
            <span className="kicker text-accent-bright">Current streak</span>
          </div>
          <p className="mt-3 flex items-end gap-2">
            <span className="mono text-[3.4rem] font-medium leading-[0.8] tracking-tight text-ink">
              <CountUp value={h.currentStreakDays} />
            </span>
            <span className="mono pb-1.5 text-sm text-ink-3">days</span>
          </p>
          <p className="mt-3 text-sm text-ink-3">
            Longest this block{" "}
            <span className="mono font-medium text-ink-2">{h.longestStreakDays} days</span>
          </p>
        </div>

        <Tile icon={<RunIcon width={16} height={16} />} label="Run distance" unit="km">
          <CountUp value={h.seasonRunKm} />
        </Tile>
        <Tile icon={<ClockIcon width={16} height={16} />} label="Run time" unit="hrs">
          <CountUp value={h.seasonRunHours} />
        </Tile>
        <Tile icon={<RunIcon width={16} height={16} />} label="Runs" unit="logged">
          <CountUp value={h.seasonRunCount} />
        </Tile>
        <Tile icon={<MountainIcon width={16} height={16} />} label="Climbed" unit="m">
          <CountUp value={h.seasonElevationM} />
        </Tile>
        <Tile icon={<TrophyIcon width={16} height={16} />} label="PRs set" unit="this block">
          <CountUp value={h.prsThisBlock} />
        </Tile>
        <Tile icon={<SparkIcon width={16} height={16} />} label="Achievements" unit="this block">
          <CountUp value={h.achievementsThisBlock} />
        </Tile>
      </div>

      {/* Distance breakdown — transparent about manual corrections */}
      <p className="mt-3 text-xs text-ink-4">
        Run distance ={" "}
        {h.seasonRunBreakdown.map((b, i) => (
          <span key={b.label}>
            {i > 0 && <span className="text-ink-4"> + </span>}
            <span className="mono text-ink-3">{b.km} km</span>{" "}
            <span>{b.label.toLowerCase()}</span>
          </span>
        ))}
        . Treadmill &amp; HYROX runs added manually — Strava logged them without distance.
      </p>

      {/* Standout session */}
      <div className="mt-5 flex items-center gap-3 rounded-[var(--r-md)] border border-[var(--line)] bg-[oklch(1_0_0/0.02)] p-3.5">
        <FlameIcon width={18} height={18} className="shrink-0 text-[var(--z5)]" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">Biggest effort · {h.bigSession.name}</p>
          <p className="text-xs text-ink-4">
            {shortDate(h.bigSession.date)} · {h.bigSession.distanceKm} km
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="mono text-lg font-medium leading-none tnum text-[var(--z5)]">
            {h.bigSession.relativeEffort}
          </p>
          <p className="kicker mt-1">Rel. effort</p>
        </div>
      </div>
    </div>
  );
}

function Tile({
  icon,
  label,
  unit,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  unit: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[var(--r-md)] border border-[var(--line)] bg-[oklch(1_0_0/0.02)] p-4">
      <div className="flex items-center gap-2 text-ink-3">
        {icon}
        <span className="kicker">{label}</span>
      </div>
      <p className="mt-2.5 mono text-[1.9rem] font-medium leading-none tnum text-ink">
        {children}
        <span className="ml-1.5 text-xs font-normal text-ink-4">{unit}</span>
      </p>
    </div>
  );
}
