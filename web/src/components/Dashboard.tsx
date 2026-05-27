import type { SleepEntry, SleepGoal } from "../lib/types";
import { computeStats, minutesToHours } from "../lib/sleep";
import ProgressRing from "./ProgressRing";
import StarRating from "./StarRating";

interface DashboardProps {
  entries: SleepEntry[];
  goal: SleepGoal;
  onSetGoal: (hours: number) => void;
}

export default function Dashboard({ entries, goal, onSetGoal }: DashboardProps) {
  const stats = computeStats(entries, goal.targetHours);
  const todayEntry = entries.find(
    (e) => e.date === new Date().toISOString().slice(0, 10),
  );
  const progress = stats.lastNightHours
    ? stats.lastNightHours / goal.targetHours
    : 0;

  // Weekly report
  const weekEntries: SleepEntry[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const entry = entries.find((e) => e.date === dateStr);
    if (entry) weekEntries.push(entry);
  }

  const bestNight =
    weekEntries.length > 0
      ? weekEntries.reduce((best, e) =>
          e.durationMinutes > best.durationMinutes ? e : best,
        )
      : null;
  const worstNight =
    weekEntries.length > 0
      ? weekEntries.reduce((worst, e) =>
          e.durationMinutes < worst.durationMinutes ? e : worst,
        )
      : null;

  const avgQuality =
    weekEntries.length > 0
      ? Math.round(
          (weekEntries.reduce((sum, e) => sum + e.quality, 0) /
            weekEntries.length) *
            10,
        ) / 10
      : 0;

  // Trend: compare this week avg to previous week avg
  const prevWeekEntries: SleepEntry[] = [];
  for (let i = 7; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const entry = entries.find((e) => e.date === dateStr);
    if (entry) prevWeekEntries.push(entry);
  }
  const prevAvg =
    prevWeekEntries.length > 0
      ? prevWeekEntries.reduce((s, e) => s + e.durationMinutes, 0) /
        prevWeekEntries.length /
        60
      : null;
  const currAvg = stats.weekAvgHours;
  const trendDir =
    prevAvg !== null
      ? currAvg > prevAvg
        ? "up"
        : currAvg < prevAvg
          ? "down"
          : "flat"
      : "flat";

  return (
    <div className="flex flex-col gap-5">
      <h2 className="display-font text-xl font-bold">Dashboard</h2>

      {/* Goal setting */}
      <div className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-3">
        <span className="text-sm font-medium text-[var(--muted)]">
          Sleep Goal:
        </span>
        <select
          value={goal.targetHours}
          onChange={(e) => onSetGoal(Number(e.target.value))}
          className="rounded-lg border border-[var(--line)] bg-[var(--paper)] px-2 py-1 text-sm font-semibold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        >
          {[5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((h) => (
            <option key={h} value={h}>
              {h}h
            </option>
          ))}
        </select>
        <span className="text-sm text-[var(--muted)]">per night</span>
      </div>

      {/* Progress ring + last night */}
      <div className="flex items-center gap-6 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
        <ProgressRing
          radius={56}
          stroke={8}
          progress={progress}
          label={stats.lastNightHours !== null ? `${stats.lastNightHours}h` : "--"}
          sublabel={`of ${goal.targetHours}h goal`}
        />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold">Last Night</p>
          {todayEntry ? (
            <>
              <p className="text-xs text-[var(--muted)]">
                Quality: <StarRating value={todayEntry.quality} size={14} readonly />
              </p>
              {todayEntry.notes && (
                <p className="mt-1 text-xs italic text-[var(--muted)]">
                  &ldquo;{todayEntry.notes}&rdquo;
                </p>
              )}
            </>
          ) : (
            <p className="text-xs text-[var(--muted)]">No log yet today</p>
          )}
        </div>
      </div>

      {/* Quick stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title="Week Average"
          value={`${stats.weekAvgHours}h`}
          accent={stats.weekAvgHours >= goal.targetHours}
        />
        <StatCard
          title="Sleep Debt"
          value={`${stats.sleepDebt}h`}
          accent={stats.sleepDebt === 0}
          subtitle="this week"
        />
        <StatCard
          title="Goal Streak"
          value={`${stats.streak}`}
          accent={stats.streak > 0}
          subtitle={stats.streak === 1 ? "day" : "days"}
        />
        <StatCard
          title="Avg Quality"
          value={`${avgQuality}/5`}
          accent={avgQuality >= 4}
          subtitle="this week"
        />
      </div>

      {/* Weekly report */}
      <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[var(--muted)]">
          Weekly Report
        </h3>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--muted)]">Average sleep</span>
            <span className="font-semibold">{stats.weekAvgHours}h/night</span>
          </div>
          {bestNight && (
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Best night</span>
              <span className="font-semibold">
                {minutesToHours(bestNight.durationMinutes)}h on{" "}
                {formatDate(bestNight.date)}
              </span>
            </div>
          )}
          {worstNight && (
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Worst night</span>
              <span className="font-semibold">
                {minutesToHours(worstNight.durationMinutes)}h on{" "}
                {formatDate(worstNight.date)}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-[var(--muted)]">Trend</span>
            <span className="font-semibold">
              {trendDir === "up"
                ? "Improving"
                : trendDir === "down"
                  ? "Declining"
                  : "Steady"}
              {trendDir === "up" && " ↑"}
              {trendDir === "down" && " ↓"}
              {trendDir === "flat" && " →"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--muted)]">Nights logged</span>
            <span className="font-semibold">{weekEntries.length}/7</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  accent,
  subtitle,
}: {
  title: string;
  value: string;
  accent: boolean;
  subtitle?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-3 text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
        {title}
      </p>
      <p
        className="mt-1 text-xl font-bold"
        style={{ color: accent ? "var(--success)" : "var(--ink)" }}
      >
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-[var(--muted)]">{subtitle}</p>
      )}
    </div>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
