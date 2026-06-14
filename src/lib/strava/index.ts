import type { StravaDataSource } from "./source";
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

export type { StravaDataSource } from "./source";
export * from "./types";
