# L1 Core Concepts
notation: `3t`=3 条 Bamboo, `5p`=5 筒 Dots, `7w`=7 万 Characters.

## L1-01 听牌是什么 · What ready hand means
goal_zh: 理解听牌是“再来某些牌就能胡”的状态。 / goal_en: Understand ready hand as the state where certain incoming tiles complete the hand.
duration: 6

### text
zh: [[term:ready-hand]] 不是已经胡，而是“差最后一步”。当你已经打缺定缺门，并且再来某些牌可组成 [[term:win]] 结构，就可以说在听牌。 / en: [[term:ready-hand]] does not mean you have already won; it means you are one step away. After clearing the declared void suit, if certain incoming tiles can complete a [[term:win]] structure, the hand is ready.

### callout warn
zh: 本期只讲听牌概念，具体听哪些张的求解器留到 Phase 2。 / en: Phase 1 teaches the concept of ready hand; the exact waits solver belongs to Phase 2.

### example 差一张的感觉 · One tile away
zh: 这组牌展示“接近完成”的感觉：已有顺子结构和对子，但不在本期计算具体进张。 / en: This set shows the feeling of being close: it has a Chow structure and a pair, but Phase 1 does not calculate exact waits.
tiles: 3t 4t 5t 7p 7p 8p

### quiz
1. q_zh: 听牌最准确的意思是？ / q_en: What does ready hand mean most accurately?
   - zh: 已经胡牌 / en: Already won
   - zh: 再来某些牌即可胡 / en: Certain incoming tiles would complete the hand *
   - zh: 必须杠 / en: Must declare Kong
   explain_zh: 听牌是差最后完成牌，不等于已经胡。 / explain_en: Ready hand means one step from completion, not already won.
   terms: ready-hand, win
2. q_zh: 想进入听牌判断前，四川麻将还要先注意哪件事？ / q_en: Before judging ready hand in Sichuan Mahjong, what must you still watch first?
   - zh: 是否已经打缺定缺门 / en: Whether the declared void suit has been cleared *
   - zh: 是否保留三门 / en: Whether all three suits are kept
   - zh: 是否一定要杠 / en: Whether a Kong is required
   explain_zh: 四川麻将的听牌和胡牌都不能忽略定缺，定缺门未打缺会影响后续判断。 / explain_en: Ready-hand and winning judgment in Sichuan Mahjong cannot ignore the declared void suit.
   terms: ready-hand, void-suit, one-suit-missing

## L1-02 基本听法 · Basic waits
goal_zh: 用直觉认识边张、嵌张和对子相关的基本听法，不做完整求解。 / goal_en: Build intuition for simple wait shapes without implementing full wait solving.
duration: 7

### text
zh: 基本听法可以先从小结构看：3 条 4 条可能等 2 条或 5 条成顺子；5 筒 5 筒可能等 5 筒成 [[term:pung]]。这些只是形状直觉，不替代完整 [[term:ready-hand]] 判断。 / en: Basic waits can be seen from small shapes: 3 and 4 Bamboo may wait for 2 or 5 Bamboo to make a Chow; 5 and 5 Dots may wait for 5 Dots to make a [[term:pung]]. These are shape intuitions, not a full [[term:ready-hand]] solver.

### callout tip
zh: 先学会看“还差什么让小结构成立”，再学整手牌听牌。 / en: First learn what a small shape is missing; full-hand ready evaluation comes later.

### example 小结构还差什么 · What the small shape needs
zh: 3 条 4 条接 2 条或 5 条都能形成同门连续三张。 / en: 3 and 4 Bamboo can connect with 2 or 5 Bamboo to form three consecutive tiles in one suit.
tiles: 3t 4t 2t 5t

### quiz
1. q_zh: 3 条 4 条接哪张可以成顺子？ / q_en: Which tile can complete 3 and 4 Bamboo as a Chow?
   - zh: 5 条 / en: 5 Bamboo *
   - zh: 5 万 / en: 5 Characters
   - zh: 9 筒 / en: 9 Dots
   explain_zh: 顺子必须同门连续，3-4-5 条成立。 / explain_en: A Chow must be consecutive in the same suit, so 3-4-5 Bamboo works.
   terms: chow, bamboo
