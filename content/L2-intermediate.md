# L2 Intermediate
notation: `3t`=3 条 Bamboo, `5p`=5 筒 Dots, `7w`=7 万 Characters. No honor tiles.

## L2-01 进张与有效牌 · Effective tiles
goal_zh: 理解 [[term:effective-tiles]]：哪些摸入会让手牌变好。 / goal_en: Understand [[term:effective-tiles]]: which incoming tiles improve a hand.
duration: 7

### text
zh: [[term:effective-tiles]] 不是“喜欢的牌”，而是摸到后能让手牌更接近 [[term:ready-hand]] 或增加等待面的牌。先确认已经 [[term:one-suit-missing]]，再看每张候选摸入能不能组成顺子、刻子或对子。 / en: [[term:effective-tiles]] are not favorite tiles; they are tiles that move the hand closer to [[term:ready-hand]] or widen the waits. First confirm [[term:one-suit-missing]], then check whether each candidate completes a Chow structure, Pung, or Pair.

### callout tip
zh: 初学时只数“打出一张后，下一步能让手牌变好的牌有几种”。不要在这里引入任何结算数值。 / en: At this stage, count how many incoming tile types improve the hand after one discard. Do not add any settlement values here.

### example 边张进张 · Edge wait improvement
zh: 定缺万后，1筒2筒等待3筒成顺；3筒就是有效牌。 / en: With Characters voided, 1 Dots and 2 Dots wait on 3 Dots to complete a Chow structure; 3 Dots is an effective tile.
tiles: 1p 2p 4p 5p 6p 2t 2t 2t 5t 5t
void: w

### quiz
1. q_zh: 定缺万，1筒2筒这组最直接的有效牌是什么？ / q_en: With Characters voided, what is the direct effective tile for 1 Dots and 2 Dots?
   - zh: 3筒 / en: 3 Dots *
   - zh: 3条 / en: 3 Bamboo
   - zh: 9万 / en: 9 Characters
   explain_zh: 1筒2筒只能用3筒补成同门顺子。 / explain_en: 1 Dots and 2 Dots need 3 Dots to complete a same-suit Chow structure.
   terms: effective-tiles, chow, one-suit-missing
2. q_zh: 数有效牌前，定缺门还在手里时应先看什么？ / q_en: Before counting effective tiles, what should you check if the void suit is still in hand?
   - zh: 先处理定缺门 / en: Clear the declared void suit first *
   - zh: 先保留所有对子 / en: Keep every pair first
   - zh: 先看别人是否已经胡 / en: First check whether others have won
   explain_zh: 胡牌前必须打缺定缺门，未清缺时牌效判断要先服务于清缺。 / explain_en: A winning hand must clear the declared void suit, so efficiency first serves voiding when the suit remains.
   terms: void-suit, effective-tiles

## L2-02 牌效率：摸打选择 · Tile efficiency for draw-discard
goal_zh: 用 [[term:tile-efficiency]] 比较“打哪张之后听牌更宽”。 / goal_en: Use [[term:tile-efficiency]] to compare which discard leaves wider waits.
duration: 8

### text
zh: [[term:tile-efficiency]] 的基本做法是：列出可打牌，分别移除一张，再用 [[term:ready-hand]] 判断看留下哪些 [[term:effective-tiles]]。进张更多通常更好，但定缺门优先级更高。 / en: Basic [[term:tile-efficiency]] means listing discard candidates, removing each one, and checking [[term:ready-hand]] waits or [[term:effective-tiles]]. More waits are usually better, but clearing the declared void suit comes first.

### example 对比舍牌 · Compare discards
zh: 这手牌若打9条，保留1筒2筒听3筒；若拆对子，可能减少等待面。 / en: If this hand discards 9 Bamboo, it keeps 1 Dots and 2 Dots waiting on 3 Dots; breaking the pair can narrow the waits.
tiles: 1p 2p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5t 5t 9t
void: w

