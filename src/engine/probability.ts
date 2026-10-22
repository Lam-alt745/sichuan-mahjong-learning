import { waits } from "./hand";
import { parseTileCode, RANKS, sortTileCodes, SUITS, toTileCode, type TileCode, type TileSuit } from "./tiles";

export interface WaitCount {
  readonly tile: TileCode;
  readonly remaining: number;
}

export interface WaitsWithCounts {
  readonly waits: WaitCount[];
  readonly totalRemaining: number;
}

export function remainingCounts(visible: readonly string[]): Map<TileCode, number> {
  const counts = new Map<TileCode, number>();
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      counts.set(toTileCode(rank, suit), 4);
    }
  }

  for (const item of visible) {
    const tile = parseTileCode(item);
    counts.set(tile, Math.max(0, counts.get(tile)! - 1));
  }

  return counts;
}

export function waitsWithCounts(
  hand: readonly string[],
  voidSuit: TileSuit,
  visible: readonly string[],
  options: { readonly openMeldCount?: number } = {}
): WaitsWithCounts {
  const counts = remainingCounts(visible);
  const waitTiles = waits(hand, voidSuit, options);
  const counted = sortTileCodes(waitTiles).map((tile) => ({
    tile,
    remaining: counts.get(tile)!
  }));
  return {
    waits: counted,
    totalRemaining: counted.reduce((sum, item) => sum + item.remaining, 0)
  };
}
