import { config } from "@/config/goals";
import historical from "@/data/historical-best-efforts.json";
import { getAccessToken } from "./oauth";
import type {
  AthleteProfile,
  AthleteZones,
  BestEffort,
  BestEffortActivityMeta,
  Gear,
  SeasonTotals,
  StravaSnapshot,
  SummaryActivity,
  WorkoutType,
} from "./types";
import type { StravaDataSource } from "./source";

const STRAVA_API = "https://www.strava.com/api/v3";
// Strava data changes slowly; cache fetches so even dynamic SSR only hits the
// API roughly every 10 minutes (the "on-load refresh" cadence).
const REVALIDATE = 600;

/**
 * Live Strava data source (OAuth). Maps Strava's REST responses onto the same
 * types the mock source returns, so the UI and derivation layer are unchanged.
 * Selected by the factory once the owner has connected (a token is stored).
 */
export class LiveStravaSource implements StravaDataSource {
  private async get<T>(path: string, params?: Record<string, string | number>): Promise<T> {
    const token = await getAccessToken();
    const url = new URL(`${STRAVA_API}${path}`);
    for (const [k, v] of Object.entries(params ?? {})) url.searchParams.set(k, String(v));
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) {
      throw new Error(`Strava API ${res.status} on ${path}: ${await res.text()}`);
    }
    return res.json() as Promise<T>;
  }

  async getAthleteProfile(): Promise<AthleteProfile> {
    const a = await this.get<RawAthlete>("/athlete");
    return {
      id: a.id,
      firstname: a.firstname ?? "",
      lastname: a.lastname ?? "",
      sex: a.sex ?? "M",
      weight: a.weight ?? 0,
      city: a.city ?? "",
      state: a.state ?? "",
      country: a.country ?? "",
      measurement_preference: a.measurement_preference ?? "meters",
    };
  }

  async getAthleteZones(): Promise<AthleteZones> {
    // HR zones are the manual correction in config (Strava reports age-estimated
    // zones the athlete overrode). Pace/power aren't surfaced in the UI.
    return {
      heart_rate: { source: "Manual", zones: config.heartRateZones },
      run_pace: { source: "n/a", zones_speed_ms: [] },
      power: { source: "n/a", ftp: 0, ftp_is_estimated: true },
    };
  }

  async getGear(): Promise<Gear[]> {
    const a = await this.get<RawAthlete>("/athlete");
    const shoes = (a.shoes ?? []).map(
      (s): Gear => ({
        id: s.id,
        type: "shoe",
        name: s.name,
        nickname: s.nickname,
        distance: s.distance ?? 0,
        retired: Boolean(s.retired),
      }),
    );
    return shoes;
  }

  async listActivities(limit = 60): Promise<SummaryActivity[]> {
    const raw = await this.get<RawActivity[]>("/athlete/activities", { per_page: limit });
    return raw.map(mapActivity);
  }

  async getBestEfforts(): Promise<Record<string, BestEffort[]>> {
    const activities = await this.listActivities();
    return this.fetchBestEfforts(activities);
  }

  /** Detailed best efforts for recent GPS runs, merged with the historical cache. */
  private async fetchBestEfforts(
    activities: SummaryActivity[],
  ): Promise<Record<string, BestEffort[]>> {
    const recentRuns = activities
      .filter((a) => a.sport_type === "Run" && a.distance > 0)
      .slice(0, 12);

    const results = await Promise.all(
      recentRuns.map(async (a) => {
        try {
          const detail = await this.get<RawDetailedActivity>(`/activities/${a.id}`);
          const efforts = (detail.best_efforts ?? []).map(
            (e): BestEffort => ({
              name: normalizeEffortName(e.name),
              distance: e.distance,
              elapsed_time: e.elapsed_time,
            }),
          );
          return [a.id, efforts] as const;
        } catch {
          return [a.id, [] as BestEffort[]] as const;
        }
      }),
    );

    const recent: Record<string, BestEffort[]> = {};
    for (const [id, efforts] of results) if (efforts.length) recent[id] = efforts;

    return { ...(historical.best_efforts_by_activity as Record<string, BestEffort[]>), ...recent };
  }

  async getSeasonTotals(): Promise<SeasonTotals> {
    const profile = await this.getAthleteProfile();
    const stats = await this.get<RawStats>(`/athletes/${profile.id}/stats`);
    const ytd = stats.ytd_run_totals;
    const year = new Date().getFullYear();
    return {
      range_start: `${year}-01-01`,
      range_end: new Date().toISOString().slice(0, 10),
      run: {
        count: ytd?.count ?? 0,
        distance: ytd?.distance ?? 0,
        moving_time: ytd?.moving_time ?? 0,
        elevation_gain: ytd?.elevation_gain ?? 0,
      },
      all: { count: ytd?.count ?? 0, moving_time: ytd?.moving_time ?? 0 },
    };
  }

  async getSnapshot(): Promise<StravaSnapshot> {
    const [athlete, zones, activities, season] = await Promise.all([
      this.getAthleteProfile(),
      this.getAthleteZones(),
      this.listActivities(),
      this.getSeasonTotals(),
    ]);
    const gear = await this.getGear().catch(() => []);
    const bestEfforts = await this.fetchBestEfforts(activities);

    return {
      fetched_at: new Date().toISOString(),
      athlete,
      zones,
      gear,
      activities,
      best_efforts_by_activity: bestEfforts,
      best_effort_activity_meta: historical.best_effort_activity_meta as Record<
        string,
        BestEffortActivityMeta
      >,
      season_totals_2026: season,
    };
  }
}

