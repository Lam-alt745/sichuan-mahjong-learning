import { decide, type AiProfile, type DecisionActionKind } from "./ai";
import { isTenpai, isWinningHand, waits } from "./hand";
import {
  netByPlayer,
  settleDraw,
  settleKong,
  settleWin,
  type KongEventKind,
  type KongPointEvent,
  type ScorePayment,
  type ScoreResult,
  type ScoringMeld,
  type WinSource,
  type WinTiming
} from "./scoring";
import {
  countBySuit,
  dealHands,
  isVoidSuitCleared,
  makeSeededRandom,
  parseTile,
  sortTileCodes,
  tileName,
  type TileCode,
  type TileSuit
} from "./tiles";

export type PlayerId = 0 | 1 | 2 | 3;
export type TablePhase = "void-selection" | "playing" | "finished";
export type TableEndReason = "three-winners" | "wall-empty";
export type ClaimKind = "win" | "pung" | "kong";

export interface MeldState {
  readonly kind: "pung" | "kong";
  readonly tiles: TileCode[];
  readonly from: PlayerId;
}

export interface TableWinEvent {
  readonly winner: PlayerId;
  readonly source: WinSource;
  readonly discarder?: PlayerId;
  readonly winTiming: WinTiming;
  readonly result: ScoreResult;
  readonly payments: ScorePayment[];
}

export interface TableKongEvent {
  readonly owner: PlayerId;
  readonly kind: KongEventKind;
  readonly from?: PlayerId;
  readonly payments: ScorePayment[];
}

export interface PlayerState {
  readonly id: PlayerId;
  readonly nameZh: string;
  readonly nameEn: string;
  readonly profile: AiProfile;
  readonly hand: TileCode[];
  readonly voidSuit?: TileSuit;
  readonly discards: TileCode[];
  readonly melds: MeldState[];
  readonly won: boolean;
  readonly revealed: TileCode[];
  readonly floweryPig?: boolean;
  readonly tenpai?: boolean;
  readonly voidSuitCleared?: boolean;
}

export interface ClaimOption {
  readonly playerId: PlayerId;
  readonly canWin: boolean;
  readonly canPung: boolean;
  readonly canKong: boolean;
}

export interface PendingClaim {
  readonly tile: TileCode;
  readonly by: PlayerId;
  readonly candidates: ClaimOption[];
}

export interface TableLogEntry {
  readonly id: number;
  readonly zh: string;
  readonly en: string;
}

export interface TableState {
  readonly seed: string;
  readonly phase: TablePhase;
  readonly dealer: PlayerId;
  readonly wall: TileCode[];
  readonly players: PlayerState[];
  readonly currentPlayer: PlayerId;
  readonly turn: number;
  readonly drawCounts: Record<PlayerId, number>;
  readonly winners: PlayerId[];
  readonly winEvents: TableWinEvent[];
  readonly kongEvents: TableKongEvent[];
  readonly pendingClaim?: PendingClaim;
  readonly endReason?: TableEndReason;
  readonly settlement?: TableSettlement;
  readonly log: TableLogEntry[];
}

export interface TableSettlement {
  readonly results: ScoreResult[];
  readonly payments: ScorePayment[];
  readonly net: Record<number, number>;
  readonly notes: Array<{ readonly zh: string; readonly en: string }>;
}

const playerIds: PlayerId[] = [0, 1, 2, 3];

export function createTableGame(options: string | { readonly seed?: string; readonly dealer?: PlayerId } = "phase-2-table"): TableState {
  const seed = typeof options === "string" ? options : (options.seed ?? "phase-2-table");
  const dealer = typeof options === "string" ? 0 : (options.dealer ?? 0);
  const deal = dealHands({ random: makeSeededRandom(seed), playerCount: 4, handSize: 13 });
  return {
    seed,
    phase: "void-selection",
    dealer,
    wall: deal.wall.map((tile) => tile.code),
    players: [
      createPlayer(0, "你", "You", "balanced", deal.hands[0].map((tile) => tile.code)),
      createPlayer(1, "稳健家", "Steady AI", "steady", deal.hands[1].map((tile) => tile.code)),
      createPlayer(2, "牌效家", "Efficiency AI", "efficiency", deal.hands[2].map((tile) => tile.code)),
      createPlayer(3, "保守家", "Conservative AI", "conservative", deal.hands[3].map((tile) => tile.code))
    ],
    currentPlayer: dealer,
    turn: 0,
    drawCounts: { 0: 0, 1: 0, 2: 0, 3: 0 },
    winners: [],
    winEvents: [],
    kongEvents: [],
    log: [
      {
        id: 0,
        zh: "新一局开始，请先定缺。",
        en: "A new hand starts. Declare a void suit first."
      }
    ]
  };
}

