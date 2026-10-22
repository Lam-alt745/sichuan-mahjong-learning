# L4 Advanced notation
notation: `3t`=3 条 Bamboo, `5p`=5 筒 Dots, `7w`=7 万 Characters.

## L4-01 剩张与概率推算 · Remaining counts
goal_zh: 用 [[term:remaining-counts]] 估计听牌是否还有活张。 / goal_en: Use [[term:remaining-counts]] to estimate whether waits still have live copies.
duration: 7

### text
zh: [[term:remaining-counts]] 的算法很朴素：每种牌最多 4 张，用自家手牌、舍牌河和公开面子中已经看见的张数去扣。若听 3 筒，但四张 3 筒都已经可见，就是死听。 / en: [[term:remaining-counts]] is simple: each tile has at most four copies, then visible copies from your hand, rivers, and open melds are subtracted. If you wait on 3 Dots but all four 3 Dots are visible, the wait is dead.

### callout tip
zh: 本应用的概率模块不猜暗手，只做“可见牌扣减”的确定性计算。 / en: This app's probability module does not guess hidden hands; it performs deterministic visible-tile subtraction.

### example 死听 · Dead wait
zh: 这手听 3 筒；如果四张 3 筒已经在可见牌里，剩张为 0，就不是好听牌。 / en: This hand waits on 3 Dots. If all four 3 Dots are already visible, remaining count is 0, so the wait is poor.
tiles: 1p 2p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5t 5t
void: w

### quiz
1. q_zh: 每种无字牌最多有几张？ / q_en: How many copies can each suited tile have at most?
   - zh: 3 张 / en: 3 copies
   - zh: 4 张 / en: 4 copies *
   - zh: 9 张 / en: 9 copies
   explain_zh: 三门 1-9 每种各 4 张，共 108 张。 / explain_en: Each suited rank has four copies; three suits make 108 tiles.
   terms: remaining-counts, sichuan-mahjong
2. q_zh: 听牌剩张为 0 时，应怎样理解？ / q_en: What does a wait with 0 remaining copies mean?
   - zh: 仍然一定能胡 / en: It will still certainly win
   - zh: 这门还没定缺 / en: The suit is not voided
   - zh: 这张听牌已经死了 / en: That wait is dead *
   explain_zh: 剩张 0 说明已知牌里四张都出现了。 / explain_en: Remaining 0 means all four copies are already visible.
   terms: remaining-counts, ready-hand

## L4-02 听牌广度与质量 · Width and quality of waits
goal_zh: 区分“听几种牌”和 [[term:wait-quality]]。 / goal_en: Distinguish the number of wait types from [[term:wait-quality]].
duration: 7

### text
zh: [[term:multiple-waits]] 通常比单吊好，但真正要看 [[term:weighted-waits]]：两种听牌各剩 1 张，总进张只有 2；一种听牌剩 4 张，反而更厚。 / en: [[term:multiple-waits]] is usually better than a single wait, but [[term:weighted-waits]] matters: two wait types with one copy each total only 2 outs, while one wait type with four copies may be stronger.

### callout tip
zh: L2 数“听几种”，L4 再加一层“每种还剩几张”。 / en: L2 counts wait types; L4 adds how many copies remain for each type.

### example 多听不一定厚 · Wider is not always thicker
zh: 如果听 3 筒和 6 条，但两者各剩 1 张，总进张 2；另一手只听 5 筒但剩 4 张，进张更厚。 / en: If a hand waits on 3 Dots and 6 Bamboo with one copy left each, total outs are 2. Another hand waiting only on 5 Dots with four copies left is thicker.
tiles: 2p 3p 4p 4p 5p 6p 6t 7t 8t 2t 2t 3t 4t
void: w

### quiz
1. q_zh: 加权进张比较的核心是什么？ / q_en: What is the core of weighted wait comparison?
   - zh: 只数有几种听牌 / en: Only count wait types
   - zh: 把每种听牌剩余张数合计 / en: Sum remaining copies for each wait *
   - zh: 只看牌面是否好看 / en: Only inspect tile appearance
   explain_zh: 加权进张按剩张数计算总有效张。 / explain_en: Weighted waits calculate total effective copies by remaining counts.
   terms: weighted-waits, remaining-counts, effective-tiles