### quiz
1. q_zh: 比较两张舍牌后，最应该记录什么？ / q_en: When comparing two discards, what should you record first?
   - zh: 每张舍牌后能等哪些进张 / en: Which waits remain after each discard *
   - zh: 谁坐在上家 / en: Who sits to your left
   - zh: 牌面颜色是否好看 / en: Whether the tile colors look nice
   explain_zh: 牌效比较要落到具体等待牌，而不是感觉。 / explain_en: Efficiency comparison should be grounded in concrete waits, not impressions.
   terms: tile-efficiency, effective-tiles, discard
2. q_zh: 如果手里还有定缺门，牌效选择通常先服务于什么？ / q_en: If the declared void suit is still in hand, what does efficiency usually serve first?
   - zh: 清缺 / en: Clearing the void suit *
   - zh: 保留所有孤张 / en: Keeping every isolated tile
   - zh: 拆掉所有顺子 / en: Breaking every Chow structure
   explain_zh: 未清缺不能胡，清缺是摸打方向的硬约束。 / explain_en: You cannot win before clearing the void suit, so voiding is a hard constraint.
   terms: void-suit, tile-efficiency

## L2-03 做牌方向 vs 求快胡 · Hand direction vs speed
goal_zh: 区分 [[term:hand-direction]]：保留结构做牌，还是尽快进入听牌。 / goal_en: Distinguish [[term:hand-direction]]: shape-building versus reaching ready hand quickly.
duration: 8

### text
zh: 求快胡时，优先保留现成顺子、刻子、对子和宽听；做牌时，会为了更清晰的 [[term:hand-direction]] 保留同门或对子结构。Phase 2 只训练方向选择，不比较任何结算数值。 / en: For speed, keep completed Chow structures, Pungs, Pairs, and wide waits. For shape-building, keep tiles that support a clear [[term:hand-direction]] such as one suit or pairs. Phase 2 trains direction choice only, without settlement values.

### example 快速成型 · Fast structure
zh: 这手牌已经有多个现成结构，若目标是求快，应减少孤张，争取先听牌。 / en: This hand already has several made structures. If the goal is speed, reduce isolated tiles and aim for ready hand.
tiles: 2p 3p 4p 4p 5p 6p 2t 2t 2t 7t 8t 9t 1p
void: w

### quiz
1. q_zh: 求快胡时，通常优先保留哪类牌？ / q_en: When playing for speed, which tiles are usually kept first?
   - zh: 已成组或容易成组的牌 / en: Tiles already grouped or easy to group *
   - zh: 所有定缺门牌 / en: Every declared void-suit tile
   - zh: 与任何牌都不相连的孤张 / en: Isolated tiles with no connection
   explain_zh: 求快的核心是减少无效张，尽快进入听牌。 / explain_en: Speed means reducing dead tiles and reaching tenpai sooner.
   terms: hand-direction, ready-hand
2. q_zh: 做牌方向改变时，最需要重新检查什么？ / q_en: When hand direction changes, what should be checked again?
   - zh: 哪些舍牌后进张更多 / en: Which discards leave more effective tiles *
   - zh: 是否可以吃上家牌 / en: Whether you can claim Chow from the player before you
   - zh: 是否加入字牌 / en: Whether honor tiles are added
   explain_zh: 四川麻将不可吃，也没有字牌；方向改变后应重新比较进张。 / explain_en: Sichuan Mahjong has no Chow claims and no honor tiles here; after direction changes, compare effective tiles again.
   terms: tile-efficiency, no-chow, honor-tiles

## L2-04 防守与拆牌 · Defense and breaking shapes
goal_zh: 学会在对手压力变大时用 [[term:defense]] 思维拆牌。 / goal_en: Learn to use [[term:defense]] when opponents become threatening.
duration: 8

### text
zh: [[term:defense]] 不是放弃胡牌，而是在别人可能 [[term:ready-hand]] 时减少危险舍牌。最基础的线索是别人已经打过的牌、明显不要的门，以及自己不再需要的孤张。 / en: [[term:defense]] does not mean giving up the hand. It means reducing dangerous discards when others may be [[term:ready-hand]]. Basic clues include visible discards, suits they seem to reject, and isolated tiles you no longer need.

