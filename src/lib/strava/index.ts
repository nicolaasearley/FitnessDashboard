import type { StravaDataSource } from "./source";
import type { StravaSnapshot } from "./types";
import { MockStravaSource } from "./mock-source";
import { LiveStravaSource } from "./live-source";
import { isConfigured } from "./oauth";
import { hasTokenSync } from "./token-store";

/**
 * Selects the data source. When the Strava app is configured (client id/secret)
 * AND the owner has connected (a refresh token is stored), the dashboard reads
 * live from Strava. Otherwise it serves the committed real-data snapshot — so
 * the site always renders, even before Strava is linked. The rest of the app
 * imports only this factory, so the swap is fully contained here.
 */
export function getStravaSource(): StravaDataSource {
  if (isConfigured() && hasTokenSync()) {
    return new LiveStravaSource();
  }
  return new MockStravaSource();
}

/** True when reading live from Strava (vs the committed snapshot). */
export function isLive(): boolean {
  return isConfigured() && hasTokenSync();
}

/**
 * Fetches the dashboard data with a safety net: when Strava is connected we read
 * live, but if that fetch fails for *any* reason — rate limit (429), outage,
 * expired token — we fall back to the committed snapshot rather than 500-ing the
 * whole page. `live` reports whether the returned data actually came from Strava.
 */
export async function getDashboardSnapshot(): Promise<{ snapshot: StravaSnapshot; live: boolean }> {
  if (isLive()) {
    try {
      const snapshot = await new LiveStravaSource().getSnapshot();
      return { snapshot, live: true };
    } catch (e) {
      console.error("Live Strava fetch failed; serving committed snapshot instead:", e);
    }
  }
  return { snapshot: await new MockStravaSource().getSnapshot(), live: false };
}

export type { StravaDataSource } from "./source";
export * from "./types";
