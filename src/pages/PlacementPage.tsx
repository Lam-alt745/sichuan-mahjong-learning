import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, Sparkles } from "lucide-react";
import { useState } from "react";
import { levelMeta, lessonsByLevel } from "../content/data";
import type { LangMode } from "../content/types";
import {
  evaluatePlacement,
  placementLevelLabels,
  placementLevels,
  placementQuestions,
  type PlacementResult
} from "../placement/placement";
import { useProgressStore } from "../state/progress";
import type { AppView } from "../components/Topbar";

export function PlacementPage({
  mode,
  onView,
  onLesson
}: {
  readonly mode: LangMode;
  readonly onView: (view: AppView) => void;
  readonly onLesson: (lessonId: string) => void;
}) {
  const unlockedLevel = useProgressStore((state) => state.unlockedLevel);
  const previousResult = useProgressStore((state) => state.placementResult);
  const recordPlacement = useProgressStore((state) => state.recordPlacement);
  const applyPlacementLevel = useProgressStore((state) => state.applyPlacementLevel);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [result, setResult] = useState<PlacementResult | undefined>();
  const question = placementQuestions[questionIndex];
  const selected = answers[question?.id];
  const isLastQuestion = questionIndex === placementQuestions.length - 1;

  const startRecommendedLevel = (level: typeof unlockedLevel) => {
    applyPlacementLevel(level);
    onLesson(lessonsByLevel[level][0].id);
    onView("lessons");
  };

  const startFromL0 = () => {
    onLesson(lessonsByLevel.L0[0].id);
    onView("lessons");
  };

  const next = () => {
    if (selected === undefined) return;
    if (!isLastQuestion) {
      setQuestionIndex((current) => current + 1);
      return;
    }
    const nextResult = evaluatePlacement(answers);
    recordPlacement(nextResult);
    setResult(nextResult);
  };

  const restart = () => {
    setAnswers({});
    setQuestionIndex(0);
    setResult(undefined);
  };

  if (result) {
    const recommendedMeta = levelMeta.find((level) => level.level === result.recommendedLevel)!;
    const wouldExpandAccess = placementLevels.indexOf(result.recommendedLevel) > placementLevels.indexOf(unlockedLevel);
    return (
      <main className="container placement-page">
        <section className="placement-result panel">
          <span className="m1-tag">摸底结果 · PLACEMENT RESULT</span>
          <CheckCircle2 size={34} className="placement-result-icon" />
          <h1>建议从 {result.recommendedLevel} · {recommendedMeta.zh} 开始</h1>
          <p className="placement-lead">
            {result.recommendedLevel === "L5"
              ? "你已稳定通过前置知识点，建议从 L5 做整局规划与复盘巩固。"
              : `先从 ${recommendedMeta.zh} 补齐当前最早出现的知识缺口，再继续向后学习。`}
          </p>
          <div className="placement-score-grid">
            {placementLevels.map((level) => {
              const score = result.levelScores[level];
              const label = placementLevelLabels[level];
              return (
                <div className={score.correct === score.total ? "placement-score pass" : "placement-score"} key={level}>
                  <span>{level} · {mode === "en" ? label.en : label.zh}</span>
                  <b>{score.correct}/{score.total}</b>
                </div>
              );
            })}
          </div>
          <p className="placement-note">
            摸底只给出建议，不会替你写入课程完成或课程测验成绩。{wouldExpandAccess ? "选择开始后才会开放建议层级。" : "你当前已开放的层级不会因重测回退。"}
          </p>
          <div className="placement-actions">
            <button className="btn btn-bamboo" type="button" onClick={() => startRecommendedLevel(result.recommendedLevel)}>
              从 {result.recommendedLevel} 开始 <ArrowRight size={16} />
            </button>
            <button className="btn btn-line" type="button" onClick={startFromL0}>
              从 L0 系统学
            </button>
            <button className="btn btn-line" type="button" onClick={restart}>
              <RotateCcw size={15} /> 重新测评
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="container placement-page">
      <section className="placement-head">
        <div>
          <span className="eyebrow">可选摸底 · OPTIONAL PLACEMENT</span>
          <h1>测测从哪里开始</h1>
          <p>
            12 道四川麻将规则与决策题，约 4 分钟；不考英文术语、拼写或表达，也不会改写你的课程完成记录。
          </p>
        </div>
        {previousResult ? <span className="chip">已有测评 · 上次建议 {previousResult.recommendedLevel}</span> : null}
      </section>

      <section className="placement-question panel">
        <div className="placement-question-meta">
          <span className="m1-tag">{question.level} · {placementLevelLabels[question.level].zh}</span>
          <span className="mono">{questionIndex + 1}/{placementQuestions.length}</span>
        </div>
        <span className="progress placement-progress"><i style={{ width: `${((questionIndex + 1) / placementQuestions.length) * 100}%` }} /></span>
        <h2>{mode === "en" ? question.prompt.en : question.prompt.zh}</h2>
        <div className="options placement-options">
          {question.options.map((option, optionIndex) => (
            <button
              key={`${question.id}-${optionIndex}`}
              type="button"
              className={selected === optionIndex ? "opt selected" : "opt"}
              onClick={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))}
            >
              <span className="key">{String.fromCharCode(65 + optionIndex)}</span>
              <span>{mode === "en" ? option.en : option.zh}</span>
            </button>
          ))}
        </div>
        <div className="placement-actions">
          <button className="btn btn-line" type="button" disabled={questionIndex === 0} onClick={() => setQuestionIndex((current) => current - 1)}>
            <ArrowLeft size={16} /> 上一题
          </button>
          <button className="btn btn-bamboo" type="button" disabled={selected === undefined} onClick={next}>
            {isLastQuestion ? <><Sparkles size={16} /> 查看建议</> : <>下一题 <ArrowRight size={16} /></>}
          </button>
        </div>
      </section>
    </main>
  );
}
