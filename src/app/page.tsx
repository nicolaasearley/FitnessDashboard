import { getStravaSource, isLive } from "@/lib/strava";
import { buildDashboard } from "@/lib/training/derive";
import { StravaStatus } from "@/components/StravaStatus";

// Render per-request so the Strava connection status (token presence, read from
// disk) is always accurate — otherwise a build-time static prerender freezes it
// to "Snapshot". The underlying Strava fetches stay cached (revalidate: 600 in
// live-source), so this adds no extra API calls and keeps the ~10-min cadence.
export const dynamic = "force-dynamic";
import { Reveal } from "@/components/Reveal";
import { RailNav } from "@/components/RailNav";
import { TopBar } from "@/components/TopBar";
import { RaceCountdown } from "@/components/RaceCountdown";
import { BlockPanel } from "@/components/BlockPanel";
import { WeekPanel } from "@/components/WeekPanel";
import { ZonePanel } from "@/components/ZonePanel";
import { TargetPaces } from "@/components/TargetPaces";
import { RecentList } from "@/components/RecentList";
import { PrPanel } from "@/components/PrPanel";
import { HighlightsPanel } from "@/components/HighlightsPanel";

export default async function Home() {
  const source = getStravaSource();
  const snapshot = await source.getSnapshot();
  const d = buildDashboard(snapshot);
  const live = isLive();

  return (
    <>
      <RailNav />

      <main className="mx-auto max-w-[1320px] px-4 pb-24 pt-6 sm:px-6 lg:pl-[92px] lg:pr-8">
        <Reveal>
          <TopBar
            name={d.athleteName}
            location={d.location}
            blockName="Sub-60 Build"
            weekNumber={d.block.weekNumber}
            referenceDate={d.referenceDate}
          />
        </Reveal>

        {/* OVERVIEW — the race countdown is the centrepiece */}
        <section id="overview" className="mt-7 scroll-mt-6">
          <Reveal>
            <div className="panel panel-hero panel-pad">
              <RaceCountdown races={d.races} primary={d.primaryRace} />
            </div>
          </Reveal>
        </section>

        {/* TRAINING — current cycle */}
        <section id="training" className="mt-5 scroll-mt-6">
          <div className="grid gap-5 lg:grid-cols-3">
            <Reveal delay={0}>
              <BlockPanel block={d.block} />
            </Reveal>
            <Reveal delay={70}>
              <WeekPanel week={d.week} />
            </Reveal>
            <Reveal delay={140}>
              <ZonePanel zones={d.zones} />
            </Reveal>
          </div>
          <Reveal delay={60} className="mt-5">
            <TargetPaces paces={d.targetPaces} />
          </Reveal>
        </section>

        {/* ACTIVITY — recent sessions */}
        <section id="activity" className="mt-5 scroll-mt-6">
          <Reveal>
            <RecentList activities={d.recent} referenceDate={d.referenceDate} />
          </Reveal>
        </section>

        {/* RECORDS */}
        <section id="records" className="mt-5 scroll-mt-6">
          <Reveal>
            <PrPanel prs={d.prs} />
          </Reveal>
        </section>

        {/* SEASON */}
        <section id="season" className="mt-5 scroll-mt-6">
          <Reveal>
            <HighlightsPanel highlights={d.highlights} />
          </Reveal>
        </section>

        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-4">
          <StravaStatus live={live} fetchedAt={snapshot.fetched_at} />
          <a
            href="https://www.strava.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-[var(--r-pill)] border border-[var(--line-2)] px-2.5 py-1 transition-colors hover:border-[color-mix(in_oklch,#fc4c02,transparent_50%)]"
          >
            <span className="font-semibold" style={{ color: "#fc5200" }}>
              Powered by Strava
            </span>
          </a>
        </footer>
      </main>
    </>
  );
}
