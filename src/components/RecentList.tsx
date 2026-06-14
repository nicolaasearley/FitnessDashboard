"use client";

import { useState } from "react";
import type { RecentActivity } from "@/lib/training/derive";
import { categoryIcon, ChevronRight } from "./icons";
import { duration, km, pace, relativeDay, timeOfDay } from "@/lib/training/format";
import { RouteMap } from "./RouteMap";

const CATEGORY_TINT: Record<string, string> = {
  run: "var(--accent)",
  strength: "var(--z4)",
  ride: "var(--z2)",
  cross: "var(--z5)",
  recovery: "var(--z3)",
  other: "var(--ink-3)",
};

export function RecentList({
  activities,
  referenceDate,
}: {
  activities: RecentActivity[];
  referenceDate: string;
}) {
  const reference = new Date(referenceDate);
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="panel panel-pad">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="kicker">Activity</p>
          <h3 className="mt-1.5 text-lg font-semibold tracking-tight">Recent sessions</h3>
        </div>
        <span className="hidden text-xs text-ink-4 sm:block">Select a session for detail</span>
      </div>

      <ul className="flex flex-col">
        {activities.map((a, i) => {
          const Icon = categoryIcon[a.category] ?? categoryIcon.other;
          const tint = CATEGORY_TINT[a.category];
          const isRun = a.category === "run" && a.distanceM > 0;
          const isOpen = open === a.id;
          return (
            <li key={a.id} style={{ borderTop: i === 0 ? "none" : "1px solid var(--line)" }}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : a.id)}
                aria-expanded={isOpen}
                aria-controls={`detail-${a.id}`}
                className="flex w-full items-center gap-3.5 rounded-[var(--r-sm)] py-3 text-left transition-colors hover:bg-[oklch(1_0_0/0.015)]"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--r-sm)] border"
                  style={{
                    color: tint,
                    borderColor: "color-mix(in oklch, " + tint + ", transparent 70%)",
                    background: "color-mix(in oklch, " + tint + ", transparent 92%)",
                  }}
                >
                  <Icon width={17} height={17} />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-ink">{a.name}</p>
                    {a.isRace && (
                      <span className="mono shrink-0 rounded-full bg-[var(--accent-soft)] px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-accent-bright">
                        Race
                      </span>
                    )}
                    {a.prCount > 0 && (
                      <span className="mono shrink-0 rounded-full border border-[var(--line)] px-1.5 py-0.5 text-[0.6rem] text-ink-3">
                        {a.prCount} PR
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-ink-4">
                    {relativeDay(a.startLocal, reference)} · {timeOfDay(a.startLocal)}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  {isRun ? (
                    <>
                      <p className="mono text-sm font-medium tnum">{km(a.distanceM)} km</p>
                      <p className="mono mt-0.5 text-xs text-ink-4 tnum">
                        {pace(a.paceSecPerKm ?? 0)}/km
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="mono text-sm font-medium tnum">{duration(a.movingTime)}</p>
                      <p className="mono mt-0.5 text-xs text-ink-4 tnum">RE {a.relativeEffort}</p>
                    </>
                  )}
                </div>

                <ChevronRight
                  width={16}
                  height={16}
                  className="shrink-0 text-ink-4 transition-transform duration-200"
                  style={{ transform: isOpen ? "rotate(90deg)" : "none" }}
                />
              </button>

              <SessionDetail activity={a} open={isOpen} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SessionDetail({ activity: a, open }: { activity: RecentActivity; open: boolean }) {
  const isRun = a.category === "run" && a.distanceM > 0;
  const metrics: { label: string; value: string }[] = [];
  if (isRun) {
    metrics.push({ label: "Distance", value: `${km(a.distanceM, 2)} km` });
    metrics.push({ label: "Moving", value: duration(a.movingTime) });
    metrics.push({ label: "Pace", value: `${pace(a.paceSecPerKm ?? 0)}/km` });
  } else {
    metrics.push({ label: "Moving", value: duration(a.movingTime) });
    metrics.push({ label: "Elapsed", value: duration(a.elapsedTime) });
  }
  if (a.averageHeartrate)
    metrics.push({
      label: "Avg / Max HR",
      value: `${Math.round(a.averageHeartrate)}${a.maxHeartrate ? ` / ${a.maxHeartrate}` : ""}`,
    });
  if (a.averageWatts) metrics.push({ label: "Avg power", value: `${Math.round(a.averageWatts)} W` });
  if (isRun && a.elevationM > 0)
    metrics.push({ label: "Elevation", value: `${Math.round(a.elevationM)} m` });
  if (a.calories) metrics.push({ label: "Calories", value: String(a.calories) });
  metrics.push({ label: "Rel. effort", value: String(a.relativeEffort) });
  if (a.achievementCount > 0)
    metrics.push({ label: "Achievements", value: String(a.achievementCount) });
  if (a.kudos > 0) metrics.push({ label: "Kudos", value: String(a.kudos) });

  return (
    <div
      id={`detail-${a.id}`}
      className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
      style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
    >
      <div className="overflow-hidden">
        <div className="pb-4 pl-[3.1rem] pr-1 pt-1">
          {a.description && (
            <p className="mb-3 whitespace-pre-line text-pretty text-xs leading-relaxed text-ink-3">
              {a.description}
            </p>
          )}

          <div className="flex flex-col gap-3 lg:flex-row">
            {a.mapPolyline && (
              <div className="overflow-hidden rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--panel-2)] lg:w-2/5">
                <RouteMap polyline={a.mapPolyline} className="h-40 w-full lg:h-full" />
              </div>
            )}

            <div className="flex-1">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {metrics.map((m) => (
                  <div
                    key={m.label}
                    className="rounded-[var(--r-sm)] border border-[var(--line)] bg-[oklch(1_0_0/0.02)] px-2.5 py-2"
                  >
                    <p className="kicker text-[0.6rem]">{m.label}</p>
                    <p className="mt-1 mono text-sm font-medium leading-none tnum">{m.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {a.bestEfforts.length > 0 && (
            <div className="mt-3">
              <p className="kicker mb-2">Best-effort splits</p>
              <div className="flex flex-wrap gap-1.5">
                {a.bestEfforts.map((e) => (
                  <span
                    key={e.name}
                    className="mono rounded-[var(--r-sm)] border border-[var(--line)] bg-[oklch(1_0_0/0.02)] px-2 py-1 text-xs"
                  >
                    <span className="text-ink-4">{e.name}</span>{" "}
                    <span className="text-ink-2">{duration(e.seconds)}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
