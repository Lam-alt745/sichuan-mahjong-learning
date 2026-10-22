import { bestDiscards, isWinningHand, waits } from "./hand";
import { parseTile, sortTileCodes, tileName, type TileCode, type TileSuit } from "./tiles";

export type AiProfile = "steady" | "aggressive" | "conservative" | "efficiency" | "balanced";
export type DecisionActionKind = "win" | "kong" | "pung" | "discard" | "pass";

export interface DecisionContext {
  readonly hand: readonly TileCode[];
  readonly voidSuit: TileSuit;
  readonly openMeldCount?: number;
  readonly claimedTile?: TileCode;
  readonly legalActions: readonly DecisionActionKind[];
}

export interface DecisionAction {
  readonly kind: DecisionActionKind;
  readonly tile?: TileCode;
  readonly reasonZh: string;
  readonly reasonEn: string;
}

export function decide(profile: AiProfile, context: DecisionContext): DecisionAction {
  const openMeldCount = context.openMeldCount ?? 0;

  if (context.legalActions.includes("win") && isWinningHand(context.hand, context.voidSuit, { openMeldCount })) {
    return {
      kind: "win",
      reasonZh: "已经满足胡牌结构和缺门要求，选择胡。",
      reasonEn: "The hand satisfies the winning shape and void-suit rule, so it wins."
    };
  }

  if (context.legalActions.includes("kong")) {
    const claimedKong =
      context.claimedTile && context.hand.filter((tile) => tile === context.claimedTile).length >= 3
        ? context.claimedTile
        : undefined;
    const kongTile = claimedKong ?? findKongTile(context.hand);
    if (kongTile && profile !== "conservative") {
      return {
        kind: "kong",
        tile: kongTile,
        reasonZh: `四张 ${tileName(kongTile).zh} 可杠；杠分会在本局结束进入教学结算。`,
        reasonEn: `Four ${tileName(kongTile).en} can be declared as a Kong; Kong points are settled for teaching at the end.`
      };
    }
  }

  if (context.legalActions.includes("pung") && context.claimedTile && profile !== "conservative") {
    const sameCount = context.hand.filter((tile) => tile === context.claimedTile).length;
    if (sameCount >= 2 && shouldPung(profile, context.hand, context.claimedTile, context.voidSuit)) {
      return {
        kind: "pung",
        tile: context.claimedTile,
        reasonZh: `碰 ${tileName(context.claimedTile).zh} 可以形成刻子并减少手牌张数。`,
        reasonEn: `Claiming ${tileName(context.claimedTile).en} forms a Pung and advances the hand.`
      };
    }
  }

  if (context.legalActions.includes("discard")) {
    const discard = chooseDiscard(profile, context.hand, context.voidSuit);
    return {
      kind: "discard",
      tile: discard,
      reasonZh: discard
        ? `选择打 ${tileName(discard).zh}：优先清定缺或保留更多进张。`
        : "当前没有可打的牌。",
      reasonEn: discard
        ? `Discard ${tileName(discard).en}: prioritize clearing the void suit or preserving more waits.`
        : "There is no discardable tile."
    };
  }

  return {
    kind: "pass",
    reasonZh: "没有更优的合法动作，选择过。",
    reasonEn: "No better legal action is available, so pass."
  };
}

export function chooseDiscard(profile: AiProfile, hand: readonly TileCode[], voidSuit: TileSuit): TileCode | undefined {
  const sorted = sortTileCodes(hand);
  const voidTiles = sorted.filter((tile) => parseTile(tile).suit === voidSuit);
  if (voidTiles.length > 0) {
    return profile === "conservative" ? voidTiles[voidTiles.length - 1] : voidTiles[0];
  }

  const best = bestDiscards(sorted, voidSuit);
  if (best.length > 0 && best[0].waitCount > 0) {
    return profile === "conservative" ? best[best.length - 1].tile : best[0].tile;
  }

  const terminal = sorted.find((tile) => {
    const rank = parseTile(tile).rank;
    return rank === 1 || rank === 9;
  });
  if (profile === "conservative" && terminal) {
    return terminal;
  }

  return sorted[0];
}

export function readyTilesAfterDiscard(hand: readonly TileCode[], voidSuit: TileSuit, discard: TileCode): TileCode[] {
  let removed = false;
  const remaining = hand.filter((tile) => {
    if (!removed && tile === discard) {
      removed = true;
      return false;
    }
    return true;
  });
  return waits(remaining, voidSuit);
}

function findKongTile(hand: readonly TileCode[]): TileCode | undefined {
  const sorted = sortTileCodes([...new Set(hand)]);
  return sorted.find((tile) => hand.filter((item) => item === tile).length >= 4);
}

function shouldPung(profile: AiProfile, hand: readonly TileCode[], claimedTile: TileCode, voidSuit: TileSuit): boolean {
  if (parseTile(claimedTile).suit === voidSuit) {
    return false;
  }
  if (profile === "aggressive") {
    return true;
  }
  if (profile === "steady" || profile === "balanced") {
    return waits(hand, voidSuit).length === 0;
  }
  return profile === "efficiency";
}