### callout warn
zh: 防守只能基于可见信息推断，不能假装知道别人手牌。教练也只会展示 engine 和牌河能推出的事实。 / en: Defense is inference from visible information; you do not know hidden hands. The coach only shows facts derived from the engine and visible rivers.

### example 拆孤张 · Break isolated tiles
zh: 当自己未听且对手压力变大时，先打不帮助成组的孤张，通常比拆现成顺子更稳。 / en: When you are not ready and opponents look threatening, discarding isolated tiles is usually steadier than breaking completed Chow structures.
tiles: 2p 3p 4p 5p 6p 7p 2t 2t 2t 8t 9t 1p 9p
void: w

### quiz
1. q_zh: 基础防守优先依赖哪类信息？ / q_en: What information does basic defense rely on first?
   - zh: 可见舍牌与自己手牌 / en: Visible discards and your own hand *
   - zh: 别人隐藏的手牌全貌 / en: The full hidden hands of others
   - zh: 结算表数值 / en: Settlement table values
   explain_zh: Phase 2 防守只用可见信息推断，不做隐藏信息假设。 / explain_en: Phase 2 defense uses visible information only and does not assume hidden hands.
   terms: defense, discard-reading
2. q_zh: 自己未听且有孤张时，通常先考虑什么？ / q_en: If you are not ready and have isolated tiles, what is usually considered first?
   - zh: 打掉不帮助成组的孤张 / en: Discard isolated tiles that do not help shapes *
   - zh: 拆掉全部现成顺子 / en: Break all completed Chow structures
   - zh: 保留定缺门等胡 / en: Keep the void suit and wait to win
   explain_zh: 孤张对成胡帮助小，未清缺仍必须先清缺。 / explain_en: Isolated tiles help less; if the void suit remains, it still must be cleared.
   terms: defense, discard, void-suit

## L2-05 看舍牌读手 · Reading discard rivers
goal_zh: 用 [[term:discard-reading]] 建立“别人可能不要什么、保留什么”的初步判断。 / goal_en: Use [[term:discard-reading]] to infer what others may reject or keep.
duration: 8

### text
zh: [[term:discard-reading]] 先看两件事：别人早早打出的门，可能是不需要或定缺方向；别人很久不打的门，可能有结构。这里只做概率性判断，不把推断当事实。 / en: [[term:discard-reading]] starts with two clues: suits discarded early may be unwanted or voided; suits not discarded for a long time may contain structure. These are probabilistic inferences, not facts.

### example 早打同门 · Early suit discards
zh: 如果一家连续早打万，可能在清万或万门少；你不能据此确定其手牌，只能降低对万门结构的预期。 / en: If a player discards Characters early and repeatedly, they may be voiding Characters or have few of them. You cannot know the hand; you only lower the expectation of Character structures.
tiles: 3w 7w 9w

### quiz
1. q_zh: 看舍牌读手时，下面哪句更准确？ / q_en: Which statement is more accurate when reading discards?
   - zh: 这是基于可见信息的推断 / en: It is inference from visible information *
   - zh: 可以直接知道别人所有手牌 / en: You directly know every hidden tile
   - zh: 可以忽略定缺 / en: You can ignore void suits
   explain_zh: 读手是推断，不是透视。 / explain_en: Discard reading is inference, not hidden information.
   terms: discard-reading, defense
2. q_zh: 一家早早连续打出同一门，可能说明什么？ / q_en: What can repeated early discards in one suit suggest?
   - zh: 那一门可能不被保留或正在清缺 / en: That suit may be unwanted or being voided *
   - zh: 这家必定已经胡牌 / en: The player must already have won
   - zh: 这家一定在做七对 / en: The player must be making Seven pairs
   explain_zh: 这只是方向线索，不能直接推出确定牌型。 / explain_en: This is a direction clue, not a certain hand-shape conclusion.
   terms: discard-reading, void-suit

