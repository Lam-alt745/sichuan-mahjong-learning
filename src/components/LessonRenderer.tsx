import { ArrowRight, CheckCircle2, LockKeyhole, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { getNextLessonId, getNextLevel, getTerm, isGateLesson } from "../content/data";
import type { Lesson, LangMode } from "../content/types";
import { useProgressStore } from "../state/progress";
import { TileRow } from "./Tile";
import { BiText } from "./BiText";
import { TermCard } from "./TermCard";

export function LessonRenderer({
  lesson,
  mode,
  onNextLesson
}: {
  readonly lesson: Lesson;
  readonly mode: LangMode;
  readonly onNextLesson: (lessonId: string) => void;
}) {
  const [activeTerm, setActiveTerm] = useState<string | undefined>();
  const selectedTerm = activeTerm ? getTerm(activeTerm) : undefined;

  return (
    <div className="lesson-shell">
      <article className="lesson-main panel">
        <div className="lesson-head">
          <span className="mono">{lesson.id}</span>
          <span>{lesson.duration} min</span>
        </div>
        <h1>{mode === "en" ? lesson.title.en : lesson.title.zh}</h1>
        <BiText value={lesson.goal} mode={mode} onTerm={setActiveTerm} />
        {lesson.blocks.map((block, index) => {
          if (block.type === "text") {
            return <BiText key={index} value={block.body} mode={mode} onTerm={setActiveTerm} />;
          }
          if (block.type === "callout") {
            return (
              <div key={index} className={`callout ${block.tone}`}>
                <BiText value={block.body} mode={mode} onTerm={setActiveTerm} />
              </div>
            );
          }
          return (
            <section key={index} className="example-block">
              <h3>{mode === "en" ? block.title.en : block.title.zh}</h3>
              <BiText value={block.body} mode={mode} onTerm={setActiveTerm} />
              {block.tiles ? <TileRow codes={block.tiles} size="sm" /> : null}
              {block.voidSuit ? <p className="void-note">定缺 · Void: {block.voidSuit.toUpperCase()}</p> : null}
            </section>
          );
        })}
        <QuizPanel key={lesson.id} lesson={lesson} mode={mode} onTerm={setActiveTerm} onNextLesson={onNextLesson} />
      </article>
      <div className="lesson-side">
        <TermCard term={selectedTerm} mode={mode} />
      </div>
    </div>
  );
}

function QuizPanel({
  lesson,
  mode,
  onTerm,
  onNextLesson
}: {
  readonly lesson: Lesson;
  readonly mode: LangMode;
  readonly onTerm: (termId: string) => void;
  readonly onNextLesson: (lessonId: string) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const recordQuiz = useProgressStore((state) => state.recordQuiz);
  const quizBest = useProgressStore((state) => state.quizBest[lesson.id] ?? 0);
  const gate = isGateLesson(lesson);
  const nextLessonId = getNextLessonId(lesson);
  const score = useMemo(() => {
    const correct = lesson.quiz.filter((item) => {
      const selected = answers[item.id];
      return selected !== undefined && item.options[selected]?.correct;
    }).length;
    return Math.round((correct / lesson.quiz.length) * 100);
  }, [answers, lesson.quiz]);
  const complete = Object.keys(answers).length === lesson.quiz.length;
  const canContinue = submitted && nextLessonId && (!gate || score >= 80);

  const submit = () => {
    if (!complete) {
      return;
    }
    const missedTerms = lesson.quiz.flatMap((item) => {
      const selected = answers[item.id];
      return selected !== undefined && item.options[selected]?.correct ? [] : item.terms;
    });
    const unlockLevel = gate && score >= 80 ? getNextLevel(lesson.level) : undefined;
    recordQuiz(lesson.id, score, missedTerms, unlockLevel);
    setSubmitted(true);
  };

  return (
    <section className="quiz-panel">
      <div className="section-title">
        <h2>通关测验 · Quiz</h2>
        <span className="mono">Best {quizBest}%</span>
      </div>
      {lesson.quiz.map((item, questionIndex) => {
        const selected = answers[item.id];
        const answered = selected !== undefined;
        return (
          <div key={item.id} className="quiz-item">
            <p className="quiz-prompt">
              {questionIndex + 1}. {mode === "en" ? item.prompt.en : item.prompt.zh}
            </p>
            <div className="options">
              {item.options.map((option, optionIndex) => {
                const selectedThis = selected === optionIndex;
                const stateClass = answered
                  ? option.correct
                    ? "correct"
                    : selectedThis
                      ? "wrong"
                      : ""
                  : "";
                return (
                  <button
                    key={`${item.id}-${optionIndex}`}
                    type="button"
                    className={["opt", stateClass].filter(Boolean).join(" ")}
                    onClick={() => setAnswers((current) => ({ ...current, [item.id]: optionIndex }))}
                  >
                    <span className="key">{String.fromCharCode(65 + optionIndex)}</span>
                    <span>{mode === "en" ? option.label.en : option.label.zh}</span>
                  </button>
                );
              })}
            </div>
            {answered ? (
              <div className={item.options[selected].correct ? "feedback ok" : "feedback err"}>
                {item.options[selected].correct ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                <BiText value={item.explanation} mode={mode} onTerm={onTerm} />
              </div>
            ) : null}
          </div>
        );
      })}
      <div className="quiz-actions">
        <button className="btn btn-bamboo" type="button" disabled={!complete} onClick={submit}>
          提交测验 · Submit
        </button>
        {submitted ? (
          <span className={score >= 80 ? "pass-note" : "retry-note"}>
            {gate && score >= 80 ? <LockKeyhole size={15} /> : null}
            {score}% {score >= 80 ? "通过 · Passed" : "可重考 · Retake available"}
          </span>
        ) : null}
        {canContinue ? (
          <button
            className="btn btn-line"
            type="button"
            onClick={() => {
              onNextLesson(nextLessonId);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            下一课 · Next lesson <ArrowRight size={15} />
          </button>
        ) : null}
      </div>
    </section>
  );
}