/* ----------------------------------------------------------------------------
 * Raw Strava response shapes (only the fields we use) + mappers.
 * ------------------------------------------------------------------------- */

interface RawAthlete {
  id: number;
  firstname?: string;
  lastname?: string;
  sex?: string;
  weight?: number;
  city?: string;
  state?: string;
  country?: string;
  measurement_preference?: string;
  shoes?: { id: string; name: string; nickname?: string; distance?: number; retired?: boolean }[];
}

interface RawActivity {
  id: number;
  name: string;
  sport_type?: string;
  type?: string;
  start_date_local: string;
  gear_id?: string | null;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  average_speed: number;
  max_speed: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_watts?: number;
  suffer_score?: number;
  calories?: number;
  achievement_count?: number;
  pr_count?: number;
  kudos_count?: number;
  workout_type?: number | null;
  description?: string;
  map?: { summary_polyline?: string; polyline?: string };
}

interface RawDetailedActivity extends RawActivity {
  best_efforts?: { name: string; distance: number; elapsed_time: number }[];
}

interface RawStats {
  ytd_run_totals?: {
    count: number;
    distance: number;
    moving_time: number;
    elevation_gain: number;
  };
}

function mapWorkoutType(wt: number | null | undefined): WorkoutType | undefined {
  switch (wt) {
    case 1:
      return "race";
    case 2:
      return "long_run";
    case 3:
      return "workout";
    default:
      return undefined;
  }
}

function mapActivity(a: RawActivity): SummaryActivity {
  return {
    id: String(a.id),
    name: a.name,
    sport_type: (a.sport_type ?? a.type ?? "Workout") as SummaryActivity["sport_type"],
    start_date_local: a.start_date_local,
    gear_id: a.gear_id ?? undefined,
    distance: a.distance,
    moving_time: a.moving_time,
    elapsed_time: a.elapsed_time,
    total_elevation_gain: a.total_elevation_gain,
    average_speed: a.average_speed,
    max_speed: a.max_speed,
    average_heartrate: a.average_heartrate,
    max_heartrate: a.max_heartrate,
    average_watts: a.average_watts,
    relative_effort: a.suffer_score,
    calories: a.calories,
    achievement_count: a.achievement_count ?? 0,
    pr_count: a.pr_count ?? 0,
    kudos_count: a.kudos_count ?? 0,
    description: a.description,
    workout_type: mapWorkoutType(a.workout_type),
    map_polyline: a.map?.summary_polyline || a.map?.polyline,
  };
}

/** Normalise Strava's effort names to our canonical keys (e.g. "5k" → "5K"). */
function normalizeEffortName(name: string): string {
  const map: Record<string, string> = {
    "1k": "1K",
    "2k": "2K",
    "5k": "5K",
    "10k": "10K",
    "15k": "15K",
    "20k": "20K",
  };
  return map[name.toLowerCase()] ?? name;
}
