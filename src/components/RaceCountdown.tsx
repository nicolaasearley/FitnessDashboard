"use client";

import { useEffect, useState } from "react";
import type { RaceCountdown as Race } from "@/lib/training/derive";
import { TargetIcon, MapPinIcon } from "./icons";

interface Props {
  races: Race[];
  primary: Race;
}

interface Parts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

function diff(target: number, now: number): Parts {
  let ms = target - now;
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  const days = Math.floor(ms / 86400000);
  ms -= days * 86400000;
  const hours = Math.floor(ms / 3600000);
  ms -= hours * 3600000;
  const minutes = Math.floor(ms / 60000);
  ms -= minutes * 60000;
  const seconds = Math.floor(ms / 1000);
  return { days, hours, minutes, seconds, done: false };
}

const pad = (n: number) => String(n).padStart(2, "0");

const priorityLabel: Record<Race["priority"], string> = {
  A: "A · Goal race",
  B: "B",
  C: "C",
};

export function RaceCountdown({ races, primary }: Props) {
  const target = Date.parse(primary.date);
  const [parts, setParts] = useState<Parts>(() => diff(target, Date.now()));

  useEffect(() => {
    const id = setInterval(() => setParts(diff(target, Date.now())), 1000);
    setParts(diff(target, Date.now()));
    return () => clearInterval(id);
  }, [target]);

  const raceDate = new Date(primary.date).toLocaleDateString("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="grid gap-7 lg:grid-cols-[1.15fr_0.85fr] lg:gap-9">
      {/* Countdown */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2.5">
          <span className="chip chip-accent">{priorityLabel[primary.priority]}</span>
          <span className="kicker">Countdown</span>
        </div>

        <h2 className="mt-5 text-balance text-[2rem] font-semibold leading-[1.05] tracking-[-0.02em] sm:text-[2.6rem]">
          {primary.name}
        </h2>
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-3">
          <span className="inline-flex items-center gap-1.5">
            <MapPinIcon width={15} height={15} className="text-ink-4" />
            {primary.location}
          </span>
          <span className="text-ink-4">{raceDate}</span>
          {primary.partner && (
            <span className="text-ink-4">
              with <span className="text-ink-3">{primary.partner}</span>
            </span>
          )}
        </p>

        {/* The clock */}
        <div className="mt-7 flex items-end gap-5 sm:gap-7" suppressHydrationWarning>
          <div className="flex flex-col">
            <span
              className="mono text-[clamp(3.4rem,11vw,5.5rem)] font-medium leading-[0.85] tracking-[-0.03em] text-accent-bright"
              style={{ textShadow: "0 0 32px var(--accent-glow)" }}
              suppressHydrationWarning
            >
              {parts.days}
            </span>
            <span className="kicker mt-2.5">Days to go</span>
          </div>
          <div className="flex flex-col pb-1">
            <span
              className="mono text-[clamp(1.6rem,5vw,2.4rem)] font-medium leading-none tracking-tight tnum"
              suppressHydrationWarning
            >
              {pad(parts.hours)}
              <span className="text-ink-4">:</span>
              {pad(parts.minutes)}
              <span className="text-ink-4">:</span>
              {pad(parts.seconds)}
            </span>
            <span className="kicker mt-2.5">Hrs · Min · Sec</span>
          </div>
        </div>

        {primary.target && (
          <div className="mt-7 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-[var(--r-md)] border border-[var(--accent-line)] bg-[var(--accent-soft)] px-3.5 py-2">
              <TargetIcon width={17} height={17} className="text-accent-bright" />
              <span className="text-sm text-ink-2">
                Target <span className="font-semibold text-ink">{primary.target}</span>
              </span>
            </span>
            {primary.note && (
              <span className="max-w-sm text-pretty text-sm text-ink-4">{primary.note}</span>
            )}
          </div>
        )}
      </div>

      {/* Race-weekend ledger */}
      <div className="flex flex-col justify-center gap-2.5 border-t border-[var(--line)] pt-6 lg:border-l lg:border-t-0 lg:pl-9 lg:pt-0">
        <span className="kicker mb-1">Race weekend · Toronto</span>
        <ol className="flex flex-col gap-2.5">
          {races.map((r) => {
            const isPrimary = r.priority === "A";
            const d = new Date(r.date);
            return (
              <li
                key={r.id}
                className="flex items-center gap-3 rounded-[var(--r-md)] px-3 py-2.5 transition-colors"
                style={
                  isPrimary
                    ? { background: "var(--accent-soft)", border: "1px solid var(--accent-line)" }
                    : { border: "1px solid var(--line)" }
                }
              >
                <div className="flex w-11 shrink-0 flex-col items-center">
                  <span className="mono text-[0.65rem] uppercase tracking-wider text-ink-4">
                    {d.toLocaleDateString("en-CA", { month: "short" })}
                  </span>
                  <span className="mono text-xl font-medium leading-none">{d.getDate()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{r.event}</p>
                  <p className="truncate text-xs text-ink-4">
                    {d.toLocaleDateString("en-CA", { weekday: "long" })}
                    {r.partner ? ` · ${r.partner}` : ""}
                    {r.target ? ` · ${r.target}` : ""}
                  </p>
                </div>
                <span
                  className={`mono text-[0.6rem] font-semibold ${
                    isPrimary ? "text-accent-bright" : "text-ink-4"
                  }`}
                >
                  {r.priority}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
