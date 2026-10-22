import { describe, expect, it, vi } from "vitest";
import { evaluatePlacement, placementQuestions } from "../src/placement/placement";
import { parseProgressImport, progressSnapshot, useProgressStore, type PersistedProgress } from "../src/state/progress";

const allPlacementAnswers = Object.fromEntries(placementQuestions.map((question) => [question.id, question.correctIndex]));

const validProgress: PersistedProgress = {
  schemaVersion: 1,
  langMode: "bi",
  coachMode: "guided",
  unlockedLevel: "L5",
  lessonsDone: { "L5-06": true },
  quizBest: { "L5-06": 100 },
  drillStats: {
    score: {
      attempts: 10,
      correct: 8,
      wrongTerms: ["score-fan"]
    }
  },
  weakTerms: ["score-fan"],
  streakDays: 3,
  lastActiveDate: "2026-06-21",
  tablePoints: 24,
  placementResult: evaluatePlacement(allPlacementAnswers, "2026-07-23T12:00:00.000Z"),
  placementPromptDismissed: true
};

describe("progress import and export helpers", () => {
  it("round trips a schemaVersion 1 progress snapshot", () => {
    const exported = JSON.stringify(progressSnapshot(validProgress));
    const parsed = parseProgressImport(exported);

    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.progress.unlockedLevel).toBe("L5");
      expect(parsed.progress.tablePoints).toBe(24);
      expect(parsed.progress.drillStats.score.correct).toBe(8);
      expect(parsed.progress.placementResult?.recommendedLevel).toBe("L5");
    }
  });

  it("rejects damaged JSON with a friendly error", () => {
    const parsed = parseProgressImport("{broken");

    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.errorZh).toContain("有效 JSON");
      expect(parsed.errorEn).toContain("valid JSON");
    }
  });

  it("rejects incompatible schema versions", () => {
    const parsed = parseProgressImport(JSON.stringify({ ...validProgress, schemaVersion: 2 }));

    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.errorZh).toContain("schemaVersion: 1");
      expect(parsed.errorEn).toContain("schemaVersion: 1");
    }
  });

  it("imports pre-placement schemaVersion 1 progress with safe defaults", () => {
    const { placementResult: _placementResult, placementPromptDismissed: _placementPromptDismissed, ...legacyProgress } = validProgress;
    const parsed = parseProgressImport(JSON.stringify(legacyProgress));

    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.progress.placementResult).toBeUndefined();
      expect(parsed.progress.placementPromptDismissed).toBe(false);
    }
  });
});


