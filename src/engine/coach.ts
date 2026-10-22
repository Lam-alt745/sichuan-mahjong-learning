import { bestDiscards, discardEfficiencies, isWinningHand, waits } from "./hand";
import { parseTile, tileName, type TileCode } from "./tiles";
import type { PlayerId, TableState } from "./table";

export type CoachMode = "guided" | "direct" | "off";

export interface CoachCandidate {
  readonly tile: TileCode;
  readonly labelZh: string;
  readonly labelEn: string;
  readonly waits: TileCode[];
}

export interface CoachStep {
  readonly id: string;
  readonly titleZh: string;
  readonly titleEn: string;
  readonly promptZh: string;
  readonly promptEn: string;
  readonly conclusionZh: string;
  readonly conclusionEn: string;
  readonly terms: string[];
  readonly candidates?: CoachCandidate[];
}

export interface CoachAdvice {
  readonly mode: CoachMode;
  readonly conclusionZh: string;
  readonly conclusionEn: string;
  readonly steps: CoachStep[];
  readonly weakTerms: string[];
}

export function buildCoachAdvice(state: TableState, playerId: PlayerId, mode: CoachMode): CoachAdvice {
  if (mode === "off") {
    return {
      mode,
      conclusionZh: "教练已关闭。",
      conclusionEn: "Coach is off.",
      steps: [],
      weakTerms: []
    };
  }

  const player = state.players[playerId];
  const voidSuit = player.voidSuit;
  if (!voidSuit) {
    return {
      mode,
      conclusionZh: "先完成定缺，再给出摸打建议。",
      conclusionEn: "Declare a void suit before discard advice is available.",
      steps: [],
      weakTerms: ["void-suit"]
    };
  }

  if (state.pendingClaim) {
    return claimAdvice(state, playerId, mode);
  }

  const currentWaits = waits(player.hand, voidSuit, { openMeldCount: player.melds.length });
  const canWin = isWinningHand(player.hand, voidSuit, { openMeldCount: player.melds.length });
  const efficiencies = discardEfficiencies(player.hand, voidSuit);
  const best = bestDiscards(player.hand, voidSuit);
  const voidTiles = player.hand.filter((tile) => parseTile(tile).suit === voidSuit);
  const bestLabels = best.slice(0, 3).map((item) => `${tileName(item.tile).zh}(${item.waitCount})`).join("、");
  const conclusionZh = canWin
    ? "当前已经成胡，可以胡。"
    : voidTiles.length > 0
      ? `先清定缺，优先打 ${tileName(voidTiles[0]).zh}。`
      : best.length > 0
        ? `建议打 ${bestLabels}，这些选择保留最多进张。`
        : "当前没有明确进张，先保留成组结构、打孤张。";
  const conclusionEn = canWin
    ? "The hand is already winning; take the win."
    : voidTiles.length > 0
      ? `Clear the declared void suit first; discard ${tileName(voidTiles[0]).en}.`
      : best.length > 0
        ? `Discard ${best.slice(0, 3).map((item) => `${tileName(item.tile).en} (${item.waitCount})`).join(", ")} to keep the most waits.`
        : "There is no clear wait yet; keep connected shapes and discard isolated tiles.";

  const steps: CoachStep[] = [
    {
      id: "discard",
      titleZh: "这张该不该打",
      titleEn: "Should this tile go?",
      promptZh: "先看是否还有定缺门；如果没有，再比较各舍牌后的进张数。",
      promptEn: "First check the declared void suit; if cleared, compare waits after each discard.",
      conclusionZh,
      conclusionEn,
      terms: ["void-suit", "discard", "tile-efficiency"],
      candidates: efficiencies.slice(0, 5).map(toCandidate)
    },
    {
      id: "draw-choice",
      titleZh: "摸牌取舍",
      titleEn: "Draw choice",
      promptZh: "摸入后若能增加听牌张数，就保留；若是定缺门，通常先打掉。",
      promptEn: "After a draw, keep tiles that increase waits; void-suit tiles are usually discarded first.",
      conclusionZh: currentWaits.length > 0 ? `当前已听 ${formatTilesZh(currentWaits)}。` : "当前未听，继续围绕最多进张的舍牌推进。",
      conclusionEn: currentWaits.length > 0 ? `Current waits: ${formatTilesEn(currentWaits)}.` : "Not ready yet; keep the discard that leaves the most waits.",
      terms: ["ready-hand", "effective-tiles"]
    },
    {
      id: "claims",
      titleZh: "碰杠取舍",
      titleEn: "Pung/Kong choice",
      promptZh: "四川麻将可以碰、杠，不可吃；碰杠只在能成组、能清缺或不明显损失听牌时考虑。",
      promptEn: "Sichuan Mahjong allows Pung and Kong, not Chow; claim only when it forms a group without hurting readiness.",
      conclusionZh: "本轮没有可响应舍牌时，先按摸打牌效处理。",
      conclusionEn: "With no discard to respond to, use discard efficiency for this turn.",
      terms: ["pung", "kong", "no-chow"]
    },
    {
      id: "ready",
      titleZh: "听牌判断",
      titleEn: "Ready-hand check",
      promptZh: "听牌只看再来哪些牌能成胡，并且必须已经打缺定缺门。",
      promptEn: "Ready hand means specific incoming tiles would win, and the declared void suit is already cleared.",
      conclusionZh: currentWaits.length > 0 ? `听 ${formatTilesZh(currentWaits)}。` : "未听牌。",
      conclusionEn: currentWaits.length > 0 ? `Waits: ${formatTilesEn(currentWaits)}.` : "Not tenpai.",
      terms: ["ready-hand", "win", "one-suit-missing"]
    },
    {
      id: "summary",
      titleZh: "汇总建议",
      titleEn: "Summary",
      promptZh: "把定缺、听牌和进张放在同一张表里比较。",
      promptEn: "Compare voiding, readiness, and waits in one view.",
      conclusionZh,
      conclusionEn,
      terms: ["tile-efficiency", "discard"]
    }
  ];

  return {
    mode,
    conclusionZh,
    conclusionEn,
    steps: mode === "direct" ? [steps[steps.length - 1]] : steps,
    weakTerms: [...new Set(steps.flatMap((step) => step.terms))]
  };
}

