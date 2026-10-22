import type { TileSuit } from "../engine/tiles";

export type LangMode = "zh" | "bi" | "en";
export type LessonLevel = "L0" | "L1" | "L2" | "L3" | "L4" | "L5";

export interface BiText {
  readonly zh: string;
  readonly en: string;
}

export type LessonBlock =
  | {
      readonly type: "text";
      readonly body: BiText;
    }
  | {
      readonly type: "callout";
      readonly tone: "tip" | "warn";
      readonly body: BiText;
    }
  | {
      readonly type: "example";
      readonly title: BiText;
      readonly body: BiText;
      readonly tiles?: string[];
      readonly voidSuit?: TileSuit;
    };

export interface QuizOption {
  readonly label: BiText;
  readonly correct: boolean;
}

export interface QuizItem {
  readonly id: string;
  readonly prompt: BiText;
  readonly options: QuizOption[];
  readonly explanation: BiText;
  readonly terms: string[];
}

export interface Lesson {
  readonly id: string;
  readonly level: LessonLevel;
  readonly index: number;
  readonly title: BiText;
  readonly goal: BiText;
  readonly duration: number;
  readonly blocks: LessonBlock[];
  readonly quiz: QuizItem[];
}

export interface GlossaryTerm {
  readonly id: string;
  readonly zh: string;
  readonly en: string;
  readonly definition: BiText;
  readonly source: "EN" | "ZH" | "standard" | "descriptive";
  readonly review: boolean;
}