## L2-06 杠的取舍 · Kong choices
goal_zh: 理解 [[term:kong]] 的流程取舍：能杠不等于一定要杠。 / goal_en: Understand [[term:kong]] flow choices: being able to Kong does not mean you always should.
duration: 8

### text
zh: 四川麻将可以 [[term:kong]]，也有与杠相关的俗称 [[term:kong-bonuses]]；但本期不实现任何结算细则。这里只看：杠是否破坏听牌、是否暴露信息、补牌后是否继续推进。 / en: Sichuan Mahjong allows [[term:kong]], and [[term:kong-bonuses]] is a common expression around Kongs; this phase implements no settlement details. Here, only check whether a Kong breaks readiness, exposes information, and how the replacement draw advances the hand.

### callout warn
zh: 不要用“有收益”这种未定细则来做判断；Phase 2 的教练只看流程、听牌与牌效。 / en: Do not base decisions on unsettled value rules. The Phase 2 coach only checks flow, readiness, and efficiency.

### example 暗杠前检查 · Check before Kong
zh: 四张相同牌可以杠；若当前已经听牌，先检查杠后手牌结构是否会改变等待面。 / en: Four identical tiles can form a Kong. If already ready, check whether declaring it changes the wait structure.
tiles: 5p 5p 5p 5p 2t 3t 4t 6t 7t 8t 9t 9t
void: w

### quiz
1. q_zh: Phase 2 里判断杠，主要看什么？ / q_en: In Phase 2, what is the main basis for a Kong decision?
   - zh: 听牌、牌效和流程影响 / en: Readiness, efficiency, and flow impact *
   - zh: 具体结算数值 / en: Specific settlement values
   - zh: 是否能吃顺子 / en: Whether a Chow can be claimed
   explain_zh: §K 细则未定，本期不比较数值；四川麻将也不可吃。 / explain_en: Section K details are unset, so this phase does not compare values; Chow claims are not allowed.
   terms: kong, tile-efficiency, no-chow
2. q_zh: 能杠时，为什么仍可能选择暂不杠？ / q_en: Why might you pass on a legal Kong?
   - zh: 可能影响听牌或暴露结构 / en: It may affect readiness or expose structure *
   - zh: 因为四川麻将不能杠 / en: Because Sichuan Mahjong cannot Kong
   - zh: 因为杠等同于吃 / en: Because Kong is the same as Chow
   explain_zh: 四川麻将可以杠，但取舍要看当下手牌目标。 / explain_en: Sichuan Mahjong allows Kong, but the choice depends on the current hand goal.
   terms: kong, ready-hand, hand-direction

## L2-07 多听比较 · Comparing multiple waits
goal_zh: 比较 [[term:multiple-waits]] 和单听，理解“宽听”为什么更稳。 / goal_en: Compare [[term:multiple-waits]] with single waits and understand why wider waits are steadier.
duration: 8

### text
zh: [[term:multiple-waits]] 指一手牌同时等待多种牌成胡。比较多听时，不只看张数，还要看是否包含定缺门、是否已被自己或别人打掉很多。 / en: [[term:multiple-waits]] means the hand can win on several tile types. When comparing waits, check not only count, but also whether a wait is the declared void suit or already heavily visible in discards.

### example 单听与多听 · Single vs multiple waits
zh: 单等一张牌容易被牌墙或舍牌消耗；多听通常有更多完成机会。 / en: A single wait can be exhausted by the wall or discards; multiple waits usually give more chances to complete.
tiles: 2p 3p 4p 4p 5p 6p 6t 7t 8t 2t 2t 3t 4t
void: w

### quiz
1. q_zh: 多听的直接优势是什么？ / q_en: What is the direct advantage of multiple waits?
   - zh: 可成胡的牌种更多 / en: More tile types can complete the win *
   - zh: 可以忽略定缺门 / en: You can ignore the declared void suit
   - zh: 可以吃别人舍牌 / en: You can claim Chow from discards
   explain_zh: 多听更宽，但仍必须满足缺门和四川不可吃规则。 / explain_en: Multiple waits are wider, but the void-suit and no-Chow rules still apply.
   terms: multiple-waits, void-suit, no-chow
