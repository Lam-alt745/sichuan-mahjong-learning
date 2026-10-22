import glossaryJson from "./glossary.json";
import lessonsJson from "./lessons.json";
import type { GlossaryTerm, Lesson, LessonLevel } from "./types";

export const lessons = lessonsJson as Lesson[];
export const glossary = glossaryJson as GlossaryTerm[];

export const levelOrder: LessonLevel[] = ["L0", "L1", "L2", "L3", "L4", "L5"];

export const levelMeta: Array<{
  readonly level: LessonLevel;
  readonly zh: string;
  readonly en: string;
  readonly summaryZh: string;
  readonly summaryEn: string;
  readonly lessonCount: number;
}> = [
  { level: "L0", zh: "入门", en: "Foundations", summaryZh: "认三门牌、定缺、碰杠不吃", summaryEn: "Tiles, voiding, Pung/Kong/no Chow", lessonCount: 6 },
  { level: "L1", zh: "基础", en: "Core concepts", summaryZh: "听牌、自摸点炮、花猪查叫", summaryEn: "Ready hand, win sources, draw checks", lessonCount: 8 },
  { level: "L2", zh: "进阶", en: "Intermediate", summaryZh: "进张、牌效、防守与多听", summaryEn: "Effective tiles, efficiency, defense, waits", lessonCount: 8 },
  { level: "L3", zh: "算分", en: "Scoring", summaryZh: "番型、杠分、多家结算", summaryEn: "Patterns, Kong points, settlements", lessonCount: 8 },
  { level: "L4", zh: "高级", en: "Advanced", summaryZh: "剩张、风险、防守与变体提示", summaryEn: "Remaining counts, risk, defense, variants", lessonCount: 7 },
  { level: "L5", zh: "大师", en: "Mastery", summaryZh: "整局规划、复盘与巩固", summaryEn: "Planning, review, and consolidation", lessonCount: 6 }
];

export const termsById = new Map(glossary.map((term) => [term.id, term]));

export const lessonsByLevel = levelOrder.reduce<Record<LessonLevel, Lesson[]>>(
  (groups, level) => {
    groups[level] = lessons.filter((lesson) => lesson.level === level);
    return groups;
  },
  { L0: [], L1: [], L2: [], L3: [], L4: [], L5: [] }
);

export function getTerm(id: string): GlossaryTerm | undefined {
  return termsById.get(id);
}

export function getLesson(id: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.id === id);
}

export function getNextLevel(level: LessonLevel): LessonLevel | undefined {
  return levelOrder[levelOrder.indexOf(level) + 1];
}

export function getNextLessonId(lesson: Lesson): string | undefined {
  const levelLessons = lessonsByLevel[lesson.level];
  const index = levelLessons.findIndex((item) => item.id === lesson.id);
  if (index >= 0 && index < levelLessons.length - 1) {
    return levelLessons[index + 1].id;
  }

  const nextLevel = getNextLevel(lesson.level);
  return nextLevel ? lessonsByLevel[nextLevel][0]?.id : undefined;
}

export function isLevelUnlocked(level: LessonLevel, unlockedLevel: LessonLevel): boolean {
  return levelOrder.indexOf(level) <= levelOrder.indexOf(unlockedLevel);
}

export function isGateLesson(lesson: Lesson): boolean {
  const levelLessons = lessonsByLevel[lesson.level];
  return levelLessons[levelLessons.length - 1]?.id === lesson.id;
}

export function isLessonAvailable(
  lesson: Lesson,
  progress: { readonly unlockedLevel: LessonLevel; readonly lessonsDone: Record<string, boolean> }
): boolean {
  if (!isLevelUnlocked(lesson.level, progress.unlockedLevel)) {
    return false;
  }
  const levelLessons = lessonsByLevel[lesson.level];
  const lessonIndex = levelLessons.findIndex((item) => item.id === lesson.id);
  if (lessonIndex <= 0) {
    return true;
  }
  return levelLessons.slice(0, lessonIndex).every((item) => progress.lessonsDone[item.id]);
}

export function firstAvailableLessonId(progress: {
  readonly unlockedLevel: LessonLevel;
  readonly lessonsDone: Record<string, boolean>;
}): string {
  return (
    lessons.find((lesson) => isLessonAvailable(lesson, progress) && !progress.lessonsDone[lesson.id])?.id ??
    lessons.find((lesson) => isLessonAvailable(lesson, progress))?.id ??
    lessons[0].id
  );
}
