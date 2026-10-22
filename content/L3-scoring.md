# L3 Scoring notation
notation: `3t`=3 条 Bamboo, `5p`=5 筒 Dots, `7w`=7 万 Characters.

## L3-01 番型体系 · Scoring pattern system
goal_zh: 建立 [[term:fan]]、最大番型和 [[term:teaching-points]] 的基础框架。 / goal_en: Build the basic frame for [[term:fan]], highest pattern, and [[term:teaching-points]].
duration: 7

### text
zh: §K 的核心是：先判断胡牌结构，再找最大 [[term:fan]] 型，只按最大番型计，不把平胡、清一色、对对胡等基础番型重复相加。[[term:teaching-points]] 只用于学习和复盘。 / en: K starts by checking the winning shape, then choosing the highest [[term:fan]] pattern. Base patterns such as Basic hand, Pure suit, and All-triplets are not stacked together. [[term:teaching-points]] are only for learning and review.

### callout tip
zh: 先问“最大番型是什么”，再问“有没有加番项”。顺序错了，分就容易算重。 / en: Ask "what is the highest pattern" before asking "are there add-fan items." Reversing the order easily double-counts.

### example 最大番型 · Highest pattern
zh: 这手全是筒，并且全靠刻子与一对将，是 [[term:pure-all-triplets]]，按 4 番，不再另加清一色和对对胡。 / en: This hand is one suit and all triplets plus a pair, so it is [[term:pure-all-triplets]] at 4 fan; Pure suit and All-triplets are not added again.
tiles: 2p 2p 2p 3p 3p 3p 4p 4p 4p 6p 6p 6p 8p 8p
void: w

### quiz
1. q_zh: 清一色的对对胡按 §K 归为哪一类？ / q_en: Under K, which pattern is a Pure suit All-triplets hand?
   - zh: 清对 4 番 / en: Pure all-triplets, 4 fan *
   - zh: 清一色 3 番再加对对胡 2 番 / en: Pure suit 3 fan plus All-triplets 2 fan
   - zh: 平胡 1 番 / en: Basic hand, 1 fan
   explain_zh: §K 只按最大番型计，清对就是 4 番。 / explain_en: K uses only the highest pattern; Pure all-triplets is 4 fan.
   terms: fan, pure-all-triplets, all-triplets, pure-suit
2. q_zh: 本应用里的积分语境是什么？ / q_en: What do points mean in this app?
   - zh: 教学积分，用于练习和复盘 / en: Teaching points for practice and review *
   - zh: 线下战绩记录 / en: An offline match record
   - zh: 线上匹配等级 / en: An online matching rank
   explain_zh: 进度里的 tablePoints 是可重置的教学积分。 / explain_en: tablePoints are resettable teaching points.
   terms: teaching-points, score-settlement

## L3-02 各番计算 · Fan to points
goal_zh: 掌握 [[term:base-score]]、倍率和自摸加底。 / goal_en: Learn [[term:base-score]], multipliers, and self-draw base add-on.
duration: 7

### text
zh: §K 锁定 [[term:base-score]] 为 2 分；n 番 = 2^(n-1) 倍，所以 1 番 2 分、2 番 4 分、3 番 8 分、4 番 16 分、5 番 32 分、6 番 64 分。[[term:self-draw-bonus]] 是每笔自摸胡牌额外 +2 分，不加番。 / en: K fixes [[term:base-score]] at 2 points. n fan uses a 2^(n-1) multiplier: 1 fan is 2, 2 fan is 4, 3 fan is 8, 4 fan is 16, 5 fan is 32, and 6 fan is 64. [[term:self-draw-bonus]] adds 2 points to each self-draw payment without adding fan.

### callout tip
zh: “自摸 +2 分”不是“自摸 +1 番”。先算番对应分，再给每笔自摸赔付加 2 分。 / en: "Self-draw +2 points" is not "+1 fan." Convert fan to points first, then add 2 to each self-draw payment.

### example 三番自摸 · Three-fan self-draw
zh: 清一色 3 番先换算为 8 分；若自摸，每个未胡家每笔付 8+2=10 分。 / en: Pure suit is 3 fan, worth 8 points. If self-drawn, each not-yet-won player pays 8+2=10 points.
tiles: 1p 2p 3p 2p 3p 4p 5p 6p 7p 8p 8p 8p 9p 9p
void: w

