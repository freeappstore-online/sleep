import { useState } from "react";
import { SLEEP_TIPS } from "../lib/tips";

export default function Tips() {
  const [current, setCurrent] = useState(0);
  const tip = SLEEP_TIPS[current];

  function next() {
    setCurrent((c) => (c + 1) % SLEEP_TIPS.length);
  }

  function prev() {
    setCurrent((c) => (c - 1 + SLEEP_TIPS.length) % SLEEP_TIPS.length);
  }

  if (!tip) return null;

  return (
    <div className="flex flex-col gap-5">
      <h2 className="display-font text-xl font-bold">Sleep Tips</h2>

      {/* Carousel */}
      <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6">
        <div className="mb-4 text-center text-4xl">{tip.icon}</div>
        <h3 className="mb-2 text-center text-lg font-bold">{tip.title}</h3>
        <p className="text-center text-sm leading-relaxed text-[var(--muted)]">
          {tip.body}
        </p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prev}
          className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--panel)]"
        >
          ← Previous
        </button>
        <span className="text-xs text-[var(--muted)]">
          {current + 1} / {SLEEP_TIPS.length}
        </span>
        <button
          onClick={next}
          className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--panel)]"
        >
          Next →
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5">
        {SLEEP_TIPS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="h-2 w-2 rounded-full transition-colors"
            style={{
              background:
                i === current ? "var(--accent)" : "var(--line-strong)",
            }}
            aria-label={`Go to tip ${i + 1}`}
          />
        ))}
      </div>

      {/* All tips list */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--muted)]">
          All Tips
        </h3>
        {SLEEP_TIPS.map((t, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="flex items-start gap-3 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-3 text-left transition-colors hover:border-[var(--accent)]"
            style={{
              borderColor: i === current ? "var(--accent)" : undefined,
            }}
          >
            <span className="text-xl">{t.icon}</span>
            <div>
              <p className="text-sm font-semibold">{t.title}</p>
              <p className="mt-0.5 text-xs text-[var(--muted)] line-clamp-2">
                {t.body}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
