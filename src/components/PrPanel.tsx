"use client";

import { useState } from "react";
import type { PrRecord } from "@/lib/training/derive";
import { duration, pace, shortDate } from "@/lib/training/format";
import { TrophyIcon } from "./icons";

export function PrPanel({ prs }: { prs: PrRecord[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="panel panel-pad">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="kicker">Personal records</p>
          <h3 className="mt-1.5 text-lg font-semibold tracking-tight">Best efforts</h3>
        </div>
        <span className="flex h-8 w-8 items-center justify-center rounded-[var(--r-sm)] border border-[var(--line-2)] text-accent">
          <TrophyIcon width={16} height={16} />
        </span>
      </div>

      <ul className="mt-5 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {prs.map((pr) => {
          const improved = pr.improvementSeconds != null && pr.improvementSeconds > 0;
          const isOpen = open === pr.label;
          return (
            <li key={pr.label}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : pr.label)}
                aria-expanded={isOpen}
                className="group flex w-full flex-col rounded-[var(--r-md)] border bg-[oklch(1_0_0/0.02)] p-3.5 text-left transition-colors"
                style={{ borderColor: isOpen ? "var(--accent-line)" : "var(--line)" }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-ink-2">{pr.label}</span>
                  {improved ? (
                    <span
                      className="mono rounded-full px-2 py-0.5 text-[0.65rem] font-semibold text-pos"
                      style={{ background: "color-mix(in oklch, var(--pos), transparent 85%)" }}
                    >
                      −{duration(pr.improvementSeconds!)}
                    </span>
                  ) : (
                    <span className="mono rounded-full border border-[var(--line)] px-2 py-0.5 text-[0.65rem] text-ink-4">
                      NEW
                    </span>
                  )}
                </div>
                <span className="mt-2 mono text-[1.9rem] font-medium leading-none tracking-tight tnum">
                  {duration(pr.seconds)}
                </span>
                <div className="mt-2.5 flex items-center justify-between text-xs text-ink-4">
                  <span className="mono">{pace(pr.paceSecPerKm)}/km</span>
                  <span>{pr.date ? shortDate(pr.date) : ""}</span>
                </div>

                {/* Detail: which session set it + effort history */}
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <div className="mt-3 border-t border-[var(--line)] pt-3">
                      <p className="text-xs text-ink-3">
                        Set in <span className="text-ink-2">{pr.activityName}</span>
                      </p>
                      {pr.history.length > 1 && (
                        <ul className="mt-2 flex flex-col gap-1">
                          {pr.history.slice(0, 4).map((e, idx) => (
                            <li
                              key={`${e.date}-${idx}`}
                              className="flex items-center justify-between text-xs"
                            >
                              <span className="mono text-ink-3 tnum">{duration(e.seconds)}</span>
                              <span className="truncate px-2 text-ink-4">{e.activityName}</span>
                              <span className="shrink-0 text-ink-4">
                                {e.date ? shortDate(e.date) : ""}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
