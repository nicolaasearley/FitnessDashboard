import { config } from "@/config/goals";
import type {
  AthleteZones,
  BestEffort,
  StravaSnapshot,
  SummaryActivity,
} from "@/lib/strava/types";
import { paceFromDistance } from "./format";

/* ----------------------------------------------------------------------------
 * View-model types — what the UI renders.
 * ------------------------------------------------------------------------- */

export interface BlockState {
  name: string;
  weekNumber: number;
  totalWeeks: number;
  phase: string;
  /** Current phase's primary focus + checkpoint, straight from the plan. */
  phaseFocus: string;
  phaseCheckpoint: string;
  /** Phases in order, with active flag, for the phase rail. */
  phases: { name: string; short: string; active: boolean; startWeek: number; endWeek: number }[];
  /** 0..1 progress through the whole block. */
  progress: number;
  daysToGoal: number;
  weeklyVolumeTargetKm: number;
}

export interface WeekStat {
  /** ISO date of the Monday that starts the week. */
  weekStart: string;
  volumeKm: number;
  loadSum: number;
  runCount: number;
  sessionCount: number;
  movingSeconds: number;
}

export interface WeekSummary {
  current: WeekStat;
  previous: WeekStat;
  volumeDeltaPct: number;
  loadDelta: number;
  /** Last N weeks oldest→newest, for the trend chart. */
  series: WeekStat[];
}

export interface ZoneSlice {
  index: number; // 1..5
  label: string;
  /** Lower/upper bpm bounds (upper -1 = open). */
  min: number;
  max: number;
  seconds: number;
  fraction: number; // 0..1 of total zoned time
}

export interface ZoneDistribution {
  slices: ZoneSlice[];
  totalSeconds: number;
  windowDays: number;
  runCountWithHr: number;
}

export interface PrEffort {
  seconds: number;
  date: string;
  activityName: string;
}

export interface PrRecord {
  label: string;
  distance: number;
  seconds: number;
  date: string;
  activityName: string;
  /** Improvement over the previous best in the dataset, seconds (positive = faster now). */
  improvementSeconds: number | null;
  paceSecPerKm: number;
  /** Every recorded effort at this distance, fastest first (for the detail view). */
  history: PrEffort[];
}

export interface BestEffortSplit {
  name: string;
  seconds: number;
  paceSecPerKm: number;
}

export interface RecentActivity {
  id: string;
  name: string;
  sportType: string;
  category: "run" | "strength" | "ride" | "cross" | "recovery" | "other";
  startLocal: string;
  distanceM: number;
  movingTime: number;
  elapsedTime: number;
  elevationM: number;
  paceSecPerKm: number | null;
  averageHeartrate?: number;
  maxHeartrate?: number;
  averageWatts?: number;
  calories?: number;
  kudos: number;
  relativeEffort: number;
  prCount: number;
  achievementCount: number;
  isRace: boolean;
  isWorkout: boolean;
  description?: string;
  /** Encoded route polyline for outdoor runs (drives the route map). */
  mapPolyline?: string;
  /** Best-effort splits for runs where we have them, for the detail view. */
  bestEfforts: BestEffortSplit[];
}

export interface Highlights {
  currentStreakDays: number;
  longestStreakDays: number;
  seasonRunKm: number;
  seasonRunHours: number;
  seasonElevationM: number;
  seasonRunCount: number;
  seasonAllCount: number;
  /** Distance breakdown (GPS-recorded vs manual corrections) for transparency. */
  seasonRunBreakdown: { label: string; km: number }[];
  prsThisBlock: number;
  achievementsThisBlock: number;
  /** A standout single session. */
  bigSession: { name: string; date: string; distanceKm: number; relativeEffort: number };
}

export interface RaceCountdown {
  id: string;
  name: string;
  event: string;
  date: string;
  location: string;
  priority: "A" | "B" | "C";
  target?: string;
  partner?: string;
  note?: string;
}