### quiz
1. q_zh: 4 番按 §K 是多少分？ / q_en: Under K, how many points is 4 fan?
   - zh: 16 分 / en: 16 points *
   - zh: 8 分 / en: 8 points
   - zh: 32 分 / en: 32 points
   explain_zh: 底分 2，4 番倍率 ×8，所以是 16 分。 / explain_en: Base score is 2, and 4 fan is x8, so it is 16 points.
   terms: fan, base-score
2. q_zh: 3 番自摸时，每个未胡家每笔付多少？ / q_en: For a 3-fan self-draw, how much does each not-yet-won player pay?
   - zh: 8 分 / en: 8 points
   - zh: 10 分 / en: 10 points *
   - zh: 12 分 / en: 12 points
   explain_zh: 3 番 8 分，自摸加底 +2 分，所以每笔 10 分。 / explain_en: 3 fan is 8 points, plus the 2-point self-draw add-on, so each payment is 10.
   terms: self-draw, self-draw-bonus, teaching-points

## L3-03 高番形态 · High-pattern hands
goal_zh: 识别龙七对、清七对、清幺九、天胡和地胡。 / goal_en: Recognize Dragon seven pairs, Pure seven pairs, Pure terminal hand, Heavenly hand, and Earthly hand.
duration: 8

### text
zh: §K 的 5 番形态包括 [[term:dragon-seven-pairs]]、[[term:pure-seven-pairs]]、[[term:pure-terminal-hand]]；6 番形态包括 [[term:heavenly-hand]]、[[term:earthly-hand]]、清龙七对。龙七对里的四张相同已经支撑番型，计算 [[term:root]] 时要减 1 根。 / en: K has 5-fan patterns including [[term:dragon-seven-pairs]], [[term:pure-seven-pairs]], and [[term:pure-terminal-hand]]. The 6-fan patterns include [[term:heavenly-hand]], [[term:earthly-hand]], and Pure dragon seven pairs. The four identical tiles inside Dragon seven pairs support the pattern, so one [[term:root]] is subtracted.

### callout warn
zh: 天胡/地胡需要牌桌记录庄家与摸牌轮次；本应用只按 §K 和牌桌字段做默认教学判定。 / en: Heavenly and Earthly hands need dealer and draw-turn state; this app uses K plus table-state fields for the default teaching judgment.

### example 清龙七对 · Pure dragon seven pairs
zh: 全部筒牌、七对结构，并含四张 1 筒，是清龙七对 6 番。 / en: One suit, Seven pairs structure, and four 1 Dots make Pure dragon seven pairs at 6 fan.
tiles: 1p 1p 1p 1p 2p 2p 3p 3p 4p 4p 5p 5p 6p 6p
void: w

### quiz
1. q_zh: 龙七对按 §K 是几番？ / q_en: Under K, how many fan is Dragon seven pairs?
   - zh: 3 番 / en: 3 fan
   - zh: 5 番 / en: 5 fan *
   - zh: 6 番 / en: 6 fan
   explain_zh: 龙七对是暗七对加四张相同，§K 计 5 番。 / explain_en: Dragon seven pairs is concealed Seven pairs with four identical tiles; K counts it as 5 fan.
   terms: dragon-seven-pairs, seven-pairs, root
2. q_zh: 清龙七对按 §K 是几番？ / q_en: Under K, how many fan is Pure dragon seven pairs?
   - zh: 5 番 / en: 5 fan
   - zh: 6 番 / en: 6 fan *
   - zh: 8 番 / en: 8 fan
   explain_zh: 清一色的龙七对是 6 番；不是清七对和龙七对相加。 / explain_en: Pure dragon seven pairs is 6 fan; it is not Pure seven pairs plus Dragon seven pairs.
   terms: pure-seven-pairs, dragon-seven-pairs, fan

## L3-04 杠分刮风下雨 · Kong points
goal_zh: 掌握直杠、巴杠、暗杠、抢杠和退税。 / goal_en: Learn point Kong, add-on Kong, concealed Kong, robbing a Kong, and tax refund.
duration: 8

