import {
  isVoidSuitCleared,
  parseTile,
  parseTileCode,
  RANKS,
  sortTileCodes,
  SUITS,
  toTileCode,
  type TileCode,
  type TileSuit
} from "./tiles";

export type MeldKind = "pung" | "chow" | "pair" | "kong" | "none";
export type WinningKind = "standard" | "seven-pairs" | "none";

export interface MeldEvaluation {
  readonly kind: MeldKind;
  readonly tiles: TileCode[];
  readonly labelZh: string;
  readonly labelEn: string;
  readonly isMeldStructure: boolean;
  readonly canBeClaimedInSichuan: boolean;
  readonly containsVoidSuit: boolean;
  readonly reasonZh: string;
  readonly reasonEn: string;
}

export interface WinningEvaluation {
  readonly winning: boolean;
  readonly kind: WinningKind;
  readonly reasonZh: string;
  readonly reasonEn: string;
}

export interface DiscardEfficiency {
  readonly tile: TileCode;
  readonly waits: TileCode[];
  readonly waitCount: number;
  readonly remainingCount: number;
  readonly efficiencyScore: number;
}

export interface DiscardEfficiencyOptions {
  readonly weighted?: boolean;
  readonly visible?: readonly string[];
}

export function evalMeld(
  inputTiles: readonly string[],
  options: { readonly voidSuit?: TileSuit } = {}
): MeldEvaluation {
  const tiles = inputTiles.map(parseTileCode);
  const parsed = tiles.map(parseTile);
  const containsVoidSuit = options.voidSuit ? parsed.some((tile) => tile.suit === options.voidSuit) : false;
  const sorted = [...parsed].sort((a, b) => a.suit.localeCompare(b.suit) || a.rank - b.rank);
  const sameSuit = sorted.every((tile) => tile.suit === sorted[0]?.suit);
  const sameRank = sorted.every((tile) => tile.rank === sorted[0]?.rank);

  if (tiles.length === 2 && sameSuit && sameRank) {
    return result("pair", tiles, containsVoidSuit);
  }

  if (tiles.length === 3 && sameSuit && sameRank) {
    return result("pung", tiles, containsVoidSuit);
  }

  if (tiles.length === 4 && sameSuit && sameRank) {
    return result("kong", tiles, containsVoidSuit);
  }

  if (tiles.length === 3 && sameSuit) {
    const ranks = sorted.map((tile) => tile.rank);
    if (ranks[0] + 1 === ranks[1] && ranks[1] + 1 === ranks[2]) {
      return result("chow", tiles, containsVoidSuit);
    }
  }

  return result("none", tiles, containsVoidSuit);
}

export function evaluateWinningHand(
  inputTiles: readonly string[],
  voidSuit: TileSuit,
  options: { readonly openMeldCount?: number } = {}
): WinningEvaluation {
  const tiles = normalizeTiles(inputTiles);
  const openMeldCount = options.openMeldCount ?? 0;

  if (!isVoidSuitCleared(tiles, voidSuit)) {
    return {
      winning: false,
      kind: "none",
      reasonZh: "手牌仍有定缺门，不能胡。",
      reasonEn: "The hand still contains the declared void suit, so it cannot win."
    };
  }

  if (!hasLegalCopies(tiles)) {
    return {
      winning: false,
      kind: "none",
      reasonZh: "同一张牌超过四张，不是合法手牌。",
      reasonEn: "One tile appears more than four times, so this is not a legal hand."
    };
  }

  if (openMeldCount === 0 && isSevenPairs(tiles)) {
    return {
      winning: true,
      kind: "seven-pairs",
      reasonZh: "七个对子，且已经打缺定缺门，是七对胡牌结构。",
      reasonEn: "Seven distinct pairs with the declared void suit cleared form a legal Seven pairs win."
    };
  }

  if (isStandardWinningShape(tiles, openMeldCount)) {
    return {
      winning: true,
      kind: "standard",
      reasonZh: "四组面子加一对将，且已经打缺定缺门，是标准胡牌结构。",
      reasonEn: "Four melds plus one pair with the declared void suit cleared form a standard winning hand."
    };
  }

  return {
    winning: false,
    kind: "none",
    reasonZh: "没有组成四组面子加一对将，也不是七对。",
    reasonEn: "The tiles do not form four melds plus one pair, and they are not Seven pairs."
  };
}