2. q_zh: 5 筒 5 筒再来 5 筒会形成什么？ / q_en: What does 5 Dots, 5 Dots plus another 5 Dots form?
   - zh: 刻子 / en: Pung *
   - zh: 顺子 / en: Chow
   explain_zh: 三张同门同点数是刻子。 / explain_en: Three identical suited tiles form a Pung.
   terms: pung, dots

## L1-03 自摸 vs 点炮 · Self-draw vs discard win
goal_zh: 区分自摸和点炮/放铳的来源。 / goal_en: Distinguish winning by self-draw from winning by another player's discard.
duration: 6

### text
zh: [[term:self-draw]] 是自己摸到完成牌；[[term:discard-win]] 是别人打出的牌让你完成。两者在平台结算上常有差异，但具体赔付属于后续平台细则，本期只记来源。 / en: [[term:self-draw]] means you draw the completing tile yourself; [[term:discard-win]] means another player's discard completes your hand. Platforms may settle them differently, but Phase 1 only teaches the source of the winning tile.

### callout warn
zh: 不要把“来源”误记成“本期要算分”；本期不写自摸或点炮的赔付数字。 / en: Do not confuse source of win with scoring; Phase 1 does not teach payment numbers for self-draw or discard win.

### example 两种来源 · Two sources
zh: 如果最后一张是自己摸来的，就是自摸；如果是别人打出给你胡，就是点炮/放铳。 / en: If the completing tile is drawn by you, it is self-draw; if it is discarded by someone else and you win on it, it is win by discard.
tiles: 5p 5p 5p 3t 4t 5t

### quiz
1. q_zh: 自己摸到最后一张完成胡牌，叫？ / q_en: You draw the final completing tile yourself. What is it called?
   - zh: 自摸 / en: Win from the wall / self-draw *
   - zh: 点炮 / en: Win by discard
   explain_zh: 自己摸到完成牌是自摸。 / explain_en: Drawing the completing tile yourself is self-draw.
   terms: self-draw
2. q_zh: 别人打出的牌让你胡，叫？ / q_en: Another player's discard completes your hand. What is it called?
   - zh: 点炮 / 放铳 / en: Win by discard *
   - zh: 定缺 / en: Void a suit
   explain_zh: 胡别人打出的牌是点炮/放铳语境。 / explain_en: Winning on another player's discard is win by discard.
   terms: discard-win

## L1-04 花猪与查叫 · Flowery pig and tenpai check
goal_zh: 知道流局时花猪与查叫检查什么，不写罚分。 / goal_en: Know what flowery pig and tenpai check inspect at a draw, without payment values.
duration: 7

### text
zh: 流局时会检查两件事：还有三门、没有完成定缺的叫 [[term:flowery-pig]]；没有进入 [[term:ready-hand]] 的情况会进入 [[term:tenpai-check]] 语境。赔付数字和细节属于平台规则，本期不写。 / en: At a draw, two checks matter: keeping all three suits and failing to clear the void suit is [[term:flowery-pig]]; not being in [[term:ready-hand]] belongs to the [[term:tenpai-check]] context. Payment numbers and details are platform rules and are not written in Phase 1.

### callout warn
zh: 花猪看是否打缺；查叫看是否听牌。先分清检查对象。 / en: Flowery pig checks whether the void suit was cleared; tenpai check concerns whether the hand is ready. Keep the targets separate.

### example 仍有三门 · Still holding three suits
zh: 定缺万却还保留筒、条、万三门，流局时会触发花猪风险。 / en: If Characters are void but the hand still keeps Dots, Bamboo, and Characters, it risks the flowery-pig check at a draw.
tiles: 2p 5t 7w
void: w

### quiz
1. q_zh: 花猪主要检查什么？ / q_en: What does flowery pig mainly check?
   - zh: 是否还有三门、未打缺 / en: Whether all three suits remain and the void suit was not cleared *
   - zh: 是否有清一色 / en: Whether there is a pure suit hand
   explain_zh: 花猪和未定缺成功有关。 / explain_en: Flowery pig is tied to failing to clear the declared void suit.
   terms: flowery-pig, void-suit
2. q_zh: 查叫相关的是哪件事？ / q_en: What is tenpai check related to?
   - zh: 是否听牌 / en: Whether the hand is ready *
   - zh: 是否有字牌 / en: Whether honor tiles are present
   explain_zh: 查叫关注流局时是否有叫，也就是是否听牌。 / explain_en: Tenpai check concerns whether the hand is ready at a draw.
   terms: tenpai-check, ready-hand