### text
zh: [[term:kong-bonuses]] 在 §K 中独立于胡牌结算：直杠由点杠者一家赔 4 分，巴杠每个未胡家赔 2 分，暗杠每个未胡家赔 4 分。若流局时杠者未听牌，要退还杠分；巴杠被抢杠胡时，本次杠分不成立。 / en: [[term:kong-bonuses]] are independent from win settlement under K: point Kong is paid by the discarder for 4 points, add-on Kong is paid by each not-yet-won player for 2 points, and concealed Kong is paid by each not-yet-won player for 4 points. If the Kong owner is not tenpai at draw, Kong points are refunded; if an add-on Kong is robbed, that Kong point event is void.

### callout tip
zh: 杠分先记事件，结局时再合并进总 [[term:score-settlement]]；这能处理退税和已胡退场。 / en: Record Kong events first, then merge them into final [[term:score-settlement]]; this handles tax refund and players who already won.

### example 暗杠 · Concealed Kong
zh: 未胡家还剩三家时，暗杠每家 4 分，总共得到 12 分杠分；若流局未听，要退回。 / en: With three not-yet-won payers, a concealed Kong receives 4 points from each, for 12 Kong points total; if the owner is not tenpai at draw, those points are refunded.
tiles: 5p 5p 5p 5p 2t 3t 4t
void: w

### quiz
1. q_zh: 直杠的杠分由谁付？ / q_en: Who pays for a point Kong?
   - zh: 点杠者一家付 4 分 / en: The discarder pays 4 points *
   - zh: 每个未胡家各付 4 分 / en: Each not-yet-won player pays 4
   - zh: 不产生杠分 / en: No Kong points are produced
   explain_zh: 直杠是点杠者一家赔 4 分。 / explain_en: A point Kong is paid by the discarder for 4 points.
   terms: kong, kong-bonuses, score-settlement
2. q_zh: 巴杠被抢杠胡时，本次杠分怎样处理？ / q_en: If an add-on Kong is robbed for a win, what happens to that Kong point event?
   - zh: 照常收 2 分 / en: It still collects 2 points
   - zh: 本次杠分不成立 / en: This Kong point event is void *
   - zh: 自动变成暗杠 / en: It becomes a concealed Kong
   explain_zh: §K 写明巴杠可被抢杠胡；被抢时本次杠分不成立。 / explain_en: K allows robbing an add-on Kong; when robbed, that Kong point event is void.
   terms: kong, kong-bonuses, win

## L3-05 血战多家结算 · Fight-to-the-end payments
goal_zh: 区分自摸、点炮和一炮多响的付款方向。 / goal_en: Distinguish payment direction for self-draw, discard win, and multiple wins on one discard.
duration: 7

### text
zh: [[term:point-payment]] 是点炮者一家承担；自摸是每个未胡家各赔一笔；[[term:multi-win]] 时点炮者要分别向每个胡牌家全额赔付。已胡退场者不再参与后续自摸和杠分。 / en: [[term:point-payment]] is paid by the discarder. Self-draw is paid once by each not-yet-won player. For [[term:multi-win]], the discarder pays each winner separately. Players who already won sit out later self-draw and Kong payments.

### callout tip
zh: 血战结算先看“谁还没胡”，再看这笔是点炮、自摸还是杠分。 / en: In fight-to-the-end settlement, first ask who has not won yet, then ask whether this event is discard win, self-draw, or Kong points.

### example 一炮多响 · Multiple wins on one discard
zh: 如果一张 3 筒让两家各以 1 番胡牌，点炮者分别赔两笔，每笔 2 分。 / en: If one 3 Dots discard lets two players win at 1 fan, the discarder pays two separate payments, 2 points each.
tiles: 1p 2p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5t 5t
void: w

### quiz
1. q_zh: 一炮多响时，点炮者怎样赔？ / q_en: In multiple wins on one discard, how does the discarder pay?
   - zh: 只向最近的一家赔 / en: Pays only the nearest winner
   - zh: 向每个胡牌家分别全额赔 / en: Pays each winner separately in full *
   - zh: 由所有未胡家平摊 / en: Shared by all not-yet-won players
   explain_zh: §K 明确一炮多响由点炮者对每个胡家分别全赔。 / explain_en: K says the discarder pays each winner separately in full.
   terms: multi-win, point-payment, score-settlement
