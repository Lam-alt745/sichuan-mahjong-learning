import { evaluateWinningHand, waits } from "./hand";
import {
  isVoidSuitCleared,
  parseTile,
  parseTileCode,
  sortTileCodes,
  toTileCode,
  type TileCode,
  type TileRank,
  type TileSuit
} from "./tiles";

export const BASE_SCORE = 2;
export const FAN_CAP = 8;
export const FLOWERY_PIG_POINTS = 32;

export type WinSource = "self-draw" | "discard";
export type WinTiming = "normal" | "heavenly" | "earthly";
export type ScoringMeldKind = "chow" | "pung" | "kong";
export type ScoringPatternId =
  | "pinhu"
  | "no-terminals"
  | "all-triplets"
  | "pure-suit"
  | "terminal-hand"
  | "seven-pairs"
  | "pure-all-triplets"
  | "rank-pairs"
  | "dragon-seven-pairs"
  | "pure-seven-pairs"
  | "pure-terminal-hand"
  | "heavenly-hand"
  | "earthly-hand"
  | "pure-dragon-seven-pairs";

export interface ScoringMeld {
  readonly kind: ScoringMeldKind;
  readonly tiles: readonly string[];
}

export interface ScoreAddOns {
  readonly kongDraw?: boolean;
  readonly kongDiscard?: boolean;
  readonly roots?: number;
}

export interface ScoreContext {
  readonly voidSuit: TileSuit;
  readonly source?: WinSource;
  readonly openMelds?: readonly ScoringMeld[];
  readonly addOns?: ScoreAddOns;
  readonly winTiming?: WinTiming;
}

export interface ScoringPattern {
  readonly id: ScoringPatternId;
  readonly fan: number;
  readonly zh: string;
  readonly en: string;
}

export interface ScoreLine {
  readonly id: string;
  readonly fan: number;
  readonly points: number;
  readonly zh: string;
  readonly en: string;
}

export interface ScoreResult {
  readonly winning: boolean;
  readonly pattern: ScoringPattern;
  readonly matchedPatterns: ScoringPattern[];
  readonly baseFan: number;
  readonly addFan: number;
  readonly totalFan: number;
  readonly capped: boolean;
  readonly patternPoints: number;
  readonly selfDrawBonus: number;
  readonly paymentPoints: number;
  readonly roots: number;
  readonly lines: ScoreLine[];
  readonly reasonZh: string;
  readonly reasonEn: string;
}

export type SettlementKind = "win" | "kong" | "draw" | "refund";

export interface ScorePayment {
  readonly from: number;
  readonly to: number;
  readonly points: number;
  readonly kind: SettlementKind;
  readonly reasonZh: string;
  readonly reasonEn: string;
}

export interface ScoreSettlement {
  readonly results: ScoreResult[];
  readonly payments: ScorePayment[];
  readonly net: Record<number, number>;
  readonly notes: Array<{ readonly zh: string; readonly en: string }>;
}

export interface WinSettlementContext extends ScoreContext {
  readonly winner: number;
  readonly discarder?: number;
  readonly players?: readonly number[];
  readonly alreadyWon?: readonly number[];
}

export type KongEventKind = "point" | "add-on" | "concealed";

export interface KongPointEvent {
  readonly owner: number;
  readonly kind: KongEventKind;
  readonly from?: number;
  readonly robbed?: boolean;
}

export interface DrawSettlementPlayer {
  readonly id: number;
  readonly floweryPig: boolean;
  readonly tenpai: boolean;
  readonly hand?: readonly string[];
  readonly voidSuit?: TileSuit;
  readonly openMelds?: readonly ScoringMeld[];
}

interface MeldGroup {
  readonly kind: ScoringMeldKind;
  readonly tiles: TileCode[];
}

interface StandardDecomposition {
  readonly pair: TileCode;
  readonly melds: MeldGroup[];
}

const playersDefault = [0, 1, 2, 3] as const;

