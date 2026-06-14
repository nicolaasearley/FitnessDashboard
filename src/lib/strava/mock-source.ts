import snapshot from "@/data/snapshot.json";
import { config } from "@/config/goals";
import type {
  AthleteProfile,
  AthleteZones,
  BestEffort,
  Gear,
  SeasonTotals,
  StravaSnapshot,
  SummaryActivity,
} from "./types";
import type { StravaDataSource } from "./source";

const data = snapshot as unknown as StravaSnapshot;

/**
 * Reads the committed real-data snapshot. This is the default source: it lets
 * the dashboard run with zero credentials while exercising the exact code path
 * the live source will use.
 */
export class MockStravaSource implements StravaDataSource {
  async getAthleteProfile(): Promise<AthleteProfile> {
    return data.athlete;
  }

  async getAthleteZones(): Promise<AthleteZones> {
    // HR zones come from config (the manual correction), not the snapshot.
    return {
      ...data.zones,
      heart_rate: { ...data.zones.heart_rate, zones: config.heartRateZones },
    };
  }

  async getGear(): Promise<Gear[]> {
    return data.gear;
  }

  async listActivities(limit?: number): Promise<SummaryActivity[]> {
    const sorted = [...data.activities].sort(
      (a, b) => Date.parse(b.start_date_local) - Date.parse(a.start_date_local),
    );
    return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
  }

  async getBestEfforts(): Promise<Record<string, BestEffort[]>> {
    return data.best_efforts_by_activity;
  }

  async getSeasonTotals(): Promise<SeasonTotals> {
    return data.season_totals_2026;
  }

  async getSnapshot(): Promise<StravaSnapshot> {
    return data;
  }
}
