# L0 Foundations
notation: `3t`=3 条 Bamboo, `5p`=5 筒 Dots, `7w`=7 万 Characters.

## L0-01 三门认牌 · Three suits
goal_zh: 认识四川麻将只用的三门牌，并能区分牌面。 / goal_en: Recognize the three suits used in Sichuan Mahjong and distinguish their tiles.
duration: 5

### text
zh: [[term:sichuan-mahjong]] 只用三门：[[term:dots]]、[[term:bamboo]]、[[term:characters]]。每门 1 到 9，每张有 4 张，所以一副牌是 108 张；没有风牌、箭牌这些 [[term:honor-tiles]]。 / en: [[term:sichuan-mahjong]] uses three suits only: [[term:dots]], [[term:bamboo]], and [[term:characters]]. Each suit has ranks 1 through 9 with four copies, making 108 tiles; there are no [[term:honor-tiles]] such as winds or dragons.

### callout tip
zh: 双语标签可以帮助对照；先看清万、条、筒的牌面差异，不需要背英文名称。 / en: Bilingual labels are available for reference. First recognize the visual difference between Characters, Bamboo, and Dots; memorizing English names is not required.

### example 三门牌样 · Three suit samples
zh: 这组牌各来自一门：5 筒、3 条、7 万。 / en: This set shows one tile from each suit: 5 Dots, 3 Bamboo, and 7 Characters.
tiles: 5p 3t 7w

### quiz
1. q_zh: 四川麻将核心规则使用多少张牌？ / q_en: How many tiles are used in this Sichuan Mahjong ruleset?
   - zh: 108 张 / en: 108 tiles *
   - zh: 136 张 / en: 136 tiles
   - zh: 144 张 / en: 144 tiles
   explain_zh: 三门 1–9 各 4 张，36 张 × 3 门 = 108 张。 / explain_en: Three suits, ranks 1 to 9, four copies each: 36 tiles per suit, 108 total.
   terms: sichuan-mahjong, dots, bamboo, characters
2. q_zh: 四川麻将核心使用哪三门牌？ / q_en: Which three suits are used in the core Sichuan Mahjong ruleset?
   - zh: 万、条、筒 / en: Characters, Bamboo, and Dots *
   - zh: 万、风、箭 / en: Characters, Winds, and Dragons
   - zh: 条、花、季 / en: Bamboo, Flowers, and Seasons
   explain_zh: 本应用只用万、条、筒三门，共 108 张，没有字牌。 / explain_en: This app uses Characters, Bamboo, and Dots only: 108 tiles and no honor tiles.
   terms: bamboo, dots, characters

## L0-02 定缺 · Voiding a suit
goal_zh: 理解定缺的作用，并能判断手牌是否已经打缺该门。 / goal_en: Understand voiding a suit and judge whether a hand has cleared its declared void suit.
duration: 6

### text
zh: [[term:void-suit]] 是四川麻将的核心：开局声明一门作为 [[term:declared-void-suit]]，之后要把这门打出去。到 [[term:win]] 时，手牌必须已经 [[term:one-suit-missing]]。 / en: [[term:void-suit]] is central to Sichuan Mahjong: at the start you declare one [[term:declared-void-suit]] and work to discard it. By the time you [[term:win]], that suit must be [[term:one-suit-missing]].

### callout warn
zh: 还没打缺定缺门，就不能算合格胡牌；本期只判断是否缺门，不写平台罚分。 / en: If the declared void suit is still present, the hand is not ready to qualify as a win; Phase 1 only checks the cleared-suit condition, not platform penalties.

### example 定缺万 · Voiding Characters
zh: 本局定缺万，这组牌里还有 7 万，所以还没有打缺。 / en: Characters are declared void here. Because 7 Characters is still present, the hand has not cleared the void suit.
tiles: 2p 3p 4p 5t 6t 7w
void: w

### quiz
1. q_zh: 定缺万时，哪组牌已经打缺？ / q_en: If Characters are void, which set has cleared the void suit?
   - zh: 2筒 3筒 4条 6条 / en: 2 Dots, 3 Dots, 4 Bamboo, 6 Bamboo *
   - zh: 2筒 3万 4条 6条 / en: 2 Dots, 3 Characters, 4 Bamboo, 6 Bamboo
   explain_zh: 定缺万时，手里不能再有万。 / explain_en: When Characters are void, no Characters should remain in the hand.
   terms: void-suit, one-suit-missing, characters
