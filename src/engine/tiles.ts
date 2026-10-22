export const SUITS = ["p", "t", "w"] as const;
export const RANKS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export type TileSuit = (typeof SUITS)[number];
export type TileRank = (typeof RANKS)[number];
export type TileCode = `${TileRank}${TileSuit}`;

export interface Tile {
  readonly suit: TileSuit;
  readonly rank: TileRank;
  readonly copy: 0 | 1 | 2 | 3;
  readonly code: TileCode;
}

export interface DealResult {
  readonly hands: Tile[][];
  readonly wall: Tile[];
}

export const SUIT_NAMES: Record<TileSuit, { zh: string; en: string; notation: string }> = {
  p: { zh: "筒", en: "Dots", notation: "p" },
  t: { zh: "条", en: "Bamboo", notation: "t" },
  w: { zh: "万", en: "Characters", notation: "w" }
};

export function isTileSuit(value: string): value is TileSuit {
  return (SUITS as readonly string[]).includes(value);
}

export function isTileRank(value: number): value is TileRank {
  return Number.isInteger(value) && value >= 1 && value <= 9;
}

export function toTileCode(rank: TileRank, suit: TileSuit): TileCode {
  return `${rank}${suit}` as TileCode;
}

export function parseTileCode(input: string): TileCode {
  const normalized = input.trim().toLowerCase();
  const match = normalized.match(/^([1-9])([ptw])$/);
  if (!match) {
    throw new Error(`Invalid tile notation: ${input}`);
  }

  const rank = Number(match[1]);
  const suit = match[2];
  if (!isTileRank(rank) || !isTileSuit(suit)) {
    throw new Error(`Invalid tile notation: ${input}`);
  }

  return toTileCode(rank, suit);
}

export function parseTile(input: string): Pick<Tile, "rank" | "suit" | "code"> {
  const code = parseTileCode(input);
  return {
    rank: Number(code[0]) as TileRank,
    suit: code[1] as TileSuit,
    code
  };
}

export function parseTiles(input: string | readonly string[]): TileCode[] {
  const values = typeof input === "string" ? input.split(/\s+/).filter(Boolean) : input;
  return values.map(parseTileCode);
}

export function tileName(code: TileCode): { zh: string; en: string } {
  const tile = parseTile(code);
  const suit = SUIT_NAMES[tile.suit];
  return {
    zh: `${tile.rank}${suit.zh}`,
    en: `${tile.rank} ${suit.en}`
  };
}

export function createWall(): Tile[] {
  const wall: Tile[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      for (const copy of [0, 1, 2, 3] as const) {
        wall.push({ suit, rank, copy, code: toTileCode(rank, suit) });
      }
    }
  }
  return wall;
}

export function makeSeededRandom(seed: string | number): () => number {
  let state = typeof seed === "number" ? seed >>> 0 : hashSeed(seed);
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleTiles<T>(tiles: readonly T[], random: () => number = Math.random): T[] {
  const result = [...tiles];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function dealHands(options: {
  readonly random?: () => number;
  readonly playerCount?: number;
  readonly handSize?: number;
} = {}): DealResult {
  const playerCount = options.playerCount ?? 4;
  const handSize = options.handSize ?? 13;
  const wall = shuffleTiles(createWall(), options.random);
  const hands = Array.from({ length: playerCount }, () => [] as Tile[]);

  for (let round = 0; round < handSize; round += 1) {
    for (let player = 0; player < playerCount; player += 1) {
      const tile = wall.shift();
      if (!tile) {
        throw new Error("Not enough tiles to deal");
      }
      hands[player].push(tile);
    }
  }

  return { hands, wall };
}

export function countBySuit(codes: readonly TileCode[]): Record<TileSuit, number> {
  return codes.reduce<Record<TileSuit, number>>(
    (counts, code) => {
      counts[parseTile(code).suit] += 1;
      return counts;
    },
    { p: 0, t: 0, w: 0 }
  );
}

export function hasSuit(codes: readonly TileCode[], suit: TileSuit): boolean {
  return codes.some((code) => parseTile(code).suit === suit);
}

export function isVoidSuitCleared(codes: readonly TileCode[], voidSuit: TileSuit): boolean {
  return !hasSuit(codes, voidSuit);
}

export function sortTileCodes(codes: readonly TileCode[]): TileCode[] {
  const suitOrder: Record<TileSuit, number> = { p: 0, t: 1, w: 2 };
  return [...codes].sort((left, right) => {
    const a = parseTile(left);
    const b = parseTile(right);
    return suitOrder[a.suit] - suitOrder[b.suit] || a.rank - b.rank;
  });
}

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