2. q_zh: 一家已胡退场后，后续自摸时是否继续赔？ / q_en: After a player has already won, do they keep paying later self-draw events?
   - zh: 不参与后续自摸赔付 / en: They do not pay later self-draw events *
   - zh: 每次仍然付 / en: They still pay every time
   - zh: 只付杠分不付胡牌 / en: They pay only Kong points
   explain_zh: 血战到底是一家胡后退场，其余继续。 / explain_en: In fight to the end, a winner exits while the others continue.
   terms: fight-to-the-end, self-draw, score-settlement

## L3-06 封顶与叠加 · Cap and add-fan
goal_zh: 正确处理 [[term:score-cap]]、杠上花、杠上炮和根。 / goal_en: Correctly apply [[term:score-cap]], Kong draw, Kong discard, and roots.
duration: 8

### text
zh: §K 的加番项在最大番型上叠加：[[term:kong-draw-win]] +1 番，杠上炮 +1 番，[[term:root]] 每根 +1 番；但单次胡牌总番以 8 番 [[term:score-cap]]，8 番基础值是 256 分。[[term:self-draw-bonus]] 在封顶后的每笔自摸付款再 +2 分。 / en: K add-fan items stack on the highest pattern: [[term:kong-draw-win]] is +1 fan, Kong discard is +1 fan, and each [[term:root]] is +1 fan. A single win is capped at 8 fan by [[term:score-cap]], whose base value is 256 points. [[term:self-draw-bonus]] adds 2 points to each self-draw payment after the cap.

### callout warn
zh: 封顶限制的是胡牌总番，不取消杠分独立结算，也不把自摸加底变成番。 / en: The cap limits total win fan; it does not cancel independent Kong points or turn the self-draw add-on into fan.

### example 六番加四番 · Six fan plus four add-fan
zh: 清龙七对 6 番，若另有杠上花、杠上炮和 2 根，共 10 番，但按 8 番封顶，基础胡牌值 256 分；若自摸，每笔 258 分。 / en: Pure dragon seven pairs is 6 fan. With Kong draw, Kong discard, and 2 roots, raw total is 10 fan, but it caps at 8 fan for 256 base points; if self-drawn, each payment is 258.
tiles: 1p 1p 1p 1p 2p 2p 3p 3p 4p 4p 5p 5p 6p 6p
void: w

### quiz
1. q_zh: 单次胡牌 9 番按 §K 算几番？ / q_en: Under K, a 9-fan win is scored as how many fan?
   - zh: 8 番 / en: 8 fan *
   - zh: 9 番 / en: 9 fan
   - zh: 6 番 / en: 6 fan
   explain_zh: 单次胡牌总番 8 番封顶。 / explain_en: A single win is capped at 8 fan.
   terms: score-cap, fan
2. q_zh: 8 番自摸时，每笔胡牌赔付是多少？ / q_en: For an 8-fan self-draw, how much is each win payment?
   - zh: 256 分 / en: 256 points
   - zh: 258 分 / en: 258 points *
   - zh: 512 分 / en: 512 points
   explain_zh: 8 番基础 256 分，自摸加底 +2 分，所以每笔 258 分。 / explain_en: 8 fan is 256 base points; self-draw adds 2, so each payment is 258.
   terms: score-cap, self-draw-bonus, self-draw

## L3-07 期望与取舍 · Return and tradeoff
goal_zh: 用 §K 积分理解速度、番型和风险的取舍。 / goal_en: Use K points to reason about speed, pattern value, and risk.
duration: 7

### text
zh: [[term:expected-value]] 不是背公式，而是比较“更快胡的小番”和“更慢做大的高番”。例如 3 番自摸三家各 10 分，总收入 30 分；5 番点炮是一家赔 32 分。两者接近，但风险、剩张和对手状态不同。 / en: [[term:expected-value]] is not memorizing formulas; it compares a faster small win with a slower larger pattern. For example, a 3-fan self-draw from three players collects 10 each, 30 total; a 5-fan discard win collects 32 from one player. They are close, but risk, remaining counts, and opponent state differ.

### callout tip
zh: 做牌不只看“几番”，还要看还剩几张、是否已经听、别人是否接近胡。 / en: Hand direction is not only "how many fan"; also check remaining counts, readiness, and whether opponents are close.

