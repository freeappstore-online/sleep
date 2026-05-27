import { useState, useCallback } from "react";
import type { SleepEntry, SleepGoal, Tab } from "./lib/types";
import { loadEntries, saveEntries, loadGoal, saveGoal } from "./lib/storage";
import Dashboard from "./components/Dashboard";
import LogSleep from "./components/LogSleep";
import CalendarView from "./components/CalendarView";
import Charts from "./components/Charts";
import SleepCalculator from "./components/SleepCalculator";
import Tips from "./components/Tips";

export default function App() {
  const [entries, setEntries] = useState<SleepEntry[]>(loadEntries);
  const [goal, setGoal] = useState<SleepGoal>(loadGoal);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [editEntry, setEditEntry] = useState<SleepEntry | null>(null);

  const handleSave = useCallback(
    (entry: SleepEntry) => {
      setEntries((prev) => {
        const idx = prev.findIndex((e) => e.id === entry.id);
        const next = idx >= 0 ? prev.map((e, i) => (i === idx ? entry : e)) : [...prev, entry];
        saveEntries(next);
        return next;
      });
      setEditEntry(null);
      if (editEntry) setTab("calendar");
    },
    [editEntry],
  );

  const handleSetGoal = useCallback((hours: number) => {
    const g = { targetHours: hours };
    setGoal(g);
    saveGoal(g);
  }, []);

  const handleEditEntry = useCallback((entry: SleepEntry) => {
    setEditEntry(entry);
    setTab("log");
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditEntry(null);
  }, []);

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "dashboard", label: "Home", icon: "home" },
    { key: "log", label: "Log", icon: "add" },
    { key: "calendar", label: "Cal", icon: "calendar" },
    { key: "charts", label: "Charts", icon: "chart" },
    { key: "calculator", label: "Calc", icon: "calc" },
    { key: "tips", label: "Tips", icon: "tips" },
  ];

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[var(--line)] bg-[var(--glass)] px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌙</span>
          <h1 className="display-font text-lg font-bold">Sleep Tracker</h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 py-5 pb-24">
        {tab === "dashboard" && (
          <Dashboard entries={entries} goal={goal} onSetGoal={handleSetGoal} />
        )}
        {tab === "log" && (
          <LogSleep
            onSave={handleSave}
            editEntry={editEntry}
            onCancelEdit={handleCancelEdit}
          />
        )}
        {tab === "calendar" && (
          <CalendarView
            entries={entries}
            goal={goal}
            onEditEntry={handleEditEntry}
          />
        )}
        {tab === "charts" && (
          <Charts entries={entries} targetHours={goal.targetHours} />
        )}
        {tab === "calculator" && <SleepCalculator />}
        {tab === "tips" && <Tips />}
      </main>

      {/* Bottom nav dock */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-[var(--line)] bg-[var(--dock)]">
        <div className="mx-auto flex max-w-lg">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                if (t.key !== "log") setEditEntry(null);
                setTab(t.key);
              }}
              className="flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors"
              style={{
                color: tab === t.key ? "var(--accent)" : "var(--muted)",
              }}
            >
              <TabIcon name={t.icon} active={tab === t.key} />
              <span className="text-[10px] font-semibold">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function TabIcon({ name, active }: { name: string; active: boolean }) {
  const strokeWidth = active ? 2.5 : 2;
  const color = active ? "var(--accent)" : "var(--muted)";

  switch (name) {
    case "home":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "add":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      );
    case "calendar":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case "chart":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    case "calc":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case "tips":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <line x1="9" y1="18" x2="15" y2="18" />
          <line x1="10" y1="22" x2="14" y2="22" />
          <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
        </svg>
      );
    default:
      return null;
  }
}