## L1-05 番型入门 · Pattern basics
goal_zh: 只认识清一色、对对胡、七对的定义，不写番数。 / goal_en: Recognize Pure suit hand, All-triplets, and Seven pairs by definition only.
duration: 8

### text
zh: 番型先只学定义：[[term:pure-suit]] 是一门到底；[[term:all-triplets]] 是全靠刻子/杠加一对将；[[term:seven-pairs]] 是七个对子。本期不写任何番数。 / en: Learn pattern definitions only: [[term:pure-suit]] uses one suit throughout; [[term:all-triplets]] uses triplets/quads plus one pair; [[term:seven-pairs]] uses seven pairs. Phase 1 writes no fan values.

### callout warn
zh: 本课先认识番型；教学计分规则见后续课程。 / en: This lesson introduces patterns; teaching scores are covered in later lessons.

### example 清一色直觉 · Pure suit intuition
zh: 这组牌全是条，所以有清一色的一门到底直觉。 / en: This set is all Bamboo, so it shows the one-suit intuition of Pure suit hand.
tiles: 2t 3t 4t 6t 6t 6t 9t 9t

### quiz
1. q_zh: 清一色的定义是什么？ / q_en: What defines a Pure suit hand?
   - zh: 只用一门牌 / en: Using one suit only *
   - zh: 三门都要有 / en: Keeping all three suits
   explain_zh: 清一色是一门到底。 / explain_en: Pure suit hand uses one suit throughout.
   terms: pure-suit
2. q_zh: 对对胡的直觉是什么？ / q_en: What is the intuition of All-triplets?
   - zh: 全是刻子/杠加一对将 / en: Triplets/quads plus one pair *
   - zh: 全是顺子 / en: All Chows
   explain_zh: 对对胡是全刻子方向，不讲番数。 / explain_en: All-triplets is a triplet-focused shape; no fan value is taught here.
   terms: all-triplets, pung, kong, pair

## L1-06 选门与定缺策略 · Choosing the void suit
goal_zh: 学会用数量和结构粗略选择定缺门。 / goal_en: Learn to choose a void suit roughly by count and structure.
duration: 8

### text
zh: 选 [[term:void-suit]] 时先看两件事：哪门最少，哪门结构最弱。如果某门数量少、没有好 [[term:meld]] 形状，通常更适合定缺；但最终选择仍要看整手牌。 / en: When choosing a [[term:void-suit]], first look at two things: which suit is shortest and which suit has the weakest structure. A suit with few tiles and weak [[term:meld]] shapes is often easier to void, but the whole hand still matters.

### callout tip
zh: 初学默认先数张，再看结构；不要为了保留三门而拖慢打缺。 / en: As a beginner, count first and then inspect structure; do not slow down clearing a suit just to keep all three suits.

### example 少而散的万 · Short and scattered Characters
zh: 这手牌里万只有 1 万、9 万，数量少且不连，定缺万更直观。 / en: This hand has only 1 and 9 Characters, few and disconnected, so voiding Characters is the intuitive choice.
tiles: 2p 3p 4p 5t 6t 7t 1w 9w
void: w

### quiz
1. q_zh: 初学选定缺时，哪门通常更适合先考虑？ / q_en: For a beginner choosing a void suit, which suit is usually worth considering first?
   - zh: 数量少、结构弱的一门 / en: The suit with fewer tiles and weaker structure *
   - zh: 数量最多的一门 / en: The suit with the most tiles
   explain_zh: 少而散的一门更容易打缺。 / explain_en: A short, scattered suit is usually easier to clear.
   terms: void-suit, meld
2. q_zh: 如果某门已经有 3-4-5 的连续形状，说明什么？ / q_en: If a suit already has a 3-4-5 shape, what does that suggest?
   - zh: 这门有结构价值 / en: That suit has structural value *
   - zh: 这门一定要定缺 / en: That suit must be voided
   explain_zh: 同门连续能形成顺子结构，通常不算最弱。 / explain_en: Consecutive same-suit tiles can form a Chow structure, so the suit is not usually the weakest.
   terms: chow, meld

## L1-07 安全牌入门 · Safe tile basics
goal_zh: 建立安全牌的基础概念：先打缺，再减少放铳风险。 / goal_en: Build the basic idea of safe tiles: clear the void suit first, then reduce discard-win risk.
duration: 7