2. q_zh: 比较两个听牌面时，除了数量还要看什么？ / q_en: Besides count, what else matters when comparing waits?
   - zh: 等待牌是否可用、是否已经大量可见 / en: Whether the waits are usable and already heavily visible *
   - zh: 牌面是否都是红色 / en: Whether all tiles are red
   - zh: 是否含字牌 / en: Whether honor tiles are included
   explain_zh: 四川麻将本课程核心牌只有三门；可见牌会影响实际完成机会。 / explain_en: This course uses only three suits; visible tiles affect real completion chances.
   terms: multiple-waits, honor-tiles, discard-reading

## L2-08 L2 综合：从清缺到听牌 · L2 synthesis: from voiding to tenpai
goal_zh: 把 [[term:void-suit]]、[[term:tile-efficiency]]、[[term:defense]]、[[term:ready-hand]] 串成一条决策链。 / goal_en: Connect [[term:void-suit]], [[term:tile-efficiency]], [[term:defense]], and [[term:ready-hand]] into one decision chain.
duration: 10

### text
zh: 一手牌的基本顺序是：先看定缺门是否清掉；再看舍哪张保留更多进张；若别人压力变大，加入防守；最后用听牌判断检查哪些牌能胡。这个链条也是 Phase 2 牌桌教练的引导顺序。 / en: A hand's basic order is: first check whether the declared void suit is cleared; then compare which discard preserves more effective tiles; if opponents become threatening, add defense; finally use ready-hand checks to see which tiles win. This is also the Phase 2 table coach sequence.

### example 决策链 · Decision chain
zh: 这手牌已缺万，下一步可比较打9条或拆对子后的进张，再判断是否听牌。 / en: This hand has voided Characters. Next compare waits after discarding 9 Bamboo or breaking a pair, then check readiness.
tiles: 1p 2p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5t 5t 9t
void: w

### quiz
1. q_zh: 一手牌最先要检查的硬约束是什么？ / q_en: What hard constraint should be checked first in a hand?
   - zh: 定缺门是否已经清掉 / en: Whether the declared void suit is cleared *
   - zh: 是否能吃上家牌 / en: Whether you can Chow from the previous player
   - zh: 是否需要字牌 / en: Whether honor tiles are needed
   explain_zh: 缺门是胡牌前置；四川麻将不可吃，且本课程核心牌无字牌。 / explain_en: Voiding is required before winning; Chow claims are not allowed, and this course uses no honor tiles.
   terms: void-suit, no-chow, honor-tiles
2. q_zh: 清缺后，牌效练习最常用的比较方式是什么？ / q_en: After clearing the void suit, what is the common efficiency comparison?
   - zh: 分别打出候选牌，比较剩余进张 / en: Discard each candidate and compare remaining waits *
   - zh: 直接保留所有孤张 / en: Keep all isolated tiles
   - zh: 只看别人座位方向 / en: Only look at seating direction
   explain_zh: 牌效要落到可验证的等待牌与进张数量。 / explain_en: Tile efficiency should be checked through concrete waits and effective tile counts.
   terms: tile-efficiency, effective-tiles, discard
3. q_zh: 对手压力变大时，牌效链里会加入哪一层判断？ / q_en: When opponent pressure rises, what layer is added to the efficiency chain?
   - zh: 防守与舍牌风险 / en: Defense and discard risk *
   - zh: 牌面装饰偏好 / en: Tile decoration preference
   - zh: 发音练习 / en: Pronunciation practice
   explain_zh: Phase 2 只做本地牌桌与教练；压力变大时加入防守推断。 / explain_en: Phase 2 uses a local table and coach only; when pressure rises, add defensive inference.
   terms: defense, discard-reading
