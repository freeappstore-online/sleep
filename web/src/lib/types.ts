export interface SleepEntry {
  id: string;
  date: string; // YYYY-MM-DD
  bedtime: string; // HH:MM (24h)
  wakeTime: string; // HH:MM (24h)
  quality: number; // 1-5
  notes: string;
  durationMinutes: number;
}

export interface SleepGoal {
  targetHours: number;
}

export interface SleepStats {
  lastNightHours: number | null;
  weekAvgHours: number;
  sleepDebt: number; // hours under goal this week
  streak: number; // consecutive days meeting goal
}

export interface SleepStageBreakdown {
  light: number; // percentage
  deep: number;
  rem: number;
  awake: number;
}

export type Tab =
  | "dashboard"
  | "log"
  | "calendar"
  | "charts"
  | "calculator"
  | "tips";