2. q_zh: 两门听牌各剩 1 张，总进张是多少？ / q_en: Two wait types with one copy left each give how many total outs?
   - zh: 2 张 / en: 2 copies *
   - zh: 4 张 / en: 4 copies
   - zh: 8 张 / en: 8 copies
   explain_zh: 1+1=2。 / explain_en: 1+1=2.
   terms: weighted-waits, wait-quality

## L4-03 危险度与防守体系 · Risk and defense
goal_zh: 用舍牌信息识别 [[term:risk-tile]] 与 [[term:safe-tile]]。 / goal_en: Use discard information to identify [[term:risk-tile]] and [[term:safe-tile]].
duration: 8

### text
zh: [[term:defense]] 不是完全不进攻，而是在对手可能 [[term:ready-hand]] 时减少放出成胡牌的概率。[[term:discard-reading]] 看别人缺哪门、早打哪门、突然不打哪门，从而判断某张是不是 [[term:risk-tile]]。 / en: [[term:defense]] is not refusing to attack; it reduces the chance of dealing in when an opponent may be [[term:ready-hand]]. [[term:discard-reading]] asks which suit they void, which suit they discarded early, and which suit they suddenly stop discarding to judge whether a tile is a [[term:risk-tile]].

### callout warn
zh: 安全只是相对安全；本应用不会把暗手未知信息当成确定事实。 / en: Safety is relative; this app does not treat unknown hidden hands as certain facts.

### example 早打和晚打 · Early and late discards
zh: 对手早早打万，后来一直不打筒，说明筒可能更危险；此时筒里的生张要谨慎。 / en: If an opponent discarded Characters early but later stops discarding Dots, Dots may be more dangerous; fresh Dot tiles need caution.
tiles: 2p 5p 8p 3t 4t 5t 7w 8w 9w
void: w

### quiz
1. q_zh: 防守的主要目标是什么？ / q_en: What is the main goal of defense?
   - zh: 减少放出成胡牌的风险 / en: Reduce the risk of discarding a winning tile *
   - zh: 永远不胡 / en: Never win
   - zh: 只打最大番 / en: Only chase the highest fan
   explain_zh: 防守是在风险变高时调整舍牌。 / explain_en: Defense adjusts discards when risk rises.
   terms: defense, risk-tile
2. q_zh: 看舍牌读手能确定对手暗手吗？ / q_en: Can discard reading know an opponent's hidden hand with certainty?
   - zh: 不能，只能形成风险判断 / en: No; it only forms risk judgments *
   - zh: 可以，完全确定 / en: Yes, completely
   - zh: 只在自摸时可以 / en: Only on self-draw
   explain_zh: 暗手未知，只能基于可见信息推断。 / explain_en: Hidden hands remain unknown; visible information only supports inference.
   terms: discard-reading, risk-tile, safe-tile

## L4-04 血战中后期决策 · Mid-late fight-to-the-end decisions
goal_zh: 在有人已胡退场后，调整速度、风险和结算预期。 / goal_en: Adjust speed, risk, and settlement expectation after players have won and exited.
duration: 8

### text
zh: [[term:fight-to-the-end]] 的中后期与开局不同：已胡家退场，付款人数减少，危险信息增多。自摸少一个未胡家就少一笔；点炮仍由点炮者一家承担。此时要把 [[term:score-settlement]] 和防守一起看。 / en: The mid-late stage of [[term:fight-to-the-end]] differs from the opening: winners exit, payer count shrinks, and risk information increases. A self-draw loses one payment for each exited player; a discard win is still paid by the discarder. Read [[term:score-settlement]] together with defense.

### callout tip
zh: 只剩两家未胡时，防守价值会变高，因为每张舍牌都更集中地影响你和对手。 / en: When only two players have not won, defense becomes more valuable because each discard affects you and the opponent more directly.

### example 已胡退场 · Winner exits
zh: 三家未胡时，3 番自摸可收三笔；已有一家胡后，只收两笔。打法要随付款人数变化。 / en: With three not-yet-won players, a 3-fan self-draw receives three payments; after one player wins, it receives two. Play should adjust to payer count.
tiles: 2p 3p 4p 3p 4p 5p 6p 7p 8p 5t 5t 5t 6t
void: w

