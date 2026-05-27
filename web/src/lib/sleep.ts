import type { SleepEntry, SleepStats, SleepStageBreakdown } from "./types";

const CYCLE_MINUTES = 90;
const FALL_ASLEEP_MINUTES = 15;

/** Calculate duration in minutes between bedtime and wake time (handles overnight) */
export function calcDuration(bedtime: string, wakeTime: string): number {
  const [bedH, bedM] = bedtime.split(":").map(Number);
  const [wakeH, wakeM] = wakeTime.split(":").map(Number);
  if (bedH === undefined || bedM === undefined || wakeH === undefined || wakeM === undefined) return 0;
  let bedMinutes = bedH * 60 + bedM;
  let wakeMinutes = wakeH * 60 + wakeM;
  if (wakeMinutes <= bedMinutes) {
    wakeMinutes += 24 * 60; // overnight
  }
  return wakeMinutes - bedMinutes;
}

/** Number of sleep cycles (90 min each) */
export function calcCycles(durationMinutes: number): number {
  return Math.round((durationMinutes / CYCLE_MINUTES) * 10) / 10;
}

/** Format minutes as "Xh Ym" */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Format minutes as decimal hours */
export function minutesToHours(minutes: number): number {
  return Math.round((minutes / 60) * 10) / 10;
}

/** Get today's date as YYYY-MM-DD */
export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Get date N days ago as YYYY-MM-DD */
export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

/** Compute sleep stats from entries */
export function computeStats(
  entries: SleepEntry[],
  targetHours: number,
): SleepStats {
  const today = todayStr();
  const lastNight = entries.find((e) => e.date === today);
  const lastNightHours = lastNight ? minutesToHours(lastNight.durationMinutes) : null;

  // Last 7 days
  const weekEntries: SleepEntry[] = [];
  for (let i = 0; i < 7; i++) {
    const dateStr = daysAgo(i);
    const entry = entries.find((e) => e.date === dateStr);
    if (entry) weekEntries.push(entry);
  }

  const weekAvgHours =
    weekEntries.length > 0
      ? Math.round(
          (weekEntries.reduce((sum, e) => sum + e.durationMinutes, 0) /
            weekEntries.length /
            60) *
            10,
        ) / 10
      : 0;

  // Sleep debt: sum of (goal - actual) for each of last 7 days where actual < goal
  let debt = 0;
  for (let i = 0; i < 7; i++) {
    const dateStr = daysAgo(i);
    const entry = entries.find((e) => e.date === dateStr);
    if (entry) {
      const hours = entry.durationMinutes / 60;
      if (hours < targetHours) {
        debt += targetHours - hours;
      }
    } else {
      debt += targetHours; // missed day = full debt
    }
  }
  debt = Math.round(debt * 10) / 10;

  // Streak: consecutive days meeting goal, going backwards from today
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const dateStr = daysAgo(i);
    const entry = entries.find((e) => e.date === dateStr);
    if (entry && entry.durationMinutes / 60 >= targetHours) {
      streak++;
    } else {
      break;
    }
  }

  return { lastNightHours, weekAvgHours, sleepDebt: debt, streak };
}

/** Sleep stage estimate based on standard 90-min cycle model */
export function estimateStages(durationMinutes: number): SleepStageBreakdown {
  if (durationMinutes <= 0) {
    return { light: 0, deep: 0, rem: 0, awake: 0 };
  }
  // Standard breakdown per cycle:
  // ~50% light, ~20% deep, ~25% REM, ~5% awake
  // Deep sleep is heavier in first half of night, REM heavier in second half
  const totalCycles = durationMinutes / CYCLE_MINUTES;
  const completeCycles = Math.floor(totalCycles);
  const partial = totalCycles - completeCycles;

  let light = 0;
  let deep = 0;
  let rem = 0;

  for (let i = 0; i < completeCycles; i++) {
    const cycleProgress = completeCycles > 1 ? i / (completeCycles - 1) : 0;
    // Deep sleep decreases through the night, REM increases
    deep += CYCLE_MINUTES * (0.25 - 0.15 * cycleProgress);
    rem += CYCLE_MINUTES * (0.15 + 0.15 * cycleProgress);
    light += CYCLE_MINUTES * 0.55;
  }

  if (partial > 0) {
    const partialMin = partial * CYCLE_MINUTES;
    light += partialMin * 0.6;
    deep += partialMin * 0.1;
    rem += partialMin * 0.2;
  }

  const total = light + deep + rem;
  const awakeMins = Math.max(0, durationMinutes - total);

  const grandTotal = total + awakeMins;
  if (grandTotal === 0) return { light: 0, deep: 0, rem: 0, awake: 0 };

  return {
    light: Math.round((light / grandTotal) * 100),
    deep: Math.round((deep / grandTotal) * 100),
    rem: Math.round((rem / grandTotal) * 100),
    awake: Math.round((awakeMins / grandTotal) * 100),
  };
}

/** Suggest bedtimes for a desired wake time */
export function suggestBedtimes(wakeTime: string): string[] {
  const [h, m] = wakeTime.split(":").map(Number);
  if (h === undefined || m === undefined) return [];
  const wakeMins = h * 60 + m;
  const suggestions: string[] = [];

  // Suggest 6, 5, 4, 3 cycles before wake time + fall-asleep buffer
  for (const cycles of [6, 5, 4, 3]) {
    const sleepNeeded = cycles * CYCLE_MINUTES + FALL_ASLEEP_MINUTES;
    let bedMins = wakeMins - sleepNeeded;
    if (bedMins < 0) bedMins += 24 * 60;
    const bh = Math.floor(bedMins / 60) % 24;
    const bm = bedMins % 60;
    suggestions.push(
      `${bh.toString().padStart(2, "0")}:${bm.toString().padStart(2, "0")}`,
    );
  }
  return suggestions;
}

/** Suggest wake times for a desired bedtime */
export function suggestWakeTimes(bedtime: string): string[] {
  const [h, m] = bedtime.split(":").map(Number);
  if (h === undefined || m === undefined) return [];
  const bedMins = h * 60 + m;
  const suggestions: string[] = [];

  // Suggest 3, 4, 5, 6 cycles after bedtime + fall-asleep buffer
  for (const cycles of [3, 4, 5, 6]) {
    const sleepDuration = cycles * CYCLE_MINUTES + FALL_ASLEEP_MINUTES;
    const wakeMins = (bedMins + sleepDuration) % (24 * 60);
    const wh = Math.floor(wakeMins / 60) % 24;
    const wm = wakeMins % 60;
    suggestions.push(
      `${wh.toString().padStart(2, "0")}:${wm.toString().padStart(2, "0")}`,
    );
  }
  return suggestions;
}

/** Format 24h time to 12h AM/PM */
export function format12h(time24: string): string {
  const [h, m] = time24.split(":").map(Number);
  if (h === undefined || m === undefined) return time24;
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${suffix}`;
}

/** Get entries for last N days, sorted by date */
export function getRecentEntries(
  entries: SleepEntry[],
  days: number,
): SleepEntry[] {
  const cutoff = daysAgo(days - 1);
  return entries
    .filter((e) => e.date >= cutoff)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Generate a unique ID */
export function generateId(): string {
  return crypto.randomUUID();
}