function claimAdvice(state: TableState, playerId: PlayerId, mode: CoachMode): CoachAdvice {
  const pending = state.pendingClaim;
  const player = state.players[playerId];
  const candidate = pending?.candidates.find((item) => item.playerId === playerId);
  if (!pending || !candidate || !player.voidSuit) {
    return {
      mode,
      conclusionZh: "当前没有可响应的舍牌。",
      conclusionEn: "There is no discard to respond to.",
      steps: [],
      weakTerms: []
    };
  }

  const tile = tileName(pending.tile);
  const canWin = candidate.canWin;
  const conclusionZh = canWin
    ? `这张 ${tile.zh} 能胡，优先胡。`
    : candidate.canKong
      ? `可以杠 ${tile.zh}；杠分会在本局结束进入教学结算。`
      : candidate.canPung
        ? `可以碰 ${tile.zh}，形成刻子；若不改善牌效也可以过。`
        : "建议过。";
  const conclusionEn = canWin
    ? `${tile.en} completes a win; take it.`
    : candidate.canKong
      ? `You may Kong ${tile.en}; Kong points are settled for teaching at the end.`
      : candidate.canPung
        ? `You may Pung ${tile.en}; pass if it does not improve efficiency.`
        : "Pass.";
  const steps: CoachStep[] = [
    {
      id: "claim",
      titleZh: "碰杠胡响应",
      titleEn: "Claim response",
      promptZh: "先判胡，再判杠/碰；没有吃。",
      promptEn: "Check Win first, then Kong/Pung; there is no Chow claim.",
      conclusionZh,
      conclusionEn,
      terms: ["win", "pung", "kong", "no-chow"]
    },
    {
      id: "ready-after-claim",
      titleZh: "响应后的听牌",
      titleEn: "Readiness after claim",
      promptZh: "响应会改变手牌张数和公开面子，必须重新看听牌。",
      promptEn: "A claim changes concealed tiles and open melds, so readiness must be checked again.",
      conclusionZh: `当前可响应牌：${tile.zh}。`,
      conclusionEn: `Current claim tile: ${tile.en}.`,
      terms: ["ready-hand", "meld"]
    }
  ];
  return {
    mode,
    conclusionZh,
    conclusionEn,
    steps: mode === "direct" ? [steps[0]] : steps,
    weakTerms: [...new Set(steps.flatMap((step) => step.terms))]
  };
}

function toCandidate(item: { readonly tile: TileCode; readonly waits: TileCode[] }): CoachCandidate {
  const name = tileName(item.tile);
  return {
    tile: item.tile,
    labelZh: `${name.zh} → ${item.waits.length ? formatTilesZh(item.waits) : "未听"}`,
    labelEn: `${name.en} -> ${item.waits.length ? formatTilesEn(item.waits) : "not ready"}`,
    waits: item.waits
  };
}

function formatTilesZh(tiles: readonly TileCode[]): string {
  return tiles.map((tile) => tileName(tile).zh).join("、");
}

function formatTilesEn(tiles: readonly TileCode[]): string {
  return tiles.map((tile) => tileName(tile).en).join(", ");
}