### example 三番自摸 vs 五番点炮 · Three-fan self-draw vs five-fan discard win
zh: 3 番自摸三家各 10 分合计 30；5 番点炮单家 32 分。若 3 番听牌更宽，未必比强做 5 番差。 / en: A 3-fan self-draw from three players totals 30; a 5-fan discard win from one player is 32. If the 3-fan hand has wider waits, it may be better than forcing 5 fan.
tiles: 2p 3p 4p 3p 4p 5p 6p 7p 8p 5t 5t 5t 6t
void: w

### quiz
1. q_zh: 3 番自摸三家都未胡时，总共收入多少教学积分？ / q_en: If a 3-fan self-draw is paid by three not-yet-won players, what is the total received?
   - zh: 24 分 / en: 24 points
   - zh: 30 分 / en: 30 points *
   - zh: 32 分 / en: 32 points
   explain_zh: 3 番 8 分，自摸每笔 10 分，三家合计 30 分。 / explain_en: 3 fan is 8; self-draw makes each payment 10; three payers total 30.
   terms: expected-value, self-draw-bonus, teaching-points
2. q_zh: 只看番数就能决定最佳打法吗？ / q_en: Can fan value alone decide the best play?
   - zh: 不能，还要看剩张、速度和风险 / en: No; remaining counts, speed, and risk also matter *
   - zh: 可以，番越高一定越好 / en: Yes; higher fan is always better
   - zh: 只看对手画像 / en: Only opponent profile matters
   explain_zh: L3 后的判断要把算分和 L4 的剩张/风险合并。 / explain_en: After L3, decisions combine scoring with L4 remaining counts and risk.
   terms: expected-value, remaining-counts, defense

## L3-08 L3 综合 · L3 synthesis
goal_zh: 综合判断番型、分值、赔付方向和流局结算。 / goal_en: Combine pattern, point value, payment direction, and draw settlement.
duration: 9

### text
zh: L3 的完整顺序是：确认胡牌和缺门，找最大番型，叠加加番，应用封顶，按自摸/点炮/一炮多响决定谁赔谁，最后把杠分、花猪和查大叫并入 [[term:score-settlement]]。 / en: The full L3 order is: confirm win and void-suit rule, choose the highest pattern, add fan items, apply the cap, decide who pays whom for self-draw, discard win, or multiple wins, then merge Kong points, flowery pig, and tenpai check into [[term:score-settlement]].

### callout tip
zh: 通关测验按 §K 金标；错题术语会进入今日复习。 / en: The gate quiz follows K golden values; missed terms go into today's review.

### example 查大叫 · Tenpai check
zh: 流局未满三家胡时，花猪向每个非花猪家赔 32 分；未听者按听牌家所听最大番型对应分赔付，并退杠分。 / en: At a draw with fewer than three winners, a flowery pig pays 32 points to each non-pig; non-tenpai players pay each tenpai player by that player's maximum waiting pattern score and refund Kong points.
tiles: 1p 2p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5t 5t
void: w

### quiz
1. q_zh: 花猪按 §K 向每个非花猪家赔多少？ / q_en: Under K, how much does a flowery pig pay each non-pig player?
   - zh: 16 分 / en: 16 points
   - zh: 32 分 / en: 32 points *
   - zh: 64 分 / en: 64 points
   explain_zh: §K 把花猪折算为 16 倍底分，即 32 分。 / explain_en: K converts flowery pig to 16 times base score, which is 32 points.
   terms: flowery-pig, base-score, score-settlement
2. q_zh: 查大叫里未听者向谁赔？ / q_en: In tenpai check, whom does a non-tenpai player pay?
   - zh: 每个听牌家 / en: Each tenpai player *
   - zh: 只向庄家 / en: Only the dealer
   - zh: 只向已胡家 / en: Only players who already won
   explain_zh: 未听者按听牌家所听最大番型对应分赔付。 / explain_en: A non-tenpai player pays each tenpai player according to that player's maximum waiting pattern score.
   terms: tenpai-check, ready-hand, score-settlement
3. q_zh: 一手清七对点炮胡，§K 基础胡牌分是多少？ / q_en: A Pure seven pairs discard win has what base win value under K?
   - zh: 16 分 / en: 16 points
   - zh: 32 分 / en: 32 points *
   - zh: 64 分 / en: 64 points
   explain_zh: 清七对 5 番，底分 2、倍率 ×16，所以是 32 分。 / explain_en: Pure seven pairs is 5 fan; base 2 times x16 equals 32 points.
   terms: pure-seven-pairs, fan, base-score