### quiz
1. q_zh: 一家已胡退场后，后续自摸付款人数会怎样？ / q_en: After one player wins and exits, what happens to later self-draw payer count?
   - zh: 减少 / en: It decreases *
   - zh: 增加 / en: It increases
   - zh: 固定不变 / en: It never changes
   explain_zh: 已胡家退场，不再参与后续自摸赔付。 / explain_en: A player who has won exits and does not pay later self-draw events.
   terms: fight-to-the-end, self-draw, score-settlement
2. q_zh: 血战后期是否还要看防守？ / q_en: Should defense still matter late in fight-to-the-end?
   - zh: 要，风险信息更多 / en: Yes, risk information is richer *
   - zh: 不要，只看摸牌 / en: No, only draws matter
   - zh: 只看花猪 / en: Only flowery pig matters
   explain_zh: 后期对手范围更窄，危险牌判断更重要。 / explain_en: Opponent ranges narrow late, making risk-tile judgment more important.
   terms: defense, risk-tile, fight-to-the-end

## L4-05 对手类型应对 · Opponent profiles
goal_zh: 用 [[term:opponent-profile]] 调整进攻和防守。 / goal_en: Use [[term:opponent-profile]] to adjust attack and defense.
duration: 7

### text
zh: 本应用的 AI 画像包括稳健、激进、保守、牌效、均衡。激进家更愿意碰杠，保守家更容易过，牌效家偏向保留最多进张。画像不是读心，只是帮助你选择更合适的 [[term:hand-direction]]。 / en: This app's AI profiles are steady, aggressive, conservative, efficiency-focused, and balanced. Aggressive players claim more, conservative players pass more, and efficiency players preserve more waits. A profile is not mind-reading; it helps choose a better [[term:hand-direction]].

### callout tip
zh: 对激进家，生张更要谨慎；对保守家，可以更重视自己进张。 / en: Against aggressive players, fresh tiles need more caution; against conservative players, you may weigh your own effective tiles more.

### example 激进家 · Aggressive player
zh: 激进家频繁碰杠，说明其手牌公开信息多，但舍牌也更可能带来响应。 / en: An aggressive player who often Pungs and Kongs reveals more information, but your discards are also more likely to be claimed.
tiles: 5p 5p 5p 2t 3t 4t 7w 8w 9w
void: w

### quiz
1. q_zh: 对手画像能直接证明暗手吗？ / q_en: Can an opponent profile prove the hidden hand?
   - zh: 不能，只是决策倾向 / en: No; it is only a decision tendency *
   - zh: 能，等于明牌 / en: Yes; it reveals the hand
   - zh: 只证明定缺门 / en: It only proves void suit
   explain_zh: 画像是倾向，不是确定信息。 / explain_en: A profile is a tendency, not certain information.
   terms: opponent-profile, discard-reading
2. q_zh: 牌效家通常更重视什么？ / q_en: What does an efficiency-focused player usually value?
   - zh: 更多进张 / en: More effective tiles *
   - zh: 永远保守 / en: Always passing
   - zh: 只做花猪 / en: Keeping all suits
   explain_zh: 牌效画像会偏向保留更多听牌和进张。 / explain_en: The efficiency profile tends to preserve more waits and effective tiles.
   terms: opponent-profile, tile-efficiency, effective-tiles

## L4-06 变体规则提示 · Variant rule notes
goal_zh: 认识换三张、平台差异和血流成河等 [[term:variant-rule]]，并区分默认对局。 / goal_en: Recognize [[term:variant-rule]] notes such as tile exchange, platform differences, and Blood-flow Mahjong, while separating them from the default table.
duration: 7

### text
zh: [[term:variant-rule]] 只作为规则提示：换三张、血流成河、平台差异以及天胡/地胡的细节口径，都可能因桌规变化。本应用默认对局仍是三门 108 张、定缺、碰杠不吃、血战到底，并按 §K 教学结算。 / en: [[term:variant-rule]] items are notes only: tile exchange, Blood-flow Mahjong, platform differences, and detailed Heavenly/Earthly timing may vary by table rules. This app's default table remains 108 suited tiles, void suit, Pung/Kong/no Chow, fight to the end, and K teaching settlement.