2. q_zh: 定缺万后，第一优先级通常是什么？ / q_en: After voiding Characters, what is usually the first priority?
   - zh: 尽快打完手里的万 / en: Clear the Characters still in hand *
   - zh: 一直保留万 / en: Keep all Characters
   - zh: 同时保留三门 / en: Keep all three suits
   explain_zh: 胡牌前必须缺一门；定缺万后要尽快打掉手里的万。 / explain_en: A winning hand must be missing one suit, so declared Characters should be cleared first.
   terms: void-suit

## L0-03 碰与杠，不可吃 · Pung, Kong, and no Chow
goal_zh: 区分碰、杠、吃，并记住四川麻将不可吃。 / goal_en: Distinguish Pung, Kong, and Chow, and remember that Chow cannot be claimed in Sichuan Mahjong.
duration: 6

### text
zh: 四川麻将可以 [[term:pung]]，可以 [[term:kong]]，但 [[term:no-chow]]。三张同门连续点数仍然是 [[term:chow]] 的结构，只是不能通过吃别家舍牌形成。 / en: Sichuan Mahjong allows [[term:pung]] and [[term:kong]], but has [[term:no-chow]]. Three consecutive tiles in one suit can still be a [[term:chow]] structure inside the hand; it just cannot be claimed from another player's discard.

### callout tip
zh: 记忆法：碰杠看“同一张”，顺子看“同一门连续”。 / en: Memory hook: Pung and Kong use identical tiles; Chow uses consecutive ranks in one suit.

### example 不能吃的顺子 · A Chow structure you cannot claim
zh: 3 条、4 条、5 条是顺子结构，但四川规则里不能吃别人打出的 4 条来组成它。 / en: 3, 4, and 5 Bamboo form a Chow structure, but Sichuan rules do not allow claiming another player's 4 Bamboo to make it.
tiles: 3t 4t 5t

### quiz
1. q_zh: 5 筒 5 筒 5 筒是什么？ / q_en: What are 5 Dots, 5 Dots, 5 Dots?
   - zh: 刻子 / en: Pung *
   - zh: 顺子 / en: Chow
   - zh: 对将 / en: Pair
   explain_zh: 三张同门同点数是刻子，也就是 Pung。 / explain_en: Three identical suited tiles form a Pung.
   terms: pung, meld
2. q_zh: 四川麻将里，别人打出 4 条时，你能吃成 3-4-5 条吗？ / q_en: In Sichuan Mahjong, can you claim a discarded 4 Bamboo to make 3-4-5 Bamboo?
   - zh: 能 / en: Yes
   - zh: 不能 / en: No *
   explain_zh: 顺子结构可以在手里形成，但四川麻将不可吃。 / explain_en: The Chow structure can exist in the hand, but claiming Chow is not allowed in Sichuan Mahjong.
   terms: chow, no-chow

## L0-04 面子与将 · Melds and the pair
goal_zh: 认识面子与将，能判断一小组牌是否成结构。 / goal_en: Recognize melds and the pair, and judge whether a small group forms a structure.
duration: 7

### text
zh: [[term:meld]] 是胡牌骨架里的三张结构，常见是刻子和顺子；[[term:pair]] 是两张同门同点数。先会看小结构，后面才看整手牌。 / en: A [[term:meld]] is a three-tile structure in the winning skeleton, commonly Pung or Chow; a [[term:pair]] is two identical suited tiles. Learn small structures before reading a whole hand.

### callout tip
zh: 面子判断先问三件事：是不是同门？是不是同点？是不是连续？ / en: To judge a structure, ask: same suit, same rank, or consecutive ranks?

### example 两组结构 · Two structures
zh: 7 万 7 万是一对将；3 筒 4 筒 5 筒是顺子结构。 / en: 7 Characters and 7 Characters form a pair; 3, 4, 5 Dots form a Chow structure.
tiles: 7w 7w 3p 4p 5p

### quiz
1. q_zh: 7 万 7 万是什么？ / q_en: What are 7 Characters and 7 Characters?
   - zh: 对将 / en: Pair *
   - zh: 刻子 / en: Pung
   - zh: 非面子 / en: Not a meld
   explain_zh: 两张同门同点数是一对将。 / explain_en: Two identical suited tiles form a pair.
   terms: pair
2. q_zh: 3 筒 4 条 5 筒为什么不是顺子？ / q_en: Why are 3 Dots, 4 Bamboo, and 5 Dots not a Chow?
   - zh: 因为跨门了 / en: Because they cross suits *
   - zh: 因为点数太小 / en: Because the ranks are too low
   explain_zh: 顺子必须同一门连续，跨门不成结构。 / explain_en: A Chow must be consecutive within one suit; mixed suits do not form a structure.
   terms: chow, meld

