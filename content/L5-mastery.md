# L5 Mastery notation
notation: `3t`=3 条 Bamboo, `5p`=5 筒 Dots, `7w`=7 万 Characters.

## L5-01 整局规划 · Whole-hand planning
goal_zh: 用 [[term:table-plan]] 把定缺、速度、做牌和风险连起来。 / goal_en: Use [[term:table-plan]] to connect voiding, speed, hand direction, and risk.
duration: 8

### text
zh: 一局牌不是每摸一张才临时决定。[[term:table-plan]] 从开局就开始：先定缺，再判断求快还是做牌；中期比较进张和番型；后期把防守、剩张和 [[term:score-settlement]] 合并。 / en: A hand is not decided one draw at a time. A [[term:table-plan]] starts from the opening: declare the void suit, decide speed versus pattern-building, compare outs and fan in the middle, then combine defense, remaining counts, and [[term:score-settlement]] late.

### callout tip
zh: 好规划不是固定路线，而是每轮用新信息更新路线。 / en: A good plan is not a fixed path; it updates with new information each turn.

### example 先快后稳 · Fast first, stable later
zh: 定缺万后，先打万清缺；如果很快听牌，就求速度；若摸成清一色雏形，再考虑转高番。 / en: After voiding Characters, discard Characters first. If ready comes quickly, prioritize speed; if a Pure suit shape appears, consider a higher-fan turn.
tiles: 1p 2p 4p 5p 6p 7p 8p 2t 2t 5t 5t 7w 8w
void: w

### quiz
1. q_zh: 整局规划的第一步通常是什么？ / q_en: What is usually the first step in whole-hand planning?
   - zh: 定缺并清缺 / en: Declare and clear the void suit *
   - zh: 先算封顶 / en: Calculate the cap first
   - zh: 保留三门 / en: Keep all three suits
   explain_zh: 四川麻将先定缺，胡牌前必须缺门。 / explain_en: Sichuan Mahjong starts with void suit, and a win must clear that suit.
   terms: table-plan, void-suit, one-suit-missing
2. q_zh: 规划是否应该随摸牌和舍牌更新？ / q_en: Should the plan update with draws and discards?
   - zh: 应该 / en: Yes *
   - zh: 不应该 / en: No
   - zh: 只在流局后更新 / en: Only after a draw
   explain_zh: 新的剩张、听牌和风险会改变最优路线。 / explain_en: New remaining counts, readiness, and risk can change the best route.
   terms: table-plan, remaining-counts, risk-tile

## L5-02 复盘方法论 · Review method
goal_zh: 用 [[term:review-method]] 把一局牌拆成可改进的步骤。 / goal_en: Use a [[term:review-method]] to turn a hand into improvable steps.
duration: 8

### text
zh: [[term:review-method]] 分四层：事实、选择、结果、下次计划。事实包括定缺门、可见牌、听牌和结算；选择包括每次舍牌、碰杠和胡；结果包括番型和教学积分；下次计划只写一条可执行改进。 / en: A [[term:review-method]] has four layers: facts, choices, results, and next plan. Facts include void suit, visible tiles, waits, and settlement. Choices include discards, Pung/Kong, and wins. Results include pattern and teaching points. The next plan should be one actionable improvement.

### callout tip
zh: 复盘不要只说“运气不好”；先找一个能控制的选择。 / en: Do not review only as "bad luck"; find one controllable choice first.

### example 复盘卡 · Review card
zh: 事实：定缺万、听 3 筒剩 0 张。选择：仍然追这门。结果：未听流局。下次：听牌前先看剩张。 / en: Fact: void Characters, wait on 3 Dots with 0 remaining. Choice: still chased that wait. Result: draw while not ready. Next: check remaining counts before committing.
tiles: 1p 2p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5t 5t
void: w

### quiz
1. q_zh: 复盘的“事实”应包含什么？ / q_en: What belongs in the "facts" layer of review?
   - zh: 可见牌、听牌、结算等可观察信息 / en: Visible tiles, waits, settlement, and other observable information *
   - zh: 只写情绪 / en: Only emotion
   - zh: 随便猜对手暗手 / en: Random guesses about hidden hands
   explain_zh: 事实层必须来自可见或 engine 可推导信息。 / explain_en: Facts must come from visible or engine-derived information.
   terms: review-method, remaining-counts, score-settlement
2. q_zh: 好的下次计划应该怎样？ / q_en: What should a good next plan look like?
   - zh: 一条可执行改进 / en: One actionable improvement *
   - zh: 越长越好 / en: As long as possible
   - zh: 只写“赢” / en: Only write "win"
   explain_zh: 复盘要转成下一局能做的动作。 / explain_en: Review should become an action you can use next hand.
   terms: review-method, table-plan

## L5-03 期望值直觉 · Expected value intuition
goal_zh: 把 [[term:expected-value]] 用在番型收益、速度和风险的比较上。 / goal_en: Apply [[term:expected-value]] to compare pattern return, speed, and risk.
duration: 8