export function chooseVoidSuit(hand: readonly TileCode[]): TileSuit {
  const counts = countBySuit(hand);
  return [...playerSuitOrder].sort((left, right) => counts[left] - counts[right] || playerSuitOrder.indexOf(left) - playerSuitOrder.indexOf(right))[0];
}

export function declareVoidSuit(state: TableState, playerId: PlayerId, voidSuit: TileSuit): TableState {
  if (state.phase !== "void-selection") {
    return state;
  }
  const player = state.players[playerId];
  return updatePlayer(
    addLog(state, `${player.nameZh} 定缺 ${suitZh(voidSuit)}。`, `${player.nameEn} voids ${suitEn(voidSuit)}.`),
    playerId,
    (item) => ({ ...item, voidSuit })
  );
}

export function autoDeclareVoids(state: TableState): TableState {
  let next = state;
  for (const player of next.players) {
    if (!player.voidSuit) {
      next = declareVoidSuit(next, player.id, chooseVoidSuit(player.hand));
    }
  }
  return next;
}

export function beginPlay(state: TableState): TableState {
  if (state.phase !== "void-selection" || state.players.some((player) => !player.voidSuit)) {
    return state;
  }
  const playing = addLog({ ...state, phase: "playing" }, "定缺完成，进入血战摸打。", "Void suits are declared; fight-to-the-end play begins.");
  return drawForCurrent(playing);
}

export function drawForCurrent(state: TableState): TableState {
  if (state.phase !== "playing" || state.pendingClaim) {
    return state;
  }
  if (state.wall.length === 0) {
    return finishDraw(state);
  }
  const player = state.players[state.currentPlayer];
  if (player.won) {
    return advanceToNextActive(state);
  }

  const [tile, ...wall] = state.wall;
  const drawCounts = { ...state.drawCounts, [player.id]: state.drawCounts[player.id] + 1 };
  return addLog(
    updatePlayer({ ...state, wall, turn: state.turn + 1, drawCounts }, player.id, (item) => ({
      ...item,
      hand: sortTileCodes([...item.hand, tile])
    })),
    `${player.nameZh} 摸牌。`,
    `${player.nameEn} draws a tile.`
  );
}

export function getLegalActions(state: TableState, playerId: PlayerId): DecisionActionKind[] {
  const player = state.players[playerId];
  if (state.phase !== "playing" || player.won) {
    return [];
  }
  const actions: DecisionActionKind[] = [];
  if (state.pendingClaim) {
    const claim = state.pendingClaim.candidates.find((candidate) => candidate.playerId === playerId);
    if (!claim) {
      return ["pass"];
    }
    if (claim.canWin) actions.push("win");
    if (claim.canKong) actions.push("kong");
    if (claim.canPung) actions.push("pung");
    actions.push("pass");
    return actions;
  }
  if (state.currentPlayer !== playerId) {
    return [];
  }
  if (player.voidSuit && isWinningHand(player.hand, player.voidSuit, { openMeldCount: player.melds.length })) {
    actions.push("win");
  }
  if (availableKongTiles(player).length > 0) {
    actions.push("kong");
  }
  if (player.hand.length > 0) {
    actions.push("discard");
  }
  return actions;
}

export function discardForCurrent(state: TableState, tile: TileCode): TableState {
  if (state.phase !== "playing" || state.pendingClaim) {
    return state;
  }
  const player = state.players[state.currentPlayer];
  if (player.won || !player.hand.includes(tile)) {
    return state;
  }

  let next = updatePlayer(state, player.id, (item) => ({
    ...item,
    hand: removeOne(item.hand, tile),
    discards: [...item.discards, tile]
  }));
  next = addLog(next, `${player.nameZh} 打出 ${tileName(tile).zh}。`, `${player.nameEn} discards ${tileName(tile).en}.`);

  const pendingClaim = buildPendingClaim(next, tile, player.id);
  if (pendingClaim) {
    if (pendingClaim.candidates.some((candidate) => candidate.playerId === 0)) {
      return addLog({ ...next, currentPlayer: 0, pendingClaim }, "你可以响应这张舍牌。", "You may respond to this discard.");
    }
    return resolveAutoClaims({ ...next, pendingClaim });
  }

  return advanceToNextActive(next);
}