const patternDefs: Record<ScoringPatternId, ScoringPattern> = {
  pinhu: { id: "pinhu", fan: 1, zh: "平胡", en: "Basic hand" },
  "no-terminals": { id: "no-terminals", fan: 1, zh: "断幺九", en: "No-terminals" },
  "all-triplets": { id: "all-triplets", fan: 2, zh: "对对胡", en: "All-triplets" },
  "pure-suit": { id: "pure-suit", fan: 3, zh: "清一色", en: "Pure suit hand" },
  "terminal-hand": { id: "terminal-hand", fan: 3, zh: "带幺九", en: "Terminal-containing hand" },
  "seven-pairs": { id: "seven-pairs", fan: 3, zh: "七对", en: "Seven pairs" },
  "pure-all-triplets": { id: "pure-all-triplets", fan: 4, zh: "清对", en: "Pure all-triplets" },
  "rank-pairs": { id: "rank-pairs", fan: 4, zh: "将对", en: "All 2/5/8 triplets" },
  "dragon-seven-pairs": { id: "dragon-seven-pairs", fan: 5, zh: "龙七对", en: "Dragon seven pairs" },
  "pure-seven-pairs": { id: "pure-seven-pairs", fan: 5, zh: "清七对", en: "Pure seven pairs" },
  "pure-terminal-hand": { id: "pure-terminal-hand", fan: 5, zh: "清幺九", en: "Pure terminal hand" },
  "heavenly-hand": { id: "heavenly-hand", fan: 6, zh: "天胡", en: "Heavenly hand" },
  "earthly-hand": { id: "earthly-hand", fan: 6, zh: "地胡", en: "Earthly hand" },
  "pure-dragon-seven-pairs": { id: "pure-dragon-seven-pairs", fan: 6, zh: "清龙七对", en: "Pure dragon seven pairs" }
};

const patternPriority: ScoringPatternId[] = [
  "pure-dragon-seven-pairs",
  "heavenly-hand",
  "earthly-hand",
  "dragon-seven-pairs",
  "pure-seven-pairs",
  "pure-terminal-hand",
  "pure-all-triplets",
  "rank-pairs",
  "pure-suit",
  "terminal-hand",
  "seven-pairs",
  "all-triplets",
  "no-terminals",
  "pinhu"
];

export function scoreForFan(fan: number): number {
  if (fan <= 0) {
    return 0;
  }
  const capped = Math.min(FAN_CAP, fan);
  return BASE_SCORE * 2 ** (capped - 1);
}

export function evaluateScore(hand: readonly string[], context: ScoreContext): ScoreResult {
  const tiles = normalizeTiles(hand);
  const openMelds = normalizeMelds(context.openMelds ?? []);
  const allTiles = [...tiles, ...openMelds.flatMap((meld) => meld.tiles)];
  const openMeldCount = openMelds.length;
  const win = evaluateWinningHand(tiles, context.voidSuit, { openMeldCount });

  if (!isVoidSuitCleared(allTiles, context.voidSuit) || !win.winning) {
    const pattern = patternDefs.pinhu;
    return {
      winning: false,
      pattern,
      matchedPatterns: [],
      baseFan: 0,
      addFan: 0,
      totalFan: 0,
      capped: false,
      patternPoints: 0,
      selfDrawBonus: 0,
      paymentPoints: 0,
      roots: 0,
      lines: [],
      reasonZh: "未满足胡牌结构或缺门要求，不能计番。",
      reasonEn: "The hand does not satisfy both the winning shape and void-suit rule, so it is not scored."
    };
  }

  const decompositions = findStandardDecompositions(tiles, openMelds);
  const matchedPatterns = detectPatterns(tiles, allTiles, openMelds, decompositions, context.winTiming ?? "normal");
  const pattern = chooseBestPattern(matchedPatterns);
  const roots = context.addOns?.roots ?? countRoots(allTiles, openMelds, pattern.id);
  const addFanLines = buildAddFanLines(context.addOns, roots);
  const addFan = addFanLines.reduce((sum, line) => sum + line.fan, 0);
  const rawFan = pattern.fan + addFan;
  const totalFan = Math.min(FAN_CAP, rawFan);
  const patternPoints = scoreForFan(totalFan);
  const selfDrawBonus = context.source === "self-draw" ? BASE_SCORE : 0;
  const paymentPoints = patternPoints + selfDrawBonus;
  const capped = rawFan > FAN_CAP;
  const lines = [
    {
      id: pattern.id,
      fan: pattern.fan,
      points: scoreForFan(pattern.fan),
      zh: `${pattern.zh} ${pattern.fan} 番`,
      en: `${pattern.en}: ${pattern.fan} fan`
    },
    ...addFanLines
  ];
  if (selfDrawBonus > 0) {
    lines.push({
      id: "self-draw-bonus",
      fan: 0,
      points: selfDrawBonus,
      zh: `自摸加底 ${selfDrawBonus} 分`,
      en: `Self-draw base add-on: ${selfDrawBonus} points`
    });
  }

  return {
    winning: true,
    pattern,
    matchedPatterns,
    baseFan: pattern.fan,
    addFan,
    totalFan,
    capped,
    patternPoints,
    selfDrawBonus,
    paymentPoints,
    roots,
    lines,
    reasonZh: `${pattern.zh} 为最大番型，${pattern.fan}+${addFan} 番${capped ? "，封顶按 8 番" : ""}，本次每笔胡牌 ${paymentPoints} 分。`,
    reasonEn: `${pattern.en} is the highest pattern: ${pattern.fan}+${addFan} fan${capped ? ", capped at 8 fan" : ""}; each win payment is ${paymentPoints} points.`
  };
}

