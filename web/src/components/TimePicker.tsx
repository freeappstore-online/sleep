import { useMemo } from "react";

interface TimePickerProps {
  label: string;
  value: string; // HH:MM 24h
  onChange: (val: string) => void;
}

export default function TimePicker({ label, value, onChange }: TimePickerProps) {
  const { hour12, minute, period } = useMemo(() => {
    const [h, m] = value.split(":").map(Number);
    const hr = h ?? 0;
    const mn = m ?? 0;
    return {
      hour12: hr % 12 || 12,
      minute: mn,
      period: (hr >= 12 ? "PM" : "AM") as "AM" | "PM",
    };
  }, [value]);

  function update(h12: number, min: number, ampm: "AM" | "PM") {
    let h24 = h12 % 12;
    if (ampm === "PM") h24 += 12;
    onChange(
      `${h24.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`,
    );
  }

  const selectStyle =
    "rounded-lg px-3 py-2 text-sm font-medium" +
    " border border-[var(--line)] bg-[var(--panel)] text-[var(--ink)]" +
    " focus:outline-none focus:ring-2 focus:ring-[var(--accent)]";

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <select
          className={selectStyle}
          value={hour12}
          onChange={(e) => update(Number(e.target.value), minute, period)}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        <span className="text-lg font-bold text-[var(--muted)]">:</span>
        <select
          className={selectStyle}
          value={minute}
          onChange={(e) => update(hour12, Number(e.target.value), period)}
        >
          {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
            <option key={m} value={m}>
              {m.toString().padStart(2, "0")}
            </option>
          ))}
        </select>
        <select
          className={selectStyle}
          value={period}
          onChange={(e) =>
            update(hour12, minute, e.target.value as "AM" | "PM")
          }
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  );
}
