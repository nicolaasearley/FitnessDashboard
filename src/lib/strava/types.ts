/**
 * Types modelled on Strava's REST API v3 response shapes.
 *
 * Keeping these aligned with Strava means the only thing that changes when we
 * swap the mock data source for a live OAuth client is *where the JSON comes
 * from* — not the shape the UI consumes. Distances are metres, durations are
 * seconds, speeds are metres/second, exactly as Strava returns them.
 */

export type SportType =
  | "Run"
  | "Ride"
  | "WeightTraining"
  | "Workout"
  | "Walk"
  | "Yoga"
  | "Rowing"
  | "PhysicalTherapy"
  | "HighIntensityIntervalTraining"
  | "Hike"
  | "Swim"
  | (string & {});

export type WorkoutType = "race" | "long_run" | "workout" | "default";

/** Mirrors Strava's SummaryActivity (with the extra effort/calorie fields the API exposes on detail). */
export interface SummaryActivity {
  id: string;
  name: string;
  sport_type: SportType;
  /** ISO local datetime, e.g. "2026-06-13T07:14:47". */
  start_date_local: string;
  gear_id?: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  average_speed: number;
  max_speed: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_watts?: number;
  /** Strava "relative effort" / suffer score. */
  relative_effort?: number;
  calories?: number;
  achievement_count: number;
  pr_count: number;
  kudos_count: number;
  description?: string;
  workout_type?: WorkoutType;
  /** Strava reduced/encoded route polyline (precision 5). Absent for indoor runs. */
  map_polyline?: string;
}

/** A single best-effort split within an activity (Strava best_efforts[]). */
export interface BestEffort {
  name: string;
  distance: number;
  elapsed_time: number;
}

export interface AthleteProfile {
  id: number;
  firstname: string;
  lastname: string;
  sex: "M" | "F" | (string & {});
  weight: number;
  city: string;
  state: string;
  country: string;
  /** "meters" | "feet" — drives unit display. */
  measurement_preference: "meters" | "feet" | (string & {});
}

export interface HeartRateZone {
  min: number;
  /** -1 means "no upper bound" (top zone). */
  max: number;
}

export interface AthleteZones {
  heart_rate: {
    source: string;
    zones: HeartRateZone[];
  };
  run_pace: {
    source: string;
    sample_race_pace?: { best_effort_type: string; time: string; is_estimated: boolean };
    /** Zone boundaries expressed as speed in m/s. */
    zones_speed_ms: HeartRateZone[];
  };
  power: {
    source: string;
    ftp: number;
    ftp_is_estimated: boolean;
  };
}

export interface Gear {
  id: string;
  type: "shoe" | "bike" | (string & {});
  name: string;
  nickname?: string;
  brand?: string;
  model_name?: string;
  /** Lifetime distance in metres. */
  distance: number;
  retired: boolean;
}

export interface SeasonStat {
  count: number;
  distance?: number;
  moving_time?: number;
  elevation_gain?: number;
}

export interface SeasonTotals {
  range_start: string;
  range_end: string;
  run: SeasonStat;
  all: SeasonStat;
}

/** Name/date for a best-effort source activity not present in the main list. */
export interface BestEffortActivityMeta {
  name: string;
  start_date_local: string;
}

/** The full payload the dashboard consumes for one render. */
export interface StravaSnapshot {
  fetched_at: string;
  athlete: AthleteProfile;
  zones: AthleteZones;
  gear: Gear[];
  activities: SummaryActivity[];
  best_efforts_by_activity: Record<string, BestEffort[]>;
  /** Metadata for best-effort activities outside the recent-window list (e.g. prior seasons). */
  best_effort_activity_meta?: Record<string, BestEffortActivityMeta>;
  season_totals_2026: SeasonTotals;
}
