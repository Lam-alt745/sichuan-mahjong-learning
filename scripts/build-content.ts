import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const files = [
  "content/L0-foundations.md",
  "content/L1-core-concepts.md",
  "content/L2-intermediate.md",
  "content/L3-scoring.md",
  "content/L4-advanced.md",
  "content/L5-mastery.md"
];
const outputDir = "src/content";

const glossary = [
  term("sichuan-mahjong", "四川麻将", "Sichuan Mahjong", "只用筒、条、万三门、强调定缺和血战到底的麻将玩法。", "A Mahjong variant using Dots, Bamboo, and Characters, centered on voiding a suit and fighting to the end.", "EN"),
  term("dots", "筒", "Dots / Circles", "三门之一，牌面画铜钱圆点。", "One of the three suits, represented here with coin-like circles.", "EN"),
  term("bamboo", "条", "Bamboo", "三门之一，牌面画竹节棍。", "One of the three suits, represented here with bamboo sticks.", "EN"),
  term("characters", "万", "Characters", "三门之一，牌面写汉字数字和「萬」。", "One of the three suits, represented with Chinese numerals and the character 萬.", "EN"),
  term("honor-tiles", "字牌", "Honor tiles", "风牌和箭牌属于字牌；四川麻将本课程核心规则不用字牌。", "Winds and dragons are honor tiles; this Sichuan Mahjong ruleset does not use them.", "EN"),
  term("void-suit", "定缺", "Void a suit", "开局声明放弃一门，胡牌前必须打缺该门。", "Declaring one suit to void; a winning hand must have cleared that suit.", "descriptive", true),
  term("declared-void-suit", "定缺门", "Declared void suit", "玩家声明要打缺的那一门。", "The suit a player has declared they must clear.", "descriptive", true),
  term("pung", "碰 / 刻子", "Pung", "三张同门同点数的面子；四川麻将可以碰。", "A meld of three identical suited tiles; it may be claimed in Sichuan Mahjong.", "EN"),
  term("kong", "杠", "Kong", "四张同门同点数的组合；L3 按 §K 讲杠分。", "Four identical suited tiles; L3 teaches Kong points under K.", "EN"),
  term("chow", "吃 / 顺子", "Chow", "三张同门连续点数的结构；四川麻将不可吃别家牌。", "A run of three consecutive tiles in one suit; claiming a discard for Chow is not allowed in Sichuan Mahjong.", "EN"),
  term("meld", "面子", "Meld", "刻子或顺子等组成胡牌骨架的三张结构；四川麻将顺子只能手内形成。", "A three-tile structure such as Pung or Chow; in Sichuan Mahjong, Chow is only a hand structure.", "standard"),
  term("pair", "将 / 对将", "Pair", "两张同门同点数，标准胡牌结构里的雀头。", "Two identical suited tiles, the pair in a standard winning hand.", "standard"),
  term("win", "胡", "Win / mahjong", "完成符合规则的胡牌结构并满足缺门要求。", "Completing a legal winning structure while satisfying the void-suit requirement.", "EN"),
  term("self-draw", "自摸", "Win from the wall / self-draw", "自己摸到完成胡牌的牌。", "Winning by drawing the completing tile yourself.", "EN"),
  term("discard-win", "点炮 / 放铳", "Win by discard", "别人打出的牌让你完成胡牌。", "Winning on a tile discarded by another player.", "EN"),
  term("fight-to-the-end", "血战到底", "Fight to the end / Bloody battle", "一家胡牌后牌局不立刻结束，未胡者继续。", "The hand continues after one player wins; players who have not won keep playing.", "descriptive", true),
  term("ready-hand", "听牌", "Ready hand / tenpai", "再来某些牌即可胡牌的状态。", "A state where specific incoming tiles would complete the hand.", "descriptive", true),
  term("flowery-pig", "花猪", "Flowery pig (no-void penalty)", "流局时仍有三门、未完成定缺的状态；L3 按 §K 讲教学积分。", "A no-void state at draw with all three suits still present; L3 teaches the K teaching-point settlement.", "descriptive", true),
  term("tenpai-check", "查叫 / 查大叫", "Tenpai check / no-ten penalty", "流局时检查是否听牌；L3 按 §K 讲查大叫。", "A draw-end check for ready hands; L3 teaches tenpai-check settlement under K.", "descriptive", true),
  term("pure-suit", "清一色", "Pure suit hand", "整副胡牌只使用一门牌。", "A winning hand made from one suit only.", "EN"),
  term("all-triplets", "对对胡", "All-triplets", "由刻子/杠和一对将组成的胡牌形态。", "A winning shape made of triplets/quads and one pair.", "EN"),
  term("seven-pairs", "七对", "Seven pairs", "七个对子组成的特殊胡牌形态；本期只讲定义。", "A special winning shape made of seven pairs; Phase 1 covers the definition only.", "descriptive", true),
  term("kong-bonuses", "刮风下雨", "Kong bonuses", "杠相关教学积分的俗称；§K 区分直杠、巴杠、暗杠。", "A colloquial term for Kong-related teaching points; K separates point, add-on, and concealed Kongs.", "descriptive", true),
  term("kong-draw-win", "杠上开花", "Win on a kong draw", "杠后补牌正好胡牌；§K 作为加番项处理。", "Winning on the replacement draw after a Kong; K treats it as an add-fan item.", "standard"),
  term("safe-tile", "安全牌", "Safe tile", "相对不容易让别人胡的舍牌；本期只做入门直觉。", "A discard that is relatively less likely to deal into another player; Phase 1 covers only the intuition.", "standard"),
  term("no-chow", "不可吃", "No Chow", "四川麻将可以碰、杠，但不能吃别家打出的顺子。", "Sichuan Mahjong allows Pung and Kong, but not claiming a discard for Chow.", "descriptive", true),
  term("one-suit-missing", "缺门", "One suit missing", "手牌中已经没有定缺那一门。", "The hand no longer contains the declared void suit.", "descriptive", true),
  term("discard", "舍牌", "Discard", "从手牌中打出一张牌。", "Playing one tile out of the hand.", "standard"),
  term("effective-tiles", "进张 / 有效牌", "Effective tiles", "摸到后能改善手牌、进入听牌或增加听牌面的牌。", "Incoming tiles that improve the hand, reach tenpai, or increase waits.", "standard"),
  term("tile-efficiency", "牌效率", "Tile efficiency", "比较不同舍牌后保留多少进张与成组可能的思路。", "A way to compare discards by the waits and shape potential they preserve.", "standard"),
  term("defense", "防守", "Defense", "在对手可能听牌时，优先减少放出成胡牌风险的打法。", "Playing to reduce the risk of discarding a tile that completes another player's win.", "standard"),
  term("discard-reading", "看舍牌读手", "Discard reading", "通过别人已经打出的牌，推测其可能保留或不需要的门与结构。", "Using visible discards to infer suits and shapes another player may be keeping or rejecting.", "descriptive", true),
  term("multiple-waits", "多听", "Multiple waits", "一手牌同时等待多种牌成胡，通常比单一等待更宽。", "A ready hand that can win on multiple incoming tiles, usually wider than a single wait.", "standard"),
  term("hand-direction", "做牌方向", "Hand direction", "围绕清缺、求快、保留对子/顺子等目标选择摸打路线。", "The plan behind discard choices, such as voiding, speed, pairs, or sequences.", "descriptive", true),
  term("fan", "番", "Fan", "番型和加番项合成的等级；§K 只按最大番型计，再加杠上花、杠上炮、根等加番。", "The level from the highest pattern plus add-fan items such as Kong draw, Kong discard, and roots under K.", "standard"),
  term("base-score", "底分", "Base score", "§K 锁定底分为 2 分，番数通过倍率换算成教学积分。", "K fixes the base score at 2 points; fan values convert to teaching points through multipliers.", "descriptive", true),
  term("score-cap", "封顶", "Score cap", "§K 单次胡牌总番 8 番封顶，对应 256 分基础胡牌值。", "K caps a single win at 8 fan, corresponding to 256 base win points.", "descriptive", true),
  term("teaching-points", "教学积分", "Teaching points", "本应用用于练习和复盘的本地积分，不具备现实价值或联机匹配含义。", "Local points for practice and review in this app, with no real-world value or networked match meaning.", "descriptive", true),
  term("score-settlement", "结算", "Settlement", "按 §K 解释谁因胡牌、杠分、花猪或查大叫向谁赔多少教学积分。", "The K-based explanation of who pays whom teaching points for wins, Kongs, flowery pig, or tenpai check.", "standard"),
  term("self-draw-bonus", "自摸加底", "Self-draw base add-on", "§K 自摸每笔胡牌在倍率分外加 2 分，不加番。", "Under K, self-draw adds 2 points to each win payment without adding fan.", "descriptive", true),
  term("point-payment", "点炮赔付", "Discard-win payment", "点炮时由打出成胡牌的一家承担该手胡牌赔付。", "On a discard win, the discarder pays the win payment for that hand.", "descriptive", true),
  term("multi-win", "一炮多响", "Multiple wins on one discard", "同一张舍牌让多人胡牌时，点炮者分别向每个胡牌家全额赔付。", "When one discard lets multiple players win, the discarder pays each winner separately.", "descriptive", true),
  term("root", "根", "Root", "四张相同未作杠，胡牌时每根按 §K 加 1 番；龙七对自带四张时减 1 根。", "Four identical tiles not declared as a Kong; each root adds 1 fan under K, with Dragon seven pairs subtracting its built-in quad.", "descriptive", true),
  term("no-terminals", "断幺九", "No-terminals", "整手胡牌不含 1 或 9，§K 计 1 番。", "A winning hand with no 1 or 9 tiles; K counts it as 1 fan.", "standard"),
  term("terminal-hand", "带幺九", "Terminal-containing hand", "全由含 1 或含 9 的连牌或幺九刻/对构成，§K 计 3 番。", "A hand built from terminal-containing runs or 1/9 triplets and pair; K counts it as 3 fan.", "descriptive", true),
  term("pure-all-triplets", "清对", "Pure all-triplets", "清一色的对对胡，§K 计 4 番。", "A Pure suit All-triplets hand; K counts it as 4 fan.", "descriptive", true),
  term("rank-pairs", "将对", "All 2/5/8 triplets", "全部由 2、5、8 的刻子/杠和将组成，§K 计 4 番。", "A triplet hand made only of 2, 5, and 8 ranks; K counts it as 4 fan.", "descriptive", true),
  term("dragon-seven-pairs", "龙七对", "Dragon seven pairs", "暗七对中含四张相同，§K 计 5 番。", "A concealed Seven pairs hand containing four identical tiles; K counts it as 5 fan.", "descriptive", true),
  term("pure-seven-pairs", "清七对", "Pure seven pairs", "清一色的七对，§K 计 5 番。", "A Pure suit Seven pairs hand; K counts it as 5 fan.", "descriptive", true),
  term("pure-terminal-hand", "清幺九", "Pure terminal hand", "清一色的带幺九，§K 计 5 番。", "A Pure suit terminal-containing hand; K counts it as 5 fan.", "descriptive", true),
  term("heavenly-hand", "天胡", "Heavenly hand", "庄家首次摸完即胡；§K 计 6 番，具体时机边界由牌桌状态标记。", "Dealer wins on the first draw; K counts it as 6 fan, with timing tracked by table state.", "descriptive", true),
  term("earthly-hand", "地胡", "Earthly hand", "非庄第一轮摸牌即胡；§K 计 6 番，具体时机边界由牌桌状态标记。", "A non-dealer wins on the first-round draw; K counts it as 6 fan, with timing tracked by table state.", "descriptive", true),
  term("remaining-counts", "剩张", "Remaining counts", "从可见牌中扣除每张牌已出现次数，估计牌墙和暗手里还剩几张。", "Counting visible tiles to estimate how many copies remain in the wall and hidden hands.", "standard"),
  term("weighted-waits", "加权进张", "Weighted waits", "不只数听几种牌，还按每种听牌剩余张数合计进张质量。", "Evaluating waits by remaining copy counts, not only by the number of wait types.", "descriptive", true),
  term("wait-quality", "听牌质量", "Wait quality", "听牌宽度、剩张、风险和收益共同决定的听牌好坏。", "The quality of a ready hand based on width, remaining counts, risk, and return.", "standard"),
  term("risk-tile", "危险牌", "Risk tile", "较可能让别人胡或明显推进别人手牌的舍牌。", "A discard that is more likely to complete or strongly improve another player's hand.", "standard"),
  term("opponent-profile", "对手画像", "Opponent profile", "用稳健、激进、保守、牌效、均衡等倾向描述对手决策。", "A decision tendency such as steady, aggressive, conservative, efficiency-focused, or balanced.", "descriptive", true),
  term("variant-rule", "变体规则", "Variant rule", "不同平台或桌规可能启用的非默认规则提示，本应用默认牌桌不启用。", "A non-default rule that may appear on some platforms or table rules; this app's default table does not enable it.", "descriptive", true),
  term("review-method", "复盘方法", "Review method", "用事实、选择、结果和下一次计划来拆解一局牌。", "Reviewing a hand through facts, choices, results, and the next plan.", "standard"),
  term("expected-value", "期望值", "Expected value", "比较不同选择长期平均收益和风险的直觉框架。", "A framework for comparing the long-run average return and risk of choices.", "standard"),
  term("table-plan", "整局规划", "Whole-hand plan", "从定缺、速度、做牌方向、风险和结算收益共同安排一局。", "Planning a hand across voiding, speed, hand direction, risk, and settlement return.", "descriptive", true)
];

