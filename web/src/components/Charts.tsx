import { useRef, useEffect, useState, useCallback } from "react";
import type { SleepEntry } from "../lib/types";
import { getRecentEntries, estimateStages, minutesToHours } from "../lib/sleep";

interface ChartsProps {
  entries: SleepEntry[];
  targetHours: number;
}

type ChartTab = "duration" | "times" | "quality" | "weekly" | "stages";

export default function Charts({ entries, targetHours }: ChartsProps) {
  const [activeChart, setActiveChart] = useState<ChartTab>("duration");

  const tabs: { key: ChartTab; label: string }[] = [
    { key: "duration", label: "Duration" },
    { key: "times", label: "Bed/Wake" },
    { key: "quality", label: "Quality" },
    { key: "weekly", label: "Weekly Avg" },
    { key: "stages", label: "Stages" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h2 className="display-font text-xl font-bold">Charts</h2>

      {/* Chart tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-[var(--line)] bg-[var(--panel)] p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveChart(tab.key)}
            className="flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
            style={{
              background:
                activeChart === tab.key ? "var(--accent)" : "transparent",
              color: activeChart === tab.key ? "white" : "var(--muted)",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Canvas chart */}
      <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4">
        {activeChart === "duration" && (
          <DurationChart entries={entries} targetHours={targetHours} />
        )}
        {activeChart === "times" && <TimesChart entries={entries} />}
        {activeChart === "quality" && <QualityChart entries={entries} />}
        {activeChart === "weekly" && (
          <WeeklyAvgChart entries={entries} targetHours={targetHours} />
        )}
        {activeChart === "stages" && <StagesChart entries={entries} />}
      </div>
    </div>
  );
}

function useCanvas(
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  deps: unknown[],
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawCallback = useCallback(draw, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parent = canvas.parentElement;
    const w = parent?.clientWidth ?? 300;
    const h = 220;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    drawCallback(ctx, w, h);
  }, [drawCallback]);

  return canvasRef;
}

function getStyleColor(varName: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
}

/** Bar chart of sleep duration over last 14 days */
function DurationChart({
  entries,
  targetHours,
}: {
  entries: SleepEntry[];
  targetHours: number;
}) {
  const recent = getRecentEntries(entries, 14);

  const canvasRef = useCanvas(
    (ctx, w, h) => {
      const ink = getStyleColor("--ink");
      const muted = getStyleColor("--muted");
      const accent = getStyleColor("--accent");
      const success = getStyleColor("--success");
      const warning = getStyleColor("--warning");
      const errColor = getStyleColor("--error");
      const line = getStyleColor("--line");

      const padding = { top: 20, right: 10, bottom: 30, left: 30 };
      const chartW = w - padding.left - padding.right;
      const chartH = h - padding.top - padding.bottom;

      // Build 14-day data
      const data: { label: string; hours: number }[] = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const entry = recent.find((e) => e.date === dateStr);
        data.push({
          label: d.toLocaleDateString("en-US", { day: "numeric" }),
          hours: entry ? minutesToHours(entry.durationMinutes) : 0,
        });
      }

      const maxHours = Math.max(12, ...data.map((d) => d.hours));
      const barWidth = chartW / data.length - 4;

      // Grid lines
      ctx.strokeStyle = line;
      ctx.lineWidth = 0.5;
      for (let h2 = 0; h2 <= maxHours; h2 += 2) {
        const y = padding.top + chartH - (h2 / maxHours) * chartH;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(w - padding.right, y);
        ctx.stroke();

        ctx.fillStyle = muted;
        ctx.font = "10px Manrope, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(`${h2}h`, padding.left - 4, y + 3);
      }

      // Goal line
      const goalY =
        padding.top + chartH - (targetHours / maxHours) * chartH;
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padding.left, goalY);
      ctx.lineTo(w - padding.right, goalY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Bars
      data.forEach((d, i) => {
        const x = padding.left + i * (chartW / data.length) + 2;
        const barH = (d.hours / maxHours) * chartH;
        const y = padding.top + chartH - barH;

        const color =
          d.hours >= targetHours
            ? success
            : d.hours >= targetHours * 0.85
              ? warning
              : d.hours > 0
                ? errColor
                : line;

        ctx.fillStyle = color;
        ctx.beginPath();
        const radius = Math.min(4, barWidth / 2);
        roundRect(ctx, x, y, barWidth, barH, radius);
        ctx.fill();

        // Labels
        ctx.fillStyle = muted;
        ctx.font = "9px Manrope, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(d.label, x + barWidth / 2, h - padding.bottom + 14);

        // Value on top of bar
        if (d.hours > 0) {
          ctx.fillStyle = ink;
          ctx.font = "9px Manrope, sans-serif";
          ctx.fillText(`${d.hours}`, x + barWidth / 2, y - 4);
        }
      });
    },
    [entries, targetHours],
  );

  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-[var(--muted)]">
        Sleep Duration — Last 14 Days
      </p>
      <canvas ref={canvasRef} className="w-full" />
    </div>
  );
}

