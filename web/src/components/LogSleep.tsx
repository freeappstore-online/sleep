import { useState } from "react";
import type { SleepEntry } from "../lib/types";
import {
  calcDuration,
  calcCycles,
  formatDuration,
  todayStr,
  generateId,
} from "../lib/sleep";
import TimePicker from "./TimePicker";
import StarRating from "./StarRating";

interface LogSleepProps {
  onSave: (entry: SleepEntry) => void;
  editEntry?: SleepEntry | null;
  onCancelEdit?: () => void;
}

export default function LogSleep({
  onSave,
  editEntry,
  onCancelEdit,
}: LogSleepProps) {
  const [bedtime, setBedtime] = useState(editEntry?.bedtime ?? "23:00");
  const [wakeTime, setWakeTime] = useState(editEntry?.wakeTime ?? "07:00");
  const [quality, setQuality] = useState(editEntry?.quality ?? 3);
  const [notes, setNotes] = useState(editEntry?.notes ?? "");
  const [date, setDate] = useState(editEntry?.date ?? todayStr());

  const duration = calcDuration(bedtime, wakeTime);
  const cycles = calcCycles(duration);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const entry: SleepEntry = {
      id: editEntry?.id ?? generateId(),
      date,
      bedtime,
      wakeTime,
      quality,
      notes,
      durationMinutes: duration,
    };
    onSave(entry);
    if (!editEntry) {
      // Reset form
      setQuality(3);
      setNotes("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <h2 className="display-font text-xl font-bold">
        {editEntry ? "Edit Sleep Log" : "Log Your Sleep"}
      </h2>

      {/* Date */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
      </div>

      {/* Time pickers */}
      <div className="grid grid-cols-2 gap-4">
        <TimePicker label="Bedtime" value={bedtime} onChange={setBedtime} />
        <TimePicker label="Wake Time" value={wakeTime} onChange={setWakeTime} />
      </div>

      {/* Duration display */}
      <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-[var(--accent)]">
            {formatDuration(duration)}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            ~{cycles} sleep cycles (90 min each)
          </p>
        </div>
      </div>

      {/* Quality */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Sleep Quality
        </label>
        <StarRating value={quality} onChange={setQuality} size={32} />
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How did you sleep? Any dreams?"
          rows={3}
          className="resize-none rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          {editEntry ? "Update" : "Save Sleep Log"}
        </button>
        {editEntry && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-xl border border-[var(--line)] px-4 py-3 text-sm font-semibold text-[var(--muted)] transition-colors hover:bg-[var(--panel)]"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