export function passClaim(state: TableState, playerId: PlayerId): TableState {
  if (!state.pendingClaim || playerId !== 0) {
    return state;
  }
  const remaining = state.pendingClaim.candidates.filter((candidate) => candidate.playerId !== playerId);
  if (remaining.length > 0) {
    return resolveAutoClaims({ ...state, pendingClaim: { ...state.pendingClaim, candidates: remaining } });
  }
  return advanceToNextActive({ ...state, pendingClaim: undefined, currentPlayer: state.pendingClaim.by });
}

export function claimDiscard(state: TableState, playerId: PlayerId, kind: ClaimKind): TableState {
  const pending = state.pendingClaim;
  if (!pending) {
    return state;
  }
  const candidate = pending.candidates.find((item) => item.playerId === playerId);
  if (!candidate || !isClaimAllowed(candidate, kind)) {
    return state;
  }

  if (kind === "win") {
    let next = updatePlayer({ ...state, pendingClaim: undefined }, playerId, (player) => ({
      ...player,
      hand: sortTileCodes([...player.hand, pending.tile])
    }));
    next = recordWinEvent(next, playerId, "discard", pending.by, "normal");
    next = markWinner(next, playerId, "胡这张舍牌。", "wins on the discard.");
    return advanceAfterWin(next, playerId);
  }

  const removeCount = kind === "kong" ? 3 : 2;
  let next = updatePlayer({ ...state, pendingClaim: undefined, currentPlayer: playerId }, playerId, (player) => ({
    ...player,
    hand: removeMany(player.hand, pending.tile, removeCount),
    melds: [
      ...player.melds,
      {
        kind,
        tiles: Array.from({ length: kind === "kong" ? 4 : 3 }, () => pending.tile),
        from: pending.by
      }
    ]
  }));
  if (kind === "kong") {
    next = recordKongEvent(next, { owner: playerId, kind: "point", from: pending.by });
  }
  next = addLog(
    next,
    `${next.players[playerId].nameZh} ${kind === "kong" ? "杠" : "碰"} ${tileName(pending.tile).zh}。`,
    `${next.players[playerId].nameEn} claims ${kind === "kong" ? "Kong" : "Pung"} with ${tileName(pending.tile).en}.`
  );
  return kind === "kong" ? drawForCurrent(next) : next;
}

export function declareKongForCurrent(state: TableState, tile?: TileCode): TableState {
  if (state.phase !== "playing" || state.pendingClaim) {
    return state;
  }
  const player = state.players[state.currentPlayer];
  const kongTile = tile ?? availableKongTiles(player)[0];
  if (!kongTile) {
    return state;
  }
  const handCount = player.hand.filter((item) => item === kongTile).length;
  const addOnMeld = player.melds.find((meld) => meld.kind === "pung" && meld.tiles[0] === kongTile);
  const kongKind: KongEventKind = handCount >= 4 ? "concealed" : "add-on";
  let next = updatePlayer(state, player.id, (item) => ({
    ...item,
    hand: removeMany(item.hand, kongTile, kongKind === "concealed" ? 4 : 1),
    melds:
      kongKind === "concealed"
        ? [...item.melds, { kind: "kong", tiles: [kongTile, kongTile, kongTile, kongTile], from: item.id }]
        : item.melds.map((meld) =>
            meld === addOnMeld ? { ...meld, kind: "kong", tiles: [kongTile, kongTile, kongTile, kongTile] } : meld
          )
  }));
  next = recordKongEvent(next, { owner: player.id, kind: kongKind });
  next = addLog(next, `${player.nameZh} 杠 ${tileName(kongTile).zh}。`, `${player.nameEn} declares Kong with ${tileName(kongTile).en}.`);
  return drawForCurrent(next);
}

