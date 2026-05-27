import { useState, useMemo } from "react";
import type { SleepEntry, SleepGoal } from "../lib/types";
import { format12h, formatDuration } from "../lib/sleep";
import StarRating from "./StarRating";

interface CalendarViewProps {
  entries: SleepEntry[];
  goal: SleepGoal;
  onEditEntry: (entry: SleepEntry) => void;
}

export default function CalendarView({
  entries,
  goal,
  onEditEntry,
}: CalendarViewProps) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const entryMap = useMemo(() => {
    const map = new Map<string, SleepEntry>();
    for (const entry of entries) {
      map.set(entry.date, entry);
    }
    return map;
  }, [entries]);

  const selectedEntry = selectedDate ? entryMap.get(selectedDate) : null;

  function prevMonth() {
    setViewDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  }

  function nextMonth() {
    setViewDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  }

  function getCellColor(dateStr: string): string {
    const entry = entryMap.get(dateStr);
    if (!entry) return "transparent";
    const hours = entry.durationMinutes / 60;
    if (hours >= goal.targetHours) return "var(--success)";
    if (hours >= goal.targetHours * 0.85) return "var(--warning)";
    return "var(--error)";
  }

  const monthName = viewDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex flex-col gap-4">
      <h2 className="display-font text-xl font-bold">Calendar</h2>

      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--panel)]"
        >
          ←
        </button>
        <span className="text-sm font-bold">{monthName}</span>
        <button
          onClick={nextMonth}
          className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--panel)]"
        >
          →
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {dayLabels.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-semibold text-[var(--muted)]"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells before first day */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
          const cellColor = getCellColor(dateStr);
          const isSelected = selectedDate === dateStr;
          const hasEntry = entryMap.has(dateStr);
          const isToday =
            dateStr === new Date().toISOString().slice(0, 10);

          return (
            <button
              key={day}
              onClick={() => setSelectedDate(dateStr)}
              className="relative flex aspect-square items-center justify-center rounded-lg text-xs font-medium transition-all"
              style={{
                background:
                  hasEntry && !isSelected
                    ? cellColor + "22"
                    : isSelected
                      ? "var(--accent)"
                      : "transparent",
                color: isSelected ? "white" : "var(--ink)",
                border: isToday
                  ? "2px solid var(--accent)"
                  : "1px solid var(--line)",
              }}
            >
              {day}
              {hasEntry && !isSelected && (
                <span
                  className="absolute bottom-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full"
                  style={{ background: cellColor }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-[var(--muted)]">
        <span className="flex items-center gap-1">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: "var(--success)" }}
          />
          Met goal
        </span>
        <span className="flex items-center gap-1">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: "var(--warning)" }}
          />
          Close
        </span>
        <span className="flex items-center gap-1">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: "var(--error)" }}
          />
          Under
        </span>
      </div>

      {/* Selected day detail */}
      {selectedDate && (
        <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4">
          <h3 className="text-sm font-bold">
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h3>
          {selectedEntry ? (
            <div className="mt-2 flex flex-col gap-2 text-sm">
              <p>
                <span className="text-[var(--muted)]">Bedtime:</span>{" "}
                {format12h(selectedEntry.bedtime)}
              </p>
              <p>
                <span className="text-[var(--muted)]">Wake:</span>{" "}
                {format12h(selectedEntry.wakeTime)}
              </p>
              <p>
                <span className="text-[var(--muted)]">Duration:</span>{" "}
                {formatDuration(selectedEntry.durationMinutes)}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[var(--muted)]">Quality:</span>
                <StarRating
                  value={selectedEntry.quality}
                  size={16}
                  readonly
                />
              </div>
              {selectedEntry.notes && (
                <p className="italic text-[var(--muted)]">
                  &ldquo;{selectedEntry.notes}&rdquo;
                </p>
              )}
              <button
                onClick={() => onEditEntry(selectedEntry)}
                className="mt-2 self-start rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
              >
                Edit
              </button>
            </div>
          ) : (
            <p className="mt-2 text-sm text-[var(--muted)]">
              No sleep logged for this day.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
