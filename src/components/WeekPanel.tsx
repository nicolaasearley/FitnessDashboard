import type { WeekSummary } from "@/lib/training/derive";
import { duration, signed } from "@/lib/training/format";
import { CountUp } from "./CountUp";
import { Sparkline } from "./Sparkline";
import { ArrowUpRight } from "./icons";

export function WeekPanel({ week }: { week: WeekSummary }) {
  const { current, previous, volumeDeltaPct, loadDelta } = week;
  const volUp = volumeDeltaPct >= 0;
  const series = week.series.map((w) => w.volumeKm);

  return (
    <div className="panel panel-pad flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="kicker">This week</p>
          <h3 className="mt-1.5 text-lg font-semibold tracking-tight">Volume &amp; load</h3>
        </div>
        <span
          className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium"
          style={{
            color: volUp ? "var(--pos)" : "var(--neg)",
            borderColor: `color-mix(in oklch, ${volUp ? "var(--pos)" : "var(--neg)"}, transparent 70%)`,
          }}
          title="Run volume vs last week"
        >
          <ArrowUpRight
            width={13}
            height={13}
            style={{ transform: volUp ? "none" : "rotate(90deg)" }}
          />
          {signed(volumeDeltaPct)}%
        </span>
      </div>

      <div className="mt-4 flex items-end gap-2">
        <span className="mono text-[3rem] font-medium leading-[0.82] tracking-tight">
          <CountUp value={current.volumeKm} decimals={1} />
        </span>
        <span className="mono pb-1.5 text-base text-ink-3">km run</span>
      </div>
      <p className="mt-1.5 text-xs text-ink-4">
        vs <span className="tnum text-ink-3">{previous.volumeKm.toFixed(1)} km</span> last week
      </p>

      <div className="mt-4">
        <Sparkline values={series} className="h-14 w-full" />
        <div className="mt-1 flex justify-between">
          <span className="kicker">8 weeks ago</span>
          <span className="kicker">This week</span>
        </div>
      </div>

      <div className="mt-auto grid grid-cols-3 gap-2.5 pt-6">
        <Mini label="Load" value={String(current.loadSum)} sub={`${signed(loadDelta)} wk`} />
        <Mini label="Sessions" value={String(current.sessionCount)} sub={`${current.runCount} runs`} />
        <Mini label="Moving" value={duration(current.movingSeconds)} sub="h:m:s" />
      </div>
    </div>
  );
}

function Mini({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-[var(--r-md)] border border-[var(--line)] bg-[oklch(1_0_0/0.02)] px-2.5 py-2.5">
      <p className="kicker">{label}</p>
      <p className="mt-1 mono text-base font-medium leading-none tnum">{value}</p>
      <p className="mt-1 text-[0.7rem] text-ink-4 tnum">{sub}</p>
    </div>
  );
}
