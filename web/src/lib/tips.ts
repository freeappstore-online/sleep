export interface SleepTip {
  title: string;
  body: string;
  icon: string;
}

export const SLEEP_TIPS: SleepTip[] = [
  {
    title: "Screens Off Before Bed",
    body: "Put away phones, tablets, and laptops at least 30 minutes before bedtime. Blue light suppresses melatonin production and delays sleep onset.",
    icon: "📵",
  },
  {
    title: "Keep a Consistent Schedule",
    body: "Go to bed and wake up at the same time every day, even on weekends. This reinforces your body's circadian rhythm.",
    icon: "🕐",
  },
  {
    title: "Cool Your Room",
    body: "The ideal bedroom temperature for sleep is 15-19 C (60-67 F). A cool environment helps your core body temperature drop, signaling sleep.",
    icon: "❄️",
  },
  {
    title: "Limit Caffeine After Noon",
    body: "Caffeine has a half-life of 5-6 hours. A coffee at 3 PM means half the caffeine is still in your system at 9 PM.",
    icon: "☕",
  },
  {
    title: "Create a Wind-Down Routine",
    body: "Spend 30-60 minutes before bed doing calming activities: reading, gentle stretching, journaling, or meditation.",
    icon: "🧘",
  },
  {
    title: "Exercise Regularly (But Not Late)",
    body: "Regular exercise improves sleep quality, but vigorous workouts within 2-3 hours of bedtime can keep you awake.",
    icon: "🏃",
  },
  {
    title: "Watch What You Eat at Night",
    body: "Avoid heavy meals within 2-3 hours of bedtime. A light snack is fine, but large meals can cause discomfort and disrupt sleep.",
    icon: "🍽️",
  },
  {
    title: "Make Your Room Dark",
    body: "Use blackout curtains or a sleep mask. Even small amounts of light can interfere with melatonin production.",
    icon: "🌙",
  },
  {
    title: "Reserve Your Bed for Sleep",
    body: "Avoid working, eating, or watching TV in bed. This trains your brain to associate the bed with sleep only.",
    icon: "🛏️",
  },
  {
    title: "Manage Stress and Worry",
    body: "If racing thoughts keep you awake, try writing them down before bed. A 'worry journal' can help clear your mind for sleep.",
    icon: "📝",
  },
];
