import { useState } from "react";
import {
  suggestBedtimes,
  suggestWakeTimes,
  format12h,
  calcDuration,
  formatDuration,
  calcCycles,
} from "../lib/sleep";
import TimePicker from "./TimePicker";

type CalcMode = "wake" | "bed";

export default function SleepCalculator() {
  const [mode, setMode] = useState<CalcMode>("wake");
  const [wakeTime, setWakeTime] = useState("07:00");
  const [bedtime, setBedtime] = useState("23:00");

  const bedtimeSuggestions = suggestBedtimes(wakeTime);
  const wakeSuggestions = suggestWakeTimes(bedtime);

  return (
    <div className="flex flex-col gap-5">
      <h2 className="display-font text-xl font-bold">Sleep Calculator</h2>

      {/* Mode toggle */}
      <div className="flex rounded-xl border border-[var(--line)] bg-[var(--panel)] p-1">
        <button
          onClick={() => setMode("wake")}
          className="flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors"
          style={{
            background: mode === "wake" ? "var(--accent)" : "transparent",
            color: mode === "wake" ? "white" : "var(--muted)",
          }}
        >
          I need to wake at...
        </button>
        <button
          onClick={() => setMode("bed")}
          className="flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors"
          style={{
            background: mode === "bed" ? "var(--accent)" : "transparent",
            color: mode === "bed" ? "white" : "var(--muted)",
          }}
        >
          I'm going to bed at...
        </button>
      </div>

      {/* Time input */}
      {mode === "wake" ? (
        <TimePicker label="Wake Up Time" value={wakeTime} onChange={setWakeTime} />
      ) : (
        <TimePicker label="Bedtime" value={bedtime} onChange={setBedtime} />
      )}

      {/* Suggestions */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          {mode === "wake"
            ? "Suggested bedtimes (includes 15 min to fall asleep)"
            : "Suggested wake times (includes 15 min to fall asleep)"}
        </p>

        {(mode === "wake" ? bedtimeSuggestions : wakeSuggestions).map(
          (time, i) => {
            const cycles = mode === "wake" ? [6, 5, 4, 3][i] : [3, 4, 5, 6][i];
            const dur =
              mode === "wake"
                ? calcDuration(time, wakeTime)
                : calcDuration(bedtime, time);

            return (
              <div
                key={time}
                className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3"
              >
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-[var(--accent)]">
                    {format12h(time)}
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    {formatDuration(dur)} of sleep
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold">
                    {cycles} cycles
                  </span>
                  <p className="text-xs text-[var(--muted)]">
                    {calcCycles(dur - 15).toFixed(0)} full
                  </p>
                </div>
              </div>
            );
          },
        )}
      </div>

      {/* Info */}
      <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4">
        <p className="text-xs leading-relaxed text-[var(--muted)]">
          Sleep cycles last about 90 minutes each and consist of light sleep,
          deep sleep, and REM stages. Waking between cycles (rather than during
          one) tends to feel more refreshing. A 15-minute buffer is included to
          account for the time it takes to fall asleep.
        </p>
      </div>
    </div>
  );
}