export function settleWin(hand: readonly string[], context: WinSettlementContext): ScoreSettlement {
  const source = context.source ?? (context.discarder === undefined ? "self-draw" : "discard");
  const result = evaluateScore(hand, { ...context, source });
  if (!result.winning) {
    return makeSettlement([result], [], [{ zh: "未成胡，不产生胡牌结算。", en: "No winning hand, so no win settlement is produced." }]);
  }

  const activePayers = activePlayers(context.players, context.alreadyWon).filter((id) => id !== context.winner);
  const payments: ScorePayment[] = [];
  if (source === "self-draw") {
    for (const payer of activePayers) {
      payments.push({
        from: payer,
        to: context.winner,
        points: result.paymentPoints,
        kind: "win",
        reasonZh: `自摸：${payerLabel(payer)} 赔 ${payerLabel(context.winner)} ${result.paymentPoints} 分`,
        reasonEn: `Self-draw: player ${payer} pays player ${context.winner} ${result.paymentPoints} points`
      });
    }
  } else if (context.discarder !== undefined) {
    payments.push({
      from: context.discarder,
      to: context.winner,
      points: result.paymentPoints,
      kind: "win",
      reasonZh: `点炮：${payerLabel(context.discarder)} 赔 ${payerLabel(context.winner)} ${result.paymentPoints} 分`,
      reasonEn: `Discard win: player ${context.discarder} pays player ${context.winner} ${result.paymentPoints} points`
    });
  }

  return makeSettlement([result], payments, []);
}

export function settleMultipleWins(
  wins: ReadonlyArray<{ readonly hand: readonly string[]; readonly context: WinSettlementContext }>
): ScoreSettlement {
  const results: ScoreResult[] = [];
  const payments: ScorePayment[] = [];
  const notes: ScoreSettlement["notes"] = [];
  for (const win of wins) {
    const settlement = settleWin(win.hand, win.context);
    results.push(...settlement.results);
    payments.push(...settlement.payments);
    notes.push(...settlement.notes);
  }
  return makeSettlement(results, payments, notes);
}

export function settleKong(event: KongPointEvent, options: { readonly players?: readonly number[]; readonly alreadyWon?: readonly number[] } = {}): ScoreSettlement {
  if (event.robbed) {
    return makeSettlement([], [], [{ zh: "巴杠被抢杠胡，本次杠分不成立。", en: "The add-on Kong was robbed, so this Kong point event is void." }]);
  }

  const payments: ScorePayment[] = [];
  if (event.kind === "point") {
    if (event.from !== undefined && event.from !== event.owner) {
      payments.push(kongPayment(event.from, event.owner, 4, "直杠", "Point Kong"));
    }
    return makeSettlement([], payments, []);
  }

  const amount = event.kind === "add-on" ? 2 : 4;
  const labelZh = event.kind === "add-on" ? "巴杠" : "暗杠";
  const labelEn = event.kind === "add-on" ? "Add-on Kong" : "Concealed Kong";
  for (const payer of activePlayers(options.players, options.alreadyWon).filter((id) => id !== event.owner)) {
    payments.push(kongPayment(payer, event.owner, amount, labelZh, labelEn));
  }
  return makeSettlement([], payments, []);
}

export function settleKongEvents(
  events: readonly KongPointEvent[],
  options: { readonly players?: readonly number[]; readonly alreadyWon?: readonly number[] } = {}
): ScoreSettlement {
  const payments = events.flatMap((event) => settleKong(event, options).payments);
  return makeSettlement([], payments, []);
}

