import { create } from "zustand";
import type { LangMode, LessonLevel } from "../content/types";
import { isPlacementResult, type PlacementResult } from "../placement/placement";

export const progressStorageKey = "sichuan-mahjong.v1";

export interface DrillStat {
  readonly attempts: number;
  readonly correct: number;
  readonly wrongTerms: string[];
}

export interface PersistedProgress {
  readonly schemaVersion: 1;
  readonly langMode: LangMode;
  readonly coachMode: "guided" | "direct" | "off";
  readonly unlockedLevel: LessonLevel;
  readonly lessonsDone: Record<string, boolean>;
  readonly quizBest: Record<string, number>;
  readonly drillStats: Record<string, DrillStat>;
  readonly weakTerms: string[];
  readonly streakDays: number;
  readonly lastActiveDate: string;
  readonly tablePoints: number;
  readonly placementResult?: PlacementResult;
  readonly placementPromptDismissed: boolean;
}

interface ProgressStore extends PersistedProgress {
  readonly setLangMode: (langMode: LangMode) => void;
  readonly setCoachMode: (coachMode: PersistedProgress["coachMode"]) => void;
  readonly markLessonDone: (lessonId: string) => void;
  readonly recordQuiz: (lessonId: string, score: number, weakTerms: string[], unlockLevel?: LessonLevel) => void;
  readonly recordDrill: (drillId: string, total: number, correct: number, weakTerms: string[]) => void;
  readonly recordTablePoints: (delta: number) => void;
  readonly resetTablePoints: () => void;
  readonly recordPlacement: (result: PlacementResult) => void;
  readonly dismissPlacementPrompt: () => void;
  readonly applyPlacementLevel: (level: LessonLevel) => void;
  readonly importProgress: (progress: PersistedProgress) => void;
  readonly resetProgress: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

const initialProgress = (): PersistedProgress => ({
  schemaVersion: 1,
  langMode: "bi",
  coachMode: "guided",
  unlockedLevel: "L0",
  lessonsDone: {},
  quizBest: {},
  drillStats: {},
  weakTerms: [],
  streakDays: 1,
  lastActiveDate: today(),
  tablePoints: 0,
  placementResult: undefined,
  placementPromptDismissed: false
});

const progressFields = [
  "schemaVersion", "langMode", "coachMode", "unlockedLevel", "lessonsDone", "quizBest",
  "drillStats", "weakTerms", "streakDays", "lastActiveDate", "tablePoints",
  "placementResult", "placementPromptDismissed"
] as const;

export const useProgressStore = create<ProgressStore>((set, get) => {
  const persist = (patch: Partial<PersistedProgress>) => {
    set((state) => {
      const next = { ...state, ...patch, lastActiveDate: today() };
      saveProgress(next);
      return next;
    });
  };

  return {
    ...loadProgress(),
    setLangMode: (langMode) => persist({ langMode }),
    setCoachMode: (coachMode) => persist({ coachMode }),
    markLessonDone: (lessonId) => {
      const state = get();
      persist({ lessonsDone: { ...state.lessonsDone, [lessonId]: true } });
    },
    recordQuiz: (lessonId, score, weakTerms, unlockLevel) => {
      const state = get();
      const nextBest = Math.max(state.quizBest[lessonId] ?? 0, score);
      persist({
        lessonsDone: { ...state.lessonsDone, [lessonId]: true },
        quizBest: { ...state.quizBest, [lessonId]: nextBest },
        unlockedLevel: unlockLevel ?? state.unlockedLevel,
        weakTerms: mergeWeakTerms(state.weakTerms, weakTerms)
      });
    },
    recordDrill: (drillId, total, correct, weakTerms) => {
      const state = get();
      const current = state.drillStats[drillId] ?? { attempts: 0, correct: 0, wrongTerms: [] };
      persist({
        drillStats: {
          ...state.drillStats,
          [drillId]: {
            attempts: current.attempts + total,
            correct: current.correct + correct,
            wrongTerms: mergeWeakTerms(current.wrongTerms, weakTerms)
          }
        },
        weakTerms: mergeWeakTerms(state.weakTerms, weakTerms)
      });
    },
    recordTablePoints: (delta) => {
      const state = get();
      persist({ tablePoints: state.tablePoints + delta });
    },
    resetTablePoints: () => persist({ tablePoints: 0 }),
    recordPlacement: (result) => persist({ placementResult: result, placementPromptDismissed: true }),
    dismissPlacementPrompt: () => persist({ placementPromptDismissed: true }),
    applyPlacementLevel: (level) => {
      const state = get();
      persist({ unlockedLevel: maxLessonLevel(state.unlockedLevel, level), placementPromptDismissed: true });
    },
    importProgress: (progress) => {
      const validated = validateProgress(progress);
      if (validated) persist(validated);
    },
    resetProgress: () => persist(initialProgress())
  };
});

export function progressSnapshot(progress: PersistedProgress): PersistedProgress {
  return {
    schemaVersion: 1,
    langMode: progress.langMode,
    coachMode: progress.coachMode,
    unlockedLevel: progress.unlockedLevel,
    lessonsDone: progress.lessonsDone,
    quizBest: progress.quizBest,
    drillStats: progress.drillStats,
    weakTerms: progress.weakTerms,
    streakDays: progress.streakDays,
    lastActiveDate: progress.lastActiveDate,
    tablePoints: progress.tablePoints,
    placementResult: progress.placementResult,
    placementPromptDismissed: progress.placementPromptDismissed
  };
}

export function parseProgressImport(raw: string):
  | { readonly ok: true; readonly progress: PersistedProgress }
  | { readonly ok: false; readonly errorZh: string; readonly errorEn: string } {
  if (raw.length > 1_000_000) {
    return { ok: false, errorZh: "进度文件过大。", errorEn: "The progress file is too large." };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, errorZh: "这不是有效 JSON 文件。", errorEn: "This is not a valid JSON file." };
  }