### text
zh: [[term:expected-value]] 的直觉是：收益 × 发生机会，再减去风险。3 番自摸三家可收 30 分，5 番点炮收 32 分；如果 3 番路线剩张明显更多、风险更低，它可能是更好的选择。 / en: [[term:expected-value]] intuition is return times chance, then adjusted for risk. A 3-fan self-draw from three players receives 30 points, and a 5-fan discard win receives 32; if the 3-fan path has many more live outs and lower risk, it can be better.

### callout warn
zh: 期望值是决策框架，不是承诺结果；单局仍会波动。 / en: Expected value is a decision frame, not a promised result; a single hand can still vary.

### example 同分附近 · Similar returns
zh: 两条路线收益接近时，优先比较剩张和危险度，而不是执着于名义番数。 / en: When two routes have similar return, compare remaining counts and danger before fixating on nominal fan value.
tiles: 2p 3p 4p 3p 4p 5p 6p 7p 8p 5t 5t 5t 6t
void: w

### quiz
1. q_zh: 3 番自摸三家未胡时为什么接近 5 番点炮？ / q_en: Why can a 3-fan self-draw with three payers be close to a 5-fan discard win?
   - zh: 3 番自摸总收 30 分，5 番点炮 32 分 / en: 3-fan self-draw totals 30, while 5-fan discard win is 32 *
   - zh: 两者都固定 2 分 / en: Both are fixed at 2 points
   - zh: 自摸没有加底 / en: Self-draw has no add-on
   explain_zh: 3 番 8 分，自摸每笔 10 分，三笔合计 30；5 番是 32 分。 / explain_en: 3 fan is 8, self-draw makes each payment 10, three payments total 30; 5 fan is 32.
   terms: expected-value, self-draw-bonus, fan
2. q_zh: 期望值能保证单局结果吗？ / q_en: Does expected value guarantee one-hand results?
   - zh: 不能 / en: No *
   - zh: 能 / en: Yes
   - zh: 只在天胡时能 / en: Only for Heavenly hand
   explain_zh: 它是长期决策框架，不是单局承诺。 / explain_en: It is a long-run decision frame, not a single-hand promise.
   terms: expected-value

## L5-04 心态与节奏 · Mindset and tempo
goal_zh: 在血战节奏中保持清晰、可复盘的决策。 / goal_en: Keep clear, reviewable decisions in fight-to-the-end tempo.
duration: 7

### text
zh: 血战到底的节奏会让人急：有人先胡、付款人数变化、后期危险牌增多。稳定节奏的方法是只做下一步判断：是否清缺、是否听牌、这张是否危险、这笔结算预期是否值得。 / en: Fight to the end can feel fast: someone wins first, payer count changes, and late risk rises. A stable tempo asks only the next decision: is the void suit cleared, is the hand ready, is this tile dangerous, and is the expected settlement worth it?

### callout tip
zh: 把复杂局面压缩成四个问题，比临场追求完美更可靠。 / en: Compressing a complex hand into four questions is more reliable than chasing perfection in the moment.

### example 四问 · Four questions
zh: 先清缺；已清缺就看听牌；听牌后看剩张；风险升高时看防守。 / en: Clear the void first; after that check readiness; after ready check remaining copies; when risk rises, check defense.
tiles: 3p 4p 5p 6p 7p 8p 2t 2t 5t 5t 6t 7w 8w
void: w

### quiz
1. q_zh: 后期风险升高时，应该加入哪个判断？ / q_en: When late-stage risk rises, what judgment should be added?
   - zh: 防守和危险牌 / en: Defense and risk tiles *
   - zh: 只看牌面美观 / en: Only tile appearance
   - zh: 永远暗杠 / en: Always concealed Kong
   explain_zh: 后期危险牌更关键。 / explain_en: Risk tiles matter more late.
   terms: defense, risk-tile, fight-to-the-end
2. q_zh: 节奏稳定的关键是什么？ / q_en: What is the key to stable tempo?
   - zh: 把局面拆成下一步可判断问题 / en: Break the situation into the next judgeable question *
   - zh: 一次算完所有未来 / en: Calculate all future turns at once
   - zh: 不看定缺 / en: Ignore void suit
   explain_zh: 简化为可执行问题，减少误判。 / explain_en: Simplifying to actionable questions reduces mistakes.
   terms: table-plan, void-suit, ready-hand

## L5-05 实战讲牌 · Explain a table decision
goal_zh: 用事实、判断和结算讲清一局川麻。 / goal_en: Explain a Sichuan Mahjong hand through facts, decisions, and settlement.
duration: 8

### text
zh: 讲一局牌时，按“事实—判断—结果”组织：先说明定缺、可见牌与听牌；再说明为什么选择这次舍牌、碰杠或防守；最后按 §K 解释结算。双语标签只用于对照阅读，不是需要背诵的考核目标。 / en: Explain a hand as facts, decisions, and outcome: state the void suit, visible tiles, and waits; explain the discard, Kong, or defense choice; then explain settlement under K. Bilingual labels support reading and are not a memorization target.