export function settleDraw(
  players: readonly DrawSettlementPlayer[],
  options: { readonly kongPayments?: readonly ScorePayment[]; readonly skipTenpaiCheck?: boolean } = {}
): ScoreSettlement {
  const payments: ScorePayment[] = [];
  const notes: ScoreSettlement["notes"] = [];
  const nonPigs = players.filter((player) => !player.floweryPig);
  for (const pig of players.filter((player) => player.floweryPig)) {
    for (const target of nonPigs) {
      if (target.id !== pig.id) {
        payments.push({
          from: pig.id,
          to: target.id,
          points: FLOWERY_PIG_POINTS,
          kind: "draw",
          reasonZh: `花猪：${payerLabel(pig.id)} 赔 ${payerLabel(target.id)} ${FLOWERY_PIG_POINTS} 分`,
          reasonEn: `Flowery pig: player ${pig.id} pays player ${target.id} ${FLOWERY_PIG_POINTS} points`
        });
      }
    }
  }

  if (!options.skipTenpaiCheck) {
    const tenpaiPlayers = players.filter((player) => player.tenpai);
    const noTenpaiPlayers = players.filter((player) => !player.tenpai);
    for (const noTenpai of noTenpaiPlayers) {
      for (const ready of tenpaiPlayers) {
        if (noTenpai.id === ready.id) {
          continue;
        }
        const maxScore = maxTenpaiScore(ready).maxPoints;
        if (maxScore > 0) {
          payments.push({
            from: noTenpai.id,
            to: ready.id,
            points: maxScore,
            kind: "draw",
            reasonZh: `查大叫：${payerLabel(noTenpai.id)} 赔 ${payerLabel(ready.id)} ${maxScore} 分`,
            reasonEn: `Tenpai check: player ${noTenpai.id} pays player ${ready.id} ${maxScore} points`
          });
        }
      }
    }
  }

  // K.8 teaching-pinned (the project maintainer 2026-06-21): tenpai-check uses the max base pattern fan only (no roots/add-fan).
  // See rules-facts.md §K.8; can be overridden if a real platform rule is later specified.
  const notTenpaiIds = new Set(players.filter((player) => !player.tenpai).map((player) => player.id));
  for (const payment of options.kongPayments ?? []) {
    if (payment.kind === "kong" && notTenpaiIds.has(payment.to)) {
      payments.push({
        from: payment.to,
        to: payment.from,
        points: payment.points,
        kind: "refund",
        reasonZh: `退税：${payerLabel(payment.to)} 未听，退还 ${payment.points} 分杠分给 ${payerLabel(payment.from)}`,
        reasonEn: `Tax refund: player ${payment.to} is not tenpai and returns ${payment.points} Kong points to player ${payment.from}`
      });
    }
  }

  if (payments.length === 0) {
    notes.push({ zh: "流局无花猪、无查叫赔付。", en: "Draw settled with no flowery-pig or tenpai-check payments." });
  }
  return makeSettlement([], payments, notes);
}

export function maxTenpaiScore(player: DrawSettlementPlayer): { readonly waits: TileCode[]; readonly maxFan: number; readonly maxPoints: number } {
  if (!player.hand || !player.voidSuit) {
    return { waits: [], maxFan: 0, maxPoints: 0 };
  }
  const openMelds = player.openMelds ?? [];
  const waitTiles = waits(player.hand, player.voidSuit, { openMeldCount: openMelds.length });
  let maxFan = 0;
  let maxPoints = 0;
  for (const tile of waitTiles) {
    const result = evaluateScore([...player.hand, tile], {
      voidSuit: player.voidSuit,
      source: "discard",
      openMelds
    });
    if (result.winning && result.baseFan > maxFan) {
      maxFan = result.baseFan;
      maxPoints = scoreForFan(result.baseFan);
    }
  }
  return { waits: waitTiles, maxFan, maxPoints };
}

export function netByPlayer(payments: readonly ScorePayment[], players: readonly number[] = playersDefault): Record<number, number> {
  const net = Object.fromEntries(players.map((id) => [id, 0])) as Record<number, number>;
  for (const payment of payments) {
    net[payment.from] = (net[payment.from] ?? 0) - payment.points;
    net[payment.to] = (net[payment.to] ?? 0) + payment.points;
  }
  return net;
}

