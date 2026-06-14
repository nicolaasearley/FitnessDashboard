import type { ZoneDistribution } from "@/lib/training/derive";
import { duration } from "@/lib/training/format";

const ZONE_VARS = ["var(--z1)", "var(--z2)", "var(--z3)", "var(--z4)", "var(--z5)"];

export function ZonePanel({ zones }: { zones: ZoneDistribution }) {
  const hasData = zones.totalSeconds > 0;

  return (
    <div className="panel panel-pad flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="kicker">Heart-rate zones</p>
          <h3 className="mt-1.5 text-lg font-semibold tracking-tight">Time in zone</h3>
        </div>
        <span className="chip">{zones.windowDays}-day window</span>
      </div>

      {hasData ? (
        <>
          {/* Stacked bar */}
          <div className="mt-5 flex h-3 w-full gap-0.5 overflow-hidden rounded-full">
            {zones.slices.map((z) =>
              z.fraction > 0 ? (
                <div
                  key={z.index}
                  style={{
                    width: `${z.fraction * 100}%`,
                    background: ZONE_VARS[z.index - 1],
                  }}
                  title={`${z.label}: ${Math.round(z.fraction * 100)}%`}
                />
              ) : null,
            )}
          </div>

          {/* Legend */}
          <ul className="mt-5 flex flex-col gap-2.5">
            {zones.slices
              .slice()
              .reverse()
              .map((z) => (
                <li key={z.index} className="flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                    style={{ background: ZONE_VARS[z.index - 1] }}
                  />
                  <span className="mono text-xs text-ink-4">Z{z.index}</span>
                  <span className="text-sm text-ink-2">{z.label}</span>
                  <span className="mono ml-auto text-xs text-ink-4 tnum">
                    {z.max === -1 ? `${z.min}+` : `${z.min}–${z.max}`}
                  </span>
                  <span className="mono w-14 text-right text-sm font-medium tnum">
                    {Math.round(z.fraction * 100)}%
                  </span>
                </li>
              ))}
          </ul>

          <p className="mt-auto pt-5 text-[0.7rem] leading-relaxed text-ink-4">
            From {zones.runCountWithHr} HR-tracked runs · {duration(zones.totalSeconds)} total ·
            estimated from session average HR.
          </p>
        </>
      ) : (
        <p className="mt-6 text-sm text-ink-4">No heart-rate data in this window.</p>
      )}
    </div>
  );
}
