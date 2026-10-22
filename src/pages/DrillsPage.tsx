import { RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { BiText, LangMode } from "../content/types";
import { bestDiscards, discardEfficiencies, evalMeld, isWinningHand, waits } from "../engine/hand";
import { evaluateScore, scoreForFan, type ScoreContext, type ScoreResult } from "../engine/scoring";
import {
  isVoidSuitCleared,
  makeSeededRandom,
  parseTile,
  SUITS,
  tileName,
  toTileCode,
  type TileCode,
  type TileRank,
  type TileSuit
} from "../engine/tiles";
import { TileRow } from "../components/Tile";
import { BiText as RenderBiText } from "../components/BiText";
import { useProgressStore } from "../state/progress";

type DrillId = "tile-id" | "meld" | "ready" | "win" | "discard" | "score";

interface DrillQuestion {
  readonly id: string;
  readonly prompt: BiText;
  readonly tiles: TileCode[];
  readonly options: BiText[];
  readonly correctIndex: number;
  readonly explanation: BiText;
  readonly terms: string[];
}

const drillLabels: Record<DrillId, { zh: string; en: string }> = {
  "tile-id": { zh: "认牌识别", en: "Tile identification" },
  meld: { zh: "面子识别", en: "Meld recognition" },
  ready: { zh: "听牌判断", en: "Ready-hand check" },
  win: { zh: "胡牌判断", en: "Winning-hand check" },
  discard: { zh: "牌效选择", en: "Discard efficiency" },
  score: { zh: "算番计分", en: "Score calculation" }
};

export function DrillsPage({ mode }: { readonly mode: LangMode }) {
  const [drillId, setDrillId] = useState<DrillId>("tile-id");
  const [seed, setSeed] = useState(1);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [recorded, setRecorded] = useState(false);
  const recordDrill = useProgressStore((state) => state.recordDrill);
  const stats = useProgressStore((state) => state.drillStats[drillId]);
  const questions = useMemo(() => buildQuestions(drillId, seed), [drillId, seed]);
  const complete = Object.keys(answers).length === questions.length;
  const correctCount = questions.filter((question) => answers[question.id] === question.correctIndex).length;

  useEffect(() => {
    setAnswers({});
    setRecorded(false);
  }, [drillId, seed]);

  useEffect(() => {
    if (complete && !recorded) {
      const weakTerms = questions.flatMap((question) =>
        answers[question.id] === question.correctIndex ? [] : question.terms
      );
      recordDrill(drillId, questions.length, correctCount, weakTerms);
      setRecorded(true);
    }
  }, [answers, complete, correctCount, drillId, questions, recordDrill, recorded]);

  return (
    <main className="container drills-page">
      <section className="page-head">
        <h1>练习器 · Drills</h1>
        <div className="segmented">
          {(["tile-id", "meld", "ready", "win", "discard", "score"] as const).map((id) => (
            <button key={id} type="button" className={drillId === id ? "on" : ""} onClick={() => setDrillId(id)}>
              {drillLabels[id].zh} · {drillLabels[id].en}
            </button>
          ))}
        </div>
      </section>

      <section className="drill-status panel">
        <div>
          <span className="m1-tag">{drillLabels[drillId].zh} · {drillLabels[drillId].en}</span>
          <p>
            {correctCount}/{questions.length} · {complete ? `${Math.round((correctCount / questions.length) * 100)}%` : "进行中"}
          </p>
        </div>
        <div className="muted">
          历史 · History {stats ? `${stats.correct}/${stats.attempts}` : "0/0"}
        </div>
        <button
          className="btn btn-line"
          type="button"
          onClick={() => {
            setSeed((value) => value + 1);
          }}
        >
          <RotateCcw size={15} /> 新一组 · New set
        </button>
      </section>

      <div className="drill-list">
        {questions.map((question, questionIndex) => {
          const selected = answers[question.id];
          const answered = selected !== undefined;
          return (
            <article key={question.id} className="drill-question panel">
              <div className="quiz-prompt">
                {questionIndex + 1}. {mode === "en" ? question.prompt.en : question.prompt.zh}
              </div>
              <TileRow codes={question.tiles} size="sm" />
              <div className="options">
                {question.options.map((option, optionIndex) => {
                  const stateClass = answered
                    ? optionIndex === question.correctIndex
                      ? "correct"
                      : optionIndex === selected
                        ? "wrong"
                        : ""
                    : "";
                  return (
                    <button
                      key={`${question.id}-${optionIndex}`}
                      type="button"
                      className={["opt", stateClass].filter(Boolean).join(" ")}
                      onClick={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))}
                    >
                      <span className="key">{String.fromCharCode(65 + optionIndex)}</span>
                      <span>{mode === "en" ? option.en : option.zh}</span>
                    </button>
                  );
                })}
              </div>
              {answered ? (
                <div className={selected === question.correctIndex ? "feedback ok" : "feedback err"}>
                  <RenderBiText value={question.explanation} mode={mode} />
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </main>
  );
}

function buildQuestions(drillId: DrillId, seed: number): DrillQuestion[] {
  if (drillId === "tile-id") return buildTileIdQuestions(seed);
  if (drillId === "meld") return buildMeldQuestions(seed);
  if (drillId === "ready") return buildReadyQuestions(seed);
  if (drillId === "win") return buildWinQuestions(seed);
  if (drillId === "discard") return buildDiscardQuestions(seed);
  return buildScoreQuestions(seed);
}

function buildTileIdQuestions(seed: number): DrillQuestion[] {
  const random = makeSeededRandom(`tile-id-${seed}`);
  return Array.from({ length: 10 }, (_, index) => {
    if (index % 5 === 4) {
      const voidSuit = SUITS[Math.floor(random() * SUITS.length)];
      const cleared = index % 10 === 4;
      const tiles = cleared
        ? makeTilesWithoutSuit(voidSuit, random)
        : [...makeTilesWithoutSuit(voidSuit, random).slice(0, 3), randomTile(voidSuit, random)];
      const correct = isVoidSuitCleared(tiles, voidSuit);
      return {
        id: `tile-void-${seed}-${index}`,
        prompt: {
          zh: `本局定缺 ${suitZh(voidSuit)}，这组牌是否已经打缺？`,
          en: `The declared void suit is ${suitEn(voidSuit)}. Has this set cleared it?`
        },
        tiles,
        options: [
          { zh: "合规，已打缺", en: "Legal, void suit cleared" },
          { zh: "不合规，仍有定缺门", en: "Not legal, void suit remains" }
        ],
        correctIndex: correct ? 0 : 1,
        explanation: {
          zh: correct ? "这组牌里没有定缺门。" : "这组牌里仍有定缺门牌。",
          en: correct ? "The declared void suit is not present." : "The declared void suit is still present."
        },
        terms: ["void-suit", "one-suit-missing"]
      };
    }

    const code = randomTile(undefined, random);
    const tile = parseTile(code);
    const correctName = tileName(code);
    const distractors = SUITS.filter((suit) => suit !== tile.suit)
      .slice(0, 2)
      .map((suit) => toTileCode(tile.rank, suit));
    const optionCodes = shuffleCodes([code, ...distractors], random);
    return {
      id: `tile-id-${seed}-${index}`,
      prompt: { zh: "请选择这张牌的门与点数。", en: "Choose this tile's suit and rank." },
      tiles: [code],
      options: optionCodes.map((optionCode) => {
        const name = tileName(optionCode);
        return { zh: name.zh, en: name.en };
      }),
      correctIndex: optionCodes.indexOf(code),
      explanation: { zh: `这是 ${correctName.zh}。`, en: `This is ${correctName.en}.` },
      terms: [tile.suit === "p" ? "dots" : tile.suit === "t" ? "bamboo" : "characters"]
    };
  });
}

function buildMeldQuestions(seed: number): DrillQuestion[] {
  const patterns: TileCode[][] = [
    ["5p", "5p", "5p"],
    ["3t", "4t", "5t"],
    ["7w", "7w"],
    ["3p", "4t", "5p"],
    ["2w", "2w", "2w"],
    ["6p", "7p", "8p"],
    ["9t", "9t"],
    ["1p", "3p", "4p"],
    ["4w", "5w", "6w"],
    ["8t", "8t", "8t"]
  ];
  return patterns.map((tiles, index) => {
    const evaluation = evalMeld(tiles);
    const correctIndex = evaluation.kind === "pung" ? 0 : evaluation.kind === "chow" ? 1 : evaluation.kind === "pair" ? 2 : 3;
    return {
      id: `meld-${seed}-${index}`,
      prompt: { zh: "请选择这组牌的结构。", en: "Choose the structure of this tile group." },
      tiles,
      options: [
        { zh: "刻子 · Pung", en: "Pung" },
        { zh: "顺子 · Chow", en: "Chow" },
        { zh: "对将 · Pair", en: "Pair" },
        { zh: "非面子 · Not a meld", en: "Not a meld" }
      ],
      correctIndex,
      explanation: { zh: evaluation.reasonZh, en: evaluation.reasonEn },
      terms: evaluation.kind === "pung" ? ["pung"] : evaluation.kind === "chow" ? ["chow", "no-chow"] : evaluation.kind === "pair" ? ["pair"] : ["meld"]
    };
  });
}

function buildReadyQuestions(seed: number): DrillQuestion[] {
  const patterns: TileCode[][] = [
    parseTileList("1p 2p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5t 5t"),
    parseTileList("1p 2p 3p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5t"),
    parseTileList("2p 4p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5t 5t"),
    parseTileList("1p 3p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5t 6t"),
    parseTileList("1p 1p 2p 2p 3p 3p 4p 4p 5t 5t 6t 6t 7t"),
    parseTileList("1p 2p 3p 3p 4p 5p 6p 7p 8p 7t 8t 9t 9t"),
    parseTileList("2p 3p 4p 4p 5p 6p 6t 7t 8t 2t 2t 3t 4t"),
    parseTileList("1p 1p 1p 2p 3p 4p 5p 6p 7p 3t 4t 6t 8t"),
    parseTileList("3p 4p 5p 5p 6p 7p 7p 8p 9p 1t 1t 2t 3t"),
    parseTileList("1p 2p 3p 4p 4p 4p 5t 6t 7t 7t 8t 9t 2p")
  ];
  const random = makeSeededRandom(`ready-${seed}`);
  return patterns.map((tiles, index) => {
    const tileWaits = waits(tiles, "w");
    const correctLabel = tileWaits.length > 0 ? waitOption(tileWaits) : { zh: "未听牌", en: "Not ready" };
    const options = shuffleBiOptions(
      [
        correctLabel,
        tileWaits.length > 0 ? { zh: "未听牌", en: "Not ready" } : { zh: "听 3筒", en: "Waits on 3 Dots" },
        { zh: "只听定缺门", en: "Only waits on the void suit" },
        { zh: "任意牌都能胡", en: "Any tile wins" }
      ],
      random
    );
    return {
      id: `ready-${seed}-${index}`,
      prompt: { zh: "定缺万，这手牌是否听牌？如果听，听哪些张？", en: "Void suit is Characters. Is this hand ready, and what are the waits?" },
      tiles,
      options,
      correctIndex: options.findIndex((option) => option.zh === correctLabel.zh),
      explanation: {
        zh: tileWaits.length > 0 ? `已听 ${formatTilesZh(tileWaits)}；这些牌补入后成胡。` : "未听牌；任一可用牌补入后都不能成胡。",
        en: tileWaits.length > 0 ? `Ready on ${formatTilesEn(tileWaits)}; those tiles complete a win.` : "Not ready; no legal incoming tile completes a win."
      },
      terms: ["ready-hand", "win", "one-suit-missing"]
    };
  });
}

function buildWinQuestions(seed: number): DrillQuestion[] {
  const patterns: Array<{ tiles: TileCode[]; voidSuit: TileSuit }> = [
    { tiles: parseTileList("1p 2p 3p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5t 5t"), voidSuit: "w" },
    { tiles: parseTileList("1p 1p 2p 2p 3p 3p 4p 4p 5t 5t 6t 6t 7t 7t"), voidSuit: "w" },
    { tiles: parseTileList("1p 2p 3p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5w 5w"), voidSuit: "w" },
    { tiles: parseTileList("1p 2p 4p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5t 5t"), voidSuit: "w" },
    { tiles: parseTileList("2p 3p 4p 3t 4t 5t 6t 7t 8t 7p 7p 7p 9p 9p"), voidSuit: "w" },
    { tiles: parseTileList("1p 1p 1p 2p 2p 2p 3p 3p 3p 4t 5t 6t 9t 9t"), voidSuit: "w" },
    { tiles: parseTileList("1p 1p 1p 2p 2p 2p 3p 3p 3p 4t 5t 7t 9t 9t"), voidSuit: "w" },
    { tiles: parseTileList("2t 3t 4t 4t 5t 6t 6t 7t 8t 3p 3p 3p 8p 8p"), voidSuit: "w" },
    { tiles: parseTileList("2t 2t 3t 3t 4t 4t 5t 5t 6p 6p 7p 7p 8p 8p"), voidSuit: "w" },
    { tiles: parseTileList("2t 2t 3t 3t 4t 4t 5t 5t 6p 6p 7p 7p 8w 8w"), voidSuit: "w" }
  ];
  return patterns.map(({ tiles, voidSuit }, index) => {
    const winning = isWinningHand(tiles, voidSuit);
    return {
      id: `win-${seed}-${index}`,
      prompt: { zh: `本局定缺 ${suitZh(voidSuit)}，这手牌能胡吗？`, en: `The declared void suit is ${suitEn(voidSuit)}. Is this a winning hand?` },
      tiles,
      options: [
        { zh: "能胡 · Winning", en: "Winning" },
        { zh: "不能胡 · Not winning", en: "Not winning" }
      ],
      correctIndex: winning ? 0 : 1,
      explanation: {
        zh: winning ? "满足缺门要求，并组成标准胡牌结构或七对。" : "未同时满足缺门要求与胡牌结构。",
        en: winning ? "The void suit is cleared and the hand forms a standard win or Seven pairs." : "The hand does not satisfy both the void-suit rule and a winning shape."
      },
      terms: ["win", "void-suit", winning && tiles.length === 14 ? "meld" : "one-suit-missing"]
    };
  });
}

function buildDiscardQuestions(seed: number): DrillQuestion[] {
  const hands: TileCode[][] = [
    parseTileList("1p 2p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5t 5t 9t"),
    parseTileList("1p 2p 3p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5t 8t"),
    parseTileList("2p 3p 4p 4p 5p 6p 6t 7t 8t 2t 2t 3t 4t 9p"),
    parseTileList("1p 1p 1p 2p 3p 4p 5p 6p 7p 3t 4t 6t 8t 9t"),
    parseTileList("3p 4p 5p 5p 6p 7p 7p 8p 9p 1t 1t 2t 3t 9p"),
    parseTileList("1p 2p 3p 4p 4p 4p 5t 6t 7t 7t 8t 9t 2p 9t"),
    parseTileList("2p 3p 4p 5p 6p 7p 7p 8p 9p 3t 4t 5t 8t 8t"),
    parseTileList("1p 2p 3p 3p 4p 5p 6p 7p 8p 7t 8t 9t 9t 1t"),
    parseTileList("2t 3t 4t 4t 5t 6t 6t 7t 8t 3p 3p 3p 8p 9p"),
    parseTileList("1p 1p 2p 2p 3p 3p 4p 4p 5t 5t 6t 6t 7t 9t")
  ];
  const random = makeSeededRandom(`discard-${seed}`);
  return hands.map((tiles, index) => {
    const efficiencies = discardEfficiencies(tiles, "w");
    const best = bestDiscards(tiles, "w")[0];
    const weaker = efficiencies.filter((item) => item.tile !== best.tile && item.waitCount < best.waitCount).slice(0, 3);
    const fallback = efficiencies.filter((item) => item.tile !== best.tile).slice(0, 3);
    const choices = [best, ...(weaker.length >= 2 ? weaker : fallback)].slice(0, 4);
    const options = shuffleBiOptions(
      choices.map((item) => ({
        zh: `打 ${tileName(item.tile).zh}`,
        en: `Discard ${tileName(item.tile).en}`
      })),
      random
    );
    const correctLabel = `打 ${tileName(best.tile).zh}`;
    return {
      id: `discard-${seed}-${index}`,
      prompt: { zh: "定缺万，选择打出后进张最多的一张。", en: "Void suit is Characters. Choose the discard that leaves the most waits." },
      tiles,
      options,
      correctIndex: options.findIndex((option) => option.zh === correctLabel),
      explanation: {
        zh: `打 ${tileName(best.tile).zh} 后可听 ${best.waits.length ? formatTilesZh(best.waits) : "无"}，进张数 ${best.waitCount}。`,
        en: `After discarding ${tileName(best.tile).en}, waits are ${best.waits.length ? formatTilesEn(best.waits) : "none"}; wait count ${best.waitCount}.`
      },
      terms: ["discard", "tile-efficiency", "effective-tiles", "ready-hand"]
    };
  });
}

function buildScoreQuestions(seed: number): DrillQuestion[] {
  const cases: Array<{
    readonly id: string;
    readonly tiles: TileCode[];
    readonly context: ScoreContext;
    readonly prompt: BiText;
    readonly terms: string[];
  }> = [
    {
      id: "pinhu-discard",
      tiles: parseTileList("1p 2p 3p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5t 5t"),
      context: { voidSuit: "w", source: "discard" },
      prompt: { zh: "按 §K，这手点炮胡的总番与每笔胡牌分是多少？", en: "Under K, what are the total fan and win payment for this discard win?" },
      terms: ["fan", "base-score", "point-payment"]
    },
    {
      id: "pure-self",
      tiles: parseTileList("1p 2p 3p 2p 3p 4p 5p 6p 7p 8p 8p 8p 9p 9p"),
      context: { voidSuit: "w", source: "self-draw" },
      prompt: { zh: "清一色自摸时，总番与每笔胡牌分是多少？", en: "For a Pure suit self-draw, what are the total fan and each win payment?" },
      terms: ["pure-suit", "self-draw-bonus", "fan"]
    },
    {
      id: "pure-triplets",
      tiles: parseTileList("2p 2p 2p 3p 3p 3p 4p 4p 4p 6p 6p 6p 8p 8p"),
      context: { voidSuit: "w", source: "discard" },
      prompt: { zh: "清对点炮胡，按最大番型应选哪个总番/分？", en: "For a Pure all-triplets discard win, which total fan and points apply?" },
      terms: ["pure-all-triplets", "score-settlement"]
    },
    {
      id: "rank-pairs",
      tiles: parseTileList("2p 2p 2p 5p 5p 5p 8t 8t 8t 2t 2t 2t 5t 5t"),
      context: { voidSuit: "w", source: "discard" },
      prompt: { zh: "将对点炮胡，按 §K 是多少？", en: "For an All 2/5/8 triplets discard win, what does K give?" },
      terms: ["rank-pairs", "fan"]
    },
    {
      id: "dragon-seven",
      tiles: parseTileList("1p 1p 1p 1p 2p 2p 3p 3p 4p 4p 5t 5t 6t 6t"),
      context: { voidSuit: "w", source: "discard" },
      prompt: { zh: "龙七对点炮胡，§K 的总番与每笔胡牌分是多少？", en: "For Dragon seven pairs on discard, what are the total fan and payment under K?" },
      terms: ["dragon-seven-pairs", "root", "fan"]
    },
    {
      id: "pure-dragon-self",
      tiles: parseTileList("1p 1p 1p 1p 2p 2p 3p 3p 4p 4p 5p 5p 6p 6p"),
      context: { voidSuit: "w", source: "self-draw" },
      prompt: { zh: "清龙七对自摸，不另加根时每笔是多少？", en: "For Pure dragon seven pairs self-draw with no extra roots, how much is each payment?" },
      terms: ["dragon-seven-pairs", "pure-seven-pairs", "self-draw-bonus"]
    },
    {
      id: "kong-draw",
      tiles: parseTileList("1p 2p 3p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5t 5t"),
      context: { voidSuit: "w", source: "self-draw", addOns: { kongDraw: true } },
      prompt: { zh: "平胡杠上花自摸，总番与每笔分是多少？", en: "For a Basic hand won by Kong draw self-draw, what are total fan and each payment?" },
      terms: ["kong-draw-win", "self-draw-bonus", "fan"]
    },
    {
      id: "cap",
      tiles: parseTileList("1p 1p 1p 1p 2p 2p 3p 3p 4p 4p 5p 5p 6p 6p"),
      context: { voidSuit: "w", source: "self-draw", addOns: { kongDraw: true, kongDiscard: true, roots: 2 } },
      prompt: { zh: "清龙七对另有杠上花、杠上炮和 2 根，自摸时按封顶每笔是多少？", en: "Pure dragon seven pairs with Kong draw, Kong discard, and 2 roots: after cap, how much is each self-draw payment?" },
      terms: ["score-cap", "root", "self-draw-bonus"]
    },
    {
      id: "heavenly",
      tiles: parseTileList("1p 2p 3p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5t 5t"),
      context: { voidSuit: "w", source: "self-draw", winTiming: "heavenly" },
      prompt: { zh: "天胡自摸按 §K 每笔是多少？", en: "For Heavenly hand self-draw under K, how much is each payment?" },
      terms: ["heavenly-hand", "self-draw-bonus", "fan"]
    },
    {
      id: "pure-seven",
      tiles: parseTileList("1p 1p 2p 2p 3p 3p 4p 4p 5p 5p 6p 6p 7p 7p"),
      context: { voidSuit: "w", source: "discard" },
      prompt: { zh: "清七对点炮胡，§K 的总番与分是多少？", en: "For Pure seven pairs on discard, what are the fan and points under K?" },
      terms: ["pure-seven-pairs", "seven-pairs", "fan"]
    }
  ];
  const random = makeSeededRandom(`score-${seed}`);
  return cases.map((item, index) => {
    const result = evaluateScore(item.tiles, item.context);
    const correct = scoreOption(result.totalFan, result.paymentPoints);
    const options = shuffleBiOptions([correct, ...scoreDistractors(result, item.context)].slice(0, 4), random);
    return {
      id: `score-${seed}-${item.id}-${index}`,
      prompt: item.prompt,
      tiles: item.tiles,
      options,
      correctIndex: options.findIndex((option) => option.zh === correct.zh),
      explanation: {
        zh: `${result.pattern.zh}；${result.baseFan}+${result.addFan} 番${result.capped ? "，8 番封顶" : ""}，每笔 ${result.paymentPoints} 分。`,
        en: `${result.pattern.en}; ${result.baseFan}+${result.addFan} fan${result.capped ? ", capped at 8 fan" : ""}, ${result.paymentPoints} points per payment.`
      },
      terms: item.terms
    };
  });
}

function scoreDistractors(result: ScoreResult, context: ScoreContext): BiText[] {
  const selfBonus = context.source === "self-draw" ? 2 : 0;
  const lowerFan = Math.max(1, result.totalFan - 1);
  const higherFan = Math.min(8, result.totalFan + 1);
  return [
    scoreOption(lowerFan, scoreForFan(lowerFan) + selfBonus),
    scoreOption(higherFan, scoreForFan(higherFan) + selfBonus),
    scoreOption(result.baseFan, scoreForFan(result.baseFan))
  ].filter((option) => option.zh !== scoreOption(result.totalFan, result.paymentPoints).zh);
}

function scoreOption(fan: number, points: number): BiText {
  return {
    zh: `${fan} 番 / 每笔 ${points} 分`,
    en: `${fan} fan / ${points} points per payment`
  };
}

function randomTile(suit: TileSuit | undefined, random: () => number): TileCode {
  const tileSuit = suit ?? SUITS[Math.floor(random() * SUITS.length)];
  const rank = (Math.floor(random() * 9) + 1) as TileRank;
  return toTileCode(rank, tileSuit);
}

function makeTilesWithoutSuit(voidSuit: TileSuit, random: () => number): TileCode[] {
  const suits = SUITS.filter((suit) => suit !== voidSuit);
  return Array.from({ length: 4 }, () => randomTile(suits[Math.floor(random() * suits.length)], random));
}

function shuffleCodes(codes: TileCode[], random: () => number): TileCode[] {
  const result = [...codes];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function shuffleBiOptions(options: BiText[], random: () => number): BiText[] {
  const result = [...options];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function parseTileList(input: string): TileCode[] {
  return input.split(/\s+/).filter(Boolean).map((value) => value as TileCode);
}

function waitOption(tileWaits: readonly TileCode[]): BiText {
  return {
    zh: `听 ${formatTilesZh(tileWaits)}`,
    en: `Waits on ${formatTilesEn(tileWaits)}`
  };
}

function formatTilesZh(tiles: readonly TileCode[]): string {
  return tiles.map((tile) => tileName(tile).zh).join("、");
}

function formatTilesEn(tiles: readonly TileCode[]): string {
  return tiles.map((tile) => tileName(tile).en).join(", ");
}

function suitZh(suit: TileSuit): string {
  return suit === "p" ? "筒" : suit === "t" ? "条" : "万";
}

function suitEn(suit: TileSuit): string {
  return suit === "p" ? "Dots" : suit === "t" ? "Bamboo" : "Characters";
}