function detectPatterns(
  concealedTiles: readonly TileCode[],
  allTiles: readonly TileCode[],
  openMelds: readonly MeldGroup[],
  decompositions: readonly StandardDecomposition[],
  winTiming: WinTiming
): ScoringPattern[] {
  const patterns: ScoringPattern[] = [];
  const sevenPairs = openMelds.length === 0 && isSevenPairs(concealedTiles);
  const dragonSevenPairs = sevenPairs && hasQuad(concealedTiles);
  const pure = isPureSuit(allTiles);
  const noTerminals = allTiles.every((tile) => {
    const rank = parseTile(tile).rank;
    return rank !== 1 && rank !== 9;
  });
  const allTriplets = decompositions.some((item) => item.melds.every((meld) => meld.kind === "pung" || meld.kind === "kong"));
  const terminalHand = decompositions.some((item) => item.melds.every(groupHasTerminal) && groupHasTerminal({ tiles: [item.pair, item.pair] }));
  const rankPairs = allTriplets && allTiles.every((tile) => [2, 5, 8].includes(parseTile(tile).rank));

  if (decompositions.length > 0) patterns.push(patternDefs.pinhu);
  if (noTerminals) patterns.push(patternDefs["no-terminals"]);
  if (allTriplets) patterns.push(patternDefs["all-triplets"]);
  if (pure) patterns.push(patternDefs["pure-suit"]);
  if (terminalHand) patterns.push(patternDefs["terminal-hand"]);
  if (sevenPairs) patterns.push(patternDefs["seven-pairs"]);
  if (pure && allTriplets) patterns.push(patternDefs["pure-all-triplets"]);
  if (rankPairs) patterns.push(patternDefs["rank-pairs"]);
  if (dragonSevenPairs) patterns.push(patternDefs["dragon-seven-pairs"]);
  if (pure && sevenPairs) patterns.push(patternDefs["pure-seven-pairs"]);
  if (pure && terminalHand) patterns.push(patternDefs["pure-terminal-hand"]);
  if (winTiming === "heavenly") patterns.push(patternDefs["heavenly-hand"]);
  if (winTiming === "earthly") patterns.push(patternDefs["earthly-hand"]);
  if (pure && dragonSevenPairs) patterns.push(patternDefs["pure-dragon-seven-pairs"]);

  return patterns.length > 0 ? patterns : [patternDefs.pinhu];
}

function chooseBestPattern(patterns: readonly ScoringPattern[]): ScoringPattern {
  return [...patterns].sort(
    (left, right) =>
      right.fan - left.fan || patternPriority.indexOf(left.id) - patternPriority.indexOf(right.id)
  )[0];
}

function buildAddFanLines(addOns: ScoreAddOns | undefined, roots: number): ScoreLine[] {
  const lines: ScoreLine[] = [];
  if (addOns?.kongDraw) {
    lines.push({ id: "kong-draw-win", fan: 1, points: 0, zh: "杠上花 +1 番", en: "Win on a Kong draw: +1 fan" });
  }
  if (addOns?.kongDiscard) {
    lines.push({ id: "kong-discard-win", fan: 1, points: 0, zh: "杠上炮 +1 番", en: "Win after a Kong discard: +1 fan" });
  }
  if (roots > 0) {
    lines.push({ id: "roots", fan: roots, points: 0, zh: `根 +${roots} 番`, en: `Roots: +${roots} fan` });
  }
  return lines;
}

function normalizeTiles(input: readonly string[]): TileCode[] {
  return input.map(parseTileCode);
}

function normalizeMelds(openMelds: readonly ScoringMeld[]): MeldGroup[] {
  return openMelds.map((meld) => ({
    kind: meld.kind,
    tiles: meld.tiles.map(parseTileCode)
  }));
}

function findStandardDecompositions(tiles: readonly TileCode[], openMelds: readonly MeldGroup[]): StandardDecomposition[] {
  const concealedMeldCount = 4 - openMelds.length;
  if (concealedMeldCount < 0 || tiles.length !== concealedMeldCount * 3 + 2) {
    return [];
  }
  const counts = countTiles(tiles);
  const decompositions: StandardDecomposition[] = [];
  for (const [pairTile, count] of counts) {
    if (count < 2) {
      continue;
    }
    const nextCounts = new Map(counts);
    nextCounts.set(pairTile, count - 2);
    for (const melds of findMeldGroups(nextCounts, concealedMeldCount)) {
      decompositions.push({ pair: pairTile, melds: [...openMelds, ...melds] });
      if (decompositions.length >= 64) {
        return decompositions;
      }
    }
  }
  return decompositions;
}

