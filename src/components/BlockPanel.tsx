import type { BlockState } from "@/lib/training/derive";
import { TargetIcon } from "./icons";

export function BlockPanel({ block }: { block: BlockState }) {
  const markerPct = Math.min(100, (block.weekNumber / block.totalWeeks) * 100);
  const activeIndex = block.phases.findIndex((p) => p.active);
  const activePhase = block.phases[activeIndex] ?? block.phases[0];

  return (
    <div className="panel panel-pad flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="kicker">Training block</p>
          <h3 className="mt-1.5 text-lg font-semibold tracking-tight">{block.name}</h3>
        </div>
        <span className="chip chip-accent">{block.phase}</span>
      </div>

      <div className="mt-5 flex items-end gap-3">
        <span className="mono text-[2.75rem] font-medium leading-[0.85] tracking-tight">
          {block.weekNumber}
        </span>
        <span className="mono pb-1 text-base text-ink-3">/ {block.totalWeeks} weeks</span>
        <span className="mono ml-auto pb-1 text-sm text-ink-4">
          {Math.round(block.progress * 100)}%
        </span>
      </div>

      {/* Phase rail */}
      <div className="mt-4">
        <div className="relative flex gap-1">
          {block.phases.map((p) => {
            const span = p.endWeek - p.startWeek + 1;
            return (
              <div
                key={p.name}
                className="relative h-2 overflow-hidden rounded-full"
                style={{
                  flexGrow: span,
                  background: p.active ? "var(--accent)" : "var(--panel-3)",
                  boxShadow: p.active ? "0 0 14px var(--accent-glow)" : "none",
                }}
              />
            );
          })}
          <div
            className="pointer-events-none absolute -top-1 h-4 w-4 -translate-x-1/2 rounded-full border-2"
            style={{
              left: `${markerPct}%`,
              background: "var(--bg)",
              borderColor: "var(--accent-bright)",
              boxShadow: "0 0 12px var(--accent-glow)",
            }}
          />
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[0.7rem]">
          <span className="text-ink-3">
            Phase {activeIndex + 1} of {block.phases.length} ·{" "}
            <span className="text-ink-2">{activePhase?.short}</span>
          </span>
          <span className="mono text-ink-4">
            Wk {activePhase?.startWeek}–{activePhase?.endWeek}
          </span>
        </div>
      </div>

      {/* Current phase focus */}
      <p className="mt-4 text-pretty text-[0.82rem] leading-relaxed text-ink-2">
        {block.phaseFocus}
      </p>

      {/* Checkpoint */}
      <div className="mt-3 flex items-start gap-2 rounded-[var(--r-md)] border border-[var(--line)] bg-[oklch(1_0_0/0.02)] px-3 py-2.5">
        <TargetIcon width={15} height={15} className="mt-0.5 shrink-0 text-accent" />
        <p className="text-xs leading-relaxed text-ink-3">
          <span className="text-ink-2">Checkpoint · </span>
          {block.phaseCheckpoint}
        </p>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-3 pt-5">
        <Stat label="Days to race" value={String(block.daysToGoal)} unit="days" />
        <Stat label="Volume target" value={String(block.weeklyVolumeTargetKm)} unit="km / wk" />
      </div>
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-[var(--r-md)] border border-[var(--line)] bg-[oklch(1_0_0/0.02)] px-3 py-2.5">
      <p className="kicker">{label}</p>
      <p className="mt-1 mono text-lg font-medium leading-none tnum">
        {value}
        <span className="ml-1 text-xs font-normal text-ink-4">{unit}</span>
      </p>
    </div>
  );
}
