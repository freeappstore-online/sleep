import type { SleepEntry, SleepGoal } from "./types";

const ENTRIES_KEY = "sleep-tracker-entries";
const GOAL_KEY = "sleep-tracker-goal";

export function loadEntries(): SleepEntry[] {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SleepEntry[];
  } catch {
    return [];
  }
}

export function saveEntries(entries: SleepEntry[]): void {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

export function loadGoal(): SleepGoal {
  try {
    const raw = localStorage.getItem(GOAL_KEY);
    if (!raw) return { targetHours: 8 };
    return JSON.parse(raw) as SleepGoal;
  } catch {
    return { targetHours: 8 };
  }
}

export function saveGoal(goal: SleepGoal): void {
  localStorage.setItem(GOAL_KEY, JSON.stringify(goal));
}