export function claimSelfDrawWin(state: TableState, playerId: PlayerId = state.currentPlayer): TableState {
  const player = state.players[playerId];
  if (state.phase !== "playing" || !player.voidSuit || player.won) {
    return state;
  }
  if (!isWinningHand(player.hand, player.voidSuit, { openMeldCount: player.melds.length })) {
    return state;
  }
  const withScore = recordWinEvent(state, playerId, "self-draw", undefined, winTimingForSelfDraw(state, playerId));
  const next = markWinner(withScore, playerId, "自摸胡。", "wins by self-draw.");
  return advanceAfterWin(next, playerId);
}

export function runAutoUntilHuman(state: TableState, maxSteps = 80): TableState {
  let next = state;
  for (let step = 0; step < maxSteps; step += 1) {
    if (next.phase !== "playing" || next.endReason) {
      return next;
    }
    if (next.pendingClaim?.candidates.some((candidate) => candidate.playerId === 0)) {
      return next;
    }
    if (next.currentPlayer === 0 && !next.pendingClaim) {
      return next;
    }
    next = runOneAutoStep(next, false);
  }
  return next;
}

export function autoFinishGame(state: TableState, maxSteps = 320): TableState {
  let next = state.phase === "void-selection" ? beginPlay(autoDeclareVoids(state)) : state;
  for (let step = 0; step < maxSteps; step += 1) {
    if (next.phase !== "playing") {
      return next;
    }
    next = runOneAutoStep(next, true);
  }
  return finishDraw(next);
}

export function finishDraw(state: TableState): TableState {
  const markedPlayers = state.players.map((player) => {
    const suits = countBySuit(player.hand);
    const voidSuitCleared = player.voidSuit ? isVoidSuitCleared(player.hand, player.voidSuit) : false;
    return {
      ...player,
      floweryPig: suits.p > 0 && suits.t > 0 && suits.w > 0,
      tenpai: player.voidSuit ? isTenpai(player.hand, player.voidSuit, { openMeldCount: player.melds.length }) : false,
      voidSuitCleared
    };
  });
  const finished = finalizeSettlement({
    ...state,
    phase: "finished",
    endReason: "wall-empty",
    players: markedPlayers,
    pendingClaim: undefined
  });
  return addLog(
    finished,
    "牌墙摸完，流局；按 §K 标记花猪/查叫并做教学结算。",
    "The wall is empty; flowery pig and tenpai check are marked and settled for teaching points under K."
  );
}

export function playerWaits(player: PlayerState): TileCode[] {
  if (!player.voidSuit) {
    return [];
  }
  return waits(player.hand, player.voidSuit, { openMeldCount: player.melds.length });
}

function runOneAutoStep(state: TableState, includeHuman: boolean): TableState {
  if (state.pendingClaim) {
    return resolveAutoClaims(state, includeHuman);
  }

  const player = state.players[state.currentPlayer];
  if (player.won) {
    return advanceToNextActive(state);
  }
  const legalActions = getLegalActions(state, player.id);
  const action = decide(includeHuman && player.id === 0 ? "balanced" : player.profile, {
    hand: player.hand,
    voidSuit: player.voidSuit ?? chooseVoidSuit(player.hand),
    openMeldCount: player.melds.length,
    legalActions
  });
  if (action.kind === "win") {
    return claimSelfDrawWin(state, player.id);
  }
  if (action.kind === "kong") {
    return declareKongForCurrent(state, action.tile);
  }
  if (action.kind === "discard" && action.tile) {
    return discardForCurrent(state, action.tile);
  }
  return advanceToNextActive(state);
}

function resolveAutoClaims(state: TableState, includeHuman = false): TableState {
  const pending = state.pendingClaim;
  if (!pending) {
    return state;
  }
  const candidates = includeHuman ? pending.candidates : pending.candidates.filter((candidate) => candidate.playerId !== 0);
  const winner = candidates.find((candidate) => candidate.canWin);
  if (winner) {
    const player = state.players[winner.playerId];
    const action = decide(player.profile, {
      hand: [...player.hand, pending.tile],
      voidSuit: player.voidSuit ?? chooseVoidSuit(player.hand),
      openMeldCount: player.melds.length,
      legalActions: ["win"],
      claimedTile: pending.tile
    });
    if (action.kind === "win") {
      return claimDiscard(state, winner.playerId, "win");
    }
  }

  for (const candidate of candidates) {
    const player = state.players[candidate.playerId];
    const legalActions: DecisionActionKind[] = [];
    if (candidate.canKong) legalActions.push("kong");
    if (candidate.canPung) legalActions.push("pung");
    const action = decide(player.profile, {
      hand: player.hand,
      voidSuit: player.voidSuit ?? chooseVoidSuit(player.hand),
      openMeldCount: player.melds.length,
      legalActions,
      claimedTile: pending.tile
    });
    if (action.kind === "kong" && candidate.canKong) {
      return claimDiscard(state, candidate.playerId, "kong");
    }
    if (action.kind === "pung" && candidate.canPung) {
      return claimDiscard(state, candidate.playerId, "pung");
    }
  }

  return advanceToNextActive({ ...state, pendingClaim: undefined, currentPlayer: pending.by });
}