### callout tip
zh: 先说可见事实，再说可复核的判断；不要把猜测对手暗手当作事实。 / en: State observable facts before reviewable decisions; do not treat guesses about hidden hands as facts.

### example 讲清一手 · Explain one hand
zh: 事实：定缺万，听 3 筒。判断：3 筒还有可见剩张，因此保持听牌而不转做高番。结果：若自摸清一色 3 番，每位未胡家按 §K 支付 10 教学积分。 / en: Fact: Characters are voided and the hand waits on 3 Dots. Decision: visible remaining copies support keeping the ready hand instead of switching to a higher-fan path. Outcome: a 3-fan Pure suit self-draw makes each not-yet-won player pay 10 teaching points under K.
tiles: 1p 2p 4p 5p 6p 7p 8p 9p 2p 3p 4p 5p 5p
void: w

### quiz
1. q_zh: 讲一手牌时，最应该先说明什么？ / q_en: What should you explain first when reviewing a hand?
   - zh: 定缺、可见牌和听牌等可观察事实 / en: Observable facts such as void suit, visible tiles, and waits *
   - zh: 对手暗手的确定牌型 / en: A certain hidden hand for an opponent
   - zh: 只说最后赢没赢 / en: Only whether the hand won
   explain_zh: 先给可观察事实，后面的判断和结算才可复核。 / explain_en: Start with observable facts so the decision and settlement can be reviewed.
   terms: void-suit, ready-hand, remaining-counts
2. q_zh: 解释一局的结算，应以什么为准？ / q_en: What should determine a hand's settlement explanation?
   - zh: §K 和 scoring.ts 推导的结果 / en: The result derived from K and scoring.ts *
   - zh: 临场猜一个数字 / en: A number guessed in the moment
   - zh: 只看谁先胡 / en: Only who won first
   explain_zh: 番型、杠分和多家结算必须同 §K/scoring.ts 同源。 / explain_en: Patterns, Kong points, and multi-player settlement must share K/scoring.ts as their source.
   terms: score-settlement, fan, teaching-points

## L5-06 大师之路 · Mastery path
goal_zh: 把 L0-L5 串成可继续练习的路线。 / goal_en: Connect L0-L5 into a continuing practice path.
duration: 8

### text
zh: 到 L5 结束，你已经能认牌、定缺、判断面子、听牌、胡牌、牌效、血战流程、§K 算分、剩张和复盘。下一步不是增加更多概念，而是用练习器和牌桌反复验证每个判断。 / en: By the end of L5, you can identify tiles, void a suit, evaluate melds, waits, wins, efficiency, fight-to-the-end flow, K scoring, remaining counts, and review. The next step is not adding more concepts, but repeatedly validating each judgment through drills and the table.

### callout tip
zh: 每次只挑一个弱项练：认牌、听牌、舍牌、算分或复盘。 / en: Practice one weak area at a time: tiles, waits, discards, scoring, or review.

### example 下一组练习 · Next drill set
zh: 若错在算分，做 score 练习器；若错在进张，做 discard 练习器；若错在剩张，回 L4-01 复盘。 / en: If scoring is weak, use the score drill; if outs are weak, use the discard drill; if remaining counts are weak, review L4-01.
tiles: 2p 3p 4p 5p 6p 7p 2t 2t 2t 5t 5t 6t 7t
void: w

### quiz
1. q_zh: L5 后最适合怎样练？ / q_en: What is the best way to practice after L5?
   - zh: 针对一个弱项反复练 / en: Drill one weak area repeatedly *
   - zh: 一次改所有习惯 / en: Change every habit at once
   - zh: 不再复盘 / en: Stop reviewing
   explain_zh: 弱项练习更容易形成稳定改进。 / explain_en: Focused weak-area practice produces steadier improvement.
   terms: review-method, table-plan
2. q_zh: score 练习器的判定应来自哪里？ / q_en: Where should score drill judgments come from?
   - zh: scoring.ts 和 §K / en: scoring.ts and K *
   - zh: 临场猜测 / en: Guessing
   - zh: 变体规则默认开启 / en: Default-enabled variants
   explain_zh: 算分练习器和课程数值必须与 §K/scoring.ts 同源。 / explain_en: Score drill and lesson values must share K/scoring.ts as their source.
   terms: score-settlement, fan, variant-rule
3. q_zh: 本应用的默认学习闭环是什么？ / q_en: What is this app's default learning loop?
   - zh: 课程、练习器、牌桌、复盘 / en: Lessons, drills, table, review *
   - zh: 只看词典 / en: Glossary only
   - zh: 只打一局不复盘 / en: Play one hand without review
   explain_zh: 课程建立概念，练习器验证点，牌桌连成整局，复盘形成下次计划。 / explain_en: Lessons build concepts, drills verify points, the table connects a whole hand, and review creates the next plan.
   terms: review-method, table-plan, teaching-points
