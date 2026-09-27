import { useSyncExternalStore } from "react";
import { useHydrated } from "@tanstack/react-router";
import type { Difficulty } from "./words";

export type ThemeName = "cyberpunk" | "synthwave" | "matrix" | "stealth" | "light";

export type Settings = {
  theme: ThemeName;
  sound: boolean;
  difficulty: Difficulty;
  numbers: boolean;
  punctuation: boolean;
  mode: "time" | "words" | "custom";
  time: number;
  words: number;
  customText: string;
  smoothCaret: boolean;
};

export const defaultSettings: Settings = {
  theme: "cyberpunk",
  sound: true,
  difficulty: "normal",
  numbers: false,
  punctuation: false,
  mode: "time",
  time: 30,
  words: 25,
  customText: "",
  smoothCaret: true,
};

export type TestResult = {
  id: string;
  date: number;
  wpm: number;
  raw: number;
  accuracy: number;
  consistency: number;
  mode: string;
  duration: number;
  correct: number;
  incorrect: number;
  extra: number;
  missed: number;
  xp: number;
};

export type Profile = {
  name: string;
  xp: number;
  tests: number;
  bestWpm: number;
  streak: number;
  lastPlayed: string | null;
  badges: string[];
  dailyChallengeDone: string | null;
};

export const defaultProfile: Profile = {
  name: "Runner-01",
  xp: 0,
  tests: 0,
  bestWpm: 0,
  streak: 0,
  lastPlayed: null,
  badges: [],
  dailyChallengeDone: null,
};

function createStore<T extends object>(key: string, initial: T) {
  let cache: T | null = null;
  const listeners = new Set<() => void>();

  const get = (): T => {
    if (cache) return cache;
    if (typeof window === "undefined") return initial;
    try {
      const raw = window.localStorage.getItem(key);
      cache = raw ? { ...initial, ...(JSON.parse(raw) as T) } : initial;
    } catch {
      cache = initial;
    }
    return cache;
  };

  const set = (updater: T | ((prev: T) => T)) => {
    const next = typeof updater === "function" ? (updater as (p: T) => T)(get()) : updater;
    cache = next;
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    listeners.forEach((l) => l());
  };

  const subscribe = (l: () => void) => {
    listeners.add(l);
    return () => void listeners.delete(l);
  };

  const use = (): T => {
    const value = useSyncExternalStore(subscribe, get, () => initial);
    const hydrated = useHydrated();
    return hydrated ? value : initial;
  };

  return { get, set, subscribe, use };
}

export const settingsStore = createStore<Settings>("blitz.settings", defaultSettings);
export const profileStore = createStore<Profile>("blitz.profile", defaultProfile);
export const historyStore = createStore<{ items: TestResult[] }>("blitz.history", { items: [] });

/* ---------------- levels / xp ---------------- */

export const LEVELS = [
  "Rookie",
  "Cadet",
  "Operative",
  "Speedster",
  "Overclocked",
  "Elite",
  "Cyber Ace",
  "Typing Master",
];

export function levelFromXp(xp: number) {
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;
  const capped = Math.min(level, 60);
  const currentFloor = Math.pow(capped - 1, 2) * 100;
  const nextFloor = Math.pow(capped, 2) * 100;
  const title = LEVELS[Math.min(LEVELS.length - 1, Math.floor((capped - 1) / 4))];
  return {
    level: capped,
    title,
    progress: Math.min(1, (xp - currentFloor) / (nextFloor - currentFloor)),
    toNext: Math.max(0, nextFloor - xp),
  };
}

export const BADGES: { id: string; name: string; desc: string }[] = [
  { id: "first-run", name: "First Run", desc: "Complete your first test" },
  { id: "wpm-40", name: "Warming Up", desc: "Reach 40 WPM" },
  { id: "wpm-60", name: "Overclocked", desc: "Reach 60 WPM" },
  { id: "wpm-80", name: "Blitz", desc: "Reach 80 WPM" },
  { id: "wpm-100", name: "Lightspeed", desc: "Reach 100 WPM" },
  { id: "flawless", name: "Flawless", desc: "Finish a test with 100% accuracy" },
  { id: "steady", name: "Steady Hands", desc: "Hit 90%+ consistency" },
  { id: "streak-3", name: "On Fire", desc: "3 day streak" },
  { id: "streak-7", name: "Unbreakable", desc: "7 day streak" },
  { id: "veteran", name: "Veteran", desc: "Complete 25 tests" },
];

export function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export function dailyChallenge() {
  const seed = Number(todayKey().replace(/-/g, "")) % 4;
  const list = [
    { label: "Score 50+ WPM on a 30s run", check: (r: TestResult) => r.wpm >= 50 },
    { label: "Finish a test with 95%+ accuracy", check: (r: TestResult) => r.accuracy >= 95 },
    { label: "Complete a 60s run", check: (r: TestResult) => r.duration >= 60 },
    { label: "Hit 85%+ consistency", check: (r: TestResult) => r.consistency >= 85 },
  ];
  return list[seed]!;
}

/** Records a finished test: history, xp, streak, badges. Returns unlocked badges. */
export function recordResult(result: TestResult) {
  historyStore.set((h) => ({ items: [result, ...h.items].slice(0, 200) }));

  const prev = profileStore.get();
  const today = todayKey();
  const yesterday = todayKey(new Date(Date.now() - 86400000));
  const streak =
    prev.lastPlayed === today
      ? prev.streak
      : prev.lastPlayed === yesterday
        ? prev.streak + 1
        : 1;

  const challenge = dailyChallenge();
  const challengeDone =
    prev.dailyChallengeDone === today ? today : challenge.check(result) ? today : prev.dailyChallengeDone;
  const bonusXp = challengeDone === today && prev.dailyChallengeDone !== today ? 150 : 0;

  const next: Profile = {
    ...prev,
    xp: prev.xp + result.xp + bonusXp,
    tests: prev.tests + 1,
    bestWpm: Math.max(prev.bestWpm, result.wpm),
    streak,
    lastPlayed: today,
    dailyChallengeDone: challengeDone,
  };

  const unlocked: string[] = [];
  const has = (id: string) => next.badges.includes(id);
  const tryUnlock = (id: string, cond: boolean) => {
    if (cond && !has(id)) {
      next.badges = [...next.badges, id];
      unlocked.push(id);
    }
  };
  tryUnlock("first-run", true);
  tryUnlock("wpm-40", result.wpm >= 40);
  tryUnlock("wpm-60", result.wpm >= 60);
  tryUnlock("wpm-80", result.wpm >= 80);
  tryUnlock("wpm-100", result.wpm >= 100);
  tryUnlock("flawless", result.accuracy === 100);
  tryUnlock("steady", result.consistency >= 90);
  tryUnlock("streak-3", streak >= 3);
  tryUnlock("streak-7", streak >= 7);
  tryUnlock("veteran", next.tests >= 25);

  profileStore.set(next);
  return { unlocked, bonusXp, isPersonalBest: result.wpm > prev.bestWpm };
}