/** Scatter plot of bedtime and wake time */
function TimesChart({ entries }: { entries: SleepEntry[] }) {
  const recent = getRecentEntries(entries, 14);

  const canvasRef = useCanvas(
    (ctx, w, h) => {
      const muted = getStyleColor("--muted");
      const accent = getStyleColor("--accent");
      const line = getStyleColor("--line");
      const sleepDeep = getStyleColor("--sleep-deep");

      const padding = { top: 20, right: 10, bottom: 30, left: 40 };
      const chartW = w - padding.left - padding.right;
      const chartH = h - padding.top - padding.bottom;

      // Y axis: hours 18 (6 PM) to 12 (noon next day) = 18h range
      const minHour = 18;
      const maxHour = 36; // 12 PM next day (18 + 18)
      const range = maxHour - minHour;

      function hourToY(hour24: number): number {
        let h = hour24;
        if (h < minHour) h += 24;
        return (
          padding.top + ((h - minHour) / range) * chartH
        );
      }

      // Grid
      ctx.strokeStyle = line;
      ctx.lineWidth = 0.5;
      for (let hr = minHour; hr <= maxHour; hr += 2) {
        const y = hourToY(hr % 24 === 0 ? 24 : hr);
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(w - padding.right, y);
        ctx.stroke();

        ctx.fillStyle = muted;
        ctx.font = "10px Manrope, sans-serif";
        ctx.textAlign = "right";
        const displayHr = hr % 24;
        const suffix = displayHr >= 12 ? "PM" : "AM";
        const h12 = displayHr % 12 || 12;
        ctx.fillText(`${h12}${suffix}`, padding.left - 4, y + 3);
      }

      // Data points
      const data: { x: number; bedY: number; wakeY: number; label: string }[] =
        [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const entry = recent.find((e) => e.date === dateStr);
        if (entry) {
          const idx = 13 - i;
          const x = padding.left + (idx / 13) * chartW;
          const [bh, bm] = entry.bedtime.split(":").map(Number);
          const [wh, wm] = entry.wakeTime.split(":").map(Number);
          data.push({
            x,
            bedY: hourToY((bh ?? 0) + (bm ?? 0) / 60),
            wakeY: hourToY((wh ?? 0) + (wm ?? 0) / 60),
            label: d.toLocaleDateString("en-US", { day: "numeric" }),
          });
        }
      }

      // Draw bedtime points
      data.forEach((d) => {
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.arc(d.x, d.bedY, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw wake time points
      data.forEach((d) => {
        ctx.fillStyle = sleepDeep;
        ctx.beginPath();
        ctx.arc(d.x, d.wakeY, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Connect bedtimes
      if (data.length > 1) {
        ctx.strokeStyle = accent + "66";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        data.forEach((d, i) => {
          if (i === 0) ctx.moveTo(d.x, d.bedY);
          else ctx.lineTo(d.x, d.bedY);
        });
        ctx.stroke();

        ctx.strokeStyle = sleepDeep + "66";
        ctx.beginPath();
        data.forEach((d, i) => {
          if (i === 0) ctx.moveTo(d.x, d.wakeY);
          else ctx.lineTo(d.x, d.wakeY);
        });
        ctx.stroke();
      }

      // Legend
      ctx.fillStyle = accent;
      ctx.fillRect(padding.left, h - 12, 8, 8);
      ctx.fillStyle = muted;
      ctx.font = "10px Manrope, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Bedtime", padding.left + 12, h - 4);

      ctx.fillStyle = sleepDeep;
      ctx.fillRect(padding.left + 80, h - 12, 8, 8);
      ctx.fillStyle = muted;
      ctx.fillText("Wake", padding.left + 92, h - 4);
    },
    [entries],
  );

  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-[var(--muted)]">
        Bedtime & Wake Time — Last 14 Days
      </p>
      <canvas ref={canvasRef} className="w-full" />
    </div>
  );
}

/** Quality trend line */
function QualityChart({ entries }: { entries: SleepEntry[] }) {
  const recent = getRecentEntries(entries, 14);

  const canvasRef = useCanvas(
    (ctx, w, h) => {
      const muted = getStyleColor("--muted");
      const accent = getStyleColor("--accent");
      const line = getStyleColor("--line");

      const padding = { top: 20, right: 10, bottom: 30, left: 30 };
      const chartW = w - padding.left - padding.right;
      const chartH = h - padding.top - padding.bottom;

      // Grid (1-5)
      for (let q = 1; q <= 5; q++) {
        const y = padding.top + chartH - ((q - 1) / 4) * chartH;
        ctx.strokeStyle = line;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(w - padding.right, y);
        ctx.stroke();

        ctx.fillStyle = muted;
        ctx.font = "10px Manrope, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(`${q}★`, padding.left - 4, y + 3);
      }

      // Data
      const data: { x: number; y: number; label: string }[] = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const entry = recent.find((e) => e.date === dateStr);
        if (entry) {
          const idx = 13 - i;
          data.push({
            x: padding.left + (idx / 13) * chartW,
            y:
              padding.top +
              chartH -
              ((entry.quality - 1) / 4) * chartH,
            label: d.toLocaleDateString("en-US", { day: "numeric" }),
          });
        }
      }

      // Line
      if (data.length > 1) {
        ctx.strokeStyle = accent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        data.forEach((d, i) => {
          if (i === 0) ctx.moveTo(d.x, d.y);
          else ctx.lineTo(d.x, d.y);
        });
        ctx.stroke();

        // Fill under
        ctx.lineTo(data[data.length - 1]!.x, padding.top + chartH);
        ctx.lineTo(data[0]!.x, padding.top + chartH);
        ctx.closePath();
        ctx.fillStyle = accent + "22";
        ctx.fill();
      }

      // Points
      data.forEach((d) => {
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.arc(d.x, d.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    },
    [entries],
  );

  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-[var(--muted)]">
        Sleep Quality Trend — Last 14 Days
      </p>
      <canvas ref={canvasRef} className="w-full" />
    </div>
  );
}

/** Weekly average bar chart */
function WeeklyAvgChart({
  entries,
  targetHours,
}: {
  entries: SleepEntry[];
  targetHours: number;
}) {
  const canvasRef = useCanvas(
    (ctx, w, h) => {
      const muted = getStyleColor("--muted");
      const accent = getStyleColor("--accent");
      const success = getStyleColor("--success");
      const warning = getStyleColor("--warning");
      const errColor = getStyleColor("--error");
      const line = getStyleColor("--line");

      const padding = { top: 20, right: 10, bottom: 30, left: 30 };
      const chartW = w - padding.left - padding.right;
      const chartH = h - padding.top - padding.bottom;

      // Compute weekly averages for last 8 weeks
      const weeks: { label: string; avg: number }[] = [];
      for (let week = 7; week >= 0; week--) {
        const weekEntries: SleepEntry[] = [];
        const startDay = week * 7;
        for (let d = startDay; d < startDay + 7; d++) {
          const date = new Date();
          date.setDate(date.getDate() - d);
          const dateStr = date.toISOString().slice(0, 10);
          const entry = entries.find((e) => e.date === dateStr);
          if (entry) weekEntries.push(entry);
        }
        const avg =
          weekEntries.length > 0
            ? weekEntries.reduce((s, e) => s + e.durationMinutes, 0) /
              weekEntries.length /
              60
            : 0;

        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - startDay - 6);
        weeks.push({
          label: weekStart.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          avg: Math.round(avg * 10) / 10,
        });
      }

      const maxHours = Math.max(12, ...weeks.map((w2) => w2.avg));
      const barWidth = chartW / weeks.length - 6;

      // Grid
      for (let hr = 0; hr <= maxHours; hr += 2) {
        const y = padding.top + chartH - (hr / maxHours) * chartH;
        ctx.strokeStyle = line;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(w - padding.right, y);
        ctx.stroke();

        ctx.fillStyle = muted;
        ctx.font = "10px Manrope, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(`${hr}h`, padding.left - 4, y + 3);
      }

      // Goal line
      const goalY =
        padding.top + chartH - (targetHours / maxHours) * chartH;
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padding.left, goalY);
      ctx.lineTo(w - padding.right, goalY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Bars
      weeks.forEach((wk, i) => {
        const x = padding.left + i * (chartW / weeks.length) + 3;
        const barH = (wk.avg / maxHours) * chartH;
        const y = padding.top + chartH - barH;

        const color =
          wk.avg >= targetHours
            ? success
            : wk.avg >= targetHours * 0.85
              ? warning
              : wk.avg > 0
                ? errColor
                : line;

        ctx.fillStyle = color;
        ctx.beginPath();
        const radius = Math.min(4, barWidth / 2);
        roundRect(ctx, x, y, barWidth, barH, radius);
        ctx.fill();

        // Label
        ctx.fillStyle = muted;
        ctx.font = "8px Manrope, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(wk.label, x + barWidth / 2, h - padding.bottom + 14);
      });
    },
    [entries, targetHours],
  );

  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-[var(--muted)]">
        Weekly Average — Last 8 Weeks
      </p>
      <canvas ref={canvasRef} className="w-full" />
    </div>
  );
}

/** Sleep stages pie chart */
function StagesChart({ entries }: { entries: SleepEntry[] }) {
  // Use the most recent entry or average of last 7
  const recent = getRecentEntries(entries, 7);
  const avgDuration =
    recent.length > 0
      ? recent.reduce((s, e) => s + e.durationMinutes, 0) / recent.length
      : 480; // default 8h

  const stages = estimateStages(avgDuration);

  const canvasRef = useCanvas(
    (ctx, w, h) => {
      const centerX = w / 2;
      const centerY = h / 2 - 5;
      const radius = Math.min(centerX, centerY) - 30;
      const muted = getStyleColor("--muted");
      const ink = getStyleColor("--ink");

      const slices = [
        { label: "Light", pct: stages.light, color: getStyleColor("--sleep-light") },
        { label: "Deep", pct: stages.deep, color: getStyleColor("--sleep-deep") },
        { label: "REM", pct: stages.rem, color: getStyleColor("--sleep-rem") },
        { label: "Awake", pct: stages.awake, color: muted },
      ].filter((s) => s.pct > 0);

      let startAngle = -Math.PI / 2;

      slices.forEach((slice) => {
        const sliceAngle = (slice.pct / 100) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = slice.color;
        ctx.fill();

        // Label
        const midAngle = startAngle + sliceAngle / 2;
        const labelR = radius * 0.65;
        const lx = centerX + Math.cos(midAngle) * labelR;
        const ly = centerY + Math.sin(midAngle) * labelR;

        ctx.fillStyle = ink;
        ctx.font = "bold 11px Manrope, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        if (slice.pct >= 8) {
          ctx.fillText(`${slice.pct}%`, lx, ly);
        }

        startAngle += sliceAngle;
      });

      // Legend
      const legendY = h - 16;
      let legendX = w / 2 - (slices.length * 60) / 2;
      slices.forEach((slice) => {
        ctx.fillStyle = slice.color;
        ctx.fillRect(legendX, legendY - 6, 8, 8);
        ctx.fillStyle = muted;
        ctx.font = "10px Manrope, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(`${slice.label}`, legendX + 11, legendY + 1);
        legendX += 65;
      });
    },
    [entries, stages.light, stages.deep, stages.rem, stages.awake],
  );

  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-[var(--muted)]">
        Estimated Sleep Stages (based on {recent.length > 0 ? "last 7-day avg" : "8h default"})
      </p>
      <canvas ref={canvasRef} className="w-full" />
    </div>
  );
}

/** Helper: draw a rounded rectangle */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  if (h <= 0) return;
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}