function buildPendingClaim(state: TableState, tile: TileCode, by: PlayerId): PendingClaim | undefined {
  const candidates = playerIds
    .filter((id) => id !== by)
    .map((id) => {
      const player = state.players[id];
      if (player.won || !player.voidSuit) {
        return undefined;
      }
      const sameCount = player.hand.filter((item) => item === tile).length;
      const canWin = isWinningHand([...player.hand, tile], player.voidSuit, { openMeldCount: player.melds.length });
      const canPung = sameCount >= 2 && parseTile(tile).suit !== player.voidSuit;
      const canKong = sameCount >= 3 && parseTile(tile).suit !== player.voidSuit;
      return canWin || canPung || canKong ? { playerId: id, canWin, canPung, canKong } : undefined;
    })
    .filter((item): item is ClaimOption => Boolean(item));
  return candidates.length > 0 ? { tile, by, candidates } : undefined;
}

function availableKongTiles(player: PlayerState): TileCode[] {
  const unique = [...new Set(player.hand)];
  const concealed = unique.filter((tile) => player.hand.filter((item) => item === tile).length >= 4);
  const addOn = player.melds
    .filter((meld) => meld.kind === "pung" && player.hand.includes(meld.tiles[0]))
    .map((meld) => meld.tiles[0]);
  return sortTileCodes([...new Set([...concealed, ...addOn])]);
}

function markWinner(state: TableState, playerId: PlayerId, suffixZh: string, suffixEn: string): TableState {
  let next = updatePlayer(state, playerId, (player) => ({
    ...player,
    won: true,
    revealed: sortTileCodes(player.hand)
  }));
  const player = next.players[playerId];
  next = {
    ...next,
    winners: next.winners.includes(playerId) ? next.winners : [...next.winners, playerId]
  };
  next = addLog(next, `${player.nameZh}${suffixZh}`, `${player.nameEn} ${suffixEn}`);
  if (next.winners.length >= 3) {
    return addLog(
      finalizeSettlement({ ...next, phase: "finished", endReason: "three-winners", pendingClaim: undefined }),
      "已有三家胡牌，本局血战结束。",
      "Three players have won; the fight-to-the-end hand is over."
    );
  }
  return next;
}

function advanceAfterWin(state: TableState, winnerId: PlayerId): TableState {
  if (state.phase === "finished") {
    return state;
  }
  return advanceToNextActive({ ...state, currentPlayer: winnerId, pendingClaim: undefined });
}

function advanceToNextActive(state: TableState): TableState {
  if (state.phase !== "playing") {
    return state;
  }
  const nextPlayer = nextActivePlayer(state, state.currentPlayer);
  if (nextPlayer === undefined) {
    return finishDraw(state);
  }
  return drawForCurrent({ ...state, currentPlayer: nextPlayer, pendingClaim: undefined });
}

function nextActivePlayer(state: TableState, from: PlayerId): PlayerId | undefined {
  for (let offset = 1; offset <= 4; offset += 1) {
    const id = ((from + offset) % 4) as PlayerId;
    if (!state.players[id].won) {
      return id;
    }
  }
  return undefined;
}

function updatePlayer(state: TableState, playerId: PlayerId, update: (player: PlayerState) => PlayerState): TableState {
  return {
    ...state,
    players: state.players.map((player) => (player.id === playerId ? update(player) : player))
  };
}

function addLog(state: TableState, zh: string, en: string): TableState {
  const nextId = state.log.reduce((maxId, entry) => Math.max(maxId, entry.id), -1) + 1;
  return {
    ...state,
    log: [...state.log, { id: nextId, zh, en }].slice(-18)
  };
}

