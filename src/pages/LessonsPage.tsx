import { LockKeyhole } from "lucide-react";
import { useEffect } from "react";
import {
  firstAvailableLessonId,
  isGateLesson,
  isLessonAvailable,
  lessons,
  lessonsByLevel,
  levelMeta
} from "../content/data";
import type { LangMode } from "../content/types";
import { LessonRenderer } from "../components/LessonRenderer";
import { useProgressStore } from "../state/progress";

export function LessonsPage({
  mode,
  selectedLessonId,
  onLesson
}: {
  readonly mode: LangMode;
  readonly selectedLessonId: string;
  readonly onLesson: (lessonId: string) => void;
}) {
  const progress = useProgressStore();
  const lesson = lessons.find((item) => item.id === selectedLessonId) ?? lessons[0];

  useEffect(() => {
    if (!isLessonAvailable(lesson, progress)) {
      onLesson(firstAvailableLessonId(progress));
    }
  }, [lesson, onLesson, progress]);

  const visibleLesson = isLessonAvailable(lesson, progress)
    ? lesson
    : lessons.find((item) => item.id === firstAvailableLessonId(progress)) ?? lessons[0];

  return (
    <main className="container page-grid">
      <aside className="lesson-nav panel">
        {levelMeta.map((level) => (
          <div key={level.level} className="lesson-nav-level">
            <h2>
              {level.level} · {mode === "en" ? level.en : level.zh}
            </h2>
            {lessonsByLevel[level.level].map((item) => {
              const available = isLessonAvailable(item, progress);
              const done = progress.lessonsDone[item.id];
              const best = progress.quizBest[item.id];
              return (
                <button
                  key={item.id}
                  type="button"
                  className={[item.id === visibleLesson.id ? "on" : "", !available ? "locked" : ""]
                    .filter(Boolean)
                    .join(" ")}
                  disabled={!available}
                  onClick={() => onLesson(item.id)}
                >
                  <span className="mono">{item.id}</span>
                  <span>{mode === "en" ? item.title.en : item.title.zh}</span>
                  {isGateLesson(item) ? <LockKeyhole size={13} /> : null}
                  {done ? <b>{best ?? 0}%</b> : null}
                </button>
              );
            })}
          </div>
        ))}
      </aside>
      <LessonRenderer lesson={visibleLesson} mode={mode} onNextLesson={onLesson} />
    </main>
  );
}
