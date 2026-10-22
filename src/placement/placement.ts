import type { BiText, LessonLevel } from "../content/types";

export const placementVersion = 1 as const;

export interface PlacementQuestion {
  readonly id: string;
  readonly level: LessonLevel;
  readonly prompt: BiText;
  readonly options: readonly BiText[];
  readonly correctIndex: number;
  readonly explanation: BiText;
}

export interface PlacementLevelScore {
  readonly correct: number;
  readonly total: number;
}

export interface PlacementResult {
  readonly version: typeof placementVersion;
  readonly completedAt: string;
  readonly recommendedLevel: LessonLevel;
  readonly levelScores: Record<LessonLevel, PlacementLevelScore>;
}

export const placementLevels: readonly LessonLevel[] = ["L0", "L1", "L2", "L3", "L4", "L5"];

export const placementLevelLabels: Record<LessonLevel, BiText> = {
  L0: { zh: "入门规则", en: "Foundations" },
  L1: { zh: "牌型基础", en: "Hand structure" },
  L2: { zh: "听牌与牌效", en: "Waits and efficiency" },
  L3: { zh: "算分规则", en: "Scoring" },
  L4: { zh: "剩张与防守", en: "Remaining tiles and defense" },
  L5: { zh: "整局规划与复盘", en: "Planning and review" }
};

/**
 * The placement test deliberately checks Sichuan Mahjong knowledge only.
 * English strings are a reading aid for the app's language modes, never the
 * thing being selected, recalled, or scored.
 */