function createPlayer(
  id: PlayerId,
  nameZh: string,
  nameEn: string,
  profile: AiProfile,
  hand: TileCode[]
): PlayerState {
  return {
    id,
    nameZh,
    nameEn,
    profile,
    hand: sortTileCodes(hand),
    discards: [],
    melds: [],
    won: false,
    revealed: []
  };
}

function recordWinEvent(
  state: TableState,
  winner: PlayerId,
  source: WinSource,
  discarder: PlayerId | undefined,
  winTiming: WinTiming
): TableState {
  const player = state.players[winner];
  if (!player.voidSuit) {
    return state;
  }
  const settlement = settleWin(player.hand, {
    voidSuit: player.voidSuit,
    source,
    winner,
    discarder,
    alreadyWon: state.winners,
    openMelds: toScoringMelds(player.melds),
    winTiming
  });
  const result = settlement.results[0];
  if (!result) {
    return state;
  }
  return {
    ...state,
    winEvents: [
      ...state.winEvents,
      {
        winner,
        source,
        discarder,
        winTiming,
        result,
        payments: settlement.payments
      }
    ]
  };
}

function recordKongEvent(state: TableState, event: KongPointEvent & { readonly owner: PlayerId; readonly from?: PlayerId }): TableState {
  const settlement = settleKong(event, { alreadyWon: state.winners });
  return {
    ...state,
    kongEvents: [
      ...state.kongEvents,
      {
        owner: event.owner,
        kind: event.kind,
        from: event.from as PlayerId | undefined,
        payments: settlement.payments
      }
    ]
  };
}

function finalizeSettlement(state: TableState): TableState {
  if (state.settlement) {
    return state;
  }
  const kongPayments = state.kongEvents.flatMap((event) => event.payments);
  const winPayments = state.winEvents.flatMap((event) => event.payments);
  const drawSettlement =
    state.endReason === "wall-empty"
      ? settleDraw(
          state.players
            .filter((player) => !player.won)
            .map((player) => ({
              id: player.id,
              floweryPig: Boolean(player.floweryPig),
              tenpai: Boolean(player.tenpai),
              hand: player.hand,
              voidSuit: player.voidSuit,
              openMelds: toScoringMelds(player.melds)
            })),
          { kongPayments }
        )
      : undefined;
  const payments = [...winPayments, ...kongPayments, ...(drawSettlement?.payments ?? [])];
  return {
    ...state,
    settlement: {
      results: state.winEvents.map((event) => event.result),
      payments,
      net: netByPlayer(payments),
      notes: drawSettlement?.notes ?? []
    }
  };
}

function toScoringMelds(melds: readonly MeldState[]): ScoringMeld[] {
  return melds.map((meld) => ({ kind: meld.kind, tiles: meld.tiles }));
}

function winTimingForSelfDraw(state: TableState, playerId: PlayerId): WinTiming {
  // K.8 teaching-pinned (the project maintainer 2026-06-21): dealer's first draw = Heavenly; a non-dealer's first-round draw (turn<=4 approx) = Earthly.
  // Platform-precise edges (e.g. no prior claims) are intentionally not modeled. See rules-facts.md §K.8.
  if (playerId === state.dealer && state.drawCounts[playerId] === 1 && state.turn <= 1) {
    return "heavenly";
  }
  if (playerId !== state.dealer && state.drawCounts[playerId] === 1 && state.turn <= 4) {
    return "earthly";
  }
  return "normal";
}

function removeOne(tiles: readonly TileCode[], tile: TileCode): TileCode[] {
  return removeMany(tiles, tile, 1);
}

function removeMany(tiles: readonly TileCode[], tile: TileCode, count: number): TileCode[] {
  let removed = 0;
  return tiles.filter((item) => {
    if (item === tile && removed < count) {
      removed += 1;
      return false;
    }
    return true;
  });
}

function isClaimAllowed(candidate: ClaimOption, kind: ClaimKind): boolean {
  return kind === "win" ? candidate.canWin : kind === "kong" ? candidate.canKong : candidate.canPung;
}

const playerSuitOrder: TileSuit[] = ["p", "t", "w"];

function suitZh(suit: TileSuit): string {
  return suit === "p" ? "筒" : suit === "t" ? "条" : "万";
}

function suitEn(suit: TileSuit): string {
  return suit === "p" ? "Dots" : suit === "t" ? "Bamboo" : "Characters";
}
