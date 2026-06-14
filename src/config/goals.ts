/**
 * Editable local configuration.
 *
 * This holds everything Strava's API can't provide: future goal races, the
 * shape of the training block, target paces, and training intent. Values here
 * are sourced from the HYROX Sub-60 Master Plan (16-week program, start Mon
 * Jun 8 2026 → race Sun Oct 3 2026). Edit freely — the dashboard reads these
 * directly. When the live Strava OAuth integration is wired up, athlete
 * activity/zone data comes from Strava while this file keeps owning goals.
 */

export type RacePriority = "A" | "B" | "C";

export interface GoalRace {
  id: string;
  name: string;
  /** Short discipline / event label, e.g. "Pro Doubles". */
  event: string;
  /** Local race date-time, ISO (no timezone suffix). */
  date: string;
  location: string;
  priority: RacePriority;
  /** Optional target finish time, formatted for display (e.g. "Sub 1:00:00"). */
  target?: string;
  /** Race partner(s). */
  partner?: string;
  /** Optional one-line note shown under the race. */
  note?: string;
}

export interface TargetPace {
  label: string;
  /** Pace in seconds per kilometre. */
  secPerKm: number;
  context: string;
}

export interface BlockPhase {
  /** Full phase name. */
  name: string;
  /** Compact label for the phase rail. */
  short: string;
  /** 1-based inclusive week range within the block. */
  startWeek: number;
  endWeek: number;
  /** What this phase is primarily about. */
  focus: string;
  /** The phase's checkpoint / test. */
  checkpoint: string;
  /** Target weekly running volume for this phase, km. */
  volumeKm: number;
}

export interface TrainingBlock {
  name: string;
  /** Block start (a Monday), ISO date. */
  start: string;
  /** Date the block builds toward (the A-race), ISO date. */
  goalDate: string;
  /** Total planned weeks in the program. */
  totalWeeks: number;
  phases: BlockPhase[];
}

/**
 * Manual distance corrections. Strava drops the distance on some indoor /
 * treadmill runs and on mixed-cardio (HYROX) sessions, so the running total it
 * reports is too low. These are real running kilometres the athlete logged that
 * Strava didn't record — added back on top of the GPS-recorded run total.
 */
export interface ManualRunAdjustment {
  label: string;
  sessions: number;
  distanceKm: number;
  /** Assumed average pace (s/km) for estimating the time these add. */
  avgPaceSecPerKm: number;
}

/** A heart-rate zone boundary in bpm (max -1 = open-ended top zone). */
export interface HrZone {
  min: number;
  max: number;
}

export interface AppConfig {
  goalRaces: GoalRace[];
  targetPaces: TargetPace[];
  block: TrainingBlock;
  manualRunAdjustments: ManualRunAdjustment[];
  /**
   * Manually-set heart-rate zones — the source of truth. Strava's API reports
   * age-estimated zones which the athlete has corrected here, so both the mock
   * and live data sources use these instead of whatever Strava returns.
   */
  heartRateZones: HrZone[];
}

export const config: AppConfig = {
  goalRaces: [
    {
      id: "hyrox-pro-doubles",
      name: "HYROX Men's Pro Doubles",
      event: "Men's Pro Doubles",
      date: "2026-10-03T09:00:00",
      location: "Toronto, ON",
      priority: "A",
      target: "Sub 1:00:00",
      partner: "Sean O'Byrne",
      note: "The priority. Current PB 1:04:24 (Ottawa) — chasing sub-60.",
    },
    {
      id: "hyrox-mixed-doubles",
      name: "HYROX Mixed Doubles",
      event: "Mixed Doubles",
      date: "2026-10-01T11:00:00",
      location: "Toronto, ON",
      priority: "B",
      partner: "Jessica Simpson",
      note: "Controlled — treat as a race-weekend warm-up.",
    },
    {
      id: "hyrox-relay",
      name: "HYROX Team Relay",
      event: "Team Relay",
      date: "2026-10-02T13:00:00",
      location: "Toronto, ON",
      priority: "C",
      partner: "Pitek · Leek · Leslie",
      note: "Speed-based but controlled — don't redline before Sunday.",
    },
  ],
  // Pace zones from the master plan (estimates until the Week 1–2 5K time trial
  // recalibrates them).
  targetPaces: [
    { label: "Goal race pace", secPerKm: 245, context: "Sub-60 compromised target" },
    { label: "Threshold", secPerKm: 262, context: "Tempo · 4:15–4:25/km" },
    { label: "VO₂", secPerKm: 240, context: "Short intervals · 3:55–4:05" },
    { label: "Easy · Z2", secPerKm: 322, context: "Base volume · HR 135–145" },
  ],
  block: {
    name: "HYROX Sub-60 Program",
    start: "2026-06-08",
    goalDate: "2026-10-03",
    totalWeeks: 16,
    phases: [
      {
        name: "Aerobic Base",
        short: "Base",
        startWeek: 1,
        endWeek: 4,
        focus: "Raise run volume to 45–50 km/wk; long run out to 18–20 km; introduce plyos.",
        checkpoint: "Wk 1–2: 5K time trial — calibrates every pace zone.",
        volumeKm: 45,
      },
      {
        name: "Threshold + Compromised",
        short: "Threshold",
        startWeek: 5,
        endWeek: 8,
        focus: "Build threshold volume @ 4:15–4:25/km; introduce station→run couplets.",
        checkpoint: "Wk 8: half-simulation (4 runs + 4 stations) + deload.",
        volumeKm: 50,
      },
      {
        name: "Race-Pace Integration",
        short: "Race-Pace",
        startWeek: 9,
        endWeek: 12,
        focus: "Lock ~4:05/km under fatigue across reps; sharpen pacing & splits with Sean.",
        checkpoint: "Wk 12: 6/8 or full simulation + deload.",
        volumeKm: 50,
      },
      {
        name: "Peak / Full Simulation",
        short: "Peak",
        startWeek: 13,
        endWeek: 14,
        focus: "1–2 full race sims at goal effort with Sean; finalize pacing.",
        checkpoint: "Wk 14 sim = sub-60 readiness read.",
        volumeKm: 45,
      },
      {
        name: "Taper / Race Weekend",
        short: "Taper",
        startWeek: 15,
        endWeek: 16,
        focus: "Arrive fresh & sharp; manage Oct 1 & 2 as controlled efforts.",
        checkpoint: "Race weekend — Oct 1–3.",
        volumeKm: 30,
      },
    ],
  },
  manualRunAdjustments: [
    { label: "Treadmill runs", sessions: 52, distanceKm: 339.52, avgPaceSecPerKm: 324 },
    { label: "HYROX / mixed cardio runs", sessions: 14, distanceKm: 49.87, avgPaceSecPerKm: 300 },
  ],
  heartRateZones: [
    { min: 0, max: 133 },
    { min: 134, max: 147 },
    { min: 148, max: 161 },
    { min: 162, max: 175 },
    { min: 176, max: -1 },
  ],
};

export default config;