export const placementQuestions: readonly PlacementQuestion[] = [
  {
    id: "L0-tile-count",
    level: "L0",
    prompt: { zh: "本应用的四川麻将核心规则使用多少张牌？", en: "How many tiles are used in this app's core Sichuan Mahjong ruleset?" },
    options: [
      { zh: "108 张", en: "108 tiles" },
      { zh: "136 张", en: "136 tiles" },
      { zh: "144 张", en: "144 tiles" }
    ],
    correctIndex: 0,
    explanation: { zh: "只用万、条、筒三门，每门 36 张，共 108 张。", en: "Characters, Bamboo, and Dots have 36 tiles each, for 108 in total." }
  },
  {
    id: "L0-no-chow",
    level: "L0",
    prompt: { zh: "别人打出一张牌时，四川麻将的哪项动作不能做？", en: "Which action is not allowed on another player's discard in Sichuan Mahjong?" },
    options: [
      { zh: "碰", en: "Claim a Pung" },
      { zh: "杠", en: "Claim a Kong" },
      { zh: "吃", en: "Claim a Chow" }
    ],
    correctIndex: 2,
    explanation: { zh: "四川麻将可以碰、杠，但不能吃别家舍牌。", en: "Sichuan Mahjong allows Pung and Kong claims, but not Chow claims." }
  },
  {
    id: "L1-void-condition",
    level: "L1",
    prompt: { zh: "定缺万时，哪组牌已经满足缺门要求？", en: "With Characters voided, which set has cleared the declared suit?" },
    options: [
      { zh: "2筒、3筒、4条、6条", en: "2 Dots, 3 Dots, 4 Bamboo, 6 Bamboo" },
      { zh: "2筒、3万、4条、6条", en: "2 Dots, 3 Characters, 4 Bamboo, 6 Bamboo" },
      { zh: "2筒、3条、4万、6万", en: "2 Dots, 3 Bamboo, 4 Characters, 6 Characters" }
    ],
    correctIndex: 0,
    explanation: { zh: "定缺万后，手中不能再有万。", en: "Once Characters are voided, no Characters may remain in the hand." }
  },
  {
    id: "L1-win-shape",
    level: "L1",
    prompt: { zh: "标准胡牌骨架需要哪一项？", en: "What belongs in a standard winning-hand structure?" },
    options: [
      { zh: "4 个面子加 1 对将", en: "Four melds plus one pair" },
      { zh: "5 个对子", en: "Five pairs" },
      { zh: "三门牌各一组", en: "One group from each of three suits" }
    ],
    correctIndex: 0,
    explanation: { zh: "标准胡牌由 4 个面子和 1 对将构成，另有七对等特殊结构。", en: "A standard win has four melds and one pair; seven pairs is a separate special structure." }
  },
  {
    id: "L2-effective-tile",
    level: "L2",
    prompt: { zh: "已定缺万，手里有 1筒、2筒；最直接的有效牌是哪张？", en: "With Characters voided, which tile most directly improves 1 Dots and 2 Dots?" },
    options: [
      { zh: "3筒", en: "3 Dots" },
      { zh: "5条", en: "5 Bamboo" },
      { zh: "9万", en: "9 Characters" }
    ],
    correctIndex: 0,
    explanation: { zh: "3筒能把 1筒、2筒直接连成顺子结构。", en: "3 Dots directly completes the 1–2 Dots run shape." }
  },
  {
    id: "L2-discard-compare",
    level: "L2",
    prompt: { zh: "清缺后比较两张候选舍牌，最可靠的第一步是什么？", en: "After clearing the void suit, what is the most reliable first step when comparing two discards?" },
    options: [
      { zh: "分别打出候选牌，比较留下的进张", en: "Discard each candidate and compare the remaining improving tiles" },
      { zh: "总是保留孤张", en: "Always keep isolated tiles" },
      { zh: "只看哪张牌更好看", en: "Choose the better-looking tile" }
    ],
    correctIndex: 0,
    explanation: { zh: "牌效比较要看每个候选舍牌后留下哪些进张与听牌。", en: "Efficiency compares the improving tiles and waits left after each candidate discard." }
  },
  {
    id: "L3-self-draw",
    level: "L3",
    prompt: { zh: "按本应用 §K，3 番自摸时，每位未胡家要付多少教学积分？", en: "Under K in this app, how many teaching points does each not-yet-won player pay for a 3-fan self-draw?" },
    options: [
      { zh: "8 分", en: "8 points" },
      { zh: "10 分", en: "10 points" },
      { zh: "32 分", en: "32 points" }
    ],
    correctIndex: 1,
    explanation: { zh: "3 番基础值是 8 分；自摸每位付款方再加底 2 分，合计 10 分。", en: "Three fan is worth 8 base points; self-draw adds 2 for each payer, making 10." }
  },
  {
    id: "L3-direct-kong",
    level: "L3",
    prompt: { zh: "直杠时，按 §K 的 4 分由谁支付？", en: "For a direct Kong, who pays the 4 teaching points under K?" },
    options: [
      { zh: "点杠的那一家", en: "The player whose discard enabled the Kong" },
      { zh: "所有未胡家平分", en: "All not-yet-won players" },
      { zh: "开杠者自己", en: "The player declaring the Kong" }
    ],
    correctIndex: 0,
    explanation: { zh: "直杠由点杠者一家赔 4 分；不同杠型的结算不同。", en: "A direct Kong is paid by the discarding player for 4 points; other Kong types settle differently." }
  },
  {
    id: "L4-remaining-count",
    level: "L4",
    prompt: { zh: "一张 5筒已经可见 3 张，还剩几张可能在牌墙或对家暗手？", en: "If three copies of 5 Dots are visible, how many can remain in the wall or hidden hands?" },
    options: [
      { zh: "0 张", en: "0" },
      { zh: "1 张", en: "1" },
      { zh: "2 张", en: "2" }
    ],
    correctIndex: 1,
    explanation: { zh: "每种牌有 4 张；可见 3 张时，只剩 1 张未见。", en: "There are four copies of each tile, so three visible copies leave one unseen." }
  },
  {
    id: "L4-defense-evidence",
    level: "L4",
    prompt: { zh: "基础防守最应依赖哪类信息？", en: "What information should basic defense rely on first?" },
    options: [
      { zh: "可见舍牌与自己手牌", en: "Visible discards and your own hand" },
      { zh: "猜测对手暗手的完整牌型", en: "A guessed complete hidden hand for an opponent" },
      { zh: "只看自己的教学积分", en: "Only your teaching-point total" }
    ],
    correctIndex: 0,
    explanation: { zh: "防守判断只能基于可见信息作推断，不会透视对手暗手。", en: "Defense infers from visible information and never sees opponents' hidden hands." }
  },
  {
    id: "L5-plan-update",
    level: "L5",
    prompt: { zh: "整局规划遇到新的摸牌、舍牌和剩张信息时，正确做法是什么？", en: "What should happen to a whole-hand plan when new draws, discards, and remaining-tile information appear?" },
    options: [
      { zh: "根据新信息更新路线", en: "Update the plan with the new information" },
      { zh: "坚持开局的路线不变", en: "Keep the opening plan unchanged" },
      { zh: "只看名义番数", en: "Look only at nominal fan value" }
    ],
    correctIndex: 0,
    explanation: { zh: "规划不是固定路线，要随听牌、剩张、风险和结算预期更新。", en: "A plan is not fixed; it changes with waits, remaining tiles, risk, and expected settlement." }
  },
  {
    id: "L5-review-action",
    level: "L5",
    prompt: { zh: "复盘后，怎样的“下次计划”最有效？", en: "What makes the most effective next plan after a review?" },
    options: [
      { zh: "写下一条可执行的改进", en: "Write one actionable improvement" },
      { zh: "只写运气不好", en: "Write only that luck was bad" },
      { zh: "一次改变所有习惯", en: "Change every habit at once" }
    ],
    correctIndex: 0,
    explanation: { zh: "复盘要把事实和选择转成下一局能执行的一条改进。", en: "A review turns facts and choices into one improvement you can use in the next hand." }
  }
];

export function evaluatePlacement(answers: Readonly<Record<string, number>>, completedAt = new Date().toISOString()): PlacementResult {
  const levelScores = Object.fromEntries(
    placementLevels.map((level) => {
      const questions = placementQuestions.filter((question) => question.level === level);
      return [
        level,
        {
          correct: questions.filter((question) => answers[question.id] === question.correctIndex).length,
          total: questions.length
        }
      ];
    })
  ) as Record<LessonLevel, PlacementLevelScore>;
  const recommendedLevel = placementLevels.find((level) => levelScores[level].correct < levelScores[level].total) ?? "L5";

  return { version: placementVersion, completedAt, recommendedLevel, levelScores };
}

export function isPlacementResult(value: unknown): value is PlacementResult {
  if (!isRecord(value) || value.version !== placementVersion || typeof value.completedAt !== "string" || !isLessonLevel(value.recommendedLevel)) {
    return false;
  }
  const levelScores = value.levelScores;
  if (!isRecord(levelScores)) {
    return false;
  }
  return placementLevels.every((level) => {
    const score = levelScores[level];
    return isRecord(score) && typeof score.correct === "number" && typeof score.total === "number" && score.correct >= 0 && score.total > 0;
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isLessonLevel(value: unknown): value is LessonLevel {
  return placementLevels.includes(value as LessonLevel);
}