## L0-05 胡牌长什么样 · What a winning hand looks like
goal_zh: 建立标准胡牌结构的直觉，不进入听牌求解。 / goal_en: Build intuition for the standard winning shape without solving waits yet.
duration: 7

### text
zh: 标准 [[term:win]] 的骨架是 4 个 [[term:meld]] 加 1 个 [[term:pair]]，并且要满足定缺要求。四川麻将虽然不可吃，但手里仍可能自然形成顺子结构。 / en: A standard [[term:win]] skeleton is four [[term:meld]] structures plus one [[term:pair]], while also satisfying the void-suit requirement. Sichuan Mahjong forbids claiming Chow, but Chow structures can still form naturally in the hand.

### callout warn
zh: 本课只看结构，不讲番数、赔付或平台细则。 / en: This lesson covers structure only, not fan values, payments, or platform-specific scoring.

### example 一个标准骨架 · A standard skeleton
zh: 这组示例可以读成 3-4-5 条、5 筒刻子、7 万对子等小结构；真正整手胡牌判断会在后续阶段扩展。 / en: This example contains small structures such as 3-4-5 Bamboo, a 5 Dots Pung, and a 7 Characters pair; full-hand win checking expands in a later phase.
tiles: 3t 4t 5t 5p 5p 5p 7w 7w

### quiz
1. q_zh: 标准胡牌骨架需要哪一项？ / q_en: Which item belongs in a standard winning skeleton?
   - zh: 4 个面子 + 1 对将 / en: Four melds plus one pair *
   - zh: 5 个对子 / en: Five pairs
   - zh: 三门都保留 / en: Keeping all three suits
   explain_zh: 标准结构是 4 面子 + 1 对将，同时还要满足缺门。 / explain_en: The standard shape is four melds plus one pair, while also clearing the void suit.
   terms: win, meld, pair, void-suit
2. q_zh: 定缺万时，手里还留着 7 万，可以算合格胡牌吗？ / q_en: If Characters are void but 7 Characters is still in the hand, can it qualify as a win?
   - zh: 可以，只要面子够 / en: Yes, as long as the melds are complete
   - zh: 不可以，还没有打缺 / en: No, the void suit has not been cleared *
   explain_zh: 标准胡牌结构之外，还必须满足定缺门已经打缺。 / explain_en: Beyond the winning structure, the declared void suit must be cleared.
   terms: void-suit, one-suit-missing, win

## L0-06 一局流程与血战到底 · Flow of a hand and fight to the end
goal_zh: 理解一局从发牌、定缺、摸打到血战到底的基本流程。 / goal_en: Understand the basic flow from dealing and voiding to draw-discard play and fight-to-the-end continuation.
duration: 8

### text
zh: 一局开始先发牌并 [[term:void-suit]]，随后轮流摸牌、[[term:discard]]、碰杠或胡。[[term:fight-to-the-end]] 的关键是：一家胡后未胡者继续，直到有 3 家胡牌或流局。 / en: A hand begins with dealing and [[term:void-suit]], then players draw, [[term:discard]], Pung, Kong, or win in turn. The key of [[term:fight-to-the-end]] is that after one player wins, the others continue until three players have won or the hand draws.

### callout tip
zh: 先抓主线：定缺决定方向，摸打推进手牌，血战让未胡者继续决策。 / en: Track the main line first: voiding sets your direction, draw-discard play develops the hand, and fight-to-the-end keeps decisions going for players who have not won.

### example 流程中的小手牌 · A small flow example
zh: 定缺万时，摸到 7 万通常优先考虑打出，因为它属于定缺门。 / en: If Characters are void, drawing 7 Characters usually points toward discarding it because it belongs to the declared void suit.
tiles: 2p 3p 5t 6t 7w
void: w

### quiz
1. q_zh: 血战到底里，一家胡牌后牌局怎样？ / q_en: In fight-to-the-end play, what happens after one player wins?
   - zh: 立刻结束 / en: The hand ends immediately
   - zh: 未胡者继续 / en: Players who have not won continue *
   explain_zh: 血战到底不是一家胡就结束，未胡者继续。 / explain_en: Fight-to-the-end does not stop at the first win; players who have not won continue.
   terms: fight-to-the-end, win
2. q_zh: 定缺万时摸到万，最基本的方向是什么？ / q_en: If Characters are void and you draw a Character tile, what is the basic direction?
   - zh: 尽快打缺这门 / en: Work to clear that suit *
   - zh: 保留三门 / en: Keep all three suits
   explain_zh: 定缺要求最终打缺该门，优先处理定缺门牌。 / explain_en: Voiding requires that suit to be cleared, so tiles in that suit should be handled first.
   terms: void-suit, one-suit-missing
