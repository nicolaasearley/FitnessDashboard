import type {
  AthleteProfile,
  AthleteZones,
  BestEffort,
  Gear,
  SeasonTotals,
  StravaSnapshot,
  SummaryActivity,
} from "./types";

/**
 * The contract every data source implements. The UI depends only on this
 * interface, so swapping the mock snapshot for a live Strava OAuth client is a
 * one-line change in the factory (./index.ts) with no component churn.
 *
 * Methods are async on purpose: the live implementation performs network I/O.
 */
export interface StravaDataSource {
  getAthleteProfile(): Promise<AthleteProfile>;
  getAthleteZones(): Promise<AthleteZones>;
  getGear(): Promise<Gear[]>;
  /** Newest-first list of activities. `limit` caps the count when provided. */
  listActivities(limit?: number): Promise<SummaryActivity[]>;
  getBestEfforts(): Promise<Record<string, BestEffort[]>>;
  getSeasonTotals(): Promise<SeasonTotals>;
  /** The whole snapshot in one call (mirrors a batched server fetch). */
  getSnapshot(): Promise<StravaSnapshot>;
}
