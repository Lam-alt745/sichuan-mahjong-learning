import { ArrowRight, Download, RotateCcw, Sparkles, Upload } from "lucide-react";
import { useMemo, useState, type ChangeEventHandler } from "react";
import { firstAvailableLessonId, getTerm, levelMeta, levelOrder, lessonsByLevel } from "../content/data";
import type { LangMode } from "../content/types";
import { Tile, TileRow } from "../components/Tile";
import { parseProgressImport, progressSnapshot, useProgressStore } from "../state/progress";
import type { AppView } from "../components/Topbar";

export function HomePage({
  mode,
  onView,
  onLesson
}: {
  readonly mode: LangMode;
  readonly onView: (view: AppView) => void;
  readonly onLesson: (lessonId: string) => void;
}) {
  const progress = useProgressStore();
  const importProgress = useProgressStore((state) => state.importProgress);
  const dismissPlacementPrompt = useProgressStore((state) => state.dismissPlacementPrompt);
  const [dailyAnswer, setDailyAnswer] = useState<"p" | "t" | "w" | undefined>();
  const [importStatus, setImportStatus] = useState<{ type: "ok" | "err"; text: string } | undefined>();
  const nextLesson = firstAvailableLessonId(progress);
  const weakTerms = progress.weakTerms.slice(0, 3);
  const reviewTerms = weakTerms.length > 0 ? weakTerms : ["void-suit", "pung", "pure-suit"];
  const reviewTiles = useMemo(() => ["2t", "3t", "4t", "7w", "7w"], []);
  const completedInUnlocked = lessonsByLevel[progress.unlockedLevel].filter((lesson) => progress.lessonsDone[lesson.id]).length;
  const totalInUnlocked = lessonsByLevel[progress.unlockedLevel].length || 1;
  const progressRatio = Math.round((completedInUnlocked / totalInUnlocked) * 100);
  const hasStartedLearning =
    Object.values(progress.lessonsDone).some(Boolean) ||
    Object.keys(progress.quizBest).length > 0 ||
    Object.values(progress.drillStats).some((stat) => stat.attempts > 0);
  const primaryActionLabel = hasStartedLearning ? "继续学习 · Continue" : "开始学习 · Start";
  const showPlacementPrompt = !hasStartedLearning && !progress.placementResult && !progress.placementPromptDismissed;

  const dailyCorrect = dailyAnswer === "p";

  const exportProgress = () => {
    const payload = JSON.stringify(progressSnapshot(progress), null, 2);
    const hasObjectUrl = typeof URL.createObjectURL === "function";
    const url = hasObjectUrl
      ? URL.createObjectURL(new Blob([payload], { type: "application/json" }))
      : `data:application/json;charset=utf-8,${encodeURIComponent(payload)}`;
    const link = document.createElement("a");
    link.href = url;
    link.download = `sichuan-mahjong-progress-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    if (hasObjectUrl) {
      URL.revokeObjectURL(url);
    }
  };

  const handleImport: ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseProgressImport(String(reader.result ?? ""));
      if (parsed.ok) {
        importProgress(parsed.progress);
        setImportStatus({ type: "ok", text: mode === "en" ? "Progress imported." : "进度已导入。" });
      } else {
        setImportStatus({ type: "err", text: mode === "en" ? parsed.errorEn : parsed.errorZh });
      }
    };
    reader.onerror = () => setImportStatus({ type: "err", text: mode === "en" ? "Could not read this file." : "无法读取这个文件。" });
    reader.readAsText(file);
  };

  return (
    <main>
      <section className="hero container">
        <div className="eyebrow">茶馆一桌 · A SEAT AT THE TEAHOUSE</div>
        <h1>{mode === "en" ? "From your first tile to fighting it out to the end" : "从认牌到血战到底"}</h1>
        <p className="hero-sub">
          {mode === "en"
            ? "Learn Sichuan Mahjong rules and decisions with Chinese-English reference."
            : "用中英双语对照学习四川麻将规则与决策。"}
        </p>
        <div className="hero-actions">
          <button
            className="btn btn-bamboo"
            type="button"
            onClick={() => {
              onLesson(nextLesson);
              onView("lessons");
            }}
          >
            {primaryActionLabel} <ArrowRight size={16} />
          </button>
          <button className="btn btn-line" type="button" onClick={() => onView("lessons")}>
            查看学习地图 · View map
          </button>
          <div className="hero-progress mono">
            {progress.unlockedLevel} · {completedInUnlocked}/{totalInUnlocked}
            <span className="progress">
              <i style={{ width: `${progressRatio}%` }} />
            </span>
          </div>
        </div>
        {showPlacementPrompt ? (
          <aside className="placement-invite panel">
            <div>
              <span className="m1-tag">首次可选 · OPTIONAL</span>
              <h2>不确定从哪里开始？</h2>
              <p>用 12 道规则与决策题找建议起点；不考英文术语，也不替你写入课程进度。</p>
            </div>
            <div className="placement-invite-actions">
              <button className="btn btn-bamboo" type="button" onClick={() => onView("placement")}>
                <Sparkles size={16} /> 测测从哪里开始
              </button>
              <button className="btn btn-line" type="button" onClick={dismissPlacementPrompt}>
                先从 L0 学
              </button>
            </div>
          </aside>
        ) : null}
      </section>

      <section className="home-grid container">
        <div>
          <div className="section-title">
            <h2>学习路径 · LEARNING PATH</h2>
          </div>
          <div className="level-list">
            {levelMeta.map((level) => {
              const unlocked = levelOrder.indexOf(level.level) <= levelOrder.indexOf(progress.unlockedLevel);
              const levelLessons = lessonsByLevel[level.level] ?? [];
              const done = levelLessons.length > 0 && levelLessons.every((lesson) => progress.lessonsDone[lesson.id]);
              return (
                <button
                  key={level.level}
                  type="button"
                  className={["level-card", level.level === progress.unlockedLevel ? "now" : "", !unlocked ? "locked" : ""]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => {
                    if (unlocked && lessonsByLevel[level.level]?.[0]) {
                      onLesson(lessonsByLevel[level.level][0].id);
                      onView("lessons");
                    }
                  }}
                >
                  <span className="lv-state">{done ? "已通关" : unlocked ? "可学习" : "未解锁"}</span>
                  <div className="lv-code">{level.level}</div>
                  <h3>{level.zh}</h3>
                  <div className="lv-en">{level.en}</div>
                  <p>{mode === "en" ? level.summaryEn : level.summaryZh}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="daily-stack">
          <section className="daily-card panel placement-home-card">
            <span className="m1-tag">学习摸底 · PLACEMENT</span>
            {progress.placementResult ? (
              <p className="daily-prompt">上次建议从 {progress.placementResult.recommendedLevel} 开始；你可以随时重测。</p>
            ) : (
              <p className="daily-prompt">按规则与决策判断推荐起点，不考英文术语，不改课程完成记录。</p>
            )}
            <button className="btn btn-line" type="button" onClick={() => onView("placement")}>
              <Sparkles size={15} /> {progress.placementResult ? "重新测评 · Retake" : "开始摸底 · Start"}
            </button>
          </section>

          <section className="daily-card panel">
            <span className="m1-tag">今日一题 · DAILY TILE</span>
            <div className="daily-tile">
              <Tile code="5p" size="lg" />
            </div>
            <p className="daily-prompt">
              {mode === "en" ? "Which suit and rank is this tile?" : "这张牌是哪一门、几点？"}
            </p>
            <div className="daily-options">
              {[
                ["p", "5 筒 · 5 Dots"],
                ["t", "5 条 · 5 Bamboo"],
                ["w", "5 万 · 5 Characters"]
              ].map(([value, label]) => (
                <button
                  key={value}
                  className={dailyAnswer === value ? (dailyCorrect ? "correct" : "wrong") : ""}
                  type="button"
                  onClick={() => setDailyAnswer(value as "p" | "t" | "w")}
                >
                  {label}
                </button>
              ))}
            </div>
            {dailyAnswer ? <p className={dailyCorrect ? "answer-ok" : "answer-err"}>{dailyCorrect ? "正确 · Correct" : "再看牌面 · Try again"}</p> : null}
          </section>

          <section className="daily-card panel">
            <span className="m1-tag">今日复习 · REVIEW</span>
            <div className="review-chips">
              {reviewTerms.map((id) => {
                const term = getTerm(id);
                return term ? (
                  <span className="chip" key={id}>
                    {term.zh} {term.en}
                  </span>
                ) : null;
              })}
            </div>
            <TileRow codes={reviewTiles} size="sm" />
            <button className="btn btn-line" type="button" onClick={() => onView("drills")}>
              <RotateCcw size={15} /> 开始练习 · Practice
            </button>
          </section>

          <section className="daily-card panel progress-tools">
            <span className="m1-tag">进度备份 · PROGRESS</span>
            <div className="progress-tool-actions">
              <button className="btn btn-line" type="button" onClick={exportProgress}>
                <Download size={15} /> 导出 · Export
              </button>
              <label className="btn btn-line">
                <Upload size={15} /> 导入 · Import
                <input type="file" accept="application/json,.json" onChange={handleImport} />
              </label>
            </div>
            {importStatus ? <p className={importStatus.type === "ok" ? "answer-ok" : "answer-err"}>{importStatus.text}</p> : null}
          </section>
        </div>
      </section>
    </main>
  );
}