### callout warn
zh: 变体提示卡不进入 engine 默认状态机；练习和牌桌仍按本应用默认规则。 / en: Variant notes do not enter the default engine state machine; drills and table play still use this app's default rules.

### example 非默认对局 · Non-default table
zh: 如果某个平台要求开局换三张，那是变体规则；本应用默认牌桌不会先换牌。 / en: If a platform requires exchanging three tiles at the start, that is a variant rule; this app's default table does not exchange tiles first.
tiles: 1p 4p 7p 2t 5t 8t 3w 6w 9w
void: w

### quiz
1. q_zh: 换三张在本应用默认牌桌中启用吗？ / q_en: Is tile exchange enabled in this app's default table?
   - zh: 不启用，只做变体提示 / en: No; it is only a variant note *
   - zh: 每局强制启用 / en: Yes, every hand
   - zh: 只在 L3 启用 / en: Only in L3
   explain_zh: L4 只描述变体，不改默认 engine。 / explain_en: L4 describes variants without changing the default engine.
   terms: variant-rule
2. q_zh: 本应用默认牌桌是否允许吃？ / q_en: Does this app's default table allow Chow claims?
   - zh: 不允许吃 / en: No Chow claims *
   - zh: 允许吃 / en: Chow claims are allowed
   - zh: 只允许吃万 / en: Only Characters can be claimed for Chow
   explain_zh: 默认规则仍是碰杠不吃。 / explain_en: The default rule remains Pung/Kong/no Chow.
   terms: no-chow, variant-rule

## L4-07 L4 综合 · L4 synthesis
goal_zh: 把剩张、听牌质量、防守和对手画像放在同一决策里。 / goal_en: Combine remaining counts, wait quality, defense, and opponent profile in one decision.
duration: 8

### text
zh: L4 的核心是把 L2 的牌效、L3 的结算收益和 L4 的剩张/风险放在一起：宽听但死张多，可能不如窄听但活张厚；高番但危险大，也可能不如快速安全。 / en: L4 combines L2 efficiency, L3 settlement return, and L4 remaining counts and risk: a wide wait with many dead copies may be worse than a narrower live wait; a high-fan path with high danger may be worse than a fast safer line.

### callout tip
zh: 先列事实，再做选择：剩张、听牌、对手、积分收益，分别写清楚。 / en: List facts before choosing: remaining counts, readiness, opponents, and point return should be separate.

### example 决策表 · Decision table
zh: 候选 A 进张 4 张但危险较高；候选 B 进张 3 张但更安全。后期可能选 B，前期可能选 A。 / en: Candidate A has 4 outs but higher risk; candidate B has 3 outs and is safer. Late stage may choose B, early stage may choose A.
tiles: 2p 3p 4p 4p 5p 6p 6t 7t 8t 2t 2t 3t 4t
void: w

### quiz
1. q_zh: L4 决策应该只看进张数吗？ / q_en: Should L4 decisions look only at out count?
   - zh: 不，应同时看风险和收益 / en: No; also consider risk and return *
   - zh: 是，进张数唯一重要 / en: Yes, out count is the only thing
   - zh: 只看英文术语 / en: Only English terms matter
   explain_zh: L4 把进张、风险和结算预期合并。 / explain_en: L4 combines outs, risk, and settlement expectation.
   terms: weighted-waits, risk-tile, expected-value
2. q_zh: 宽听但全部死张，质量如何？ / q_en: How good is a wide wait if all copies are dead?
   - zh: 质量差 / en: Poor quality *
   - zh: 一定最好 / en: Always best
   - zh: 自动变成天胡 / en: It becomes Heavenly hand
   explain_zh: 听牌种类多但剩张为 0，无法带来真实进张。 / explain_en: Many wait types with zero remaining copies do not provide real outs.
   terms: wait-quality, remaining-counts, ready-hand
3. q_zh: 变体规则在默认练习器中会改变判定吗？ / q_en: Do variant rules change default drill judgments?
   - zh: 不会 / en: No *
   - zh: 会，全部启用 / en: Yes, all variants are enabled
   - zh: 只改变牌面组件 / en: Only tile rendering changes
   explain_zh: 变体规则只做提示卡，不进默认 engine。 / explain_en: Variant rules are notes only and do not enter the default engine.
   terms: variant-rule