// All malformed examples are synthetic and contain no learner records.
describe("untrusted progress boundaries", () => {
  it.each([
    { setLangMode: "synthetic-overwrite" },
    { importProgress: null },
    { unexpected: true },
    { tablePoints: { synthetic: true } },
    { tablePoints: 1e100 },
    { streakDays: -1 },
    { streakDays: 1.5 },
    { lastActiveDate: "2026-02-30" },
    { lessonsDone: [] },
    { lessonsDone: { "L0-01": "true" } },
    { quizBest: { "L0-01": 101 } },
    { quizBest: { "L0-01": -1 } },
    { drillStats: { score: { attempts: 2, correct: 3, wrongTerms: [] } } },
    { drillStats: { score: { attempts: -1, correct: 0, wrongTerms: [] } } },
    { drillStats: { score: { attempts: 2, correct: 1, wrongTerms: [7] } } },
    { drillStats: { score: { attempts: 2, correct: 1, wrongTerms: [], extra: true } } },
    { weakTerms: [null] },
    { placementPromptDismissed: "true" },
    { placementResult: {} },
    { placementResult: { ...validProgress.placementResult, extra: true } },
    { placementResult: { ...validProgress.placementResult, completedAt: "invalid" } },
    { placementResult: {
      ...validProgress.placementResult,
      levelScores: { ...validProgress.placementResult!.levelScores, L0: { correct: 3, total: 2 } }
    } }
  ])("rejects invalid fields: %j", (patch) => {
    expect(parseProgressImport(JSON.stringify({ ...validProgress, ...patch })).ok).toBe(false);
  });

  it.each(["__proto__", "constructor", "prototype"])("rejects dangerous key %s at every nesting level", (key) => {
    const base = JSON.stringify(validProgress);
    expect(parseProgressImport(base.replace('"schemaVersion":1', '"schemaVersion":1,"' + key + '":{}')).ok).toBe(false);
    expect(parseProgressImport(base.replace('"lessonsDone":{', '"lessonsDone":{"' + key + '":true,')).ok).toBe(false);
    expect(parseProgressImport(base.replace('"attempts":10', '"attempts":10,"' + key + '":{}')).ok).toBe(false);
  });

  it("rejects overflowing JSON numbers and oversized/deep input", () => {
    expect(parseProgressImport('{"schemaVersion":1,"tablePoints":1e400}').ok).toBe(false);
    expect(parseProgressImport(" ".repeat(1_000_001)).ok).toBe(false);
    const nested = '{"schemaVersion":1,"lessonsDone":' + '{"a":'.repeat(25) + 'true' + '}'.repeat(25) + '}';
    expect(parseProgressImport(nested).ok).toBe(false);
  });

  it("rejects the reported payload and protects actions even for direct store imports", () => {
    const raw = '{"schemaVersion":1,"setLangMode":"synthetic-overwrite","tablePoints":{"synthetic":true}}';
    expect(parseProgressImport(raw).ok).toBe(false);
    const before = useProgressStore.getState();
    before.importProgress(JSON.parse(raw));
    expect(useProgressStore.getState()).toBe(before);
    expect(useProgressStore.getState().setLangMode).toBe(before.setLangMode);
  });

  it("restores valid and legacy data while preserving all store actions", () => {
    const before = useProgressStore.getState();
    const actions = Object.entries(before).filter(([, value]) => typeof value === "function");
    const parsed = parseProgressImport(JSON.stringify(validProgress));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    before.importProgress(parsed.progress);
    const after = useProgressStore.getState();
    for (const [key, action] of actions) expect(after[key as keyof typeof after]).toBe(action);
    expect(after.tablePoints).toBe(24);
    expect(after.quizBest).toEqual(validProgress.quizBest);
    expect(after.placementResult).toEqual(validProgress.placementResult);
    expect(after.lastActiveDate).toBe(new Date().toISOString().slice(0, 10));
    after.setLangMode("en");
    expect(useProgressStore.getState().langMode).toBe("en");
    const { placementResult: _result, placementPromptDismissed: _dismissed, ...legacy } = validProgress;
    const old = parseProgressImport(JSON.stringify(legacy));
    if (!old.ok) throw new Error("legacy snapshot rejected");
    after.importProgress(old.progress);
    expect(useProgressStore.getState().placementResult).toBeUndefined();
    expect(useProgressStore.getState().placementPromptDismissed).toBe(false);
    useProgressStore.getState().resetProgress();
  });

  it.each([
    '{"schemaVersion":1,"tablePoints":{}}',
    '{"schemaVersion":1,"setLangMode":"synthetic-overwrite"}',
    JSON.stringify(validProgress)
  ])("loads storage through the same validator", async (raw) => {
    vi.resetModules();
    const setItem = vi.fn();
    vi.stubGlobal("window", { localStorage: { getItem: () => raw, setItem } });
    try {
      const module = await import("../src/state/progress");
      const state = module.useProgressStore.getState();
      expect(typeof state.setLangMode).toBe("function");
      expect(state.tablePoints).toBe(raw === JSON.stringify(validProgress) ? 24 : 0);
      state.setLangMode("zh");
      expect(module.useProgressStore.getState().langMode).toBe("zh");
      expect(setItem).toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
      vi.resetModules();
    }
  });
});
