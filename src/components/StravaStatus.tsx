"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  live: boolean;
  fetchedAt: string;
}

export function StravaStatus({ live, fetchedAt }: Props) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  async function handleRefresh() {
    setState("loading");
    await fetch("/api/revalidate", { method: "POST" });
    router.refresh();
    setState("done");
    setTimeout(() => setState("idle"), 2000);
  }

  const dot = (
    <span
      className="h-1.5 w-1.5 shrink-0 rounded-full"
      style={{ background: live ? "var(--pos)" : "var(--ink-4)" }}
    />
  );

  if (live) {
    return (
      <span className="inline-flex items-center gap-2">
        {dot}
        <span>
          Live · updated {new Date(fetchedAt).toLocaleDateString("en-CA")}
        </span>
        <button
          onClick={handleRefresh}
          disabled={state === "loading"}
          className="inline-flex items-center gap-1 rounded-[var(--r-pill)] border border-[var(--line-2)] px-2 py-0.5 transition-colors hover:border-[var(--ink-3)] disabled:opacity-50"
        >
          <span
            className={state === "loading" ? "animate-spin inline-block" : "inline-block"}
            style={{ fontSize: "0.7rem" }}
          >
            ↻
          </span>
          {state === "done" ? "Updated" : state === "loading" ? "Refreshing…" : "Refresh"}
        </button>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      {dot}
      <span>Snapshot · Strava not connected</span>
      <a
        href="/api/strava/connect"
        className="inline-flex items-center gap-1 rounded-[var(--r-pill)] border border-[var(--line-2)] px-2 py-0.5 transition-colors hover:border-[color-mix(in_oklch,#fc4c02,transparent_50%)]"
      >
        Connect →
      </a>
    </span>
  );
}
