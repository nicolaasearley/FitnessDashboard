"use client";

import { useEffect, useState } from "react";
import { GridIcon, PulseIcon, RunIcon, TrophyIcon, SparkIcon } from "./icons";

const ITEMS = [
  { id: "overview", label: "Overview", Icon: GridIcon },
  { id: "training", label: "Training", Icon: PulseIcon },
  { id: "activity", label: "Activity", Icon: RunIcon },
  { id: "records", label: "Records", Icon: TrophyIcon },
  { id: "season", label: "Season", Icon: SparkIcon },
];

export function RailNav() {
  const [active, setActive] = useState("overview");

  useEffect(() => {
    const sections = ITEMS.map((i) => document.getElementById(i.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5] },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <nav
      aria-label="Sections"
      className="fixed left-0 top-0 z-[var(--z-nav)] hidden h-dvh w-[68px] flex-col items-center justify-between border-r border-[var(--line)] bg-[oklch(0.16_0.012_248/0.7)] py-5 backdrop-blur-xl lg:flex"
    >
      <a
        href="#overview"
        className="flex h-10 w-10 items-center justify-center rounded-[var(--r-md)] border border-[var(--accent-line)] bg-[var(--accent-soft)] mono text-sm font-semibold text-accent-bright"
        aria-label="Top"
      >
        NE
      </a>

      <ul className="flex flex-col items-center gap-1.5">
        {ITEMS.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                title={label}
                aria-current={isActive ? "true" : undefined}
                className="group relative flex h-11 w-11 items-center justify-center rounded-[var(--r-md)] transition-colors"
                style={{
                  color: isActive ? "var(--accent-bright)" : "var(--ink-4)",
                  background: isActive ? "var(--accent-soft)" : "transparent",
                }}
              >
                <Icon width={20} height={20} />
                <span className="sr-only">{label}</span>
                {isActive && (
                  <span className="absolute -left-[5px] h-5 w-[3px] rounded-full bg-[var(--accent-bright)]" />
                )}
              </a>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col items-center gap-1.5" title="Synced with Strava">
        <span className="live-dot h-2 w-2 rounded-full bg-[var(--pos)]" />
        <span className="mono rotate-180 text-[0.55rem] uppercase tracking-widest text-ink-4 [writing-mode:vertical-rl]">
          Synced
        </span>
      </div>
    </nav>
  );
}
