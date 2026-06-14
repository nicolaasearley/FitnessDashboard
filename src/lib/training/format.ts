/** Display formatters. All inputs are in Strava's native units (m, s, m/s). */

export function metresToKm(m: number, digits = 1): number {
  return Math.round((m / 1000) * 10 ** digits) / 10 ** digits;
}

/** "12.4" — kilometres, fixed digits, no unit. */
export function km(m: number, digits = 1): string {
  return metresToKm(m, digits).toFixed(digits);
}

/** Seconds → "1:45:16" or "26:20" (drops the hour when zero). */
export function duration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

/** Seconds → "26:20" always min:sec (for live clocks under an hour). */
export function clock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(h > 0 ? m : m).padStart(2, "0");
  const base = `${mm}:${String(sec).padStart(2, "0")}`;
  return h > 0 ? `${h}:${base}` : base;
}

/** Seconds-per-km → "4:25" (pace). */
export function pace(secPerKm: number): string {
  if (!isFinite(secPerKm) || secPerKm <= 0) return "—";
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  // Handle rounding that pushes seconds to 60.
  if (s === 60) return `${m + 1}:00`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** m/s → seconds per km. */
export function speedToPace(metresPerSecond: number): number {
  if (metresPerSecond <= 0) return 0;
  return 1000 / metresPerSecond;
}

/** Pace from distance (m) + time (s), as seconds per km. */
export function paceFromDistance(metres: number, seconds: number): number {
  if (metres <= 0) return 0;
  return seconds / (metres / 1000);
}

const DAY = 86400000;

/** Friendly relative day label from an ISO local datetime. */
export function relativeDay(iso: string, reference: Date): string {
  const d = new Date(iso);
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOf(reference) - startOf(d)) / DAY);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return d.toLocaleDateString("en-CA", { weekday: "long" });
  return d.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

/** "Jun 7" style short date. */
export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

/** Time-of-day "7:14 AM". */
export function timeOfDay(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" });
}

/** Signed delta with a leading sign, e.g. +12 / −5. Uses a true minus glyph. */
export function signed(value: number, digits = 0): string {
  const fixed = Math.abs(value).toFixed(digits);
  if (value > 0) return `+${fixed}`;
  if (value < 0) return `−${fixed}`;
  return fixed;
}