const glossaryById = new Map(glossary.map((item) => [item.id, item]));

const lessons = [];
for (const file of files) {
  lessons.push(...parseLessons(await readFile(file, "utf8"), file));
}

const usedTerms = new Set();
for (const lesson of lessons) {
  collectTerms(JSON.stringify(lesson), usedTerms);
}

const missingTerms = [...usedTerms].filter((id) => !glossaryById.has(id));
if (missingTerms.length > 0) {
  throw new Error(`Missing glossary terms: ${missingTerms.join(", ")}`);
}

await mkdir(outputDir, { recursive: true });
await writeFile(path.join(outputDir, "lessons.json"), `${JSON.stringify(lessons, null, 2)}\n`);
await writeFile(path.join(outputDir, "glossary.json"), `${JSON.stringify(glossary, null, 2)}\n`);

console.log(`CONTENT_BUILT lessons=${lessons.length} terms=${glossary.length}`);

function term(id, zh, en, definitionZh, definitionEn, source, review = false) {
  return {
    id,
    zh,
    en,
    definition: { zh: definitionZh, en: definitionEn },
    source,
    review
  };
}

function parseLessons(markdown, file) {
  const parsedLessons = [];
  const lines = markdown.split(/\r?\n/);
  let lesson = null;
  let section = null;
  let block = null;
  let quizItem = null;

  const closeBlock = () => {
    if (block && lesson) {
      lesson.blocks.push(block);
    }
    block = null;
  };

  const closeQuizItem = () => {
    if (quizItem && lesson) {
      lesson.quiz.push(quizItem);
    }
    quizItem = null;
  };

  const closeLesson = () => {
    closeBlock();
    closeQuizItem();
    if (lesson) {
      parsedLessons.push(lesson);
    }
    lesson = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("# ") || line.startsWith("notation:")) {
      continue;
    }

    const lessonMatch = line.match(/^##\s+(L[0-5])-(\d{2})\s+(.+?)\s+·\s+(.+)$/);
    if (lessonMatch) {
      closeLesson();
      lesson = {
        id: `${lessonMatch[1]}-${lessonMatch[2]}`,
        level: lessonMatch[1],
        index: Number(lessonMatch[2]),
        title: { zh: lessonMatch[3], en: lessonMatch[4] },
        goal: { zh: "", en: "" },
        duration: 5,
        blocks: [],
        quiz: []
      };
      section = null;
      continue;
    }

    if (!lesson) {
      throw new Error(`Content outside lesson in ${file}: ${line}`);
    }

    const goalMatch = line.match(/^goal_zh:\s*(.*?)\s*\/\s*goal_en:\s*(.*)$/);
    if (goalMatch) {
      lesson.goal = { zh: goalMatch[1], en: goalMatch[2] };
      continue;
    }

    const durationMatch = line.match(/^duration:\s*(\d+)$/);
    if (durationMatch) {
      lesson.duration = Number(durationMatch[1]);
      continue;
    }

    const sectionMatch = line.match(/^###\s+(.+)$/);
    if (sectionMatch) {
      closeBlock();
      closeQuizItem();
      const label = sectionMatch[1];
      if (label === "text") {
        section = "block";
        block = { type: "text", body: { zh: "", en: "" } };
      } else if (label.startsWith("callout ")) {
        section = "block";
        block = { type: "callout", tone: label.replace("callout ", ""), body: { zh: "", en: "" } };
      } else if (label.startsWith("example ")) {
        const title = label.replace("example ", "");
        const titleMatch = title.match(/^(.+?)\s+·\s+(.+)$/);
        section = "block";
        block = {
          type: "example",
          title: { zh: titleMatch?.[1] ?? title, en: titleMatch?.[2] ?? title },
          body: { zh: "", en: "" }
        };
      } else if (label === "quiz") {
        section = "quiz";
      } else {
        throw new Error(`Unknown section "${label}" in ${file}`);
      }
      continue;
    }

    if (section === "block" && block) {
      const bi = parseBiLine(line);
      if (bi) {
        block.body = bi;
        continue;
      }
      const tilesMatch = line.match(/^tiles:\s*(.+)$/);
      if (tilesMatch && block.type === "example") {
        block.tiles = tilesMatch[1].split(/\s+/).filter(Boolean);
        continue;
      }
      const voidMatch = line.match(/^void:\s*([ptw])$/);
      if (voidMatch && block.type === "example") {
        block.voidSuit = voidMatch[1];
        continue;
      }
    }

    if (section === "quiz") {
      const questionMatch = line.match(/^\d+\.\s+q_zh:\s*(.*?)\s*\/\s*q_en:\s*(.*)$/);
      if (questionMatch) {
        closeQuizItem();
        quizItem = {
          id: `${lesson.id}-q${lesson.quiz.length + 1}`,
          prompt: { zh: questionMatch[1], en: questionMatch[2] },
          options: [],
          explanation: { zh: "", en: "" },
          terms: []
        };
        continue;
      }

      if (!quizItem) {
        throw new Error(`Quiz line before question in ${file}: ${line}`);
      }

      const optionMatch = line.match(/^-\s+zh:\s*(.*?)\s*\/\s*en:\s*(.*?)(\s+\*)?$/);
      if (optionMatch) {
        quizItem.options.push({
          label: { zh: optionMatch[1], en: optionMatch[2].trim() },
          correct: Boolean(optionMatch[3])
        });
        continue;
      }

      const explanationMatch = line.match(/^explain_zh:\s*(.*?)\s*\/\s*explain_en:\s*(.*)$/);
      if (explanationMatch) {
        quizItem.explanation = { zh: explanationMatch[1], en: explanationMatch[2] };
        continue;
      }

      const termsMatch = line.match(/^terms:\s*(.*)$/);
      if (termsMatch) {
        quizItem.terms = termsMatch[1].split(",").map((item) => item.trim()).filter(Boolean);
        continue;
      }
    }

    throw new Error(`Cannot parse line in ${file}: ${line}`);
  }

  closeLesson();
  return parsedLessons;
}

function parseBiLine(line) {
  const match = line.match(/^zh:\s*(.*?)\s*\/\s*en:\s*(.*)$/);
  if (!match) {
    return null;
  }
  return { zh: match[1], en: match[2] };
}

function collectTerms(text, sink) {
  const matches = text.matchAll(/\[\[term:([a-z0-9-]+)\]\]/g);
  for (const match of matches) {
    sink.add(match[1]);
  }
}
