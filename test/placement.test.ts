import { describe, expect, it } from "vitest";
import { evaluatePlacement, placementQuestions } from "../src/placement/placement";

function correctAnswers(): Record<string, number> {
  return Object.fromEntries(placementQuestions.map((question) => [question.id, question.correctIndex]));
}

describe("placement assessment", () => {
  it("recommends L5 after every level is secure", () => {
    const result = evaluatePlacement(correctAnswers(), "2026-07-23T12:00:00.000Z");

    expect(result.recommendedLevel).toBe("L5");
    expect(result.levelScores.L5).toEqual({ correct: 2, total: 2 });
  });

  it("routes to the first level with a knowledge gap", () => {
    const answers = correctAnswers();
    answers["L3-direct-kong"] = 1;
    const result = evaluatePlacement(answers, "2026-07-23T12:00:00.000Z");

    expect(result.recommendedLevel).toBe("L3");
    expect(result.levelScores.L0).toEqual({ correct: 2, total: 2 });
    expect(result.levelScores.L3).toEqual({ correct: 1, total: 2 });
  });

  it("does not use Chinese English-learning prompts or answers", () => {
    const assessedChinese = placementQuestions.flatMap((question) => [question.prompt.zh, ...question.options.map((option) => option.zh)]).join(" ");

    expect(assessedChinese).not.toMatch(/英文|英语|拼写|翻译/);
    expect(placementQuestions).toHaveLength(12);
  });
});