function findMeldGroups(counts: Map<TileCode, number>, targetMelds: number): MeldGroup[][] {
  if (targetMelds === 0) {
    return [...counts.values()].every((count) => count === 0) ? [[]] : [];
  }

  const first = firstRemainingTile(counts);
  if (!first) {
    return [];
  }

  const results: MeldGroup[][] = [];
  const count = counts.get(first) ?? 0;
  if (count >= 3) {
    const tripletCounts = new Map(counts);
    tripletCounts.set(first, count - 3);
    for (const rest of findMeldGroups(tripletCounts, targetMelds - 1)) {
      results.push([{ kind: "pung", tiles: [first, first, first] }, ...rest]);
    }
  }

  const parsed = parseTile(first);
  if (parsed.rank <= 7) {
    const second = toTileCode((parsed.rank + 1) as TileRank, parsed.suit);
    const third = toTileCode((parsed.rank + 2) as TileRank, parsed.suit);
    if ((counts.get(second) ?? 0) > 0 && (counts.get(third) ?? 0) > 0) {
      const sequenceCounts = new Map(counts);
      sequenceCounts.set(first, (sequenceCounts.get(first) ?? 0) - 1);
      sequenceCounts.set(second, (sequenceCounts.get(second) ?? 0) - 1);
      sequenceCounts.set(third, (sequenceCounts.get(third) ?? 0) - 1);
      for (const rest of findMeldGroups(sequenceCounts, targetMelds - 1)) {
        results.push([{ kind: "chow", tiles: [first, second, third] }, ...rest]);
      }
    }
  }

  return results;
}

function countTiles(tiles: readonly TileCode[]): Map<TileCode, number> {
  const counts = new Map<TileCode, number>();
  for (const tile of tiles) {
    counts.set(tile, (counts.get(tile) ?? 0) + 1);
  }
  return counts;
}

function firstRemainingTile(counts: Map<TileCode, number>): TileCode | undefined {
  return sortTileCodes([...counts.keys()]).find((tile) => (counts.get(tile) ?? 0) > 0);
}

function isSevenPairs(tiles: readonly TileCode[]): boolean {
  if (tiles.length !== 14) {
    return false;
  }
  const counts = [...countTiles(tiles).values()];
  return counts.every((count) => count === 2 || count === 4) && counts.reduce((sum, count) => sum + count / 2, 0) === 7;
}

function hasQuad(tiles: readonly TileCode[]): boolean {
  return [...countTiles(tiles).values()].some((count) => count === 4);
}

function isPureSuit(tiles: readonly TileCode[]): boolean {
  if (tiles.length === 0) {
    return false;
  }
  const firstSuit = parseTile(tiles[0]).suit;
  return tiles.every((tile) => parseTile(tile).suit === firstSuit);
}

function groupHasTerminal(group: Pick<MeldGroup, "tiles">): boolean {
  return group.tiles.some((tile) => {
    const rank = parseTile(tile).rank;
    return rank === 1 || rank === 9;
  });
}

function countRoots(allTiles: readonly TileCode[], openMelds: readonly MeldGroup[], patternId: ScoringPatternId): number {
  const kongTiles = new Set(openMelds.filter((meld) => meld.kind === "kong").map((meld) => meld.tiles[0]));
  const rawRoots = [...countTiles(allTiles)].filter(([tile, count]) => count === 4 && !kongTiles.has(tile)).length;
  return patternId === "dragon-seven-pairs" || patternId === "pure-dragon-seven-pairs" ? Math.max(0, rawRoots - 1) : rawRoots;
}

function activePlayers(players: readonly number[] = playersDefault, alreadyWon: readonly number[] = []): number[] {
  const won = new Set(alreadyWon);
  return players.filter((player) => !won.has(player));
}

function kongPayment(from: number, to: number, points: number, labelZh: string, labelEn: string): ScorePayment {
  return {
    from,
    to,
    points,
    kind: "kong",
    reasonZh: `${labelZh}：${payerLabel(from)} 赔 ${payerLabel(to)} ${points} 分`,
    reasonEn: `${labelEn}: player ${from} pays player ${to} ${points} points`
  };
}

function makeSettlement(
  results: readonly ScoreResult[],
  payments: readonly ScorePayment[],
  notes: ScoreSettlement["notes"]
): ScoreSettlement {
  return {
    results: [...results],
    payments: [...payments],
    net: netByPlayer(payments),
    notes: [...notes]
  };
}

function payerLabel(player: number): string {
  return `玩家${player}`;
}