export function isWinningHand(
  inputTiles: readonly string[],
  voidSuit: TileSuit,
  options: { readonly openMeldCount?: number } = {}
): boolean {
  return evaluateWinningHand(inputTiles, voidSuit, options).winning;
}

export function waits(
  inputTiles: readonly string[],
  voidSuit: TileSuit,
  options: { readonly openMeldCount?: number } = {}
): TileCode[] {
  const tiles = normalizeTiles(inputTiles);
  if (!isVoidSuitCleared(tiles, voidSuit) || !hasLegalCopies(tiles) || tiles.length % 3 !== 1) {
    return [];
  }

  const counts = countTiles(tiles);
  const candidates: TileCode[] = [];
  for (const suit of SUITS) {
    if (suit === voidSuit) {
      continue;
    }
    for (const rank of RANKS) {
      const code = toTileCode(rank, suit);
      if ((counts.get(code) ?? 0) >= 4) {
        continue;
      }
      if (isWinningHand([...tiles, code], voidSuit, options)) {
        candidates.push(code);
      }
    }
  }
  return sortTileCodes(candidates);
}

export function isTenpai(
  inputTiles: readonly string[],
  voidSuit: TileSuit,
  options: { readonly openMeldCount?: number } = {}
): boolean {
  return waits(inputTiles, voidSuit, options).length > 0;
}

export function discardEfficiencies(
  inputTiles: readonly string[],
  voidSuit: TileSuit,
  options: DiscardEfficiencyOptions = {}
): DiscardEfficiency[] {
  const tiles = normalizeTiles(inputTiles);
  const uniqueTiles = [...new Set(tiles)];
  const visibleCounts = countTiles((options.visible ?? tiles).map(parseTileCode));
  return sortTileCodes(uniqueTiles)
    .map((tile) => {
      const remaining = removeOne(tiles, tile);
      const tileWaits = waits(remaining, voidSuit);
      const remainingCount = tileWaits.reduce((sum, wait) => sum + Math.max(0, 4 - (visibleCounts.get(wait) ?? 0)), 0);
      return {
        tile,
        waits: tileWaits,
        waitCount: tileWaits.length,
        remainingCount,
        efficiencyScore: options.weighted ? remainingCount : tileWaits.length
      };
    })
    .sort(
      (left, right) =>
        right.efficiencyScore - left.efficiencyScore ||
        right.waitCount - left.waitCount ||
        right.remainingCount - left.remainingCount ||
        compareTileCodes(left.tile, right.tile)
    );
}

export function bestDiscards(
  inputTiles: readonly string[],
  voidSuit: TileSuit,
  options: DiscardEfficiencyOptions = {}
): DiscardEfficiency[] {
  const efficiencies = discardEfficiencies(inputTiles, voidSuit, options);
  const bestScore = efficiencies[0]?.efficiencyScore ?? 0;
  return efficiencies.filter((item) => item.efficiencyScore === bestScore);
}

function result(kind: MeldKind, tiles: TileCode[], containsVoidSuit: boolean): MeldEvaluation {
  const base = labels[kind];
  const canBeClaimedInSichuan = kind === "pung" || kind === "kong";
  const isMeldStructure = kind !== "none";
  const voidPrefixZh = containsVoidSuit ? "含定缺门牌；" : "";
  const voidPrefixEn = containsVoidSuit ? "Contains the declared void suit; " : "";

  return {
    kind,
    tiles,
    labelZh: base.zh,
    labelEn: base.en,
    isMeldStructure,
    canBeClaimedInSichuan,
    containsVoidSuit,
    reasonZh: `${voidPrefixZh}${base.reasonZh}`,
    reasonEn: `${voidPrefixEn}${base.reasonEn}`
  };
}