  if (!isRecord(parsed) || parsed.schemaVersion !== 1) {
    return {
      ok: false,
      errorZh: "进度文件版本不匹配，需要 schemaVersion: 1。",
      errorEn: "Progress schema mismatch; schemaVersion: 1 is required."
    };
  }

  const progress = validateProgress(parsed);
  return progress
    ? { ok: true, progress }
    : { ok: false, errorZh: "进度文件字段不完整或不合法。", errorEn: "The progress file has missing or invalid fields." };
}



function validateProgress(value: unknown): PersistedProgress | undefined {
  if (!isRecord(value) || value.schemaVersion !== 1 || !onlyKeys(value, progressFields) || hasDangerousKey(value)) return;
  const next = { ...initialProgress(), ...value };
  if (!isLangMode(next.langMode) || !isCoachMode(next.coachMode) || !isLessonLevel(next.unlockedLevel)
    || !validMap(next.lessonsDone, (item) => typeof item === "boolean")
    || !validMap(next.quizBest, (item) => typeof item === "number" && Number.isFinite(item) && item >= 0 && item <= 100)
    || !validMap(next.drillStats, validDrill)
    || !stringList(next.weakTerms)
    || !nonnegativeInteger(next.streakDays)
    || typeof next.lastActiveDate !== "string" || !validDay(next.lastActiveDate)
    || typeof next.tablePoints !== "number" || !Number.isSafeInteger(next.tablePoints)
    || typeof next.placementPromptDismissed !== "boolean"
    || (next.placementResult !== undefined && !validPlacement(next.placementResult))) return;

  // Construct only persisted fields, never merge untrusted input into store actions.
  return {
    schemaVersion: 1,
    langMode: next.langMode,
    coachMode: next.coachMode,
    unlockedLevel: next.unlockedLevel,
    lessonsDone: Object.fromEntries(Object.entries(next.lessonsDone as Record<string, boolean>)),
    quizBest: Object.fromEntries(Object.entries(next.quizBest as Record<string, number>)),
    drillStats: Object.fromEntries(Object.entries(next.drillStats as Record<string, DrillStat>)
      .map(([key, stat]) => [key, { attempts: stat.attempts, correct: stat.correct, wrongTerms: [...stat.wrongTerms] }])),
    weakTerms: [...next.weakTerms as string[]],
    streakDays: next.streakDays as number,
    lastActiveDate: next.lastActiveDate,
    tablePoints: next.tablePoints,
    placementResult: next.placementResult === undefined ? undefined : {
      version: next.placementResult.version,
      completedAt: next.placementResult.completedAt,
      recommendedLevel: next.placementResult.recommendedLevel,
      levelScores: Object.fromEntries(Object.entries(next.placementResult.levelScores)
        .map(([level, score]) => [level, { correct: score.correct, total: score.total }])) as PlacementResult["levelScores"]
    },
    placementPromptDismissed: next.placementPromptDismissed
  };
}

function onlyKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).every((key) => keys.includes(key));
}

function hasDangerousKey(value: unknown, depth = 0): boolean {
  if (depth > 20) return true;
  if (Array.isArray(value)) return value.some((item) => hasDangerousKey(item, depth + 1));
  return isRecord(value) && Object.entries(value).some(([key, item]) =>
    ["__proto__", "prototype", "constructor"].includes(key) || hasDangerousKey(item, depth + 1));
}

function nonnegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function stringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function validMap(value: unknown, check: (item: unknown) => boolean): boolean {
  return isRecord(value) && Object.entries(value).every(([key, item]) => /^[A-Za-z0-9-]+$/.test(key) && check(item));
}

function validDrill(value: unknown): boolean {
  return isRecord(value) && onlyKeys(value, ["attempts", "correct", "wrongTerms"])
    && nonnegativeInteger(value.attempts) && nonnegativeInteger(value.correct)
    && value.correct <= value.attempts && stringList(value.wrongTerms);
}

function validDay(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validPlacement(value: unknown): value is PlacementResult {
  if (!isPlacementResult(value) || !isRecord(value)
    || !onlyKeys(value, ["version", "completedAt", "recommendedLevel", "levelScores"])
    || !Number.isFinite(Date.parse(value.completedAt))) return false;
  const levels = ["L0", "L1", "L2", "L3", "L4", "L5"];
  return onlyKeys(value.levelScores, levels) && levels.every((level) => {
    const score = value.levelScores[level as LessonLevel];
    return isRecord(score) && onlyKeys(score, ["correct", "total"])
      && nonnegativeInteger(score.correct) && nonnegativeInteger(score.total)
      && score.total > 0 && score.correct <= score.total;
  });
}

function loadProgress(): PersistedProgress {
  if (typeof window === "undefined") return initialProgress();
  try {
    const raw = window.localStorage.getItem(progressStorageKey);
    if (!raw) {
      const initial = initialProgress();
      saveProgress(initial);
      return initial;
    }
    const parsed = parseProgressImport(raw);
    return parsed.ok ? parsed.progress : initialProgress();
  } catch {
    return initialProgress();
  }
}

function saveProgress(progress: PersistedProgress): void {
  if (typeof window === "undefined") {
    return;
  }
  const persisted: PersistedProgress = {
    schemaVersion: 1,
    langMode: progress.langMode,
    coachMode: progress.coachMode,
    unlockedLevel: progress.unlockedLevel,
    lessonsDone: progress.lessonsDone,
    quizBest: progress.quizBest,
    drillStats: progress.drillStats,
    weakTerms: progress.weakTerms,
    streakDays: progress.streakDays,
    lastActiveDate: progress.lastActiveDate,
    tablePoints: progress.tablePoints,
    placementResult: progress.placementResult,
    placementPromptDismissed: progress.placementPromptDismissed
  };
  window.localStorage.setItem(progressStorageKey, JSON.stringify(persisted));
}

function mergeWeakTerms(current: readonly string[], incoming: readonly string[]): string[] {
  return [...new Set([...incoming, ...current])].slice(0, 12);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isLangMode(value: unknown): value is LangMode {
  return value === "zh" || value === "bi" || value === "en";
}

function isCoachMode(value: unknown): value is PersistedProgress["coachMode"] {
  return value === "guided" || value === "direct" || value === "off";
}

function isLessonLevel(value: unknown): value is LessonLevel {
  return value === "L0" || value === "L1" || value === "L2" || value === "L3" || value === "L4" || value === "L5";
}

function maxLessonLevel(current: LessonLevel, candidate: LessonLevel): LessonLevel {
  const levels: LessonLevel[] = ["L0", "L1", "L2", "L3", "L4", "L5"];
  return levels[Math.max(levels.indexOf(current), levels.indexOf(candidate))];
}