### text
zh: [[term:safe-tile]] 是相对不容易让别人 [[term:discard-win]] 的舍牌。L1 只讲入门：先完成打缺，再观察别人打过什么、碰过什么；不要把“安全”理解成绝对安全。 / en: A [[term:safe-tile]] is a discard relatively less likely to let someone [[term:discard-win]]. L1 only covers the entry point: clear your void suit first, then observe others' discards and Pungs; do not treat "safe" as absolute.

### callout warn
zh: 安全牌是概率和信息判断，不是保证；本期不做危险度模型。 / en: Safe-tile judgment is probabilistic and information-based, not guaranteed; Phase 1 does not build a danger model.

### example 先处理定缺门 · Clear the void suit first
zh: 定缺万时，手里还有 8 万；在没有更强理由前，先处理定缺门比贪留三门更稳。 / en: If Characters are void and 8 Characters remains, clearing the void suit is steadier than greedily keeping all three suits unless there is a stronger reason.
tiles: 2p 3p 4t 5t 8w
void: w

### quiz
1. q_zh: “安全牌”意味着什么？ / q_en: What does "safe tile" mean?
   - zh: 相对不容易让别人胡 / en: Relatively less likely to let someone win *
   - zh: 一定不会点炮 / en: Guaranteed never to deal in
   explain_zh: 安全是相对判断，不是绝对保证。 / explain_en: Safety is relative judgment, not a guarantee.
   terms: safe-tile, discard-win
2. q_zh: 定缺还没完成时，最先检查什么？ / q_en: If the void suit has not been cleared, what should you check first?
   - zh: 是否还有定缺门牌 / en: Whether the declared void suit still remains *
   - zh: 是否要保留三门 / en: Whether to keep all three suits
   explain_zh: 初学先完成缺门，再谈更细的安全。 / explain_en: Beginners should clear the void suit before finer safety judgments.
   terms: void-suit, one-suit-missing

## L1-08 L1 综合 · Core concepts review
goal_zh: 综合复习 L1 核心概念，达到 80% 后解锁下一层。 / goal_en: Review L1 core concepts; scoring at least 80% unlocks the next level.
duration: 8

### text
zh: L1 把 L0 的认牌和定缺，连接到 [[term:ready-hand]]、自摸/点炮、[[term:flowery-pig]]、[[term:tenpai-check]] 与番型定义。你现在应该能解释概念，但还不需要会完整听牌或算分。 / en: L1 connects L0 tile recognition and voiding to [[term:ready-hand]], self-draw/discard win, [[term:flowery-pig]], [[term:tenpai-check]], and pattern definitions. You should now be able to explain the ideas, without full wait solving or scoring.

### callout tip
zh: 通关测验可重考，系统保留最高分；错题术语会进入今日复习。 / en: The gate quiz can be retaken, the best score is kept, and terms from missed questions enter today's review.

### example 综合牌例 · Review example
zh: 定缺万后，这组牌没有万，且有 5 筒刻子与 3-4-5 条结构。 / en: After voiding Characters, this set has no Characters and includes a 5 Dots Pung plus a 3-4-5 Bamboo structure.
tiles: 5p 5p 5p 3t 4t 5t
void: w

### quiz
1. q_zh: 流局时仍有三门、没打缺，最接近哪个概念？ / q_en: At a draw, still holding all three suits and failing to clear the void suit points to which concept?
   - zh: 花猪 / en: Flowery pig *
   - zh: 清一色 / en: Pure suit hand
   - zh: 自摸 / en: Self-draw
   explain_zh: 花猪关注未定缺成功，也就是仍保留三门。 / explain_en: Flowery pig concerns failing to clear the declared void suit, often still holding all three suits.
   terms: flowery-pig, void-suit
2. q_zh: 只用一门牌的胡牌形态叫什么？ / q_en: What is the pattern that uses one suit only?
   - zh: 清一色 / en: Pure suit hand *
   - zh: 对对胡 / en: All-triplets
   - zh: 查叫 / en: Tenpai check
   explain_zh: 清一色定义是一门到底；本期不讲番数。 / explain_en: Pure suit hand means one suit throughout; Phase 1 does not teach its fan value.
   terms: pure-suit