const labels: Record<MeldKind, { zh: string; en: string; reasonZh: string; reasonEn: string }> = {
  pung: {
    zh: "刻子",
    en: "Pung",
    reasonZh: "三张同门同点数，是刻子；四川麻将可以碰。",
    reasonEn: "Three identical suited tiles form a Pung; it can be claimed in Sichuan Mahjong."
  },
  chow: {
    zh: "顺子",
    en: "Chow",
    reasonZh: "三张同门连续点数，是手内顺子结构；四川麻将不可吃别家牌。",
    reasonEn:
      "Three consecutive tiles in one suit form a Chow structure in the hand; claiming a discard for Chow is not allowed in Sichuan Mahjong."
  },
  pair: {
    zh: "对将",
    en: "Pair",
    reasonZh: "两张同门同点数，是一对将。",
    reasonEn: "Two identical suited tiles form a pair."
  },
  kong: {
    zh: "杠",
    en: "Kong",
    reasonZh: "四张同门同点数，是杠；四川麻将可以杠。",
    reasonEn: "Four identical suited tiles form a Kong; it can be declared in Sichuan Mahjong."
  },
  none: {
    zh: "非面子",
    en: "Not a meld",
    reasonZh: "这组牌既不是同点数对子/刻子/杠，也不是同门连续三张。",
    reasonEn: "These tiles are neither identical pairs/triplets/kongs nor three consecutive tiles in one suit."
  }
};

function normalizeTiles(inputTiles: readonly string[]): TileCode[] {
  return inputTiles.map(parseTileCode);
}

function countTiles(tiles: readonly TileCode[]): Map<TileCode, number> {
  const counts = new Map<TileCode, number>();
  for (const tile of tiles) {
    counts.set(tile, (counts.get(tile) ?? 0) + 1);
  }
  return counts;
}

function hasLegalCopies(tiles: readonly TileCode[]): boolean {
  return [...countTiles(tiles).values()].every((count) => count <= 4);
}

function isSevenPairs(tiles: readonly TileCode[]): boolean {
  if (tiles.length !== 14) {
    return false;
  }
  const counts = [...countTiles(tiles).values()];
  return counts.every((count) => count === 2 || count === 4) && counts.reduce((sum, count) => sum + count / 2, 0) === 7;
}

function isStandardWinningShape(tiles: readonly TileCode[], openMeldCount: number): boolean {
  if (openMeldCount < 0 || openMeldCount > 4) {
    return false;
  }
  const concealedMeldCount = 4 - openMeldCount;
  if (tiles.length !== concealedMeldCount * 3 + 2) {
    return false;
  }

  const counts = countTiles(tiles);
  for (const [pairTile, count] of counts) {
    if (count < 2) {
      continue;
    }
    const nextCounts = new Map(counts);
    nextCounts.set(pairTile, count - 2);
    if (canFormMelds(nextCounts, concealedMeldCount)) {
      return true;
    }
  }
  return false;
}

function canFormMelds(counts: Map<TileCode, number>, targetMelds: number): boolean {
  if (targetMelds === 0) {
    return [...counts.values()].every((count) => count === 0);
  }

  const first = firstRemainingTile(counts);
  if (!first) {
    return false;
  }

  const count = counts.get(first) ?? 0;
  if (count >= 3) {
    const tripletCounts = new Map(counts);
    tripletCounts.set(first, count - 3);
    if (canFormMelds(tripletCounts, targetMelds - 1)) {
      return true;
    }
  }

  const parsed = parseTile(first);
  if (parsed.rank <= 7) {
    const second = toTileCode((parsed.rank + 1) as 2 | 3 | 4 | 5 | 6 | 7 | 8, parsed.suit);
    const third = toTileCode((parsed.rank + 2) as 3 | 4 | 5 | 6 | 7 | 8 | 9, parsed.suit);
    if ((counts.get(second) ?? 0) > 0 && (counts.get(third) ?? 0) > 0) {
      const sequenceCounts = new Map(counts);
      sequenceCounts.set(first, (sequenceCounts.get(first) ?? 0) - 1);
      sequenceCounts.set(second, (sequenceCounts.get(second) ?? 0) - 1);
      sequenceCounts.set(third, (sequenceCounts.get(third) ?? 0) - 1);
      if (canFormMelds(sequenceCounts, targetMelds - 1)) {
        return true;
      }
    }
  }

  return false;
}

function firstRemainingTile(counts: Map<TileCode, number>): TileCode | undefined {
  return sortTileCodes([...counts.keys()]).find((tile) => (counts.get(tile) ?? 0) > 0);
}

function removeOne(tiles: readonly TileCode[], tile: TileCode): TileCode[] {
  let removed = false;
  return tiles.filter((item) => {
    if (!removed && item === tile) {
      removed = true;
      return false;
    }
    return true;
  });
}

function compareTileCodes(left: TileCode, right: TileCode): number {
  const sorted = sortTileCodes([left, right]);
  return sorted[0] === left ? -1 : 1;
}