export interface Dashboard {
  athleteName: string;
  athleteFirst: string;
  location: string;
  referenceDate: string; // ISO — anchors weekly/training math to the data
  block: BlockState;
  races: RaceCountdown[];
  primaryRace: RaceCountdown;
  targetPaces: { label: string; paceSecPerKm: number; context: string }[];
  week: WeekSummary;
  zones: ZoneDistribution;
  prs: PrRecord[];
  recent: RecentActivity[];
  highlights: Highlights;
}

/* ----------------------------------------------------------------------------
 * Date helpers (local, Monday-based weeks).
 * ------------------------------------------------------------------------- */

const DAY = 86400000;

function atMidnight(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Monday 00:00 of the week containing `d`. */
function weekStart(d: Date): Date {
  const m = atMidnight(d);
  const dow = (m.getDay() + 6) % 7; // 0 = Monday
  return new Date(m.getTime() - dow * DAY);
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((atMidnight(b).getTime() - atMidnight(a).getTime()) / DAY);
}

/* ----------------------------------------------------------------------------
 * Categorisation.
 * ------------------------------------------------------------------------- */

function categorise(sport: string): RecentActivity["category"] {
  switch (sport) {
    case "Run":
      return "run";
    case "WeightTraining":
      return "strength";
    case "Ride":
      return "ride";
    case "Workout":
    case "HighIntensityIntervalTraining":
    case "Rowing":
      return "cross";
    case "PhysicalTherapy":
    case "Yoga":
    case "Walk":
      return "recovery";
    default:
      return "other";
  }
}

/* ----------------------------------------------------------------------------
 * Block.
 * ------------------------------------------------------------------------- */

function deriveBlock(reference: Date): BlockState {
  const start = new Date(config.block.start + "T00:00:00");
  const goal = new Date(config.block.goalDate + "T00:00:00");
  const elapsedDays = Math.max(0, daysBetween(start, reference));
  const totalDays = Math.max(1, daysBetween(start, goal));
  const weekNumber = Math.min(config.block.totalWeeks, Math.max(1, Math.floor(elapsedDays / 7) + 1));
  const activePhase =
    config.block.phases.find((p) => weekNumber >= p.startWeek && weekNumber <= p.endWeek) ??
    config.block.phases[0];
  return {
    name: config.block.name,
    weekNumber,
    totalWeeks: config.block.totalWeeks,
    phase: activePhase.name,
    phaseFocus: activePhase.focus,
    phaseCheckpoint: activePhase.checkpoint,
    phases: config.block.phases.map((p) => ({
      name: p.name,
      short: p.short,
      startWeek: p.startWeek,
      endWeek: p.endWeek,
      active: weekNumber >= p.startWeek && weekNumber <= p.endWeek,
    })),
    progress: Math.min(1, elapsedDays / totalDays),
    daysToGoal: Math.max(0, daysBetween(reference, goal)),
    weeklyVolumeTargetKm: activePhase.volumeKm,
  };
}

/* ----------------------------------------------------------------------------
 * Weekly stats.
 * ------------------------------------------------------------------------- */

function emptyWeek(start: Date): WeekStat {
  return {
    weekStart: atMidnight(start).toISOString(),
    volumeKm: 0,
    loadSum: 0,
    runCount: 0,
    sessionCount: 0,
    movingSeconds: 0,
  };
}

function statForWeek(activities: SummaryActivity[], start: Date): WeekStat {
  const end = new Date(start.getTime() + 7 * DAY);
  const stat = emptyWeek(start);
  for (const a of activities) {
    const t = new Date(a.start_date_local);
    if (t >= start && t < end) {
      stat.sessionCount += 1;
      stat.loadSum += a.relative_effort ?? 0;
      stat.movingSeconds += a.moving_time;
      if (a.sport_type === "Run") {
        stat.runCount += 1;
        stat.volumeKm += a.distance / 1000;
      }
    }
  }
  stat.volumeKm = Math.round(stat.volumeKm * 10) / 10;
  return stat;
}

function deriveWeek(activities: SummaryActivity[], reference: Date, weeks = 8): WeekSummary {
  const thisStart = weekStart(reference);
  const current = statForWeek(activities, thisStart);
  const previous = statForWeek(activities, new Date(thisStart.getTime() - 7 * DAY));
  const series: WeekStat[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    series.push(statForWeek(activities, new Date(thisStart.getTime() - i * 7 * DAY)));
  }
  const volumeDeltaPct =
    previous.volumeKm > 0 ? ((current.volumeKm - previous.volumeKm) / previous.volumeKm) * 100 : 0;
  return {
    current,
    previous,
    volumeDeltaPct: Math.round(volumeDeltaPct),
    loadDelta: current.loadSum - previous.loadSum,
    series,
  };
}

/* ----------------------------------------------------------------------------
 * HR zone distribution (over a trailing window, bucketed by session avg HR).
 * ------------------------------------------------------------------------- */

const ZONE_LABELS = ["Recovery", "Endurance", "Tempo", "Threshold", "VO₂ Max"];

function deriveZones(
  activities: SummaryActivity[],
  zones: AthleteZones,
  reference: Date,
  windowDays = 28,
): ZoneDistribution {
  const cutoff = new Date(atMidnight(reference).getTime() - (windowDays - 1) * DAY);
  const hrZones = zones.heart_rate.zones;
  const seconds = new Array(hrZones.length).fill(0);
  let runCountWithHr = 0;

  for (const a of activities) {
    if (a.sport_type !== "Run" || a.average_heartrate == null) continue;
    const t = new Date(a.start_date_local);
    if (t < cutoff) continue;
    const hr = a.average_heartrate;
    // Assign by upper bound so values landing in the 1-bpm gap between
    // adjacent zone boundaries (e.g. 151.7 between Z2≤151 and Z3≥152) map to
    // the correct zone instead of falling through to the top zone.
    let idx = hrZones.length - 1;
    for (let i = 0; i < hrZones.length; i++) {
      const z = hrZones[i];
      if (z.max === -1 || hr <= z.max) {
        idx = i;
        break;
      }
    }
    seconds[idx] += a.moving_time;
    runCountWithHr += 1;
  }

  const total = seconds.reduce((s: number, v: number) => s + v, 0);
  const slices: ZoneSlice[] = hrZones.map((z, i) => ({
    index: i + 1,
    label: ZONE_LABELS[i] ?? `Z${i + 1}`,
    min: z.min,
    max: z.max,
    seconds: seconds[i],
    fraction: total > 0 ? seconds[i] / total : 0,
  }));

  return { slices, totalSeconds: total, windowDays, runCountWithHr };
}

/* ----------------------------------------------------------------------------
 * Personal records (best efforts → PR per distance with deltas).
 * ------------------------------------------------------------------------- */

const PR_DISTANCES = [
  { key: "1K", label: "1 K", distance: 1000 },
  { key: "1 mile", label: "1 Mile", distance: 1609 },
  { key: "5K", label: "5 K", distance: 5000 },
  { key: "10K", label: "10 K", distance: 10000 },
  { key: "Half-Marathon", label: "Half Marathon", distance: 21097 },
];

function derivePrs(
  bestEfforts: Record<string, BestEffort[]>,
  activities: SummaryActivity[],
  meta: Record<string, { name: string; start_date_local: string }> = {},
): PrRecord[] {
  const activityById = new Map(activities.map((a) => [a.id, a]));
  const resolve = (id: string): { name: string; date: string } => {
    const a = activityById.get(id);
    if (a) return { name: a.name, date: a.start_date_local };
    const m = meta[id];
    return { name: m?.name ?? "", date: m?.start_date_local ?? "" };
  };

  return PR_DISTANCES.map(({ key, label, distance }) => {
    // Collect every (time, activityId) for this distance across all activities.
    const efforts: { seconds: number; activityId: string }[] = [];
    for (const [activityId, list] of Object.entries(bestEfforts)) {
      for (const e of list) {
        if (e.name === key) efforts.push({ seconds: e.elapsed_time, activityId });
      }
    }
    if (efforts.length === 0) return null;
    efforts.sort((a, b) => a.seconds - b.seconds);
    const best = efforts[0];
    const previous = efforts.find((e) => e.activityId !== best.activityId);
    const bestMeta = resolve(best.activityId);
    const history: PrEffort[] = efforts.map((e) => {
      const r = resolve(e.activityId);
      return { seconds: e.seconds, date: r.date, activityName: r.name };
    });
    return {
      label,
      distance,
      seconds: best.seconds,
      date: bestMeta.date,
      activityName: bestMeta.name,
      improvementSeconds: previous ? previous.seconds - best.seconds : null,
      paceSecPerKm: paceFromDistance(distance, best.seconds),
      history,
    } satisfies PrRecord;
  }).filter((x): x is PrRecord => x !== null);
}

/* ----------------------------------------------------------------------------
 * Recent activities.
 * ------------------------------------------------------------------------- */

// Canonical order for best-effort splits in the detail view.
const EFFORT_ORDER = ["400m", "1/2 mile", "1K", "1 mile", "2 mile", "5K", "10K", "15K", "10 mile", "20K", "Half-Marathon"];

function deriveRecent(
  activities: SummaryActivity[],
  bestEfforts: Record<string, BestEffort[]>,
  count = 8,
): RecentActivity[] {
  return activities.slice(0, count).map((a) => {
    const efforts = bestEfforts[a.id] ?? [];
    const bestEffortSplits: BestEffortSplit[] = efforts
      .map((e) => ({
        name: e.name,
        seconds: e.elapsed_time,
        paceSecPerKm: paceFromDistance(e.distance, e.elapsed_time),
      }))
      .sort((x, y) => EFFORT_ORDER.indexOf(x.name) - EFFORT_ORDER.indexOf(y.name));
    return {
      id: a.id,
      name: a.name,
      sportType: a.sport_type,
      category: categorise(a.sport_type),
      startLocal: a.start_date_local,
      distanceM: a.distance,
      movingTime: a.moving_time,
      elapsedTime: a.elapsed_time,
      elevationM: a.total_elevation_gain,
      paceSecPerKm:
        a.sport_type === "Run" && a.distance > 0
          ? paceFromDistance(a.distance, a.moving_time)
          : null,
      averageHeartrate: a.average_heartrate,
      maxHeartrate: a.max_heartrate,
      averageWatts: a.average_watts,
      calories: a.calories,
      kudos: a.kudos_count,
      relativeEffort: a.relative_effort ?? 0,
      prCount: a.pr_count,
      achievementCount: a.achievement_count,
      isRace: a.workout_type === "race",
      isWorkout: a.workout_type === "workout" || a.workout_type === "long_run",
      description: a.description,
      mapPolyline: a.sport_type === "Run" ? a.map_polyline : undefined,
      bestEfforts: bestEffortSplits,
    };
  });
}

/* ----------------------------------------------------------------------------
 * Streaks + highlights.
 * ------------------------------------------------------------------------- */

function deriveStreaks(activities: SummaryActivity[], reference: Date): { current: number; longest: number } {
  const days = new Set(
    activities.map((a) => atMidnight(new Date(a.start_date_local)).getTime()),
  );
  // Current streak: count back from the reference day while days are present.
  let current = 0;
  let cursor = atMidnight(reference).getTime();
  // Allow the streak to start "yesterday" if nothing logged yet today.
  if (!days.has(cursor)) cursor -= DAY;
  while (days.has(cursor)) {
    current += 1;
    cursor -= DAY;
  }
  // Longest streak across the dataset.
  const sorted = [...days].sort((a, b) => a - b);
  let longest = 0;
  let run = 0;
  let prev: number | null = null;
  for (const d of sorted) {
    run = prev !== null && d - prev === DAY ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = d;
  }
  return { current, longest };
}

function deriveHighlights(snapshot: StravaSnapshot, reference: Date): Highlights {
  const { activities, season_totals_2026: season } = snapshot;
  const streaks = deriveStreaks(activities, reference);

  const prsThisBlock = activities.reduce((s, a) => s + a.pr_count, 0);
  const achievementsThisBlock = activities.reduce((s, a) => s + a.achievement_count, 0);

  const big = [...activities].sort(
    (a, b) => (b.relative_effort ?? 0) - (a.relative_effort ?? 0),
  )[0];

  // Running-only totals: GPS-recorded runs + manual corrections for runs Strava
  // logged with no distance (treadmill, mixed cardio). Cycling/other excluded.
  const gpsKm = (season.run.distance ?? 0) / 1000;
  const gpsSeconds = season.run.moving_time ?? 0;
  const manual = config.manualRunAdjustments;
  const manualKm = manual.reduce((s, m) => s + m.distanceKm, 0);
  const manualSeconds = manual.reduce((s, m) => s + m.distanceKm * m.avgPaceSecPerKm, 0);
  const manualSessions = manual.reduce((s, m) => s + m.sessions, 0);

  const seasonRunBreakdown = [
    { label: "GPS-recorded", km: Math.round(gpsKm) },
    ...manual.map((m) => ({ label: m.label, km: Math.round(m.distanceKm) })),
  ];

  return {
    currentStreakDays: streaks.current,
    longestStreakDays: streaks.longest,
    seasonRunKm: Math.round(gpsKm + manualKm),
    // Treadmill/mixed time is estimated from distance × assumed pace (Strava
    // records time on these even when it drops distance; this approximates it).
    seasonRunHours: Math.round((gpsSeconds + manualSeconds) / 3600),
    seasonElevationM: Math.round(season.run.elevation_gain ?? 0),
    seasonRunCount: season.run.count + manualSessions,
    seasonAllCount: season.all.count,
    seasonRunBreakdown,
    prsThisBlock,
    achievementsThisBlock,
    bigSession: {
      name: big.name,
      date: big.start_date_local,
      distanceKm: Math.round((big.distance / 1000) * 10) / 10,
      relativeEffort: big.relative_effort ?? 0,
    },
  };
}

/* ----------------------------------------------------------------------------
 * Top-level assembly.
 * ------------------------------------------------------------------------- */

export function buildDashboard(snapshot: StravaSnapshot, now: Date = new Date()): Dashboard {
  const activities = [...snapshot.activities].sort(
    (a, b) => Date.parse(b.start_date_local) - Date.parse(a.start_date_local),
  );
  // Weekly/zone stats are anchored to the latest activity so the "current week"
  // panel is always populated regardless of when the dashboard is viewed.
  const reference = new Date(activities[0]?.start_date_local ?? snapshot.fetched_at);
  // The training block (week number, phase, progress, days-to-goal) tracks real
  // wall-clock time — it must advance as the calendar does, even on a rest day.
  const blockNow = activities.length ? now : reference;

  const races: RaceCountdown[] = config.goalRaces
    .map((r) => ({ ...r }))
    .sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  const primaryRace = races.find((r) => r.priority === "A") ?? races[0];

  return {
    athleteName: `${snapshot.athlete.firstname} ${snapshot.athlete.lastname}`,
    athleteFirst: snapshot.athlete.firstname,
    location: `${snapshot.athlete.city}, ${snapshot.athlete.state}`,
    referenceDate: reference.toISOString(),
    block: deriveBlock(blockNow),
    races,
    primaryRace,
    targetPaces: config.targetPaces.map((p) => ({
      label: p.label,
      paceSecPerKm: p.secPerKm,
      context: p.context,
    })),
    week: deriveWeek(activities, reference),
    zones: deriveZones(activities, snapshot.zones, reference),
    prs: derivePrs(
      snapshot.best_efforts_by_activity,
      activities,
      snapshot.best_effort_activity_meta ?? {},
    ),
    recent: deriveRecent(activities, snapshot.best_efforts_by_activity),
    highlights: deriveHighlights(snapshot, reference),
  };
}
